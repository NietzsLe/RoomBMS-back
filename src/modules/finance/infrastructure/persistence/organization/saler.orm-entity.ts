import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  PrimaryColumn,
  OneToMany,
} from 'typeorm';
import { EmployeeOrmEntity } from './employee.orm-entity';
import { SalerCommissionPolicy } from 'src/modules/finance/domain/finance.enum';
import { CollaboratorOrmEntity } from './collaborator.orm-entity';

@Entity({ name: 'saler-accounting' })
export class SalerOrmEntity {
  @PrimaryColumn({ type: 'varchar', length: 64 })
  id: string; // Khóa chính cho Saler

  @ManyToOne(() => EmployeeOrmEntity, { nullable: false })
  @JoinColumn({ name: 'id' })
  employee: EmployeeOrmEntity;

  @OneToMany(() => CollaboratorOrmEntity, (collaborator) => collaborator.leader)
  relatedCollaborators?: CollaboratorOrmEntity[]; // Tham chiếu đến các Collaborator qua leader

  @Column({ type: 'varchar', length: 64 })
  teamID: string; // Liên kết đến Team entity

  @Column({
    type: 'enum',
    enum: SalerCommissionPolicy,
    default: SalerCommissionPolicy.OLD,
  })
  commissionPolicy: SalerCommissionPolicy;
}
