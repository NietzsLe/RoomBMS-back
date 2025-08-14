import { Entity, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { EmployeeOrmEntity } from './employee.orm-entity';
import { SalerOrmEntity } from './saler.orm-entity';

@Entity({ name: 'collaborator-accounting' })
export class CollaboratorOrmEntity {
  @PrimaryColumn({ type: 'varchar', length: 64 })
  id: string; // Khóa chính cho Collaborator

  @ManyToOne(() => EmployeeOrmEntity, { nullable: false })
  @JoinColumn({ name: 'id' })
  employee: EmployeeOrmEntity;

  @ManyToOne(() => SalerOrmEntity, { nullable: false })
  @JoinColumn({ name: 'leaderID' })
  leader: SalerOrmEntity;
}
