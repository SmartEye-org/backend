import { Controller } from '@nestjs/common';
import { ViolationsService } from './violations.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('violations')
@Controller('violations')
export class ViolationsController {
  constructor(private readonly violationsService: ViolationsService) {}
}
