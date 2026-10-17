import {
  Customer,
  DailyClosing,
  Partner,
  ShopSettings,
  SimBalances,
  Transaction,
} from '../types';
import { getTodayDateString } from './formatters';

const STORAGE_KEYS = {
  TRANSACTIONS: 'dokan_khata_transactions_v1',
  CUSTOMERS: 'dokan_khata_customers_v1',
  PARTNERS: 'dokan_khata_partners_v1',
  SIM_BALANCES: 'dokan_khata_sim_balances_v1',
  CLOSINGS: 'dokan_khata_closings_v1',
  SETTINGS: 'dokan_khata_settings_v1',
};

const DEFAULT_SETTINGS: ShopSettings = {
  shopName: 'ভাই ভাই চা ও টেলিকম কর্নার',
  tagline: 'চা, ফ্লেক্সিলোড ও মোবাইল ব্যাংকিং সেবা',
  ownerName: 'রাকিব ও সুমন',
  mobile: '01712-345678',
  address: 'লোকাল বাজার রোড, বটতলা মোড়',
  openingCash: 5000,
  language: 'bn',
  currencySymbol: '৳',
  bkashCommissionRatePerThousand: 4.14,
  nagadCommissionRatePerThousand: 4.00,
  rocketCommissionRatePerThousand: 4.00,
  flexiCommissionRatePercent: 2.70,
};

const DEFAULT_PARTNERS: Partner[] = [
  {
    id: 'p1',
    name: 'মো: রাকিবুল হাসান (পার্টনার ১)',
    phone: '01711-223344',
    sharePercent: 50,
    initialCapital: 30000,
    totalWithdrawn: 700,
  },
  {
    id: 'p2',
    name: 'সুমন আহমেদ (পার্টনার ২)',
    phone: '01822-334455',
    sharePercent: 50,
    initialCapital: 30000,
    totalWithdrawn: 500,
  },
];

const DEFAULT_CUSTOMERS: Customer[] = [
  {
    id: 'c1',
    name: 'কবির হোসেন (মুদি দোকানদার)',
    phone: '01715-667788',
    address: 'বাজার সংলগ্ন',
    totalDue: 450,
    totalTransactionsCount: 14,
    lastActive: getTodayDateString(),
    createdAt: '2026-10-01',
  },
  {
    id: 'c2',
    name: 'মিলন ভাই (অটোরিকশা চালক)',
    phone: '01911-889900',
    address: 'স্ট্যান্ড মোড়',
    totalDue: 180,
    totalTransactionsCount: 8,
    lastActive: getTodayDateString(),
    createdAt: '2026-10-05',
  },
  {
    id: 'c3',
    name: 'মাস্টার শফিকুল ইসলাম',
    phone: '01819-112233',
    address: 'স্কুল রোড',
    totalDue: 85,
    totalTransactionsCount: 5,
    lastActive: getTodayDateString(),
    createdAt: '2026-10-10',
  },
  {
    id: 'c4',
    name: 'আরিফ মেকানিক',
    phone: '01633-445566',
    address: 'গ্যারেজ পট্টি',
    totalDue: 320,
    totalTransactionsCount: 12,
    lastActive: getTodayDateString(),
    createdAt: '2026-10-08',
  },
];

const DEFAULT_SIM_BALANCES: SimBalances = {
  bkashAgent: 18450,
  nagadAgent: 12200,
  rocketAgent: 4500,
  flexiload: 4850,
  cashInHand: 20000,
  lastUpdated: new Date().toISOString(),
};

const today = getTodayDateString();

const DEFAULT_TRANSACTIONS: Transaction[] = [
  {
    id: 't-1',
    date: today,
    time: '07:30 AM',
    type: 'tea_sale',
    title: 'সকালের চা ও বিস্কুট বিক্রি (কাউন্টার ক্যাশ)',
    amount: 850,
    cashInHandChange: 850,
    category: 'milk_tea',
    note: 'সকাল ৭টা থেকে ৯টা কাউন্টার ক্যাশ',
    createdAt: Date.now() - 1000 * 60 * 180,
  },
  {
    id: 't-2',
    date: today,
    time: '08:15 AM',
    type: 'expense',
    title: 'খাঁটি তরল দুধ ক্রয় (৩ লিটার)',
    amount: 270,
    cashInHandChange: -270,
    category: 'milk',
    note: 'গোয়ালার কাছ থেকে ৯০ টাকা দরে ৩ লিটার',
    createdAt: Date.now() - 1000 * 60 * 160,
  },
  {
    id: 't-3',
    date: today,
    time: '09:00 AM',
    type: 'mfs_cashout',
    title: 'বিকাশ ক্যাশ আউট (কাস্টমার ক্যাশ উত্তোলন)',
    amount: 3000,
    commission: 12.42,
    simProvider: 'bkash',
    cashInHandChange: -3000,
    simBalanceChange: 3000,
    note: 'গ্রাহক ক্যাশ নিয়েছে, এজেন্ট সিমে টাকা ঢুকেছে',
    createdAt: Date.now() - 1000 * 60 * 130,
  },
  {
    id: 't-4',
    date: today,
    time: '09:40 AM',
    type: 'flexiload',
    title: 'গ্রামীণফোন ফ্লেক্সিলোড রিচার্জ',
    amount: 199,
    commission: 5.37,
    simProvider: 'flexiload',
    operator: 'Grameenphone',
    cashInHandChange: 199,
    simBalanceChange: -199,
    note: 'কাস্টমার 017... প্যাকেজ রিচার্জ',
    createdAt: Date.now() - 1000 * 60 * 100,
  },
  {
    id: 't-5',
    date: today,
    time: '10:15 AM',
    type: 'mfs_cashin',
    title: 'নগদ ক্যাশ ইন (টাকা পাঠানো)',
    amount: 2000,
    simProvider: 'nagad',
    cashInHandChange: 2000,
    simBalanceChange: -2000,
    note: 'কাস্টমার ক্যাশ জমা দিল, সিমে ব্যালেন্স কমেছে',
    createdAt: Date.now() - 1000 * 60 * 70,
  },
  {
    id: 't-6',
    date: today,
    time: '10:45 AM',
    type: 'baki_paid',
    title: 'কবির হোসেন - পূর্বের বাকি পরিশোধ',
    amount: 200,
    cashInHandChange: 200,
    customerId: 'c1',
    customerName: 'কবির হোসেন (মুদি দোকানদার)',
    note: 'পূর্বের ৪৫০ টাকার মধ্যে ২০০ টাকা নগদ দিল',
    createdAt: Date.now() - 1000 * 60 * 50,
  },
  {
    id: 't-7',
    date: today,
    time: '11:10 AM',
    type: 'tea_sale',
    title: 'চা, সিগারেট ও কোল্ড ড্রিংকস সেল',
    amount: 620,
    cashInHandChange: 620,
    category: 'general_counter',
    note: 'বেলা ১১টার সেল',
    createdAt: Date.now() - 1000 * 60 * 30,
  },
  {
    id: 't-8',
    date: today,
    time: '11:40 AM',
    type: 'baki_given',
    title: 'মিলন ভাই - চা ও বেনসন সিগারেট বাকি',
    amount: 45,
    cashInHandChange: 0,
    customerId: 'c2',
    customerName: 'মিলন ভাই (অটোরিকশা চালক)',
    note: '২ কাপ চা ও সিগারেট বাকিতে নিল',
    createdAt: Date.now() - 1000 * 60 * 15,
  },
  {
    id: 't-9',
    date: today,
    time: '12:00 PM',
    type: 'partner_withdraw',
    title: 'রাকিব (পার্টনার ১) ব্যক্তিগত হাতখরচ উত্তোলন',
    amount: 200,
    cashInHandChange: -200,
    partnerId: 'p1',
    note: 'দুপুরের নাস্তা ও পারিবারিক কাজের জন্য উত্তোলন',
    createdAt: Date.now() - 1000 * 60 * 5,
  },
  // Yesterday's transactions
  {
    id: 't-prev-1',
    date: '2026-10-16',
    time: '08:00 AM',
    type: 'tea_sale',
    title: 'সকালের চা ও টোস্ট বিক্রি',
    amount: 1420,
    cashInHandChange: 1420,
    category: 'milk_tea',
    createdAt: Date.now() - 1000 * 60 * 60 * 24,
  },
  {
    id: 't-prev-2',
    date: '2026-10-16',
    time: '09:30 AM',
    type: 'expense',
    title: 'সিলিন্ডার গ্যাস রিফিল',
    amount: 1350,
    cashInHandChange: -1350,
    category: 'cylinder_gas',
    createdAt: Date.now() - 1000 * 60 * 60 * 23,
  },
  {
    id: 't-prev-3',
    date: '2026-10-16',
    time: '11:00 AM',
    type: 'mfs_cashout',
    title: 'বিকাশ ক্যাশ আউট',
    amount: 5000,
    commission: 20.70,
    simProvider: 'bkash',
    cashInHandChange: -5000,
    simBalanceChange: 5000,
    createdAt: Date.now() - 1000 * 60 * 60 * 22,
  },
  {
    id: 't-prev-4',
    date: '2026-10-16',
    time: '04:30 PM',
    type: 'tea_sale',
    title: 'বিকেলের চা ও নাস্তা বিক্রি',
    amount: 1850,
    cashInHandChange: 1850,
    category: 'general_counter',
    createdAt: Date.now() - 1000 * 60 * 60 * 18,
  },
  {
    id: 't-prev-5',
    date: '2026-10-16',
    time: '06:00 PM',
    type: 'flexiload',
    title: 'রবি ও এয়ারটেল রিচার্জ',
    amount: 550,
    commission: 14.85,
    simProvider: 'flexiload',
    operator: 'Robi',
    cashInHandChange: 550,
    simBalanceChange: -550,
    createdAt: Date.now() - 1000 * 60 * 60 * 16,
  },
];

export function getStoredSettings(): ShopSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: ShopSettings): void {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
}

export function getStoredPartners(): Partner[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PARTNERS);
    if (!raw) return DEFAULT_PARTNERS;
    return JSON.parse(raw);
  } catch {
    return DEFAULT_PARTNERS;
  }
}

export function savePartners(partners: Partner[]): void {
  localStorage.setItem(STORAGE_KEYS.PARTNERS, JSON.stringify(partners));
}

export function getStoredCustomers(): Customer[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
    if (!raw) return DEFAULT_CUSTOMERS;
    return JSON.parse(raw);
  } catch {
    return DEFAULT_CUSTOMERS;
  }
}

export function saveCustomers(customers: Customer[]): void {
  localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
}

export function getStoredTransactions(): Transaction[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (!raw) return DEFAULT_TRANSACTIONS;
    return JSON.parse(raw);
  } catch {
    return DEFAULT_TRANSACTIONS;
  }
}

export function saveTransactions(transactions: Transaction[]): void {
  localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
}

export function getStoredSimBalances(): SimBalances {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SIM_BALANCES);
    if (!raw) return DEFAULT_SIM_BALANCES;
    return JSON.parse(raw);
  } catch {
    return DEFAULT_SIM_BALANCES;
  }
}

export function saveSimBalances(balances: SimBalances): void {
  localStorage.setItem(STORAGE_KEYS.SIM_BALANCES, JSON.stringify(balances));
}

export function getStoredClosings(): Record<string, DailyClosing> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CLOSINGS);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function saveClosing(closing: DailyClosing): void {
  const closings = getStoredClosings();
  closings[closing.date] = closing;
  localStorage.setItem(STORAGE_KEYS.CLOSINGS, JSON.stringify(closings));
}

export function exportAllDataAsJSON(): string {
  const data = {
    settings: getStoredSettings(),
    partners: getStoredPartners(),
    customers: getStoredCustomers(),
    transactions: getStoredTransactions(),
    simBalances: getStoredSimBalances(),
    closings: getStoredClosings(),
    exportDate: new Date().toISOString(),
  };
  return JSON.stringify(data, null, 2);
}

export function importAllDataFromJSON(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString);
    if (data.settings) saveSettings(data.settings);
    if (data.partners) savePartners(data.partners);
    if (data.customers) saveCustomers(data.customers);
    if (data.transactions) saveTransactions(data.transactions);
    if (data.simBalances) saveSimBalances(data.simBalances);
    if (data.closings) localStorage.setItem(STORAGE_KEYS.CLOSINGS, JSON.stringify(data.closings));
    return true;
  } catch (err) {
    console.error('Failed to parse import data', err);
    return false;
  }
}

export function resetToDemoData(): void {
  localStorage.removeItem(STORAGE_KEYS.SETTINGS);
  localStorage.removeItem(STORAGE_KEYS.PARTNERS);
  localStorage.removeItem(STORAGE_KEYS.CUSTOMERS);
  localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
  localStorage.removeItem(STORAGE_KEYS.SIM_BALANCES);
  localStorage.removeItem(STORAGE_KEYS.CLOSINGS);
}
