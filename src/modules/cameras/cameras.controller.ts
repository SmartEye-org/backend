import { Controller } from '@nestjs/common';
import { CamerasService } from './cameras.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('cameras')
@Controller('cameras')
export class CamerasController {
  constructor(private readonly camerasService: CamerasService) {}
}
