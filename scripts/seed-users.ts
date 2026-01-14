import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import {
  Building,
  BuildingStatus,
} from '../src/modules/buildings/entities/building.entity';
import { User, UserRole } from '../src/modules/users/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const buildingRepo = app.get<Repository<Building>>(
    getRepositoryToken(Building),
  );
  const userRepo = app.get<Repository<User>>(getRepositoryToken(User));

  const building = await buildingRepo.save({
    name: 'Vinhomes Central Park',
    code: 'VCP',
    address: '208 Nguyễn Hữu Cảnh, Bình Thạnh, TP.HCM',
    city: 'Ho Chi Minh City',
    location: { lat: 10.7879, lng: 106.7218 },
    status: BuildingStatus.ACTIVE,
  });

  const hashedPassword = await bcrypt.hash('admin123', 10);

  await userRepo.save({
    email: 'admin@smarteye.vn',
    password: hashedPassword,
    full_name: 'Nguyễn Văn A',
    role: UserRole.ADMIN,
    building_id: building.id,
    phone: '+84901234567',
  });

  console.log('Seed thành công!');
  await app.close();
}

void seed();
