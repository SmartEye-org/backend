import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('ngsi_ld_entities')
@Index(['type'])
export class NgsiLd {
  @PrimaryColumn({ length: 255 })
  id: string; // URN format: urn:ngsi-ld:Person:...

  @Column({ length: 100 })
  type: string; // Person/Observation/Alert/Device

  @Column({ type: 'jsonb' })
  data: object; // Full NGSI-LD entity

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
