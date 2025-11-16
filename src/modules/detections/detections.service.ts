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
import { GrpcDetectionClient } from './grpc-detection.client';

// ✅ Type for AI detection result
interface AiDetectionResult {
  track_id: string;
  frame_id: number;
  bbox: number[];
  confidence: number;
  action: string;
  face_detected: boolean;
  face_encoding?: number[] | null;
  face_confidence?: number | null;
  person_id: number;
  timestamp: string;
}

@Injectable()
export class DetectionsService {
  private readonly logger = new Logger(DetectionsService.name);
  private readonly aiServiceUrl: string;
  private readonly useGrpc: boolean;

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
    private readonly grpcClient: GrpcDetectionClient,
  ) {
    this.aiServiceUrl = this.configService.getOrThrow<string>('AI_SERVICE_URL');
    this.useGrpc = this.configService.get<boolean>('USE_GRPC') !== false;

    this.logger.log(`✅ DetectionsService initialized`);
    this.logger.log(
      `   Mode: ${this.useGrpc ? 'gRPC (fast)' : 'HTTP (fallback)'}`,
    );
    this.logger.log(`   AI Service URL: ${this.aiServiceUrl}`);
  }

  async processImage(
    imageBuffer: Buffer,
    fileName: string,
    cameraId: string = 'camera-01',
    location?: string,
  ) {
    const startTime = Date.now();

    try {
      // 1. Validate camera
      const camera = await this.cameraRepo.findOne({
        where: { id: cameraId },
      });

      if (!camera) {
        throw new BadRequestException(`Camera ${cameraId} not found`);
      }

      // 2. Call AI Service (gRPC primary, HTTP fallback)
      let aiResults: {
        detections: AiDetectionResult[];
        total_persons: number;
        timestamp: string;
      };

      if (this.useGrpc) {
        // gRPC mode (FAST!)
        const grpcStartTime = Date.now();

        try {
          aiResults = await this.grpcClient.detectPersons(
            imageBuffer,
            cameraId,
            location,
          );

          console.log('aiResults: ', aiResults);

          const grpcTime = Date.now() - grpcStartTime;

          this.logger.debug(
            `✅ gRPC detection: ${grpcTime}ms for camera ${cameraId}`,
          );
        } catch (grpcError) {
          this.logger.error(`gRPC failed, falling back to HTTP:`, grpcError);

          // Fallback to HTTP if gRPC fails
          aiResults = await this.callHttpDetection(
            imageBuffer,
            fileName,
            cameraId,
            location,
          );
        }
      } else {
        // HTTP mode (fallback)
        this.logger.debug('Using HTTP mode (gRPC disabled)');
        aiResults = await this.callHttpDetection(
          imageBuffer,
          fileName,
          cameraId,
          location,
        );
      }

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

        // ✅ FIX: Create detection with proper typing
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
          // ✅ FIX: face_confidence can be number | undefined, NOT null
          face_confidence: det.face_confidence ?? undefined,
          timestamp: new Date(det.timestamp),
        });

        // ✅ FIX: Save single entity, not array
        const saved = await this.detectionRepo.save(detection);
        savedDetections.push(saved);
      }

      // Log total time
      const totalTime = Date.now() - startTime;
      if (totalTime > 100) {
        this.logger.warn(
          `Detection pipeline slow: ${totalTime}ms for camera ${cameraId}`,
        );
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
      if (error instanceof Error) {
        this.logger.error(`Detection processing failed: ${error.message}`);
      } else {
        this.logger.error('Detection processing failed: Unknown error');
      }
      throw error;
    }
  }

  /**
   * HTTP detection fallback method
   */
  private async callHttpDetection(
    imageBuffer: Buffer,
    fileName: string,
    cameraId: string,
    location?: string,
  ): Promise<{
    detections: AiDetectionResult[];
    total_persons: number;
    timestamp: string;
  }> {
    const httpStartTime = Date.now();

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

    const httpTime = Date.now() - httpStartTime;
    this.logger.debug(`HTTP detection: ${httpTime}ms for camera ${cameraId}`);

    // ✅ FIX: Transform HTTP response to match AiDetectionResult interface
    const transformedDetections: AiDetectionResult[] =
      response.data.detections.map((det) => ({
        track_id: det.track_id ?? `track_${Date.now()}`,
        frame_id: det.frame_id ?? 0,
        bbox: det.bbox,
        confidence: det.confidence,
        action: det.action ?? 'unknown',
        face_detected: det.face_detected ?? false,
        face_encoding: det.face_encoding ?? null,
        face_confidence: det.face_confidence ?? null,
        person_id: det.person_id ?? 0,
        timestamp: det.timestamp,
      }));

    return {
      detections: transformedDetections,
      total_persons: response.data.total_persons,
      timestamp: response.data.timestamp,
    };
  }

  async getRecentEvents(params: {
    limit?: number;
    offset?: number;
    camera_id?: string;
    person_type?: string;
    start_date?: string;
    end_date?: string;
  }) {
    const {
      limit = 50,
      offset = 0,
      camera_id,
      person_type,
      start_date,
      end_date,
    } = params;

    const query = this.detectionRepo
      .createQueryBuilder('d')
      .leftJoinAndSelect('d.camera', 'c')
      .orderBy('d.timestamp', 'DESC')
      .skip(offset)
      .take(limit);

    // Filters
    if (camera_id) {
      query.andWhere('d.camera_id = :camera_id', { camera_id });
    }

    if (person_type) {
      query.andWhere('d.person_type = :person_type', { person_type });
    }

    if (start_date) {
      query.andWhere('d.timestamp >= :start_date', { start_date });
    }

    if (end_date) {
      query.andWhere('d.timestamp <= :end_date', { end_date });
    }

    const [detections, total] = await query.getManyAndCount();

    // Transform to DTO
    const events = detections.map((d) => ({
      id: d.id.toString(),
      event_id: `EVT-${String(d.id).padStart(6, '0')}`,
      camera_id: d.camera_id,
      camera_name: d.camera?.name || 'Unknown',
      detected_time: d.timestamp.toISOString(),

      // Person info
      track_id: d.track_id,
      person_type: d.person_type,
      person_name: d.person_name,
      face_id: d.person_name
        ? `Face #${d.person_id}`
        : `Face #${d.track_id.slice(-3)}`,

      // Detection details
      action: d.action || 'unknown',
      confidence: Math.round(d.confidence * 100),
      face_confidence: d.face_confidence
        ? Math.round(d.face_confidence * 100)
        : null,

      // Event classification
      event_type: d.person_name ? 'Face Recognition' : 'Person Detection',
      event_details: this.getEventDetails(d),
      alert_level: this.getAlertLevel(d),

      // Media
      bbox: d.bbox,
      snapshot_url: `/api/detections/${d.id}/snapshot`,

      // Status
      has_violation: d.violation_detected ?? false,
      is_acknowledged: false,
      notes: null,
    }));

    return {
      events,
      total,
      page: Math.floor(offset / limit) + 1,
      pages: Math.ceil(total / limit),
    };
  }

  private getEventDetails(detection: Detection): string {
    if (detection.person_name) {
      return `Known - ${detection.person_name}${
        detection.action ? ` (${detection.action})` : ''
      }`;
    }

    if (detection.person_type === PersonType.GUEST) {
      return `Guest${detection.action ? ` (${detection.action})` : ''}`;
    }

    return `Unknown person${detection.action ? ` (${detection.action})` : ''}`;
  }

  private getAlertLevel(
    detection: Detection,
  ): 'normal' | 'warning' | 'critical' {
    if (detection.person_type === PersonType.UNKNOWN) {
      return 'warning';
    }

    if (detection.action === 'running' || detection.action === 'lying') {
      return 'warning';
    }

    return 'normal';
  }

  private async matchFaceWithResident(
    faceEncoding: number[],
  ): Promise<Resident | null> {
    const residents = await this.residentRepo.find({
      where: { status: ResidentStatus.ACTIVE },
      select: ['id', 'name', 'face_encoding'],
    });

    let bestMatch: Resident | null = null;
    let bestSimilarity = 0.6;

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

  private cosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (magA * magB);
  }

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
