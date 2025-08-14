import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

@Entity('chat_group') // Tên bảng trong cơ sở dữ liệu
export class ChatGroup {
  @PrimaryColumn()
  chatGroupID: string; // Khóa chính, tự động tăng
  @Column({ type: 'int', array: true, default: [] })
  provinceCodes: number[];
  @Index({ unique: true })
  @Column()
  chatGroupName: string;
}
