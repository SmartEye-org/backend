import { Building } from 'src/modules/buildings/entities/building.entity';
import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

export enum ResidentStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

@Entity('residents')
export class Resident {
  @PrimaryColumn({ length: 50 })
  id: string; // resident-001

  @Column({ length: 255 })
  name: string;

  @Column({ length: 50, nullable: true })
  apartment: string;

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({ length: 255, nullable: true })
  email: string;

  // Face encoding - 512-dimensional vector
  @Column({ type: 'float8', array: true, nullable: true })
  face_encoding: number[];

  @Column({ length: 500, nullable: true })
  photo_url: string;

  @Column({
    type: 'enum',
    enum: ResidentStatus,
    default: ResidentStatus.ACTIVE,
  })
  status: ResidentStatus;

  // Multi-tenant
  @Column({ type: 'uuid' })
  building_id: string;

  @ManyToOne(() => Building)
  @JoinColumn({ name: 'building_id' })
  building: Building;

  @CreateDateColumn()
  registered_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
