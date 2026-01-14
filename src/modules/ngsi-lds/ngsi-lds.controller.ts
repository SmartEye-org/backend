import { Controller } from '@nestjs/common';
import { NgsiLdsService } from './ngsi-lds.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('ngsi-ld')
@Controller('ngsi-lds')
export class NgsiLdsController {
  constructor(private readonly ngsiLdsService: NgsiLdsService) {}
}
