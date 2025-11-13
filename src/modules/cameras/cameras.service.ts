import { Injectable } from '@nestjs/common';
import { CreateCameraDto } from './dto/create-camera.dto';
import { UpdateCameraDto } from './dto/update-camera.dto';

@Injectable()
export class CamerasService {
  create(createCameraDto: CreateCameraDto) {
    return 'This action adds a new camera';
  }

  findAll() {
    return `This action returns all cameras`;
  }

  findOne(id: number) {
    return `This action returns a #${id} camera`;
  }

  update(id: number, updateCameraDto: UpdateCameraDto) {
    return `This action updates a #${id} camera`;
  }

  remove(id: number) {
    return `This action removes a #${id} camera`;
  }
}
