export type TransactionType =
  | 'tea_sale'          // চা ও নাস্তা বিক্রি
  | 'expense'           // সাধারণ খরচ (দুধ, চিনি, গ্যাস, ইত্যাদি)
  | 'mfs_cashout'       // বিকাশ/নগদ ক্যাশ আউট (কমিশন আয়)
  | 'mfs_cashin'        // বিকাশ/নগদ ক্যাশ ইন
  | 'flexiload'         // ফ্লেক্সিলোড / মোবাইল রিচার্জ
  | 'baki_given'        // গ্রাহককে বাকি দেওয়া
  | 'baki_paid'         // গ্রাহকের বাকি টাকা আদায়
  | 'partner_withdraw'  // পার্টনারের ব্যক্তিগত উত্তোলন
  | 'capital_add';      // নতুন মূলধন জমা

export type MfsProvider = 'bkash' | 'nagad' | 'rocket' | 'upay' | 'flexiload';

export type ExpenseCategory =
  | 'milk'              // তরল দুধ / গুড়া দুধ
  | 'sugar_tea'         // চিনি ও চা পাতা
  | 'cylinder_gas'      // গ্যাস সিলিন্ডার / জ্বালানী
  | 'bakery_biscuit'    // বিস্কুট, পাউরুটি, টোস্ট, কলা
  | 'cigarette_stock'   // সিগারেট স্টক কেনা
  | 'cups_plastic'      // কাপ, ছাঁকনি ও পরিচ্ছন্নতা
  | 'rent_bill'         // দোকান ভাড়া ও বিদ্যুৎ বিল
  | 'personal_snacks'   // নাস্তা ও দৈনিক হাতখরচ
  | 'other_expense';    // অন্যান্য খরচ

export type TeaSaleCategory =
  | 'milk_tea'          // স্পেশাল দুধ চা
  | 'black_tea'         // রঙ চা / লেবু চা / আদা চা
  | 'coffee'            // কফি
  | 'bakery_snacks'     // বিস্কুট, কলা ও পাউরুটি
  | 'cigarette'         // সিগারেট
  | 'cold_drinks'       // কোল্ড ড্রিঙ্কস ও পানি
  | 'general_counter';  // মোট ক্যাশ কাউন্টার সেল

export interface Transaction {
  id: string;
  date: string;           // YYYY-MM-DD
  time: string;           // HH:mm AM/PM
  type: TransactionType;
  title: string;
  amount: number;         // Face value of transaction
  commission?: number;    // Commission earned (for MFS/Flexiload)
  cashInHandChange: number; // Positive = cash increases, Negative = cash decreases, 0 = neutral
  simProvider?: MfsProvider;
  simBalanceChange?: number; // e-money balance change on SIM
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  partnerId?: 'p1' | 'p2';
  category?: string;
  note?: string;
  operator?: string;      // Grameenphone, Banglalink, Robi, Airtel, Teletalk
  createdAt: number;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address?: string;
  totalDue: number;
  totalTransactionsCount: number;
  lastActive: string;
  createdAt: string;
}

export interface Partner {
  id: 'p1' | 'p2';
  name: string;
  phone: string;
  sharePercent: number;   // e.g. 50
  initialCapital: number;
  totalWithdrawn: number;
}

export interface SimBalances {
  bkashAgent: number;
  nagadAgent: number;
  rocketAgent: number;
  flexiload: number;
  cashInHand: number;     // Physical cash in drawer
  lastUpdated: string;
}

export interface NoteCounter {
  note1000: number;
  note500: number;
  note200: number;
  note100: number;
  note50: number;
  note20: number;
  note10: number;
  note5: number;
  coins: number;
}

export interface DailyClosing {
  date: string;
  openingCash: number;
  salesTotal: number;
  expenseTotal: number;
  mfsCommissionTotal: number;
  netProfit: number;
  bakiCollected: number;
  bakiGiven: number;
  partnerWithdrawn: number;
  expectedClosingCash: number;
  actualCountedCash: number;
  difference: number;
  isClosed: boolean;
  notes?: string;
  closedAt?: string;
}

export interface ShopSettings {
  shopName: string;
  tagline: string;
  ownerName: string;
  mobile: string;
  address: string;
  openingCash: number;
  language: 'bn' | 'en';
  currencySymbol: string;
  bkashCommissionRatePerThousand: number; // e.g. 4.14 Tk
  nagadCommissionRatePerThousand: number; // e.g. 4.00 Tk
  rocketCommissionRatePerThousand: number;// e.g. 4.00 Tk
  flexiCommissionRatePercent: number;    // e.g. 2.70%
}
