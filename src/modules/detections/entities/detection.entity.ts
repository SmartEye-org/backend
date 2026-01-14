import { Camera } from 'src/modules/cameras/entities/camera.entity';
import { Resident } from 'src/modules/residents/entities/resident.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';

export enum PersonType {
  RESIDENT = 'resident',
  GUEST = 'guest',
  UNKNOWN = 'unknown',
}

@Entity('detections')
@Index(['timestamp']) // For time-series queries
@Index(['camera_id', 'timestamp'])
@Index(['track_id'])
export class Detection {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: string;

  @Column({ length: 50 })
  camera_id: string;

  @ManyToOne(() => Camera, (camera) => camera.detections)
  @JoinColumn({ name: 'camera_id' })
  camera: Camera;

  @Column({ length: 100 })
  track_id: string;

  @Column({ type: 'bigint', nullable: true })
  frame_id: number;

  // Detection data
  @Column({ type: 'float8', array: true }) // [x1, y1, x2, y2]
  bbox: number[];

  @Column({ type: 'float' })
  confidence: number;

  @Column({ length: 50, nullable: true })
  action: string; // walking/standing/sitting/running

  // Person identification
  @Column({
    type: 'enum',
    enum: PersonType,
    default: PersonType.UNKNOWN,
  })
  person_type: PersonType;

  @Column({ length: 50, nullable: true })
  person_id: string; // FK to residents.id

  @ManyToOne(() => Resident, { nullable: true })
  @JoinColumn({ name: 'person_id' })
  person: Resident;

  @Column({ length: 255, nullable: true })
  person_name: string;

  @Column({ type: 'float', nullable: true })
  face_confidence: number;

  @Column({ type: 'boolean', default: false })
  violation_detected: boolean;

  // Timestamp
  @Column({ type: 'timestamptz' })
  timestamp: Date;

  @CreateDateColumn()
  created_at: Date;
}
