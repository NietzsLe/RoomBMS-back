import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Appointment } from 'src/models/appointment.model';
import { ChatGroup } from 'src/models/chatGroup.model';
import { AppointmentStatus } from 'src/models/helper';
import { Room } from 'src/models/room.model';
import { Context, Telegraf } from 'telegraf';
import { ArrayContains, Repository } from 'typeorm';
import * as dayjs from 'dayjs';
import { User } from 'src/models/user.model';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { Update } from 'telegraf/typings/core/types/typegram';
import axios from 'axios';

function IsCTV(roleIDs: string[]) {
  for (const roleID of roleIDs) {
    if (roleID != 'ctv') {
      return false;
    }
  }
  return true;
}

function toShortName(fullName: string) {
  const parts = fullName.trim().split(/\s+/); // tách các từ
  const lastName = parts[parts.length - 1]; // lấy từ cuối (Linh)
  const initials = parts
    .slice(0, parts.length - 1) // các từ trước
    .map((word) => word[0].toUpperCase()) // lấy chữ cái đầu
    .join('');
  return lastName + initials;
}

function thankString(user: User | null | undefined) {
  if (user) {
    if (IsCTV(user.roles.map((role) => role.roleID))) {
      return `CTV${user?.name ? ' + ' + user?.name : ''}${user?.phoneNumber ? ' + +84' + user?.phoneNumber : ''}${user?.manager?.name ? ' + ' + toShortName(user?.manager?.name) : ''}${user?.team?.teamID ? ' + ' + user?.team.teamID : ''}`;
    } else {
      return `${user?.name ? toShortName(user?.name) : ''}${user?.phoneNumber ? ' + +84' + user?.phoneNumber : ''}${user?.team?.teamID ? ' + ' + user?.team.teamID : ''}`;
    }
  } else return '';
}

// Bước 1: Lấy danh sách proxy miễn phí
async function fetchFreeProxies(): Promise<string[]> {
  const res = await axios.get('https://www.sslproxies.org/');
  const html: string = res.data as string;
  const regex = /<td>(\d+\.\d+\.\d+\.\d+)<\/td><td>(\d+)<\/td>/g;

  const proxies: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = regex.exec(html)) !== null) {
    proxies.push(`http://${match[1]}:${match[2]}`);
  }
  return proxies;
}

// Bước 2: Test proxy
async function testProxy(proxyUrl: string): Promise<boolean> {
  try {
    const agent = new HttpsProxyAgent(proxyUrl);
    const res = await axios.get('https://api.telegram.org', {
      httpsAgent: agent,
      timeout: 4000,
    });
    return res.status === 200;
  } catch {
    return false;
  }
}

// Bước 3: Tìm proxy đầu tiên hoạt động được
async function findWorkingProxy(): Promise<string | null> {
  const proxies = await fetchFreeProxies();

  for (const proxy of proxies.slice(0, 20)) {
    // kiểm tra tối đa 20 proxy
    console.log(`Đang kiểm tra proxy: ${proxy}`);
    const ok = await testProxy(proxy);
    if (ok) {
      console.log(`✅ Proxy hoạt động: ${proxy}`);
      return proxy;
    } else {
      console.log(`❌ Không dùng được: ${proxy}`);
    }
  }

  console.error('Không tìm thấy proxy hoạt động');
  return null;
}

// const agent = new HttpsProxyAgent('http://143.198.42.182:31280');
@Injectable()
export class TelegramBotService {
  private bot: Telegraf<Context<Update>>;
  constructor(
    @InjectRepository(Appointment)
    private appointmentReponsitory: Repository<Appointment>,
    @InjectRepository(Room)
    private roomRepository: Repository<Room>,
    @InjectRepository(ChatGroup)
    private chatGroupRepository: Repository<ChatGroup>,
  ) {
    findWorkingProxy()
      .then((proxy) => {
        if (!proxy) {
          console.error('Không thể khởi động bot do không có proxy hoạt động');
          return;
        }

        const agent = new HttpsProxyAgent(proxy);
        this.bot = new Telegraf(process.env.BOT_TOKEN ?? '', {
          telegram: { agent },
        });
      })
      .catch(() => {});
  }

  async updateBot() {
    const proxy = await findWorkingProxy();
    if (!proxy) {
      console.error('Không thể khởi động bot do không có proxy hoạt động');
      return;
    }

    const agent = new HttpsProxyAgent(proxy);
    this.bot = new Telegraf(process.env.BOT_TOKEN ?? '', {
      telegram: { agent },
    });
  }

  async sendMessage(chatId: string, text: string) {
    await this.bot.telegram.sendMessage(chatId, text, {
      parse_mode: 'Markdown',
    });
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
    let text: string;
    let chatGroups: ChatGroup[];
    if (appointment) {
      chatGroups = await this.chatGroupRepository.find({
        where: {
          provinceCodes: ArrayContains([
            appointment?.room?.house?.administrativeUnit?.districtCode,
          ]),
        },
      });
      text = `KHÁCH HẸN XEM PHÒNG
-Tên khách hàng: ${appointment.tenant?.name ?? ''}
-SĐT: ${appointment?.tenant?.phoneNumber.slice(0, -3) + 'xxx'}
-Nhà/CHDV: ${appointment?.room?.house?.name ?? ''}
-Phòng: ${appointment?.room?.name ?? ''}
-Địa chỉ: ${appointment?.room?.house?.addressDetail ?? ''}${appointment?.room?.house?.addressDetail && appointment?.room?.house?.administrativeUnit ? ', ' : ''}${appointment?.room?.house?.administrativeUnit ? appointment?.room?.house?.administrativeUnit.wardName + ', ' + appointment?.room?.house?.administrativeUnit.districtName + ', ' + appointment?.room?.house?.administrativeUnit.provinceName : ''}
-Giá tư vấn: ${appointment.consultingPrice ? appointment.consultingPrice.toLocaleString('de-DE') + '₫' : ''}
-Thời gian khách xem: ${dayjs(appointment.appointmentTime).format('HH:mm DD/MM/YYYY')}
-Số lượng người: ${appointment.noPeople ?? ''}
-Số lượng xe: ${appointment.noPeople ?? ''}
-Thời gian dự kiến dọn vào: ${appointment.moveInTime ?? ''}
-Nuôi thú cưng: ${appointment.pet ? 'Có' : 'Không'}
-Ghi chú: ${appointment.note ?? ''}
-Cảm ơn nhập khách: ${thankString(appointment.madeUser)}
-Nhận tại: ${process.env.FRONTEND_HOST + '/saler/appointments/' + appointmentID}`;
      console.log('@Telegram: ', text);
      try {
        await Promise.all(
          chatGroups.map((item) => this.sendMessage(item.chatGroupID, text)),
        );
      } catch (error) {
        console.log(error);
        try {
          await this.updateBot();
          await new Promise((resolve) => setTimeout(resolve, 2000));
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
    let text: string;
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
      text = `KHÁCH HẸN XEM PHÒNG: 

-Kết quả: *${appointment?.status == AppointmentStatus.EXTRA_CARE ? 'CHĂM SÓC THÊM' : 'KHÁCH NGỪNG XEM'}*
-Tên khách hàng: ${appointment.tenant?.name ?? ''}
-SĐT: ${appointment?.tenant?.phoneNumber.slice(0, -3) + 'xxx'}
-Nhà/CHDV: ${appointment?.room?.house?.name ?? ''}
-Phòng: ${appointment?.room?.name ?? ''}
-Địa chỉ:  ${appointment?.room?.house?.addressDetail ?? ''}${appointment?.room?.house?.addressDetail && appointment?.room?.house?.administrativeUnit ? ', ' : ''}${appointment?.room?.house?.administrativeUnit ? appointment?.room?.house?.administrativeUnit.wardName + ', ' + appointment?.room?.house?.administrativeUnit.districtName + ', ' + appointment?.room?.house?.administrativeUnit.provinceName : ''}
-Giá tư vấn:  ${appointment.consultingPrice ? appointment.consultingPrice.toLocaleString('de-DE') + '₫' : ''}
-Thời gian khách xem: ${appointment.appointmentTime ? dayjs(appointment.appointmentTime).format('HH:mm DD/MM/YYYY') : ''}
-Số lượng người: ${appointment.noPeople ?? ''}
-Số lượng xe: ${appointment.noPeople ?? ''}
-Thời gian dự kiến dọn vào: ${appointment.moveInTime ?? ''}
-Nuôi thú cưng: ${appointment.pet ? 'Có' : 'Không'}
-Ghi chú: ${appointment.note ?? ''}
-Cảm ơn nhập khách:  ${thankString(appointment.madeUser)}
-Cảm ơn dẫn khách:  ${thankString(appointment.takenOverUser)}
-Kết quả: ${appointment.failReason ?? ''}`;
    } else {
      chatGroups = await this.chatGroupRepository.find({
        where: {
          chatGroupName: 'Result:Deposit',
        },
      });
      text = `KHÁCH HẸN XEM PHÒNG 
-Kết quả: *KHÁCH CỌC GIỮ CHỖ*
-Ngày cọc: ${appointment?.depositAgreement?.depositDeliverDate ? dayjs(appointment?.depositAgreement?.depositDeliverDate).format('DD/MM/YYYY') : ''}
-Ngày lên HĐ: ${appointment?.depositAgreement?.agreementDate ? dayjs(appointment?.depositAgreement?.agreementDate).format('DD/MM/YYYY') : ''}
-Thời gian ký HĐ: ${appointment?.depositAgreement?.duration ? appointment?.depositAgreement?.duration + ' tháng' : ''}
-Tên khách hàng: ${appointment?.tenant?.name ?? ''}
-SĐT: ${appointment?.tenant?.phoneNumber ?? ''}
-Chủ nhà: ${appointment?.room?.house?.ownerName ?? ''}
-Hoa hồng: ${appointment?.depositAgreement?.commissionPer ? appointment?.depositAgreement?.commissionPer + '%' : ''} - ${(((appointment?.depositAgreement?.price ?? 0) * (appointment?.depositAgreement?.commissionPer ?? 0)) / 100).toLocaleString('de-DE') + '₫'}
-Nhà/CHDV: ${appointment?.room?.house?.name ?? ''} - Địa chỉ: ${appointment?.room?.house?.addressDetail ?? ''}${appointment?.room?.house?.addressDetail && appointment?.room?.house?.administrativeUnit ? ', ' : ''}${appointment?.room?.house?.administrativeUnit ? appointment?.room?.house?.administrativeUnit.wardName + ', ' + appointment?.room?.house?.administrativeUnit.districtName + ', ' + appointment?.room?.house?.administrativeUnit.provinceName : ''}
-Phòng: ${appointment?.room?.name ?? ''}
-Tiền đã cọc: ${appointment?.depositAgreement?.price ? appointment?.depositAgreement?.price.toLocaleString('de-DE') + '₫' : ''}
-Tiền đã cọc: ${appointment?.depositAgreement?.deliveredDeposit ? appointment?.depositAgreement?.deliveredDeposit.toLocaleString('de-DE') + '₫' : ''}
-Ngày bổ sung đủ: ${appointment?.depositAgreement?.depositCompleteDate ? dayjs(appointment?.depositAgreement?.depositCompleteDate).format('DD/MM/YYYY') : ''}
-Ghi chú: ${appointment?.depositAgreement?.note ?? ''}
-Cảm ơn nhập khách:  ${thankString(appointment?.madeUser)}
-Cảm ơn dẫn khách: ${thankString(appointment?.takenOverUser)}`;
    }
    console.log('@Telegram: ', text);
    try {
      await Promise.all(
        chatGroups.map((item) => this.sendMessage(item.chatGroupID, text)),
      );
    } catch (error) {
      console.log(error);
      try {
        await this.updateBot();
        await new Promise((resolve) => setTimeout(resolve, 2000));
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
}
