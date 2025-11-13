import { Injectable } from '@nestjs/common';
import { CreateNgsiLdDto } from './dto/create-ngsi-ld.dto';
import { UpdateNgsiLdDto } from './dto/update-ngsi-ld.dto';

@Injectable()
export class NgsiLdsService {
  create(createNgsiLdDto: CreateNgsiLdDto) {
    return 'This action adds a new ngsiLd';
  }

  findAll() {
    return `This action returns all ngsiLds`;
  }

  findOne(id: number) {
    return `This action returns a #${id} ngsiLd`;
  }

  update(id: number, updateNgsiLdDto: UpdateNgsiLdDto) {
    return `This action updates a #${id} ngsiLd`;
  }

  remove(id: number) {
    return `This action removes a #${id} ngsiLd`;
  }
}
