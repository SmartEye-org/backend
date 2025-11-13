import { Injectable } from '@nestjs/common';
import { CreateViolationDto } from './dto/create-violation.dto';
import { UpdateViolationDto } from './dto/update-violation.dto';

@Injectable()
export class ViolationsService {
  create(createViolationDto: CreateViolationDto) {
    return 'This action adds a new violation';
  }

  findAll() {
    return `This action returns all violations`;
  }

  findOne(id: number) {
    return `This action returns a #${id} violation`;
  }

  update(id: number, updateViolationDto: UpdateViolationDto) {
    return `This action updates a #${id} violation`;
  }

  remove(id: number) {
    return `This action removes a #${id} violation`;
  }
}
