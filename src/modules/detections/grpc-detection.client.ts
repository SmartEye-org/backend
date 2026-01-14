import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';

// gRPC service client interface
interface DetectionServiceClient {
  DetectPerson(
    request: DetectPersonRequest,
    callback: (
      error: grpc.ServiceError | null,
      response: DetectPersonResponse,
    ) => void,
  ): void;

  HealthCheck(
    request: HealthCheckRequest,
    callback: (
      error: grpc.ServiceError | null,
      response: HealthCheckResponse,
    ) => void,
  ): void;
}

// Request/Response types matching proto
interface Image {
  image_data: Buffer;
  camera_id: string;
  timestamp: string;
}

interface DetectPersonRequest {
  image: Image;
}

interface BoundingBox {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

interface PersonDetection {
  person_id: number;
  bbox: BoundingBox;
  confidence: number;
  face_detected: boolean;
  timestamp: string;
}

interface DetectPersonResponse {
  detections: PersonDetection[];
  total_persons: number;
  timestamp: string;
  success: boolean;
  message: string;
}

interface HealthCheckRequest {
  service: string;
}

interface HealthCheckResponse {
  healthy: boolean;
  version: string;
  timestamp: string;
  message: string;
}

// Type for gRPC detection result
interface GrpcDetectionResult {
  track_id: string;
  frame_id: number;
  bbox: number[];
  confidence: number;
  action: string;
  face_detected: boolean;
  face_encoding: number[] | null;
  face_confidence: number | null;
  person_id: number;
  timestamp: string;
}

@Injectable()
export class GrpcDetectionClient implements OnModuleInit {
  private readonly logger = new Logger(GrpcDetectionClient.name);
  private client: DetectionServiceClient;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    // Proto file path - relative to compiled JS file location
    const PROTO_PATH = path.join(
      process.cwd(), // Use process.cwd() instead of __dirname
      'proto/detection_service.proto',
    );

    this.logger.log(`Loading proto file from: ${PROTO_PATH}`);

    const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
      keepCase: true,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true,
    });

    const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);

    // Correct way to access the service from proto descriptor
    // The structure is: protoDescriptor.detection (package name)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const detectionPackage = protoDescriptor.detection as any;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const DetectionService = detectionPackage.DetectionService;

    // Get gRPC server address from config
    const grpcUrl =
      this.configService.get<string>('AI_SERVICE_GRPC_URL') ||
      'localhost:50051';

    // Create client with proper typing
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    this.client = new DetectionService(
      grpcUrl,
      grpc.credentials.createInsecure(),
      {
        'grpc.keepalive_time_ms': 10000,
        'grpc.keepalive_timeout_ms': 5000,
        'grpc.keepalive_permit_without_calls': 1,
        'grpc.max_send_message_length': 10 * 1024 * 1024,
        'grpc.max_receive_message_length': 10 * 1024 * 1024,
      },
    ) as unknown as DetectionServiceClient;

    this.logger.log(`✅ gRPC client connected to ${grpcUrl}`);
  }

  /**
   * Detect persons using gRPC (3-10x faster than HTTP)
   */
  async detectPersons(
    imageBuffer: Buffer,
    cameraId: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _location?: string, // Intentionally unused - reserved for future use
  ): Promise<{
    detections: GrpcDetectionResult[];
    total_persons: number;
    timestamp: string;
  }> {
    const startTime = Date.now();

    return new Promise((resolve, reject) => {
      const request: DetectPersonRequest = {
        image: {
          image_data: imageBuffer,
          camera_id: cameraId,
          timestamp: new Date().toISOString(),
        },
      };

      this.client.DetectPerson(request, (error, response) => {
        if (error) {
          this.logger.error(
            `gRPC DetectPerson failed for ${cameraId}:`,
            error.message,
          );
          reject(error);
          return;
        }

        const requestTime = Date.now() - startTime;

        // Log performance
        if (requestTime > 100) {
          this.logger.warn(
            `Slow gRPC detection: ${requestTime}ms for camera ${cameraId}`,
          );
        } else {
          this.logger.debug(
            `gRPC detection: ${requestTime}ms for camera ${cameraId}`,
          );
        }

        // Transform with proper typing
        const detections: GrpcDetectionResult[] = response.detections.map(
          (det): GrpcDetectionResult => ({
            track_id: `track_${cameraId}_${det.person_id}_${Date.now()}`,
            frame_id: 0,
            bbox: [det.bbox.x1, det.bbox.y1, det.bbox.x2, det.bbox.y2],
            confidence: det.confidence,
            action: 'unknown',
            face_detected: det.face_detected,
            face_encoding: null,
            face_confidence: null,
            person_id: det.person_id,
            timestamp: det.timestamp,
          }),
        );

        resolve({
          detections,
          total_persons: response.total_persons,
          timestamp: response.timestamp,
        });
      });
    });
  }

  /**
   * Health check using gRPC
   */
  async healthCheck(): Promise<boolean> {
    return new Promise((resolve) => {
      this.client.HealthCheck({ service: 'detection' }, (error, response) => {
        if (error) {
          this.logger.error('gRPC health check failed:', error.message);
          resolve(false);
          return;
        }
        resolve(response.healthy);
      });
    });
  }
}
