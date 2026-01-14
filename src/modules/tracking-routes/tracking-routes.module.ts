import { Module } from '@nestjs/common';
import { TrackingRoutesService } from './tracking-routes.service';
import { TrackingRoutesController } from './tracking-routes.controller';

@Module({
  controllers: [TrackingRoutesController],
  providers: [TrackingRoutesService],
})
export class TrackingRoutesModule {}
