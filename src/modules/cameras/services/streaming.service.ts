import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Camera, CameraStatus, StreamType } from '../entities/camera.entity';
import { EventsGateway } from 'src/gateways/events.gateway';
import { DetectionsService } from 'src/modules/detections/detections.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { spawn, ChildProcess } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

interface StreamInstance {
  cameraId: string;
  interval: NodeJS.Timeout;
  frameCount: number;
  startedAt: Date;
  isActive: boolean;
  ffmpegProcess?: ChildProcess;
  lastDetections?: any[];
}

@Injectable()
export class StreamingService {
  private readonly logger = new Logger(StreamingService.name);
  private streams = new Map<string, StreamInstance>();
  private readonly tempDir = path.join(process.cwd(), 'temp', 'frames');

  constructor(
    @InjectRepository(Camera)
    private readonly cameraRepo: Repository<Camera>,
    private readonly detectionsService: DetectionsService,
    private readonly eventsGateway: EventsGateway,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
      this.logger.log(`Created temp directory: ${this.tempDir}`);
    }
  }

  async startStream(cameraId: string, fps: number = 30): Promise<Camera> {
    const camera = await this.cameraRepo.findOne({
      where: { id: cameraId },
    });

    if (!camera) {
      throw new NotFoundException(`Camera ${cameraId} not found`);
    }

    if (this.streams.has(cameraId)) {
      this.logger.warn(`Camera ${cameraId} is already streaming`);
      return camera;
    }

    camera.is_streaming = true;
    camera.status = CameraStatus.ONLINE;
    camera.stream_config = {
      ...camera.stream_config,
      fps,
    };
    await this.cameraRepo.save(camera);

    const instance = this.createStreamInstance(camera, fps);
    this.streams.set(cameraId, instance);

    this.logger.log(`Started streaming for camera ${cameraId} at ${fps} FPS`);

    return camera;
  }

  async stopStream(cameraId: string): Promise<Camera> {
    const camera = await this.cameraRepo.findOne({
      where: { id: cameraId },
    });

    if (!camera) {
      throw new NotFoundException(`Camera ${cameraId} not found`);
    }

    const instance = this.streams.get(cameraId);
    if (instance) {
      clearInterval(instance.interval);

      if (instance.ffmpegProcess) {
        instance.ffmpegProcess.kill('SIGKILL');
        this.logger.log(`Killed FFmpeg process for camera ${cameraId}`);
      }

      instance.isActive = false;
      this.streams.delete(cameraId);
      this.logger.log(`Stopped streaming for camera ${cameraId}`);
    }

    camera.is_streaming = false;
    camera.status = CameraStatus.OFFLINE;
    await this.cameraRepo.save(camera);

    this.eventsGateway.broadcastStreamStatus({
      camera_id: cameraId,
      camera_name: camera.name,
      is_streaming: false,
      status: CameraStatus.OFFLINE,
    });

    return camera;
  }

  private createStreamInstance(camera: Camera, fps: number): StreamInstance {
    const intervalMs = 1000 / fps;

    const instance: StreamInstance = {
      cameraId: camera.id,
      frameCount: 0,
      startedAt: new Date(),
      isActive: true,
      lastDetections: [],
      interval: setInterval(() => {
        this.processFrame(camera, instance).catch((error) => {
          this.logger.error(
            `Error processing frame for camera ${camera.id}:`,
            error,
          );
        });
      }, intervalMs),
    };

    if (camera.stream_type === StreamType.RTSP) {
      instance.ffmpegProcess = this.startRtspCapture(camera, fps);
    }

    return instance;
  }

  private async processFrame(
    camera: Camera,
    instance: StreamInstance,
  ): Promise<void> {
    try {
      const frameBuffer = await this.extractFrame(camera);

      if (!frameBuffer) {
        return;
      }

      const detectionInterval = Math.max(
        1,
        Math.floor((camera.stream_config?.fps ?? 30) / 10) || 3,
      );
      const shouldDetect = camera.frame_count % detectionInterval === 0;

      let detectionResult: {
        saved_detections: number;
        detections: any[];
        total_persons: number;
        timestamp: string;
      } | null = null;

      if (shouldDetect) {
        detectionResult = await this.detectionsService.processImage(
          frameBuffer,
          `frame_${Date.now()}.jpg`,
          camera.id,
          camera.location,
        );

        if (detectionResult) {
          instance.lastDetections = detectionResult.detections;
        }
      }

      camera.frame_count += 1;
      camera.last_frame_at = new Date();

      if (camera.frame_count % 10 === 0) {
        await this.cameraRepo.save(camera);
      }

      this.eventsGateway.broadcastFrame({
        camera_id: camera.id,
        camera_name: camera.name,
        frame_number: camera.frame_count,
        frame_data: `data:image/jpeg;base64,${frameBuffer.toString('base64')}`,
        detections:
          detectionResult?.detections ?? instance.lastDetections ?? [],
        total_persons:
          detectionResult?.total_persons ??
          instance.lastDetections?.length ??
          0,
        timestamp: new Date().toISOString(),
      });

      instance.frameCount += 1;
    } catch (error) {
      this.logger.error(
        `Error processing frame for camera ${camera.id}:`,
        error,
      );

      if (camera.status !== CameraStatus.ERROR) {
        camera.status = CameraStatus.ERROR;
        await this.cameraRepo.save(camera);
      }
    }
  }

  private async extractFrame(camera: Camera): Promise<Buffer | null> {
    switch (camera.stream_type) {
      case StreamType.FILE:
        return this.extractFrameFromFile(camera.stream_url);
      case StreamType.HTTP:
        return this.extractFrameFromHttp(camera.stream_url);
      case StreamType.RTSP:
        return this.extractFrameFromRtsp(camera);
      case StreamType.WEBCAM:
        this.logger.warn('Webcam streaming not yet implemented');
        return null;
      default:
        return null;
    }
  }

  private extractFrameFromFile(filePath: string): Buffer | null {
    try {
      if (!fs.existsSync(filePath)) {
        this.logger.error(`File not found: ${filePath}`);
        return null;
      }
      return fs.readFileSync(filePath);
    } catch (error) {
      this.logger.error(`Error reading file ${filePath}:`, error);
      return null;
    }
  }

  private async extractFrameFromHttp(url: string): Promise<Buffer | null> {
    try {
      const response = await this.httpService.axiosRef.get(url, {
        responseType: 'arraybuffer',
        timeout: 5000,
      });
      return Buffer.from(response.data);
    } catch (error) {
      this.logger.error(`Error fetching frame from ${url}:`, error);
      return null;
    }
  }

  private extractFrameFromRtsp(camera: Camera): Buffer | null {
    const latestFramePath = path.join(this.tempDir, `${camera.id}_latest.jpg`);

    try {
      if (fs.existsSync(latestFramePath)) {
        const stats = fs.statSync(latestFramePath);
        const age = Date.now() - stats.mtimeMs;

        if (age < 2000) {
          return fs.readFileSync(latestFramePath);
        } else {
          this.logger.warn(
            `Frame for camera ${camera.id} is stale (${age}ms old)`,
          );
        }
      }
      return null;
    } catch (error) {
      this.logger.error(`Error reading RTSP frame:`, error);
      return null;
    }
  }

  private startRtspCapture(camera: Camera, fps: number = 30): ChildProcess {
    const outputPath = path.join(this.tempDir, `${camera.id}_latest.jpg`);
    const streamUrl = camera.stream_url || camera.rtsp_url;

    const ffmpegArgs = [
      '-rtsp_transport',
      'tcp',
      '-i',
      streamUrl,
      '-vf',
      `fps=${Math.min(fps, 30)}`,
      '-q:v',
      '2',
      '-update',
      '1',
      '-y',
      outputPath,
    ];

    this.logger.log(`Starting FFmpeg for camera ${camera.id} at ${fps} FPS`);
    this.logger.debug(`FFmpeg command: ffmpeg ${ffmpegArgs.join(' ')}`);

    const ffmpegProcess = spawn('ffmpeg', ffmpegArgs);

    ffmpegProcess.stdout.on('data', (data) => {
      this.logger.debug(`FFmpeg stdout [${camera.id}]: ${data}`);
    });

    ffmpegProcess.stderr.on('data', (data: Buffer | string) => {
      const message = data.toString();
      if (message.includes('error') || message.includes('Error')) {
        this.logger.error(`FFmpeg error [${camera.id}]: ${message}`);
      }
    });

    ffmpegProcess.on('error', (error) => {
      this.logger.error(`FFmpeg process error [${camera.id}]:`, error);
    });

    ffmpegProcess.on('exit', (code, signal) => {
      this.logger.warn(
        `FFmpeg process exited [${camera.id}] - Code: ${code}, Signal: ${signal}`,
      );
    });

    return ffmpegProcess;
  }

  getActiveStreams(): StreamInstance[] {
    return Array.from(this.streams.values());
  }

  getStreamStatus(cameraId: string): StreamInstance | null {
    return this.streams.get(cameraId) || null;
  }

  isStreaming(cameraId: string): boolean {
    return this.streams.has(cameraId);
  }

  async stopAllStreams(): Promise<void> {
    const cameraIds = Array.from(this.streams.keys());
    for (const cameraId of cameraIds) {
      await this.stopStream(cameraId);
    }
    this.logger.log('Stopped all streams');
  }

  cleanupTempFiles(): void {
    try {
      const files = fs.readdirSync(this.tempDir);
      const now = Date.now();
      const maxAge = 60 * 60 * 1000;

      for (const file of files) {
        const filePath = path.join(this.tempDir, file);
        const stats = fs.statSync(filePath);

        if (now - stats.mtimeMs > maxAge) {
          fs.unlinkSync(filePath);
          this.logger.debug(`Cleaned up old temp file: ${file}`);
        }
      }
    } catch (error) {
      this.logger.error('Error cleaning up temp files:', error);
    }
  }

  async onModuleDestroy() {
    await this.stopAllStreams();
  }
}
