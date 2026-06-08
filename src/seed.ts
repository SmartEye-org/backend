/**
 * Seed script — creates initial data for development/demo
 * Run: npx ts-node src/seed.ts
 */
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import {
  Building,
  BuildingStatus,
} from './modules/buildings/entities/building.entity';
import {
  User,
  UserRole,
  UserStatus,
} from './modules/users/entities/user.entity';
import {
  Camera,
  CameraStatus,
  CameraZoneType,
  StreamType,
} from './modules/cameras/entities/camera.entity';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || '123456',
  database:
    process.env.DB_NAME || process.env.DB_DATABASE || 'smart_residential',
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  synchronize: true,
});

async function seed() {
  await AppDataSource.initialize();
  console.log('✅ Database connected');

  const buildingRepo = AppDataSource.getRepository(Building);
  const userRepo = AppDataSource.getRepository(User);
  const cameraRepo = AppDataSource.getRepository(Camera);

  // --- Building ---
  let building = await buildingRepo.findOne({ where: { code: 'DEMO' } });
  if (!building) {
    building = buildingRepo.create({
      name: 'SmartEyes Demo Building',
      code: 'DEMO',
      address: '1 Nguyễn Hữu Thọ, Quận 7, TP.HCM',
      city: 'Hồ Chí Minh',
      location: { lat: 10.7321, lng: 106.6992 },
      contact_email: 'admin@smarteyes-demo.vn',
      contact_phone: '0901234567',
      status: BuildingStatus.ACTIVE,
    });
    building = await buildingRepo.save(building);
    console.log(`✅ Building created: ${building.name} (${building.id})`);
  } else {
    console.log(`ℹ️  Building already exists: ${building.name}`);
  }

  // --- Super Admin ---
  const superAdminEmail = 'superadmin@smarteyes.vn';
  let superAdmin = await userRepo.findOne({
    where: { email: superAdminEmail },
  });
  if (!superAdmin) {
    const hash = await bcrypt.hash('Admin@123456', 10);
    superAdmin = userRepo.create({
      email: superAdminEmail,
      password: hash,
      full_name: 'Super Administrator',
      role: UserRole.SUPER_ADMIN,
      status: UserStatus.ACTIVE,
    });
    await userRepo.save(superAdmin);
    console.log(`✅ Super Admin: ${superAdminEmail} / Admin@123456`);
  } else {
    console.log(`ℹ️  Super Admin already exists`);
  }

  // --- Admin ---
  const adminEmail = 'admin@smarteyes.vn';
  let admin = await userRepo.findOne({ where: { email: adminEmail } });
  if (!admin) {
    const hash = await bcrypt.hash('Admin@123456', 10);
    admin = userRepo.create({
      email: adminEmail,
      password: hash,
      full_name: 'Building Admin',
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      building_id: building.id,
    });
    await userRepo.save(admin);
    console.log(`✅ Admin: ${adminEmail} / Admin@123456`);
  } else {
    console.log(`ℹ️  Admin already exists`);
  }

  // --- Security Guard ---
  const securityEmail = 'security@smarteyes.vn';
  let security = await userRepo.findOne({ where: { email: securityEmail } });
  if (!security) {
    const hash = await bcrypt.hash('Security@123', 10);
    security = userRepo.create({
      email: securityEmail,
      password: hash,
      full_name: 'Security Guard',
      role: UserRole.SECURITY,
      status: UserStatus.ACTIVE,
      building_id: building.id,
    });
    await userRepo.save(security);
    console.log(`✅ Security: ${securityEmail} / Security@123`);
  } else {
    console.log(`ℹ️  Security guard already exists`);
  }

  // --- Cameras ---
  const cameraSeeds = [
    {
      id: 'camera-lobby-01',
      name: 'Lobby Camera 1',
      location: 'Main Lobby - Ground Floor',
      zone_type: CameraZoneType.LOBBY,
      rtsp_url: 'rtsp://localhost:8554/stream1',
      stream_url: 'rtsp://localhost:8554/stream1',
      stream_type: StreamType.RTSP,
      fps: 5,
      resolution: '1920x1080',
    },
    {
      id: 'camera-entrance-01',
      name: 'Entrance Camera 1',
      location: 'Main Entrance',
      zone_type: CameraZoneType.ENTRANCE,
      rtsp_url: 'rtsp://localhost:8554/stream2',
      stream_url: 'rtsp://localhost:8554/stream2',
      stream_type: StreamType.RTSP,
      fps: 5,
      resolution: '1920x1080',
    },
    {
      id: 'camera-elevator-01',
      name: 'Elevator Camera 1',
      location: 'Elevator B1',
      zone_type: CameraZoneType.ELEVATOR,
      rtsp_url: 'rtsp://localhost:8554/stream1',
      stream_url: 'rtsp://localhost:8554/stream1',
      stream_type: StreamType.RTSP,
      fps: 5,
      resolution: '1280x720',
    },
    {
      id: 'camera-restricted-01',
      name: 'Server Room Camera',
      location: 'Server Room - Basement',
      zone_type: CameraZoneType.RESTRICTED,
      rtsp_url: 'rtsp://localhost:8554/stream2',
      stream_url: 'rtsp://localhost:8554/stream2',
      stream_type: StreamType.RTSP,
      fps: 3,
      resolution: '1280x720',
    },
  ];

  for (const seed of cameraSeeds) {
    const exists = await cameraRepo.findOne({ where: { id: seed.id } });
    if (!exists) {
      const camera = cameraRepo.create({
        ...seed,
        status: CameraStatus.OFFLINE,
        building_id: building.id,
      });
      await cameraRepo.save(camera);
      console.log(`✅ Camera: ${camera.name} (${camera.id})`);
    } else {
      console.log(`ℹ️  Camera already exists: ${seed.id}`);
    }
  }

  console.log('\n🎉 Seed completed!');
  console.log('\n📋 Demo accounts:');
  console.log('  Super Admin : superadmin@smarteyes.vn / Admin@123456');
  console.log('  Admin       : admin@smarteyes.vn / Admin@123456');
  console.log('  Security    : security@smarteyes.vn / Security@123');
  console.log(
    '\n📷 Demo cameras: camera-lobby-01, camera-entrance-01, camera-elevator-01, camera-restricted-01',
  );

  await AppDataSource.destroy();
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
