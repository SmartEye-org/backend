import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Resident } from './entities/resident.entity';
import { CreateResidentDto } from './dto/create-resident.dto';
import { UpdateResidentDto } from './dto/update-resident.dto';

@Injectable()
export class ResidentsService {
  constructor(
    @InjectRepository(Resident)
    private readonly residentRepo: Repository<Resident>,
  ) {}

  async create(dto: CreateResidentDto): Promise<Resident> {
    const existing = await this.residentRepo.findOne({ where: { id: dto.id } });
    if (existing) {
      throw new ConflictException(`Resident with id "${dto.id}" already exists`);
    }

    const resident = this.residentRepo.create(dto);
    return this.residentRepo.save(resident);
  }

  async findAll(buildingId?: string): Promise<Resident[]> {
    const where = buildingId ? { building_id: buildingId } : {};
    return this.residentRepo.find({
      where,
      order: { registered_at: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Resident> {
    const resident = await this.residentRepo.findOne({
      where: { id },
      relations: ['building'],
    });
    if (!resident) {
      throw new NotFoundException(`Resident #${id} not found`);
    }
    return resident;
  }

  async update(id: string, dto: UpdateResidentDto): Promise<Resident> {
    const resident = await this.findOne(id);
    Object.assign(resident, dto);
    return this.residentRepo.save(resident);
  }

  async remove(id: string): Promise<void> {
    const resident = await this.findOne(id);
    await this.residentRepo.remove(resident);
  }

  /**
   * Store face embedding (512-dim ArcFace vector) for a resident.
   * Called after face enrollment via AI service.
   */
  async enrollFace(
    id: string,
    embedding: number[],
    photoUrl?: string,
  ): Promise<Resident> {
    const resident = await this.findOne(id);
    resident.face_encoding = embedding;
    if (photoUrl) resident.photo_url = photoUrl;
    return this.residentRepo.save(resident);
  }

  /**
   * Find resident by face embedding similarity.
   * Uses simple cosine similarity — replace with pgvector in production.
   */
  async findByFaceEmbedding(
    queryEmbedding: number[],
    threshold = 0.6,
    buildingId?: string,
  ): Promise<Resident | null> {
    const where: any = {};
    if (buildingId) where.building_id = buildingId;

    const residents = await this.residentRepo.find({
      where,
      select: ['id', 'name', 'apartment', 'face_encoding', 'building_id'],
    });

    let bestMatch: Resident | null = null;
    let bestScore = -1;

    for (const resident of residents) {
      if (!resident.face_encoding?.length) continue;
      const score = cosineSimilarity(queryEmbedding, resident.face_encoding);
      if (score > threshold && score > bestScore) {
        bestScore = score;
        bestMatch = resident;
      }
    }

    return bestMatch;
  }
}

/** Cosine similarity between two vectors */
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return -1;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] ** 2;
    normB += b[i] ** 2;
  }
  if (normA === 0 || normB === 0) return -1;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}
