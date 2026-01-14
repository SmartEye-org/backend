// src/entities/user.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Building } from 'src/modules/buildings/entities/building.entity';

export enum UserRole {
  SUPER_ADMIN = 'super_admin', // Quản trị hệ thống
  ADMIN = 'admin', // Quản lý chung cư
  SUPERVISOR = 'supervisor', // Ban quản lý tòa nhà
  SECURITY = 'security', // Bảo vệ
  VIEWER = 'viewer', // Chỉ xem
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude() // Don't return password in responses
  password: string;

  @Column()
  full_name: string;

  @Column({ nullable: true })
  phone: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.VIEWER,
  })
  role: UserRole;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  status: UserStatus;

  // Multi-tenant: User belongs to a building
  @Column({ nullable: true })
  building_id: string;

  @ManyToOne(() => Building, { nullable: true })
  @JoinColumn({ name: 'building_id' })
  building: Building;

  @Column({ nullable: true })
  avatar_url: string;

  @Column({ type: 'timestamp', nullable: true })
  last_login_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
