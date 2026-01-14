// src/entities/violation.entity.ts
import { PersonType } from 'src/modules/detections/entities/detection.entity';
import { User } from 'src/modules/users/entities/user.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

export enum ViolationType {
  UNAUTHORIZED_ACCESS = 'unauthorized_access',
  SUSPICIOUS_BEHAVIOR = 'suspicious_behavior',
  RESTRICTED_AREA = 'restricted_area',
  LOITERING = 'loitering',
  RUNNING = 'running',
  LYING = 'lying',
}

export enum ViolationSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

@Entity('violations')
@Index(['timestamp'])
@Index(['camera_id', 'timestamp'])
export class Violation {
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

  // Violation details
  @Column({
    type: 'enum',
    enum: ViolationType,
  })
  violation_type: ViolationType;

  @Column({
    type: 'enum',
    enum: ViolationSeverity,
  })
  severity: ViolationSeverity;

  @Column({ length: 50 })
  camera_id: string;

  @Column({ length: 255 })
  location: string;

  // Evidence
  @Column({ length: 500, nullable: true })
  snapshot_url: string;

  @Column({ length: 500, nullable: true })
  video_url: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  // Alert status
  @Column({ type: 'boolean', default: false })
  alert_sent: boolean;

  @Column({ type: 'boolean', default: false })
  acknowledged: boolean;

  @Column({ type: 'uuid', nullable: true })
  acknowledged_by: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'acknowledged_by' })
  acknowledger: User;

  @Column({ type: 'timestamptz', nullable: true })
  acknowledged_at: Date;

  // Actions taken
  @Column({ type: 'text', nullable: true })
  actions_taken: string;

  @Column({ type: 'boolean', default: false })
  resolved: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  resolved_at: Date;

  @Column({ type: 'timestamptz' })
  timestamp: Date;

  @CreateDateColumn()
  created_at: Date;
}
