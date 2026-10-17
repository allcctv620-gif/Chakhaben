import React from 'react';
import { Printer, X } from 'lucide-react';
import { Partner, ShopSettings, Transaction } from '../types';
import { formatTaka, getFormattedDateBengali } from '../utils/formatters';

interface PrintDailyReportProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string;
  transactions: Transaction[];
  partners: Partner[];
  settings: ShopSettings;
  cashInHand: number;
}

export const PrintDailyReport: React.FC<PrintDailyReportProps> = ({
  isOpen,
  onClose,
  selectedDate,
  transactions,
  partners,
  settings,
  cashInHand,
}) => {
  if (!isOpen) return null;

  const teaSales = transactions
    .filter((t) => t.type === 'tea_sale')
    .reduce((sum, t) => sum + t.amount, 0);

  const mfsCommission = transactions
    .filter((t) => t.type === 'mfs_cashout')
    .reduce((sum, t) => sum + (t.commission || 0), 0);

  const flexiCommission = transactions
    .filter((t) => t.type === 'flexiload')
    .reduce((sum, t) => sum + (t.commission || 0), 0);

  const totalCommissions = mfsCommission + flexiCommission;

  const expenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netProfit = teaSales + totalCommissions - expenses;

  const p1 = partners[0] || { name: 'পার্টনার ১', sharePercent: 50 };
  const p2 = partners[1] || { name: 'পার্টনার ২', sharePercent: 50 };

  const p1Profit = Math.round((netProfit * (p1.sharePercent / 100)) * 100) / 100;
  const p2Profit = Math.round((netProfit * (p2.sharePercent / 100)) * 100) / 100;

  const p1Withdrawn = transactions
    .filter((t) => t.type === 'partner_withdraw' && t.partnerId === 'p1')
    .reduce((sum, t) => sum + t.amount, 0);

  const p2Withdrawn = transactions
    .filter((t) => t.type === 'partner_withdraw' && t.partnerId === 'p2')
    .reduce((sum, t) => sum + t.amount, 0);

  const bakiCollected = transactions
    .filter((t) => t.type === 'baki_paid')
    .reduce((sum, t) => sum + t.amount, 0);

  const bakiGiven = transactions
    .filter((t) => t.type === 'baki_given')
    .reduce((sum, t) => sum + t.amount, 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-stone-200 w-full max-w-xl my-6 overflow-hidden">
        {/* Modal Controls (Hidden in Print) */}
        <div className="no-print flex items-center justify-between px-5 py-3 border-b border-stone-200 bg-stone-50">
          <span className="text-xs font-bold text-stone-700">
            দৈনিক ক্লোজিং হিস্যা রসিদ (Daily Memo)
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-md transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>প্রিন্ট করুন</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-700 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Paper */}
        <div className="p-6 sm:p-8 space-y-5 text-stone-900 font-sans print:p-0">
          {/* Shop Header */}
          <div className="text-center border-b border-dashed border-stone-300 pb-4">
            <h1 className="text-xl font-bold tracking-tight text-stone-900">
              {settings.shopName}
            </h1>
            <p className="text-xs text-stone-500 mt-0.5">{settings.tagline}</p>
            <p className="text-xs text-stone-500">{settings.address} · মোবা: {settings.mobile}</p>
            <div className="mt-2 text-xs font-semibold text-stone-700 bg-stone-100 inline-block px-3 py-1 rounded">
              তারিখ: {getFormattedDateBengali(selectedDate)} ({selectedDate})
            </div>
          </div>

          {/* Income & Expense Breakdown */}
          <div className="space-y-2 text-xs">
            <div className="font-bold text-stone-800 pb-1 border-b border-stone-200">
              আয় ও বিক্রির খতিয়ান
            </div>
            <div className="flex justify-between py-1">
              <span>চা ও নাস্তা নগদ বিক্রি:</span>
              <span className="font-bold tabular-nums">{formatTaka(teaSales)}</span>
            </div>
            <div className="flex justify-between py-1">
              <span>বিকাশ/নগদ ক্যাশ আউট কমিশন লাভ:</span>
              <span className="font-bold tabular-nums">{formatTaka(mfsCommission)}</span>
            </div>
            <div className="flex justify-between py-1">
              <span>ফ্লেক্সিলোড কমিশন লাভ:</span>
              <span className="font-bold tabular-nums">{formatTaka(flexiCommission)}</span>
            </div>
            <div className="flex justify-between py-1 border-t border-stone-200 font-bold text-stone-900">
              <span>মোট আয় (বিক্রি + কমিশন):</span>
              <span className="tabular-nums">{formatTaka(teaSales + totalCommissions)}</span>
            </div>

            <div className="font-bold text-stone-800 pt-3 pb-1 border-b border-stone-200">
              দোকানের খরচের খতিয়ান
            </div>
            <div className="flex justify-between py-1">
              <span>দুধ, চিনি, গ্যাস ও পরিচালন খরচ:</span>
              <span className="font-bold text-rose-700 tabular-nums">-{formatTaka(expenses)}</span>
            </div>

            <div className="flex justify-between py-2 border-t-2 border-stone-900 font-bold text-sm bg-stone-50 px-2 rounded">
              <span>আজকের নিট মোট লাভ (Net Profit):</span>
              <span className={`tabular-nums ${netProfit >= 0 ? 'text-emerald-800' : 'text-rose-800'}`}>
                {formatTaka(netProfit)}
              </span>
            </div>
          </div>

          {/* 2-Partner Profit & Drawing Summary */}
          <div className="p-3 bg-stone-50/80 rounded-lg border border-stone-200 text-xs space-y-2">
            <div className="font-bold text-stone-900 border-b border-stone-200 pb-1">
              ২ অংশীদারের লাভ হিস্যা ও উত্তোলন
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="space-y-1">
                <span className="font-bold text-stone-800 block">{p1.name} ({p1.sharePercent}%):</span>
                <div className="flex justify-between text-stone-600">
                  <span>লাভ হিস্যা:</span>
                  <span className="font-bold text-emerald-700 tabular-nums">{formatTaka(p1Profit)}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>আজকের উত্তোলন:</span>
                  <span className="font-bold text-rose-700 tabular-nums">{formatTaka(p1Withdrawn)}</span>
                </div>
                <div className="flex justify-between font-semibold pt-1 border-t border-stone-200">
                  <span>আজকের অবশিষ্ট:</span>
                  <span className="tabular-nums">{formatTaka(p1Profit - p1Withdrawn)}</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-stone-800 block">{p2.name} ({p2.sharePercent}%):</span>
                <div className="flex justify-between text-stone-600">
                  <span>লাভ হিস্যা:</span>
                  <span className="font-bold text-emerald-700 tabular-nums">{formatTaka(p2Profit)}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>আজকের উত্তোলন:</span>
                  <span className="font-bold text-rose-700 tabular-nums">{formatTaka(p2Withdrawn)}</span>
                </div>
                <div className="flex justify-between font-semibold pt-1 border-t border-stone-200">
                  <span>আজকের অবশিষ্ট:</span>
                  <span className="tabular-nums">{formatTaka(p2Profit - p2Withdrawn)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Additional info */}
          <div className="text-[11px] text-stone-500 space-y-1 pt-1 border-t border-stone-200">
            <div className="flex justify-between">
              <span>আজকের বাকি আদায়:</span>
              <span className="font-bold tabular-nums">{formatTaka(bakiCollected)}</span>
            </div>
            <div className="flex justify-between">
              <span>আজকের নতুন বাকি দেওয়া:</span>
              <span className="font-bold tabular-nums">{formatTaka(bakiGiven)}</span>
            </div>
            <div className="flex justify-between">
              <span>দিন শেষে ক্যাশ ড্রয়ারে মজুদ:</span>
              <span className="font-bold text-stone-900 tabular-nums">{formatTaka(cashInHand)}</span>
            </div>
          </div>

          {/* Signatures */}
          <div className="pt-8 grid grid-cols-2 gap-8 text-center text-xs">
            <div className="border-t border-stone-400 pt-1 text-stone-700 font-semibold">
              {p1.name.split(' ')[0]} (স্বাক্ষর)
            </div>
            <div className="border-t border-stone-400 pt-1 text-stone-700 font-semibold">
              {p2.name.split(' ')[0]} (স্বাক্ষর)
            </div>
          </div>

          <div className="text-[10px] text-center text-stone-400 pt-2">
            হিসাব খাতা ডিজিটাল সিস্টেম দ্বারা প্রস্তুতকৃত · প্রিন্ট সময়: {new Date().toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
};
