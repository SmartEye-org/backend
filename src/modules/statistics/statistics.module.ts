import { Module } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { StatisticsController } from './statistics.controller';
import { Detection } from 'src/modules/detections/entities/detection.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Camera } from 'src/modules/cameras/entities/camera.entity';
import { Violation } from 'src/modules/violations/entities/violation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Detection, Camera, Violation])],
  controllers: [StatisticsController],
  providers: [StatisticsService],
  exports: [StatisticsService],
})
export class StatisticsModule {}
