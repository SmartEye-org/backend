import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { TrackingRoutesService } from './tracking-routes.service';
import { CreateTrackingRouteDto } from './dto/create-tracking-route.dto';
import { UpdateTrackingRouteDto } from './dto/update-tracking-route.dto';

@Controller('tracking-routes')
export class TrackingRoutesController {
  constructor(private readonly trackingRoutesService: TrackingRoutesService) {}

  @Post()
  create(@Body() createTrackingRouteDto: CreateTrackingRouteDto) {
    return this.trackingRoutesService.create(createTrackingRouteDto);
  }

  @Get()
  findAll() {
    return this.trackingRoutesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.trackingRoutesService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTrackingRouteDto: UpdateTrackingRouteDto,
  ) {
    return this.trackingRoutesService.update(+id, updateTrackingRouteDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.trackingRoutesService.remove(+id);
  }
}
