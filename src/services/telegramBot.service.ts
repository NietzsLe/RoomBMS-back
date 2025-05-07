import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Appointment, AppointmentStatus } from 'src/models/appointment.model';
import { ChatGroup } from 'src/models/chatGroup.model';
import { Room } from 'src/models/room.model';
import { Telegraf } from 'telegraf';
import { ArrayContains, Repository } from 'typeorm';

@Injectable()
export class TelegramBotService {
  private bot = new Telegraf(process.env.BOT_TOKEN ?? '');
  constructor(
    @InjectRepository(Appointment)
    private appointmentReponsitory: Repository<Appointment>,
    @InjectRepository(Room)
    private roomRepository: Repository<Room>,
    @InjectRepository(ChatGroup)
    private chatGroupRepository: Repository<ChatGroup>,
  ) {}

  async sendMessage(chatId: string, text: string) {
    await this.bot.telegram.sendMessage(chatId, text);
  }

  async notifyCreateAppointment(appointmentID: number) {
    const appointment = await this.appointmentReponsitory.findOne({
      where: {
        appointmentID: appointmentID,
      },
      relations: {
        depositAgreement: true,
        tenant: true,
        room: true,
        madeUser: true,
        takenOverUser: true,
      },
    });
    let text: string;
    let chatGroups: ChatGroup[];
    let room: Room | null;
    if (appointment) {
      room = await this.roomRepository.findOne({
        where: {
          roomID: appointment?.room?.roomID,
        },
        relations: { house: true, administrativeUnit: true },

        select: { roomID: true },
      });
      chatGroups = await this.chatGroupRepository.find({
        where: {
          provinceCodes: ArrayContains([room?.administrativeUnit.districtCode]),
        },
      });
      text = `KHÁCH HẸN XEM PHÒNG
-Tên khách hàng: ${appointment.tenant?.name ?? ''}
-SĐT: ${appointment?.tenant?.phoneNumber.slice(0, -4) + 'XXXX'}
-Nhà/CHDV: ${room?.house?.name ?? ''}
-Phòng: ${room?.name ?? ''}
-Địa chỉ: ${room?.house?.addressDetail ?? ''}
-Giá tư vấn: ${appointment.consultingPrice ?? ''}
-Thời gian khách xem: ${appointment.appointmentTime.toLocaleString()}
-Số lượng người: ${appointment.noPeople ?? ''}
-Số lượng xe: ${appointment.noPeople ?? ''}
-Thời gian dự kiến dọn vào: 
-Nuôi thú cưng: ${appointment.pet ? 'Có' : 'Không'}
-Ghi chú: ${appointment.note ?? ''}
-Cảm ơn nhập khách: ${appointment?.madeUser?.name} - ${appointment?.madeUser?.phoneNumber} ${appointment?.madeUser?.team ? ' - ' + appointment?.madeUser?.team : ''}`;
      console.log(chatGroups);
      try {
        await Promise.all(
          chatGroups.map((item) => this.sendMessage(item.chatGroupID, text)),
        );
      } catch (error) {
        console.log(error);
        throw new HttpException(
          'Error in send message',
          HttpStatus.FAILED_DEPENDENCY,
        );
      }
    }
  }
  async notifyReturnDepositAgreementResult(appointmentID: number) {
    const appointment = await this.appointmentReponsitory.findOne({
      where: {
        appointmentID: appointmentID,
      },
      relations: {
        depositAgreement: true,
        tenant: true,
        room: true,
        madeUser: true,
        takenOverUser: true,
      },
    });
    if (appointment?.status == AppointmentStatus.NOT_YET_RECEIVED) return;
    let text: string;
    let chatGroups: ChatGroup[];
    let room: Room | null;
    if (
      appointment?.status == AppointmentStatus.EXTRA_CARE ||
      appointment?.status == AppointmentStatus.STOPPED
    ) {
      const result = await Promise.all([
        this.roomRepository.findOne({
          where: {
            roomID: appointment?.room?.roomID,
          },
          relations: { house: true },
          select: { roomID: true },
        }),
        this.chatGroupRepository.find({
          where: {
            chatGroupName: 'Result:Deposit',
          },
        }),
      ]);
      room = result[0];
      chatGroups = result[1];
      text = `KẾT QUẢ KHÁCH XEM PHÒNG: ${appointment?.status == AppointmentStatus.EXTRA_CARE ? 'CHĂM SÓC THÊM' : 'KHÁCH NGỪNG XEM'}
-Tên khách hàng: ${appointment.tenant?.name ?? ''}
-SĐT: ${appointment?.tenant?.phoneNumber.slice(0, -4) + 'XXXX'}
-Nhà/CHDV: ${room?.house?.name ?? ''}
-Phòng: ${room?.name ?? ''}
-Địa chỉ: ${room?.house?.addressDetail ?? ''}
-Giá tư vấn: ${appointment.consultingPrice ?? ''}
-Thời gian khách xem: ${appointment.appointmentTime.toLocaleString()}
-Số lượng người: ${appointment.noPeople ?? ''}
-Số lượng xe: ${appointment.noPeople ?? ''}
-Thời gian dự kiến dọn vào: 
-Nuôi thú cưng: ${appointment.pet ? 'Có' : 'Không'}
-Ghi chú: ${appointment.note ?? ''}
-Cảm ơn nhập khách: ${appointment?.madeUser?.name ?? ''} - ${appointment?.madeUser?.phoneNumber ?? ''} ${appointment?.madeUser?.team ? ' - ' + appointment?.madeUser?.team : ''}
-Cảm ơn dẫn khách: ${appointment?.takenOverUser?.name ?? ''} - ${appointment?.takenOverUser?.phoneNumber ?? ''} ${appointment?.takenOverUser?.team ? ' - ' + appointment?.takenOverUser?.team : ''}
-Kết quả: ${appointment.failReason ?? ''}`;
    } else {
      const result = await Promise.all([
        this.roomRepository.findOne({
          where: {
            roomID: appointment?.depositAgreement?.room?.roomID,
          },
          relations: { house: true },
          select: { roomID: true },
        }),
        this.chatGroupRepository.find({
          where: {
            chatGroupName: 'Result:Deposit',
          },
        }),
      ]);
      room = result[0];
      chatGroups = result[1];
      text = `KẾT QUẢ KHÁCH XEM PHÒNG 
-Kết quả: KHÁCH CỌC GIỮ CHỖ
-Ngày cọc: ${appointment?.depositAgreement?.agreementDate.toLocaleDateString()}
-Thời gian ký HĐ: ${appointment?.depositAgreement?.duration ?? ''}
-Tên khách hàng: ${appointment?.tenant?.name ?? ''}
-SĐT: ${appointment?.tenant?.phoneNumber.slice(0, -4) + 'XXXX'}
-Chủ nhà: ${room?.house?.ownerName ?? ''}
-Hoa hồng: ${appointment?.depositAgreement?.commissionPer ?? ''}% - ${((appointment?.depositAgreement?.price ?? 0) * (appointment?.depositAgreement?.commissionPer ?? 0)) / 100}
-Nhà/CHDV: ${room?.house?.name ?? ''}
-Phòng: ${room?.name ?? ''}
-Tiền đã cọc: ${appointment?.depositAgreement?.deliveredDeposit ?? ''}
-Bổ sung đủ: ${appointment?.depositAgreement?.depositCompleteDate.toLocaleDateString()}
-Ghi chú: ${appointment?.depositAgreement?.note ?? ''}
-Cảm ơn: ${appointment?.madeUser?.name ?? ''} - ${appointment?.madeUser?.phoneNumber ?? ''}${appointment?.madeUser?.team ? ' - ' + appointment?.madeUser?.team : ''}
-Cảm ơn: ${appointment?.takenOverUser?.name ?? ''} - ${appointment?.takenOverUser?.phoneNumber ?? ''} ${appointment?.takenOverUser?.team ? ' - ' + appointment?.takenOverUser?.team : ''} đã dẫn khách
`;
    }
    console.log('@Telegram: ', chatGroups);
    try {
      await Promise.all(
        chatGroups.map((item) => this.sendMessage(item.chatGroupID, text)),
      );
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Error in send message',
        HttpStatus.FAILED_DEPENDENCY,
      );
    }
  }
}
