import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Camera, CameraStatus } from '../entities/camera.entity';
import { CreateCameraDto } from '../dto/create-camera.dto';
import { UpdateCameraDto } from '../dto/update-camera.dto';

@Injectable()
export class CamerasService {
  private readonly logger = new Logger(CamerasService.name);

  constructor(
    @InjectRepository(Camera)
    private readonly cameraRepo: Repository<Camera>,
  ) {}

  /**
   * Create a new camera
   */
  async create(createCameraDto: CreateCameraDto): Promise<Camera> {
    const camera = this.cameraRepo.create(createCameraDto);
    const saved = await this.cameraRepo.save(camera);

    this.logger.log(`Created camera: ${saved.id}`);
    return saved;
  }

  /**
   * Get all cameras
   */
  async findAll(): Promise<Camera[]> {
    return this.cameraRepo.find({
      relations: ['building'],
      order: { created_at: 'DESC' },
    });
  }

  /**
   * Get camera by ID
   */
  async findOne(id: string): Promise<Camera> {
    const camera = await this.cameraRepo.findOne({
      where: { id },
      relations: ['building'],
    });

    if (!camera) {
      throw new NotFoundException(`Camera with ID ${id} not found`);
    }

    return camera;
  }

  /**
   * Update camera
   */
  async update(id: string, updateCameraDto: UpdateCameraDto): Promise<Camera> {
    const camera = await this.findOne(id);

    Object.assign(camera, updateCameraDto);
    const updated = await this.cameraRepo.save(camera);

    this.logger.log(`Updated camera: ${id}`);
    return updated;
  }

  /**
   * Delete camera
   */
  async remove(id: string): Promise<void> {
    const camera = await this.findOne(id);
    await this.cameraRepo.remove(camera);

    this.logger.log(`Deleted camera: ${id}`);
  }

  /**
   * Find cameras by building
   */
  async findByBuilding(buildingId: string): Promise<Camera[]> {
    return this.cameraRepo.find({
      where: { building_id: buildingId },
      order: { created_at: 'DESC' },
    });
  }

  /**
   * Find online cameras
   */
  async findOnline(): Promise<Camera[]> {
    return this.cameraRepo.find({
      where: { status: CameraStatus.ONLINE },
      order: { created_at: 'DESC' },
    });
  }

  /**
   * Find streaming cameras
   */
  async findStreaming(): Promise<Camera[]> {
    return this.cameraRepo.find({
      where: { is_streaming: true },
      order: { created_at: 'DESC' },
    });
  }
}
