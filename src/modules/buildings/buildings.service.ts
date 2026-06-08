import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Building } from './entities/building.entity';
import { CreateBuildingDto } from './dto/create-building.dto';
import { UpdateBuildingDto } from './dto/update-building.dto';

@Injectable()
export class BuildingsService {
  constructor(
    @InjectRepository(Building)
    private readonly buildingRepo: Repository<Building>,
  ) {}

  async create(dto: CreateBuildingDto): Promise<Building> {
    const existing = await this.buildingRepo.findOne({
      where: [{ name: dto.name }, { code: dto.code }],
    });
    if (existing) {
      throw new ConflictException('Building with this name or code already exists');
    }

    const building = this.buildingRepo.create({
      ...dto,
      subscription_expires_at: dto.subscription_expires_at
        ? new Date(dto.subscription_expires_at)
        : undefined,
    });
    return this.buildingRepo.save(building);
  }

  async findAll(): Promise<Building[]> {
    return this.buildingRepo.find({
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Building> {
    const building = await this.buildingRepo.findOne({
      where: { id },
      relations: ['cameras', 'residents'],
    });
    if (!building) {
      throw new NotFoundException(`Building #${id} not found`);
    }
    return building;
  }

  async update(id: string, dto: UpdateBuildingDto): Promise<Building> {
    const building = await this.findOne(id);
    Object.assign(building, {
      ...dto,
      subscription_expires_at: dto.subscription_expires_at
        ? new Date(dto.subscription_expires_at)
        : building.subscription_expires_at,
    });
    return this.buildingRepo.save(building);
  }

  async remove(id: string): Promise<void> {
    const building = await this.findOne(id);
    await this.buildingRepo.remove(building);
  }
}
