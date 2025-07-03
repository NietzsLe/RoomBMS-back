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
import { AppointmentStatus, DepositAgreementStatus } from 'src/models/helper';

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

  /**
   * Gửi tin nhắn đến một kênh Discord với embed.
   * @param channelId ID của kênh Discord.
   * @param embed EmbedBuilder chứa nội dung tin nhắn.
   * @returns ID của tin nhắn đã gửi hoặc null nếu không thành công.
   */

  async sendMessage(
    channelId: string,
    embed: EmbedBuilder,
  ): Promise<{ messageId: string | null }> {
    const channel = await this.client.channels.fetch(channelId);
    try {
      const message = await (channel as TextChannel).send({ embeds: [embed] });
      return { messageId: message.id };
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
      embed = this.genCreateAppointmentNotify(appointment);
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
  async notifyReturnDepositAgreementResult(
    appointmentID: number,
    preStatus: AppointmentStatus,
  ) {
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
    let embed: EmbedBuilder | undefined = undefined;
    let chatGroups: ChatGroup[] | undefined = undefined;
    // Kiểm tra trả kết quả trễ
    let isLate = false;
    if (appointment?.appointmentTime) {
      const now = dayjs();
      const appointTime = dayjs(appointment.appointmentTime);
      if (
        now.diff(appointTime, 'hour', true) > 2 &&
        !(
          preStatus == AppointmentStatus.EXTRA_CARE &&
          appointment &&
          appointment.status == AppointmentStatus.SUCCESS
        )
      ) {
        isLate = true;
      }
    }
    if (appointment && appointment?.status == AppointmentStatus.EXTRA_CARE) {
      chatGroups = await this.chatGroupRepository.find({
        where: {
          chatGroupName: 'Result:Extra-care',
        },
      });
      embed = this.genReturnDepositAgreementResultNotify(
        appointment,
        isLate,
        'extra-care',
      );
      console.log('@Discord: ', embed);
    } else if (
      appointment &&
      appointment?.status == AppointmentStatus.SUCCESS
    ) {
      chatGroups = await this.chatGroupRepository.find({
        where: {
          chatGroupName: 'Result:Deposit',
        },
      });
      embed = this.genReturnDepositAgreementResultNotify(
        appointment,
        isLate,
        'deposit',
      );
      console.log('@Discord: ', embed);
    }

    if (Array.isArray(chatGroups) && embed) {
      let sentMessages: { channelId: string; messageId: string | null }[] = [];
      try {
        sentMessages = await Promise.all(
          chatGroups.map(async (item) => {
            const result = await this.sendMessage(item.chatGroupID, embed);
            return { channelId: item.chatGroupID, messageId: result.messageId };
          }),
        );
      } catch (error) {
        console.log(error);
        try {
          await new Promise((resolve) => setTimeout(resolve, 2000));
          sentMessages = await Promise.all(
            chatGroups.map(async (item) => {
              const result = await this.sendMessage(item.chatGroupID, embed);
              return {
                channelId: item.chatGroupID,
                messageId: result.messageId,
              };
            }),
          );
        } catch (error) {
          console.log(error);
          throw new HttpException(
            'Error in send message',
            HttpStatus.FAILED_DEPENDENCY,
          );
        }
      }
      // Nếu trễ thì forward tin nhắn qua Warning
      if (isLate && sentMessages.length > 0) {
        const warningGroups = await this.chatGroupRepository.find({
          where: {
            chatGroupName: 'Warning',
          },
        });
        // Gửi lại embed vào kênh Warning trước
        for (const warningGroup of warningGroups) {
          try {
            await this.sendMessage(warningGroup.chatGroupID, embed);
          } catch (error) {
            console.log(error);
          }
        }
        // Sau đó forward link tin nhắn gốc
        for (const msg of sentMessages) {
          for (const warningGroup of warningGroups) {
            try {
              const channel = await this.client.channels.fetch(
                warningGroup.chatGroupID,
              );
              if (channel && msg.messageId) {
                // Forward bằng cách gửi link đến tin nhắn gốc
                const messageUrl = `https://discord.com/channels/${(channel as TextChannel).guildId}/${msg.channelId}/${msg.messageId}`;
                await (channel as TextChannel).send({
                  content: `Forwarded: ${messageUrl}`,
                });
              }
            } catch (error) {
              console.log(error);
            }
          }
        }
      }
    }
  }
  async notifyCancelDepositAgreement(appointmentID: number) {
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
    if (
      appointment &&
      appointment.depositAgreement?.status &&
      appointment.depositAgreement?.status == DepositAgreementStatus.CANCELLED
    ) {
      const embed: EmbedBuilder =
        this.genCancelDepositAgreementNotify(appointment);
      const chatGroups: ChatGroup[] = await this.chatGroupRepository.find({
        where: {
          chatGroupName: 'Result:Deposit',
        },
      });
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

  /**
   * ⏰ notifyWhenChangeAppointmentTime
   * Gửi thông báo Discord khi thời gian hẹn của appointment bị thay đổi.
   * Chỉ gửi thông báo nếu thay đổi trễ (isLate).
   *
   * @param appointmentID - ID của appointment cần thông báo
   */
  async notifyWhenChangeAppointmentTime(
    appointmentID: number,
    preTime: Date | undefined,
  ) {
    // --- Lấy thông tin appointment và các quan hệ liên quan ---
    const appointment = await this.appointmentReponsitory.findOne({
      where: { appointmentID },
      relations: {
        depositAgreement: { room: { house: { administrativeUnit: true } } },
        tenant: true,
        room: { house: { administrativeUnit: true } },
        madeUser: { team: true, roles: true, manager: true },
        takenOverUser: { team: true, roles: true, manager: true },
      },
    });

    if (!appointment) return;

    // --- Xác định isLate: nếu thời gian hiện tại cách appointmentTime > 2h ---
    let isLate = false;
    if (preTime) {
      const now = dayjs();
      const appointTime = dayjs(preTime);
      if (now.diff(appointTime, 'hour', true) > 2) {
        isLate = true;
      }
    }

    // --- Chỉ gửi thông báo nếu isLate ---
    if (!isLate) return;

    // --- Tìm các chat group phù hợp (theo districtCode) ---
    const chatGroups = await this.chatGroupRepository.find({
      where: {
        chatGroupName: 'Warning',
      },
    });

    // --- Tạo embed thông báo bằng genChangeAppointmentTimeNotify ---
    const embed = this.genChangeAppointmentTimeNotify(
      appointment,
      isLate,
      preTime,
    );

    // --- Gửi thông báo đến các chat group ---
    try {
      await Promise.all(
        chatGroups.map((item) => this.sendMessage(item.chatGroupID, embed)),
      );
    } catch (error) {
      console.log(error);
      // Thử lại sau 2s nếu lỗi
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

  /**
   * 🔒 Tạo thông báo thay đổi thời gian hẹn (private helper)
   * @param appointment - Appointment object
   * @param isLate - Có phải thay đổi trễ không
   * @returns EmbedBuilder
   */
  private genChangeAppointmentTimeNotify(
    appointment: Appointment,
    isLate: boolean,
    preTime: Date | undefined,
  ): EmbedBuilder {
    let warning = '';
    if (isLate) {
      warning = '**☢️ Vi phạm quy trình dẫn khách: Trả kết quả trễ!**';
    }
    const embed = new EmbedBuilder()
      .setTitle('KHÁCH XEM PHÒNG: ĐỔI LỊCH HẸN')
      .setColor('#00b0f4')

      .setTimestamp();
    const text = `${warning ? '\n' + warning : ''}
- Tên khách hàng: ${appointment.tenant?.name ?? ''}
- SĐT: ${appointment?.tenant?.phoneNumber.slice(0, -3) + 'xxx'}
- Nhà/CHDV: ${appointment?.room?.house?.name ?? ''}${appointment?.room?.house?.name && appointment?.room?.house?.administrativeUnit ? ', ' : ''}${appointment?.room?.house?.administrativeUnit ? appointment?.room?.house?.administrativeUnit.wardName + ', ' + appointment?.room?.house?.administrativeUnit.districtName + ', ' + appointment?.room?.house?.administrativeUnit.provinceName : ''}
- Phòng: ${appointment?.room?.name ?? ''}
- Giá tư vấn:  ${appointment.consultingPrice ? appointment.consultingPrice.toLocaleString('de-DE') + '₫' : ''}
- Thời gian ban đầu: ${preTime ? dayjs(preTime).format('HH:mm DD/MM/YYYY') : ''}
- Thời gian đổi đến: ${preTime ? dayjs(preTime).format('HH:mm DD/MM/YYYY') : ''}
- Số lượng người: ${appointment.noPeople ?? ''}
- Số lượng xe: ${appointment.noVehicles ?? ''}
- Thời gian dự kiến dọn vào: ${appointment.moveInTime ?? ''}
- Nuôi thú cưng: ${appointment.pet ? 'Có' : 'Không'}
- Ghi chú: ${appointment.note ?? ''}
- Nhập khách:  ${this.thankString(appointment.madeUser)}
- Dẫn khách:  ${this.thankString(appointment.takenOverUser)}`;
    embed.setDescription(text);
    return embed;
  }

  /**
   * 🔒 Tạo chuỗi cảm ơn nhập khách (private helper)
   * @param user - User object
   * @returns string
   */
  private thankString(user: User | null | undefined): string {
    if (user) {
      if (this.isCTV(user.roles.map((role) => role.roleID))) {
        return `CTV${user?.name ? ' + ' + user?.name : ''}${user?.phoneNumber ? ' + ' + user?.phoneNumber : ''}${user?.manager?.name ? ' + ' + this.toShortName(user?.manager?.name) : ''}${user?.team?.teamID ? ' + ' + user?.team.teamID : ''}`;
      } else {
        return `${user?.name ? this.toShortName(user?.name) : ''}${user?.phoneNumber ? ' + ' + user?.phoneNumber : ''}${user?.team?.teamID ? ' + ' + user?.team.teamID : ''}`;
      }
    } else return '';
  }

  /**
   * 🔒 Kiểm tra user có phải CTV không (private helper)
   * @param roleIDs - Danh sách roleID
   * @returns boolean
   */
  private isCTV(roleIDs: string[]): boolean {
    for (const roleID of roleIDs) {
      if (roleID != 'ctv') {
        return false;
      }
    }
    return true;
  }

  /**
   * 🔒 Rút gọn tên (private helper)
   * @param fullName - Họ tên đầy đủ
   * @returns string
   */
  private toShortName(fullName: string): string {
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 0) return '';
    const lastName = this.removeVietnameseTones(parts[parts.length - 1]);
    const initials = parts
      .slice(0, -1)
      .map((word) => this.removeVietnameseTones(word[0].toUpperCase()))
      .join('');
    return `${lastName}${initials}`;
  }

  /**
   * 🔒 Loại bỏ dấu tiếng Việt (private helper)
   * @param str - Chuỗi cần xử lý
   * @returns string
   */
  private removeVietnameseTones(str: string): string {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D');
  }

  private genCreateAppointmentNotify(
    appointment: Appointment,
    isLate?: boolean,
  ) {
    const text = `- Tên khách hàng: ${appointment.tenant?.name ?? ''}
- SĐT: ${appointment?.tenant?.phoneNumber.slice(0, -3) + 'xxx'}
- Nhà/CHDV: ${appointment?.room?.house?.name ?? ''}${appointment?.room?.house?.name && appointment?.room?.house?.administrativeUnit ? ', ' : ''}${appointment?.room?.house?.administrativeUnit ? appointment?.room?.house?.administrativeUnit.wardName + ', ' + appointment?.room?.house?.administrativeUnit.districtName + ', ' + appointment?.room?.house?.administrativeUnit.provinceName : ''}
- Phòng: ${appointment?.room?.name ?? ''}
- Giá tư vấn: ${appointment.consultingPrice ? appointment.consultingPrice.toLocaleString('de-DE') + '₫' : ''}
- Thời gian khách xem: ${dayjs(appointment.appointmentTime).format('HH:mm DD/MM/YYYY')}
- Số lượng người: ${appointment.noPeople ?? ''}
- Số lượng xe: ${appointment.noVehicles ?? ''}
- Thời gian dự kiến dọn vào: ${appointment.moveInTime ?? ''}
- Nuôi thú cưng: ${appointment.pet ? 'Có' : 'Không'}
- Ghi chú: ${appointment.note ?? ''}
- Cảm ơn nhập khách: ${this.thankString(appointment.madeUser)}
- Nhận lịch: [Evohome website](${process.env.FRONTEND_HOST + '/saler/appointments/' + appointment.appointmentID})`;
    const embed = new EmbedBuilder()
      .setTitle('KHÁCH HẸN XEM PHÒNG')
      .setDescription(text)
      .setColor('#00b0f4')
      .setTimestamp();

    if (isLate) {
      embed.setFooter({
        text: '☢️ Vi phạm quy trình dẫn khách: Thay đổi thời gian trễ!',
      });
    }

    return embed;
  }

  private genReturnDepositAgreementResultNotify(
    appointment: Appointment,
    isLate: boolean,
    mode: string,
  ) {
    let text: string;
    let warning = '';
    if (isLate) {
      warning = '**☢️ Vi phạm quy trình dẫn khách: Trả kết quả trễ!**';
    }
    const embed = new EmbedBuilder()
      .setTitle('KẾT QUẢ KHÁCH XEM PHÒNG')
      .setColor('#00b0f4')

      .setTimestamp();
    if (mode == 'deposit') {
      text = `- Kết quả: **KHÁCH CỌC GIỮ CHỖ**${warning ? '\n' + warning : ''}
- Ngày cọc: ${appointment?.depositAgreement?.depositDeliverDate ? dayjs(appointment?.depositAgreement?.depositDeliverDate).format('DD/MM/YYYY') : ''}
- Ngày lên HĐ: ${appointment?.depositAgreement?.agreementDate ? dayjs(appointment?.depositAgreement?.agreementDate).format('DD/MM/YYYY') : ''}
- Thời gian ký HĐ: ${appointment?.depositAgreement?.duration ? appointment?.depositAgreement?.duration + ' tháng' : ''}
- Tên khách hàng: ${appointment?.tenant?.name ?? ''}
- SĐT: ${appointment?.tenant?.phoneNumber ?? ''}
- Chủ nhà: ${appointment?.depositAgreement?.room?.house?.ownerName ?? ''}
- Hoa hồng: ${appointment?.depositAgreement?.commissionPer ? appointment?.depositAgreement?.commissionPer + '%' : ''} - ${(((appointment?.depositAgreement?.price ?? 0) * (appointment?.depositAgreement?.commissionPer ?? 0)) / 100).toLocaleString('de-DE') + '₫'}
- Nhà/CHDV: ${appointment?.depositAgreement?.room?.house?.name ?? ''}${appointment?.depositAgreement?.room?.house?.name && appointment?.depositAgreement?.room?.house?.administrativeUnit ? ', ' : ''}${appointment?.depositAgreement?.room?.house?.administrativeUnit ? appointment?.depositAgreement?.room?.house?.administrativeUnit.wardName + ', ' + appointment?.depositAgreement?.room?.house?.administrativeUnit.districtName + ', ' + appointment?.depositAgreement?.room?.house?.administrativeUnit.provinceName : ''}
- Phòng: ${appointment?.depositAgreement?.room?.name ?? ''}
- Giá phòng: ${appointment?.depositAgreement?.price ? appointment?.depositAgreement?.price.toLocaleString('de-DE') + '₫' : ''}
- Tiền đã cọc: ${appointment?.depositAgreement?.deliveredDeposit ? appointment?.depositAgreement?.deliveredDeposit.toLocaleString('de-DE') + '₫' : ''}
- Thưởng: ${appointment?.depositAgreement?.bonus ? appointment?.depositAgreement?.bonus.toLocaleString('de-DE') + '₫' : ''}
- Ngày bổ sung đủ: ${appointment?.depositAgreement?.depositCompleteDate ? dayjs(appointment?.depositAgreement?.depositCompleteDate).format('DD/MM/YYYY') : ''}
- Ghi chú: ${appointment?.depositAgreement?.note ?? ''}
- Cảm ơn nhập khách:  ${this.thankString(appointment?.madeUser)}
- Cảm ơn dẫn khách: ${this.thankString(appointment?.takenOverUser)}`;
      embed.setDescription(text);
    } else {
      text = `- Kết quả: **CHĂM SÓC THÊM**${warning ? '\n' + warning : ''}
- Tên khách hàng: ${appointment.tenant?.name ?? ''}
- SĐT: ${appointment?.tenant?.phoneNumber.slice(0, -3) + 'xxx'}
- Nhà/CHDV: ${appointment?.room?.house?.name ?? ''}${appointment?.room?.house?.name && appointment?.room?.house?.administrativeUnit ? ', ' : ''}${appointment?.room?.house?.administrativeUnit ? appointment?.room?.house?.administrativeUnit.wardName + ', ' + appointment?.room?.house?.administrativeUnit.districtName + ', ' + appointment?.room?.house?.administrativeUnit.provinceName : ''}
- Phòng: ${appointment?.room?.name ?? ''}
- Giá tư vấn:  ${appointment.consultingPrice ? appointment.consultingPrice.toLocaleString('de-DE') + '₫' : ''}
- Thời gian khách xem: ${appointment.appointmentTime ? dayjs(appointment.appointmentTime).format('HH:mm DD/MM/YYYY') : ''}
- Số lượng người: ${appointment.noPeople ?? ''}
- Số lượng xe: ${appointment.noVehicles ?? ''}
- Thời gian dự kiến dọn vào: ${appointment.moveInTime ?? ''}
- Nuôi thú cưng: ${appointment.pet ? 'Có' : 'Không'}
- Ghi chú: ${appointment.note ?? ''}
- Cảm ơn nhập khách:  ${this.thankString(appointment.madeUser)}
- Cảm ơn dẫn khách:  ${this.thankString(appointment.takenOverUser)}
- Kết quả: ${appointment.failReason ?? ''}`;
      embed.setDescription(text);
    }

    return embed;
  }

  private genCancelDepositAgreementNotify(appointment: Appointment) {
    const embed = new EmbedBuilder()
      .setTitle('KẾT QUẢ KHÁCH XEM PHÒNG')
      .setColor('#00b0f4')

      .setTimestamp();

    const text = `- Kết quả: **HỦY CỌC**
- Ngày cọc: ${appointment?.depositAgreement?.depositDeliverDate ? dayjs(appointment?.depositAgreement?.depositDeliverDate).format('DD/MM/YYYY') : ''}
- Ngày lên HĐ: ${appointment?.depositAgreement?.agreementDate ? dayjs(appointment?.depositAgreement?.agreementDate).format('DD/MM/YYYY') : ''}
- Thời gian ký HĐ: ${appointment?.depositAgreement?.duration ? appointment?.depositAgreement?.duration + ' tháng' : ''}
- Tên khách hàng: ${appointment?.tenant?.name ?? ''}
- SĐT: ${appointment?.tenant?.phoneNumber ?? ''}
- Chủ nhà: ${appointment?.depositAgreement?.room?.house?.ownerName ?? ''}
- Hoa hồng: ${appointment?.depositAgreement?.commissionPer ? appointment?.depositAgreement?.commissionPer + '%' : ''} - ${(((appointment?.depositAgreement?.price ?? 0) * (appointment?.depositAgreement?.commissionPer ?? 0)) / 100).toLocaleString('de-DE') + '₫'}
- Nhà/CHDV: ${appointment?.depositAgreement?.room?.house?.ownerName ?? ''}${appointment?.depositAgreement?.room?.house?.ownerName && appointment?.depositAgreement?.room?.house?.administrativeUnit ? ', ' : ''}${appointment?.depositAgreement?.room?.house?.administrativeUnit ? appointment?.depositAgreement?.room?.house?.administrativeUnit.wardName + ', ' + appointment?.depositAgreement?.room?.house?.administrativeUnit.districtName + ', ' + appointment?.depositAgreement?.room?.house?.administrativeUnit.provinceName : ''}
- Phòng: ${appointment?.room?.name ?? ''}
- Giá phòng: ${appointment?.depositAgreement?.price ? appointment?.depositAgreement?.price.toLocaleString('de-DE') + '₫' : ''}
- Tiền cọc: ${appointment?.depositAgreement?.depositPrice ? appointment?.depositAgreement?.depositPrice.toLocaleString('de-DE') + '₫' : ''}
- Tiền đã cọc: ${appointment?.depositAgreement?.deliveredDeposit ? appointment?.depositAgreement?.deliveredDeposit.toLocaleString('de-DE') + '₫' : ''}
- Phí hủy cọc: ${appointment?.depositAgreement?.cancelFee ? appointment?.depositAgreement?.cancelFee.toLocaleString('de-DE') + '₫' : ''}
- Thưởng: ${appointment?.depositAgreement?.bonus ? appointment?.depositAgreement?.bonus.toLocaleString('de-DE') + '₫' : ''}
- Ngày bổ sung đủ: ${appointment?.depositAgreement?.depositCompleteDate ? dayjs(appointment?.depositAgreement?.depositCompleteDate).format('DD/MM/YYYY') : ''}
- Ghi chú: ${appointment?.depositAgreement?.note ?? ''}
- Cảm ơn nhập khách:  ${this.thankString(appointment?.madeUser)}
- Cảm ơn dẫn khách: ${this.thankString(appointment?.takenOverUser)}`;
    embed.setDescription(text);

    return embed;
  }
}
