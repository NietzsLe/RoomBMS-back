// src/discord/discord.service.ts
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Client, TextChannel, EmbedBuilder } from 'discord.js';
import { Inject } from '@nestjs/common';
import { Appointment } from 'src/models/appointment.model';
import { Room } from 'src/models/room.model';
import { ArrayContains, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ChatGroup } from 'src/models/chatGroup.model';
import * as dayjs from 'dayjs';
import { User } from 'src/models/user.model';
import { AppointmentStatus } from 'src/models/helper';

function removeVietnameseTones(str: string): string {
  return str
    .normalize('NFD') // Tách ký tự và dấu
    .replace(/[\u0300-\u036f]/g, '') // Loại bỏ dấu
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}

function toShortName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 0) return '';

  const lastName = removeVietnameseTones(parts[parts.length - 1]);
  const initials = parts
    .slice(0, -1)
    .map((word) => removeVietnameseTones(word[0].toUpperCase()))
    .join('');

  return `${lastName}${initials}`;
}

function IsCTV(roleIDs: string[]) {
  for (const roleID of roleIDs) {
    if (roleID != 'ctv') {
      return false;
    }
  }
  return true;
}

function thankString(user: User | null | undefined) {
  if (user) {
    if (IsCTV(user.roles.map((role) => role.roleID))) {
      return `CTV${user?.name ? ' + ' + user?.name : ''}${user?.phoneNumber ? ' + ' + user?.phoneNumber : ''}${user?.manager?.name ? ' + ' + toShortName(user?.manager?.name) : ''}${user?.team?.teamID ? ' + ' + user?.team.teamID : ''}`;
    } else {
      return `${user?.name ? toShortName(user?.name) : ''}${user?.phoneNumber ? ' + ' + user?.phoneNumber : ''}${user?.team?.teamID ? ' + ' + user?.team.teamID : ''}`;
    }
  } else return '';
}

function genCreateAppointmentNotify(appointment: Appointment) {
  const text = `- Tên khách hàng: ${appointment.tenant?.name ?? ''}
- SĐT: ${appointment?.tenant?.phoneNumber.slice(0, -3) + 'xxx'}
- Nhà/CHDV: ${appointment?.room?.house?.name ?? ''}${appointment?.room?.house?.name && appointment?.room?.house?.administrativeUnit ? ', ' : ''}${appointment?.room?.house?.administrativeUnit ? appointment?.room?.house?.administrativeUnit.wardName + ', ' + appointment?.room?.house?.administrativeUnit.districtName + ', ' + appointment?.room?.house?.administrativeUnit.provinceName : ''}
- Phòng: ${appointment?.room?.name ?? ''}
- Giá tư vấn: ${appointment.consultingPrice ? appointment.consultingPrice.toLocaleString('de-DE') + '₫' : ''}
- Thời gian khách xem: ${dayjs(appointment.appointmentTime).format('HH:mm DD/MM/YYYY')}
- Số lượng người: ${appointment.noPeople ?? ''}
- Số lượng xe: ${appointment.noPeople ?? ''}
- Thời gian dự kiến dọn vào: ${appointment.moveInTime ?? ''}
- Nuôi thú cưng: ${appointment.pet ? 'Có' : 'Không'}
- Ghi chú: ${appointment.note ?? ''}
- Cảm ơn nhập khách: ${thankString(appointment.madeUser)}
- Nhận lịch: [Evohome website](${process.env.FRONTEND_HOST + '/saler/appointments/' + appointment.appointmentID})`;
  const embed = new EmbedBuilder()
    .setTitle('KHÁCH HẸN XEM PHÒNG')
    .setDescription(text)
    .setColor('#00b0f4')
    .setTimestamp();

  return embed;
}

function genReturnDepositAgreementResultNotify(
  appointment: Appointment,
  mode: string,
) {
  let text: string;
  const embed = new EmbedBuilder()
    .setTitle('KHÁCH HẸN XEM PHÒNG')
    .setColor('#00b0f4')

    .setTimestamp();
  if (mode == 'deposit') {
    text = `- Kết quả: **KHÁCH CỌC GIỮ CHỖ**
- Ngày cọc: ${appointment?.depositAgreement?.depositDeliverDate ? dayjs(appointment?.depositAgreement?.depositDeliverDate).format('DD/MM/YYYY') : ''}
- Ngày lên HĐ: ${appointment?.depositAgreement?.agreementDate ? dayjs(appointment?.depositAgreement?.agreementDate).format('DD/MM/YYYY') : ''}
- Thời gian ký HĐ: ${appointment?.depositAgreement?.duration ? appointment?.depositAgreement?.duration + ' tháng' : ''}
- Tên khách hàng: ${appointment?.tenant?.name ?? ''}
- SĐT: ${appointment?.tenant?.phoneNumber ?? ''}
- Chủ nhà: ${appointment?.room?.house?.ownerName ?? ''}
- Hoa hồng: ${appointment?.depositAgreement?.commissionPer ? appointment?.depositAgreement?.commissionPer + '%' : ''} - ${(((appointment?.depositAgreement?.price ?? 0) * (appointment?.depositAgreement?.commissionPer ?? 0)) / 100).toLocaleString('de-DE') + '₫'}
- Nhà/CHDV: ${appointment?.room?.house?.name ?? ''}${appointment?.room?.house?.name && appointment?.room?.house?.administrativeUnit ? ', ' : ''}${appointment?.room?.house?.administrativeUnit ? appointment?.room?.house?.administrativeUnit.wardName + ', ' + appointment?.room?.house?.administrativeUnit.districtName + ', ' + appointment?.room?.house?.administrativeUnit.provinceName : ''}
- Phòng: ${appointment?.room?.name ?? ''}
- Giá phòng: ${appointment?.depositAgreement?.price ? appointment?.depositAgreement?.price.toLocaleString('de-DE') + '₫' : ''}
- Tiền đã cọc: ${appointment?.depositAgreement?.deliveredDeposit ? appointment?.depositAgreement?.deliveredDeposit.toLocaleString('de-DE') + '₫' : ''}
- Thưởng: ${appointment?.depositAgreement?.bonus ? appointment?.depositAgreement?.bonus.toLocaleString('de-DE') + '₫' : ''}
- Ngày bổ sung đủ: ${appointment?.depositAgreement?.depositCompleteDate ? dayjs(appointment?.depositAgreement?.depositCompleteDate).format('DD/MM/YYYY') : ''}
- Ghi chú: ${appointment?.depositAgreement?.note ?? ''}
- Cảm ơn nhập khách:  ${thankString(appointment?.madeUser)}
- Cảm ơn dẫn khách: ${thankString(appointment?.takenOverUser)}`;
    embed.setDescription(text);
  } else {
    text = `- Kết quả: **${appointment?.status == AppointmentStatus.EXTRA_CARE ? 'CHĂM SÓC THÊM' : 'KHÁCH NGỪNG XEM'}**
- Tên khách hàng: ${appointment.tenant?.name ?? ''}
- SĐT: ${appointment?.tenant?.phoneNumber.slice(0, -3) + 'xxx'}
- Nhà/CHDV: ${appointment?.room?.house?.name ?? ''}
- Phòng: ${appointment?.room?.name ?? ''}
- Giá tư vấn:  ${appointment.consultingPrice ? appointment.consultingPrice.toLocaleString('de-DE') + '₫' : ''}
- Thời gian khách xem: ${appointment.appointmentTime ? dayjs(appointment.appointmentTime).format('HH:mm DD/MM/YYYY') : ''}
- Số lượng người: ${appointment.noPeople ?? ''}
- Số lượng xe: ${appointment.noPeople ?? ''}
- Thời gian dự kiến dọn vào: ${appointment.moveInTime ?? ''}
- Nuôi thú cưng: ${appointment.pet ? 'Có' : 'Không'}
- Ghi chú: ${appointment.note ?? ''}
- Cảm ơn nhập khách:  ${thankString(appointment.madeUser)}
- Cảm ơn dẫn khách:  ${thankString(appointment.takenOverUser)}
- Kết quả: ${appointment.failReason ?? ''}`;
    embed.setDescription(text);
  }

  return embed;
}

@Injectable()
export class DiscordService {
  constructor(
    @Inject(Client) private readonly client: Client,
    @InjectRepository(Appointment)
    private appointmentReponsitory: Repository<Appointment>,
    @InjectRepository(Room)
    private roomRepository: Repository<Room>,
    @InjectRepository(ChatGroup)
    private chatGroupRepository: Repository<ChatGroup>,
  ) {}

  async sendMessage(channelId: string, embed: EmbedBuilder): Promise<void> {
    const channel = await this.client.channels.fetch(channelId);
    try {
      await (channel as TextChannel).send({ embeds: [embed] });
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Error in send message',
        HttpStatus.FAILED_DEPENDENCY,
      );
    }
  }
  async notifyCreateAppointment(appointmentID: number) {
    const appointment = await this.appointmentReponsitory.findOne({
      where: {
        appointmentID: appointmentID,
      },
      relations: {
        depositAgreement: { room: { house: { administrativeUnit: true } } },
        tenant: true,
        room: { house: { administrativeUnit: true } },
        madeUser: { team: true, roles: true, manager: true },
        takenOverUser: { team: true, roles: true, manager: true },
      },
    });
    let embed: EmbedBuilder;
    let chatGroups: ChatGroup[];
    if (appointment) {
      chatGroups = await this.chatGroupRepository.find({
        where: {
          provinceCodes: ArrayContains([
            appointment?.room?.house?.administrativeUnit?.districtCode,
          ]),
        },
      });
      embed = genCreateAppointmentNotify(appointment);
      console.log('@Discord: ', embed);
      try {
        await Promise.all(
          chatGroups.map((item) => this.sendMessage(item.chatGroupID, embed)),
        );
      } catch (error) {
        console.log(error);
        try {
          await new Promise((resolve) => setTimeout(resolve, 2000));
          await Promise.all(
            chatGroups.map((item) => this.sendMessage(item.chatGroupID, embed)),
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
  }
  async notifyReturnDepositAgreementResult(appointmentID: number) {
    const appointment = await this.appointmentReponsitory.findOne({
      where: {
        appointmentID: appointmentID,
      },
      relations: {
        depositAgreement: { room: { house: { administrativeUnit: true } } },
        tenant: true,
        room: { house: { administrativeUnit: true } },
        madeUser: { team: true, roles: true, manager: true },
        takenOverUser: { team: true, roles: true, manager: true },
      },
    });
    if (appointment?.status == AppointmentStatus.NOT_YET_RECEIVED) return;
    let embed: EmbedBuilder;
    let chatGroups: ChatGroup[];
    if (
      appointment?.status == AppointmentStatus.EXTRA_CARE ||
      appointment?.status == AppointmentStatus.STOPPED
    ) {
      chatGroups = await this.chatGroupRepository.find({
        where: {
          chatGroupName: 'Result:Extra-care',
        },
      });
      embed = genReturnDepositAgreementResultNotify(appointment, 'extra-care');
      console.log('@Discord: ', embed);
    } else {
      chatGroups = await this.chatGroupRepository.find({
        where: {
          chatGroupName: 'Result:Deposit',
        },
      });
      if (appointment) {
        embed = genReturnDepositAgreementResultNotify(appointment, 'deposit');
        console.log('@Discord: ', embed);
      }
    }

    try {
      await Promise.all(
        chatGroups.map((item) => this.sendMessage(item.chatGroupID, embed)),
      );
    } catch (error) {
      console.log(error);
      try {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        await Promise.all(
          chatGroups.map((item) => this.sendMessage(item.chatGroupID, embed)),
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
}
