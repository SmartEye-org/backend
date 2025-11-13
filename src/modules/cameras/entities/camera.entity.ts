import { Building } from 'src/modules/buildings/entities/building.entity';
import { Detection } from 'src/modules/detections/entities/detection.entity';
import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';

export enum CameraZoneType {
  ENTRANCE = 'entrance',
  LOBBY = 'lobby',
  ELEVATOR = 'elevator',
  FLOOR = 'floor',
  RESTRICTED = 'restricted',
}

export enum CameraStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  ERROR = 'error',
}

@Entity('cameras')
export class Camera {
  @PrimaryColumn({ length: 50 })
  id: string; // camera-01

  @Column({ length: 255 })
  name: string;

  @Column({ length: 255 })
  location: string;

  @Column({
    type: 'enum',
    enum: CameraZoneType,
    nullable: true,
  })
  zone_type: CameraZoneType;

  @Column({ type: 'point', nullable: true })
  coordinates: string; // PostGIS POINT(lon, lat)

  @Column({ length: 500, nullable: true })
  rtsp_url: string;

  @Column({
    type: 'enum',
    enum: CameraStatus,
    default: CameraStatus.OFFLINE,
  })
  status: CameraStatus;

  @Column({ type: 'int', default: 25 })
  fps: number;

  @Column({ length: 20, default: '1920x1080' })
  resolution: string;

  // Multi-tenant
  @Column({ type: 'uuid' })
  building_id: string;

  @ManyToOne(() => Building, (building) => building.cameras)
  @JoinColumn({ name: 'building_id' })
  building: Building;

  // Relations
  @OneToMany(() => Detection, (detection) => detection.camera)
  detections: Detection[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
