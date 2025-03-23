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

// console.log(getInitialsOrFullText('Nam Từ Liêm  - 13/5B'));
