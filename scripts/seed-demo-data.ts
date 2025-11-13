import {
  Camera,
  CameraStatus,
  CameraZoneType,
} from 'src/modules/cameras/entities/camera.entity';
import {
  Resident,
  ResidentStatus,
} from 'src/modules/residents/entities/resident.entity';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { Repository } from 'typeorm';
import { Building } from 'src/modules/buildings/entities/building.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

async function seedDemoData() {
  const app = await NestFactory.createApplicationContext(AppModule);

  // Get repositories
  const buildingRepo = app.get<Repository<Building>>(
    getRepositoryToken(Building),
  );
  const cameraRepo = app.get<Repository<Camera>>(getRepositoryToken(Camera));
  const residentRepo = app.get<Repository<Resident>>(
    getRepositoryToken(Resident),
  );

  // Get demo building
  const building = await buildingRepo.findOne({
    where: { code: 'VCP' },
  });

  if (!building) {
    console.error('❌ No building found. Run seed-users.ts first!');
    return;
  }

  // Seed Cameras
  const cameras = [
    {
      id: 'camera-01',
      name: 'Cổng chính',
      location: 'Tầng 1 - Lối vào chính',
      zone_type: CameraZoneType.ENTRANCE,
      building_id: building.id,
      status: CameraStatus.ONLINE,
      fps: 25,
    },
    {
      id: 'camera-02',
      name: 'Sảnh chính',
      location: 'Tầng 1 - Sảnh',
      zone_type: CameraZoneType.LOBBY,
      building_id: building.id,
      status: CameraStatus.ONLINE,
      fps: 25,
    },
    {
      id: 'camera-03',
      name: 'Thang máy A',
      location: 'Tầng 1-10',
      zone_type: CameraZoneType.ELEVATOR,
      building_id: building.id,
      status: CameraStatus.ONLINE,
      fps: 30,
    },
    {
      id: 'camera-04',
      name: 'Hành lang tầng 5',
      location: 'Tầng 5',
      zone_type: CameraZoneType.FLOOR,
      building_id: building.id,
      status: CameraStatus.ONLINE,
      fps: 25,
    },
    {
      id: 'camera-05',
      name: 'Bãi đỗ xe B1',
      location: 'Tầng hầm B1',
      zone_type: CameraZoneType.RESTRICTED,
      building_id: building.id,
      status: CameraStatus.ONLINE,
      fps: 25,
    },
  ];

  await cameraRepo.save(cameras);
  console.log('✅ Seeded', cameras.length, 'cameras');

  // Seed Residents
  const residents = [
    {
      id: 'resident-001',
      name: 'Nguyễn Văn A',
      apartment: '501',
      phone: '+84901234567',
      email: 'nguyenvana@gmail.com',
      building_id: building.id,
      status: ResidentStatus.ACTIVE,
    },
    {
      id: 'resident-002',
      name: 'Trần Thị B',
      apartment: '502',
      phone: '+84902345678',
      email: 'tranthib@gmail.com',
      building_id: building.id,
      status: ResidentStatus.ACTIVE,
    },
    {
      id: 'resident-003',
      name: 'Lê Văn C',
      apartment: '503',
      phone: '+84903456789',
      building_id: building.id,
      status: ResidentStatus.ACTIVE,
    },
  ];

  await residentRepo.save(residents);
  console.log('✅ Seeded', residents.length, 'residents');

  console.log('\n✅ Demo data seeded successfully!');
  console.log('📊 Database ready for testing');

  await app.close();
}

void seedDemoData();
