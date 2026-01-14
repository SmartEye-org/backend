import { Controller } from '@nestjs/common';
import { TrackingRoutesService } from './tracking-routes.service';

@Controller('tracking-routes')
export class TrackingRoutesController {
  constructor(private readonly trackingRoutesService: TrackingRoutesService) {}
}
