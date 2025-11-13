import { Injectable } from '@nestjs/common';
import { CreateTrackingRouteDto } from './dto/create-tracking-route.dto';
import { UpdateTrackingRouteDto } from './dto/update-tracking-route.dto';

@Injectable()
export class TrackingRoutesService {
  create(createTrackingRouteDto: CreateTrackingRouteDto) {
    return 'This action adds a new trackingRoute';
  }

  findAll() {
    return `This action returns all trackingRoutes`;
  }

  findOne(id: number) {
    return `This action returns a #${id} trackingRoute`;
  }

  update(id: number, updateTrackingRouteDto: UpdateTrackingRouteDto) {
    return `This action updates a #${id} trackingRoute`;
  }

  remove(id: number) {
    return `This action removes a #${id} trackingRoute`;
  }
}
