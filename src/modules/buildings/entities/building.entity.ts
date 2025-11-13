import { Camera } from 'src/modules/cameras/entities/camera.entity';
import { Resident } from 'src/modules/residents/entities/resident.entity';
import { User } from 'src/modules/users/entities/user.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

export enum BuildingStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  TRIAL = 'trial',
}

@Entity('buildings')
export class Building {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string; // "Vinhomes Central Park", "The Sun Avenue"

  @Column({ unique: true })
  code: string; // "VCP", "TSA"

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ nullable: true })
  city: string;

  @Column({ type: 'jsonb', nullable: true })
  location: {
    lat: number;
    lng: number;
  };

  @Column({ nullable: true })
  contact_email: string;

  @Column({ nullable: true })
  contact_phone: string;

  @Column({
    type: 'enum',
    enum: BuildingStatus,
    default: BuildingStatus.TRIAL,
  })
  status: BuildingStatus;

  @Column({ type: 'timestamp', nullable: true })
  subscription_expires_at: Date;

  @OneToMany(() => User, (user) => user.building)
  users: User[];

  @OneToMany(() => Camera, (camera) => camera.building)
  cameras: Camera[];

  @OneToMany(() => Resident, (resident) => resident.building)
  residents: Resident[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
