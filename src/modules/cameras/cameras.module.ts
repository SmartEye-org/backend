import { Module } from '@nestjs/common';
import { CamerasService } from './services/cameras.service';
import { CamerasController } from './cameras.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Camera } from './entities/camera.entity';
import { HttpModule } from '@nestjs/axios';
import { EventsModule } from 'src/gateways/events.module';
import { DetectionsModule } from '../detections/detections.module';
import { StreamingService } from './services/streaming.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Camera]),
    HttpModule,
    EventsModule,
    DetectionsModule,
  ],
  controllers: [CamerasController],
  providers: [CamerasService, StreamingService],
  exports: [CamerasService, StreamingService],
})
export class CamerasModule {}
