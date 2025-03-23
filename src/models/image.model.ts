import {
  BeforeInsert,
  Column,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';

import { Expose, Type } from '@nestjs/class-transformer';
import { Room } from './room.model';
import { v4 as uuidv4 } from 'uuid';

@Entity('image')
export class Image {
  @PrimaryColumn()
  @Expose({ groups: ['TO-DTO'] })
  imageName: string;
  @Column()
  @Expose({ groups: ['NOT-TO-DTO'] })
  extensionType: string;
  @DeleteDateColumn()
  @Expose({ groups: ['NOT-TO-DTO'] })
  deletedAt: Date | null;

  @ManyToOne(() => Room, (room) => room.images, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @Expose({ groups: ['NOT-TO-DTO'] })
  @Type(() => Room)
  @JoinColumn({ name: 'roomID' })
  room: Room;
  @BeforeInsert()
  generateCustomId() {
    const uuid = uuidv4();
    this.imageName = uuid + '.' + this.extensionType;
  }
}
