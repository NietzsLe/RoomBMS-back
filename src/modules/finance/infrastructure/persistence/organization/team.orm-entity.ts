import {
  Entity,
  PrimaryColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { SalerOrmEntity } from './saler.orm-entity';

@Entity({ name: 'team-accounting' })
export class TeamOrmEntity {
  @PrimaryColumn({ type: 'varchar', length: 64 })
  id: string; // Khóa chính

  @ManyToOne(() => SalerOrmEntity, { nullable: false })
  @JoinColumn({ name: 'leaderID' })
  leader: SalerOrmEntity; // Liên kết đến Saler

  @OneToMany(() => SalerOrmEntity, (saler) => saler.teamID)
  salers: SalerOrmEntity[]; // Liên kết đến các Saler
}
