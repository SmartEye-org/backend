import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ViolationsService } from './violations.service';
import { CreateViolationDto } from './dto/create-violation.dto';
import { UpdateViolationDto } from './dto/update-violation.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('violations')
@Controller('violations')
export class ViolationsController {
  constructor(private readonly violationsService: ViolationsService) {}

  @Post()
  create(@Body() createViolationDto: CreateViolationDto) {
    return this.violationsService.create(createViolationDto);
  }

  @Get()
  findAll() {
    return this.violationsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.violationsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateViolationDto: UpdateViolationDto,
  ) {
    return this.violationsService.update(+id, updateViolationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.violationsService.remove(+id);
  }
}
