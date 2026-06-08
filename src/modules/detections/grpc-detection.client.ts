import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';

// ─── Proto Types (matching updated detection_service.proto) ────────────────────

interface Image {
  image_data: Buffer;
  camera_id: string;
  timestamp: string;
}

interface BoundingBox {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

interface PersonDetectionProto {
  person_id: number;
  bbox: BoundingBox;
  confidence: number;
  face_detected: boolean;
  timestamp: string;
  track_id: string;
  action: string;
  violation_detected: boolean;
  violation_type: string;
  violation_severity: string;
  violation_description: string;
}

interface DetectPersonResponse {
  detections: PersonDetectionProto[];
  violations: PersonDetectionProto[];
  total_persons: number;
  timestamp: string;
  success: boolean;
  message: string;
}

interface HealthCheckResponse {
  healthy: boolean;
  version: string;
  timestamp: string;
  message: string;
}

interface DetectionServiceClient {
  DetectPerson(
    request: { image: Image; location?: string },
    callback: (err: grpc.ServiceError | null, res: DetectPersonResponse) => void,
  ): void;

  HealthCheck(
    request: { service: string },
    callback: (err: grpc.ServiceError | null, res: HealthCheckResponse) => void,
  ): void;
}

// ─── Normalized result consumed by DetectionsService ──────────────────────────

export interface GrpcDetectionResult {
  track_id: string;
  person_id: number;
  frame_id: number;
  bbox: number[];
  confidence: number;
  action: string;
  face_detected: boolean;
  face_encoding: number[] | null;
  face_confidence: number | null;
  violation_detected: boolean;
  violation_type: string | null;
  violation_severity: string | null;
  violation_description: string | null;
  timestamp: string;
}

export interface GrpcDetectResult {
  detections: GrpcDetectionResult[];
  violations: GrpcDetectionResult[];
  total_persons: number;
  timestamp: string;
}

// ─── Client ───────────────────────────────────────────────────────────────────

@Injectable()
export class GrpcDetectionClient implements OnModuleInit {
  private readonly logger = new Logger(GrpcDetectionClient.name);
  private client: DetectionServiceClient;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const PROTO_PATH = path.join(
      process.cwd(),
      'proto/detection_service.proto',
    );

    this.logger.log(`Loading proto from: ${PROTO_PATH}`);

    const packageDef = protoLoader.loadSync(PROTO_PATH, {
      keepCase: true,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true,
    });

    const protoDescriptor = grpc.loadPackageDefinition(packageDef);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const detectionPkg = protoDescriptor.detection as any;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const DetectionService = detectionPkg.DetectionService;

    const grpcUrl =
      this.configService.get<string>('AI_SERVICE_GRPC_URL') || 'localhost:50051';

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    this.client = new DetectionService(
      grpcUrl,
      grpc.credentials.createInsecure(),
      {
        'grpc.keepalive_time_ms': 10000,
        'grpc.keepalive_timeout_ms': 5000,
        'grpc.keepalive_permit_without_calls': 1,
        'grpc.max_send_message_length': 50 * 1024 * 1024,
        'grpc.max_receive_message_length': 50 * 1024 * 1024,
      },
    ) as unknown as DetectionServiceClient;

    this.logger.log(`✅ gRPC client connected to ${grpcUrl}`);
  }

  /**
   * Detect persons with tracking + behavior + violation info via gRPC.
   * Returns normalized result including violations array.
   */
  async detectPersons(
    imageBuffer: Buffer,
    cameraId: string,
    location?: string,
  ): Promise<GrpcDetectResult> {
    const startTime = Date.now();

    return new Promise((resolve, reject) => {
      this.client.DetectPerson(
        {
          image: {
            image_data: imageBuffer,
            camera_id: cameraId,
            timestamp: new Date().toISOString(),
          },
          location: location ?? '',
        },
        (error, response) => {
          if (error) {
            this.logger.error(
              `gRPC DetectPerson failed [${cameraId}]: ${error.message}`,
            );
            reject(error);
            return;
          }

          const elapsed = Date.now() - startTime;
          if (elapsed > 150) {
            this.logger.warn(`Slow gRPC: ${elapsed}ms [${cameraId}]`);
          } else {
            this.logger.debug(`gRPC: ${elapsed}ms [${cameraId}]`);
          }

          const mapDet = (det: PersonDetectionProto): GrpcDetectionResult => ({
            track_id: det.track_id || `track_${cameraId}_${det.person_id}`,
            person_id: det.person_id,
            frame_id: 0,
            bbox: [det.bbox.x1, det.bbox.y1, det.bbox.x2, det.bbox.y2],
            confidence: det.confidence,
            action: det.action || 'unknown',
            face_detected: det.face_detected,
            face_encoding: null,
            face_confidence: null,
            violation_detected: det.violation_detected,
            violation_type: det.violation_type || null,
            violation_severity: det.violation_severity || null,
            violation_description: det.violation_description || null,
            timestamp: det.timestamp || new Date().toISOString(),
          });

          resolve({
            detections: response.detections.map(mapDet),
            violations: (response.violations ?? []).map(mapDet),
            total_persons: response.total_persons,
            timestamp: response.timestamp,
          });
        },
      );
    });
  }

  async healthCheck(): Promise<boolean> {
    return new Promise((resolve) => {
      this.client.HealthCheck({ service: 'detection' }, (error, response) => {
        if (error) {
          this.logger.error(`gRPC health check failed: ${error.message}`);
          resolve(false);
          return;
        }
        resolve(response.healthy);
      });
    });
  }
}
