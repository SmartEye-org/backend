import { Module } from '@nestjs/common';
import { DetectionsService } from './detections.service';
import { DetectionsController } from './detections.controller';
import { Detection } from './entities/detection.entity';
import { Camera } from '../cameras/entities/camera.entity';
import { Resident } from '../residents/entities/resident.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { EventsModule } from 'src/gateways/events.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Detection, Camera, Resident]),
    HttpModule,
    EventsModule,
  ],
  controllers: [DetectionsController],
  providers: [DetectionsService],
  exports: [DetectionsService],
})
export class DetectionsModule {}
