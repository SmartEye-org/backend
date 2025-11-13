import {
  Resident,
  ResidentStatus,
} from '../residents/entities/resident.entity';
import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { firstValueFrom } from 'rxjs';
import { Repository } from 'typeorm';
import { Camera } from '../cameras/entities/camera.entity';
import { Detection, PersonType } from './entities/detection.entity';
import { EventsGateway } from 'src/gateways/events.gateway';
import * as FormData from 'form-data';
import { AiDetectionResponseDto } from './dto/response/ai-detection-response.dto';

@Injectable()
export class DetectionsService {
  private readonly logger = new Logger(DetectionsService.name);
  private readonly aiServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @InjectRepository(Detection)
    private readonly detectionRepo: Repository<Detection>,
    @InjectRepository(Camera)
    private readonly cameraRepo: Repository<Camera>,
    @InjectRepository(Resident)
    private readonly residentRepo: Repository<Resident>,
    private readonly eventsGateway: EventsGateway,
  ) {
    this.aiServiceUrl = this.configService.getOrThrow<string>('AI_SERVICE_URL');
  }

  async processImage(
    imageBuffer: Buffer,
    fileName: string,
    cameraId: string = 'camera-01',
    location?: string,
  ) {
    try {
      // 1. Validate camera
      const camera = await this.cameraRepo.findOne({
        where: { id: cameraId },
      });

      if (!camera) {
        throw new BadRequestException(`Camera ${cameraId} not found`);
      }

      // 2. Call AI Service (multipart/form-data)
      const formData = new FormData();
      formData.append('image', imageBuffer, { filename: fileName });
      formData.append('camera_id', cameraId);
      if (location) {
        formData.append('location', location);
      }

      const response = await firstValueFrom(
        this.httpService.post<AiDetectionResponseDto>(
          `${this.aiServiceUrl}/detect`,
          formData,
          {
            headers: formData.getHeaders(),
          },
        ),
      );

      const aiResults = response.data;

      // 3. Save to DB
      const savedDetections: Detection[] = [];

      for (const det of aiResults.detections) {
        // Match face with resident
        let matchedResident: Resident | null = null;
        let personType = PersonType.UNKNOWN;

        if (det.face_detected && det.face_encoding) {
          matchedResident = await this.matchFaceWithResident(det.face_encoding);
          if (matchedResident) {
            personType = PersonType.RESIDENT;
          }
        }

        const detection = this.detectionRepo.create({
          camera_id: cameraId,
          track_id: det.track_id || `track_${Date.now()}_${det.person_id}`,
          frame_id: det.frame_id,
          bbox: det.bbox,
          confidence: det.confidence,
          action: det.action,
          person_type: personType,
          person_id: matchedResident?.id,
          person_name: matchedResident?.name,
          face_confidence: det.face_confidence,
          timestamp: new Date(det.timestamp),
        });

        const saved = await this.detectionRepo.save(detection);
        savedDetections.push(saved);
      }

      // 4. Broadcast over WebSocket
      this.eventsGateway.broadcastDetection({
        camera_id: cameraId,
        camera_name: camera.name,
        detections: savedDetections.map((d) => ({
          id: d.id,
          track_id: d.track_id,
          person_type: d.person_type,
          person_name: d.person_name,
          confidence: Math.round(d.confidence * 100),
          timestamp: d.timestamp,
        })),
        total_persons: savedDetections.length,
        timestamp: new Date().toISOString(),
      });

      this.logger.log(
        `Saved ${savedDetections.length} detections for camera ${cameraId}`,
      );

      return {
        ...aiResults,
        saved_detections: savedDetections.length,
        detections: savedDetections,
      };
    } catch (error: unknown) {
      const err = error as { message?: string };
      this.logger.error(
        `Detection processing failed: ${err?.message ?? 'Unknown error'}`,
      );
      throw error;
    }
  }

  /**
   * Match face encoding with residents database
   */
  private async matchFaceWithResident(
    faceEncoding: number[],
  ): Promise<Resident | null> {
    const residents = await this.residentRepo.find({
      where: { status: ResidentStatus.ACTIVE },
      select: ['id', 'name', 'face_encoding'],
    });

    let bestMatch: Resident | null = null;
    let bestSimilarity = 0.6; // Threshold

    for (const resident of residents) {
      if (!resident.face_encoding) continue;

      const similarity = this.cosineSimilarity(
        faceEncoding,
        resident.face_encoding,
      );

      if (similarity > bestSimilarity) {
        bestSimilarity = similarity;
        bestMatch = resident;
      }
    }

    return bestMatch;
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  private cosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (magA * magB);
  }

  /**
   * Get recent detections
   */
  async getRecentDetections(limit: number = 50) {
    const detections = await this.detectionRepo.find({
      relations: ['camera', 'person'],
      order: { timestamp: 'DESC' },
      take: limit,
    });

    return {
      detections,
      total: detections.length,
    };
  }
}
