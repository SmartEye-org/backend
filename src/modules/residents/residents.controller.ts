import { Controller } from '@nestjs/common';
import { ResidentsService } from './residents.service';

@Controller('residents')
export class ResidentsController {
  constructor(private readonly residentsService: ResidentsService) {}
}
