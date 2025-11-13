import { PartialType } from '@nestjs/swagger';
import { CreateTrackingRouteDto } from './create-tracking-route.dto';

export class UpdateTrackingRouteDto extends PartialType(
  CreateTrackingRouteDto,
) {}
