import { Module } from '@nestjs/common';
import { DetectionsService } from './detections.service';
import { DetectionsController } from './detections.controller';

@Module({
  controllers: [DetectionsController],
  providers: [DetectionsService],
})
export class DetectionsModule {}
