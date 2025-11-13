import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { NgsiLdsService } from './ngsi-lds.service';
import { CreateNgsiLdDto } from './dto/create-ngsi-ld.dto';
import { UpdateNgsiLdDto } from './dto/update-ngsi-ld.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('ngsi-ld')
@Controller('ngsi-lds')
export class NgsiLdsController {
  constructor(private readonly ngsiLdsService: NgsiLdsService) {}

  @Post()
  create(@Body() createNgsiLdDto: CreateNgsiLdDto) {
    return this.ngsiLdsService.create(createNgsiLdDto);
  }

  @Get()
  findAll() {
    return this.ngsiLdsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ngsiLdsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateNgsiLdDto: UpdateNgsiLdDto) {
    return this.ngsiLdsService.update(+id, updateNgsiLdDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ngsiLdsService.remove(+id);
  }
}
