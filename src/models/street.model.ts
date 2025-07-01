import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  DeleteDateColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Expose, Type, Transform } from '@nestjs/class-transformer';
import { User } from './user.model';

@Entity('street')
export class Street {
  @PrimaryGeneratedColumn()
  @Expose({
    groups: [
      'TO-DTO',
      'TO-HOUSE-DTO',
      'TO-ROOM-DTO',
      'TO-DEPOSITAGREEMENT-DTO',
      'TO-APPOINTMENT-DTO',
    ],
  })
  streetID: number;
  @Column({ unique: true })
  @Expose({
    groups: [
      'TO-DTO',
      'TO-HOUSE-DTO',
      'TO-ROOM-DTO',
      'TO-DEPOSITAGREEMENT-DTO',
      'TO-APPOINTMENT-DTO',
    ],
  })
  name: string;
  @DeleteDateColumn()
  @Expose({ groups: ['NOT-TO-DTO'] })
  deletedAt: Date | null; // Xem phường đã xóa chưa
  @CreateDateColumn()
  @Expose({ groups: ['TO-DTO'] })
  createAt: Date; // Thời điểm tạo phường
  @UpdateDateColumn()
  @Expose({ groups: ['TO-DTO'] })
  updateAt: Date; // Thời điểm cập nhật thông tin phường
  @ManyToOne(() => User, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'managerID' })
  @Expose({ name: 'managerID', groups: ['TO-DTO'] })
  @Type(() => User)
  @Transform(({ value }: { value: User }) => value?.username, {
    toPlainOnly: true,
  })
  manager: User | null;
}
