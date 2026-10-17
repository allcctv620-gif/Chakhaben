export const BENGALI_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

export function toBengaliNumber(num: number | string): string {
  if (num === null || num === undefined) return '০';
  const str = String(num);
  return str.replace(/[0-9]/g, (digit) => BENGALI_DIGITS[parseInt(digit, 10)] || digit);
}

export function formatTaka(amount: number, useBengali = true): string {
  const rounded = Math.round((amount + Number.EPSILON) * 100) / 100;
  const parts = rounded.toLocaleString('en-IN', {
    minimumFractionDigits: rounded % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });

  if (useBengali) {
    return `৳ ${toBengaliNumber(parts)}`;
  }
  return `৳ ${parts}`;
}

export function formatNumberOnly(amount: number, useBengali = true): string {
  const rounded = Math.round((amount + Number.EPSILON) * 100) / 100;
  const parts = rounded.toLocaleString('en-IN', {
    minimumFractionDigits: rounded % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });

  if (useBengali) {
    return toBengaliNumber(parts);
  }
  return parts;
}

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getFormattedDateBengali(dateString: string): string {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-').map(Number);
  const monthsBn = [
    'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
    'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
  ];
  return `${toBengaliNumber(day)} ${monthsBn[month - 1]} ${toBengaliNumber(year)}`;
}

export function getCurrentTimeString(): string {
  const now = new Date();
  let hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 becomes 12
  return `${hours}:${minutes} ${ampm}`;
}

export function isSameDay(date1: string, date2: string): boolean {
  return date1 === date2;
}

export function getRelativeDayLabel(dateString: string, lang: 'bn' | 'en' = 'bn'): string {
  const today = getTodayDateString();
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = `${yesterdayDate.getFullYear()}-${String(yesterdayDate.getMonth() + 1).padStart(2, '0')}-${String(yesterdayDate.getDate()).padStart(2, '0')}`;

  if (dateString === today) {
    return lang === 'bn' ? 'আজ' : 'Today';
  }
  if (dateString === yesterday) {
    return lang === 'bn' ? 'গতকাল' : 'Yesterday';
  }
  return lang === 'bn' ? getFormattedDateBengali(dateString) : dateString;
}
