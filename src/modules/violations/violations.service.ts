import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions } from 'typeorm';
import { Violation, ViolationType, ViolationSeverity } from './entities/violation.entity';
import { CreateViolationDto } from './dto/create-violation.dto';
import { AcknowledgeViolationDto } from './dto/acknowledge-violation.dto';

export interface ViolationFilter {
  camera_id?: string;
  violation_type?: ViolationType;
  severity?: ViolationSeverity;
  resolved?: boolean;
  acknowledged?: boolean;
  limit?: number;
  offset?: number;
}

@Injectable()
export class ViolationsService {
  constructor(
    @InjectRepository(Violation)
    private readonly violationRepo: Repository<Violation>,
  ) {}

  async create(dto: CreateViolationDto): Promise<Violation> {
    const violation = this.violationRepo.create({
      ...dto,
      timestamp: new Date(dto.timestamp),
    });
    return this.violationRepo.save(violation);
  }

  async findAll(filter: ViolationFilter = {}): Promise<{ data: Violation[]; total: number }> {
    const {
      camera_id,
      violation_type,
      severity,
      resolved,
      acknowledged,
      limit = 50,
      offset = 0,
    } = filter;

    const qb = this.violationRepo
      .createQueryBuilder('v')
      .leftJoinAndSelect('v.acknowledger', 'acknowledger')
      .orderBy('v.timestamp', 'DESC')
      .take(limit)
      .skip(offset);

    if (camera_id) qb.andWhere('v.camera_id = :camera_id', { camera_id });
    if (violation_type) qb.andWhere('v.violation_type = :violation_type', { violation_type });
    if (severity) qb.andWhere('v.severity = :severity', { severity });
    if (resolved !== undefined) qb.andWhere('v.resolved = :resolved', { resolved });
    if (acknowledged !== undefined) qb.andWhere('v.acknowledged = :acknowledged', { acknowledged });

    const [data, total] = await qb.getManyAndCount();
    return { data, total };
  }

  async findOne(id: string): Promise<Violation> {
    const violation = await this.violationRepo.findOne({
      where: { id },
      relations: ['acknowledger'],
    });
    if (!violation) {
      throw new NotFoundException(`Violation #${id} not found`);
    }
    return violation;
  }

  async acknowledge(
    id: string,
    userId: string,
    dto: AcknowledgeViolationDto,
  ): Promise<Violation> {
    const violation = await this.findOne(id);
    violation.acknowledged = true;
    violation.acknowledged_by = userId;
    violation.acknowledged_at = new Date();
    if (dto.actions_taken) violation.actions_taken = dto.actions_taken;
    return this.violationRepo.save(violation);
  }

  async resolve(id: string, userId: string): Promise<Violation> {
    const violation = await this.findOne(id);
    violation.resolved = true;
    violation.resolved_at = new Date();
    // Auto-acknowledge if not yet
    if (!violation.acknowledged) {
      violation.acknowledged = true;
      violation.acknowledged_by = userId;
      violation.acknowledged_at = new Date();
    }
    return this.violationRepo.save(violation);
  }

  async remove(id: string): Promise<void> {
    const violation = await this.findOne(id);
    await this.violationRepo.remove(violation);
  }

  /** Statistics for dashboard */
  async getStats(cameraIds?: string[]): Promise<{
    total: number;
    unresolved: number;
    unacknowledged: number;
    by_type: Record<string, number>;
    by_severity: Record<string, number>;
  }> {
    const qb = this.violationRepo.createQueryBuilder('v');
    if (cameraIds?.length) {
      qb.where('v.camera_id IN (:...cameraIds)', { cameraIds });
    }

    const all = await qb.getMany();

    const by_type: Record<string, number> = {};
    const by_severity: Record<string, number> = {};
    let unresolved = 0;
    let unacknowledged = 0;

    for (const v of all) {
      by_type[v.violation_type] = (by_type[v.violation_type] || 0) + 1;
      by_severity[v.severity] = (by_severity[v.severity] || 0) + 1;
      if (!v.resolved) unresolved++;
      if (!v.acknowledged) unacknowledged++;
    }

    return {
      total: all.length,
      unresolved,
      unacknowledged,
      by_type,
      by_severity,
    };
  }
}
