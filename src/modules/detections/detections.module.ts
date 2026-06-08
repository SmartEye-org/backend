import { Module } from '@nestjs/common';
import { DetectionsService } from './detections.service';
import { DetectionsController } from './detections.controller';
import { Detection } from './entities/detection.entity';
import { Camera } from '../cameras/entities/camera.entity';
import { Resident } from '../residents/entities/resident.entity';
import { Violation } from '../violations/entities/violation.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { EventsModule } from 'src/gateways/events.module';
import { GrpcDetectionClient } from './grpc-detection.client';
import { ViolationsModule } from '../violations/violations.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Detection, Camera, Resident, Violation]),
    HttpModule,
    EventsModule,
    ViolationsModule,
  ],
  controllers: [DetectionsController],
  providers: [DetectionsService, GrpcDetectionClient],
  exports: [DetectionsService],
})
export class DetectionsModule {}
