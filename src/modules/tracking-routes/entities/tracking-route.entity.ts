import { PersonType } from 'src/modules/detections/entities/detection.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';

export enum RouteStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  SUSPICIOUS = 'suspicious',
}

@Entity('tracking_routes')
@Index(['track_id'])
export class TrackingRoute {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: string;

  @Column({ length: 100 })
  track_id: string;

  @Column({
    type: 'enum',
    enum: PersonType,
    nullable: true,
  })
  person_type: PersonType;

  @Column({ length: 50, nullable: true })
  person_id: string;

  // Route data - JSON array
  @Column({ type: 'jsonb' })
  route: Array<{
    camera_id: string;
    timestamp: string;
    action: string;
  }>;

  @Column({ length: 50, nullable: true })
  start_camera: string;

  @Column({ length: 50, nullable: true })
  end_camera: string;

  @Column({ type: 'timestamptz' })
  start_time: Date;

  @Column({ type: 'timestamptz', nullable: true })
  end_time: Date;

  @Column({ type: 'int', nullable: true })
  duration_seconds: number;

  @Column({
    type: 'enum',
    enum: RouteStatus,
    default: RouteStatus.ACTIVE,
  })
  status: RouteStatus;

  @Column({ type: 'boolean', default: false })
  violation_detected: boolean;

  @CreateDateColumn()
  created_at: Date;
}
