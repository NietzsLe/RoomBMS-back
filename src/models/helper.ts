export function getInitialsOrFullText(text: string) {
  // Tách văn bản thành các từ
  const words = text.split(/[-\s]+/);
  let result = '';

  // Duyệt qua từng từ trong mảng
  console.log(words);
  words.forEach((word) => {
    // Kiểm tra nếu từ chỉ chứa chữ cái
    if (
      /[^a-zA-Zàáảãạấầẩẫạăắằẳẵặâấầẩẫạđéèẻẽẹêếềểễệíìỉĩịóòỏõọốồổỗộơớờởỡợúùủũụưứừửữựýỳỷỹỵ]/.test(
        word,
      )
    ) {
      // Thêm chữ cái đầu vào kết quả
      result += word;
    } else {
      // Nếu từ chứa số, thêm toàn bộ từ vào kết quả
      result += word[0];
    }
  });
  result = result.toUpperCase();
  return result;
}

export enum AppointmentStatus {
  SUCCESS = 'success',
  NOT_YET_RECEIVED = 'not-yet-received',
  RECEIVED = 'received',
  EXTRA_CARE = 'extra-care',
}
// console.log(getInitialsOrFullText('Nam Từ Liêm  - 13/5B'));
export enum DepositAgreementStatus {
  ACTIVE = 'active',
  CANCELLED = 'cancelled',
}

/**
 * 📅 Enum for period type (week or month)
 */
export enum PeriodType {
  WEEK = 'week',
  MONTH = 'month',
}

/**
 * 🏷️ Enum for role tier (collaborator, saler, team, company)
 */
export enum RoleTier {
  COLLABORATOR = 'collaborator',
  SALER = 'saler',
  TEAM = 'team',
  COMPANY = 'company',
}
