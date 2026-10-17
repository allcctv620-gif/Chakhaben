import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  Sparkles,
  Calendar,
  ArrowRightLeft,
} from 'lucide-react';
import { formatTaka, getFormattedDateBengali, getTodayDateString } from '../utils/formatters';

interface DailyStatsProps {
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  salesTotal: number;
  expenseTotal: number;
  commissionTotal: number;
  netProfit: number;
  cashInHand: number;
  partner1Name: string;
  partner2Name: string;
  partner1Share: number;
  partner2Share: number;
  onOpenQuickSale: () => void;
  onOpenQuickExpense: () => void;
  onOpenClosing: () => void;
}

export const DailyStats: React.FC<DailyStatsProps> = ({
  selectedDate,
  setSelectedDate,
  salesTotal,
  expenseTotal,
  commissionTotal,
  netProfit,
  cashInHand,
  partner1Name,
  partner2Name,
  partner1Share,
  partner2Share,
  onOpenQuickSale,
  onOpenQuickExpense,
  onOpenClosing,
}) => {
  const today = getTodayDateString();
  const isToday = selectedDate === today;

  // Calculate yesterday date string
  const yDate = new Date();
  yDate.setDate(yDate.getDate() - 1);
  const yesterdayStr = `${yDate.getFullYear()}-${String(yDate.getMonth() + 1).padStart(2, '0')}-${String(yDate.getDate()).padStart(2, '0')}`;
  const isYesterday = selectedDate === yesterdayStr;

  const p1Profit = Math.round((netProfit * (partner1Share / 100)) * 100) / 100;
  const p2Profit = Math.round((netProfit * (partner2Share / 100)) * 100) / 100;

  return (
    <div className="bg-white border border-stone-200 rounded-xl p-4 sm:p-5 shadow-xs mb-6">
      {/* Date Bar & Quick Status */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-stone-100">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-lg text-xs font-medium">
            <button
              onClick={() => setSelectedDate(today)}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                isToday ? 'bg-white text-stone-900 font-bold shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              আজ
            </button>
            <button
              onClick={() => setSelectedDate(yesterdayStr)}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                isYesterday ? 'bg-white text-stone-900 font-bold shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              গতকাল
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-stone-600 bg-stone-50 px-2.5 py-1.5 rounded-lg border border-stone-200">
            <Calendar className="w-3.5 h-3.5 text-stone-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
              className="bg-transparent border-none text-xs text-stone-800 font-medium focus:outline-none cursor-pointer"
            />
          </div>

          <span className="text-xs text-stone-500 font-medium">
            {getFormattedDateBengali(selectedDate)}
          </span>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={onOpenQuickSale}
            className="px-2.5 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-md transition-colors"
          >
            + দ্রুত বিক্রি
          </button>
          <button
            onClick={onOpenQuickExpense}
            className="px-2.5 py-1.5 text-xs font-semibold text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-md transition-colors"
          >
            - দ্রুত খরচ
          </button>
          <button
            onClick={onOpenClosing}
            className="px-2.5 py-1.5 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-md transition-colors"
          >
            ক্যাশ রিকনসাইল
          </button>
        </div>
      </div>

      {/* 5-Column Metric Strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4">
        {/* Metric 1: চা ও নাস্তা বিক্রি */}
        <div className="bg-stone-50/70 p-3.5 rounded-lg border border-stone-200/80">
          <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
            <span>চা ও নাস্তা বিক্রি</span>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-stone-900 tabular-nums">
            {formatTaka(salesTotal)}
          </div>
          <div className="text-[11px] text-stone-500 mt-1">
            কাউন্টার ক্যাশ সেল
          </div>
        </div>

        {/* Metric 2: এমএফএস কমিশন */}
        <div className="bg-stone-50/70 p-3.5 rounded-lg border border-stone-200/80">
          <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
            <span>বিকাশ/ফ্লেক্সি লাভ</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-amber-700 tabular-nums">
            {formatTaka(commissionTotal)}
          </div>
          <div className="text-[11px] text-stone-500 mt-1">
            অর্জিত মোট কমিশন
          </div>
        </div>

        {/* Metric 3: মোট খরচ */}
        <div className="bg-stone-50/70 p-3.5 rounded-lg border border-stone-200/80">
          <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
            <span>দোকানের খরচ</span>
            <TrendingDown className="w-3.5 h-3.5 text-rose-600" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-rose-700 tabular-nums">
            {formatTaka(expenseTotal)}
          </div>
          <div className="text-[11px] text-stone-500 mt-1">
            দুধ, চিনি, গ্যাস ও অন্যান্য
          </div>
        </div>

        {/* Metric 4: আজকের নিট লাভ */}
        <div className="bg-stone-50/70 p-3.5 rounded-lg border border-stone-200/80">
          <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
            <span>আজকের নিট লাভ</span>
            <PiggyBank className="w-3.5 h-3.5 text-emerald-700" />
          </div>
          <div className={`text-xl sm:text-2xl font-bold tabular-nums ${netProfit >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
            {formatTaka(netProfit)}
          </div>
          <div className="text-[11px] text-stone-500 mt-1 truncate">
            (বিক্রি + কমিশন) - খরচ
          </div>
        </div>

        {/* Metric 5: ক্যাশ ড্রয়ার ব্যালেন্স */}
        <div className="col-span-2 md:col-span-1 bg-amber-50/50 p-3.5 rounded-lg border border-amber-200/80">
          <div className="flex items-center justify-between text-xs text-amber-900 font-medium mb-1">
            <span>হাতের নগদ ক্যাশ</span>
            <Wallet className="w-3.5 h-3.5 text-amber-700" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-amber-950 tabular-nums">
            {formatTaka(cashInHand)}
          </div>
          <div className="text-[11px] text-amber-800/80 mt-1">
            ড্রয়ারে উপস্থিত থাকা ক্যাশ
          </div>
        </div>
      </div>

      {/* 2-Partner Profit Split Notice */}
      <div className="mt-3.5 pt-3 border-t border-stone-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-stone-600">
        <div className="flex items-center gap-2">
          <ArrowRightLeft className="w-3.5 h-3.5 text-stone-400" />
          <span className="font-medium text-stone-700">আজকের লাভ হিস্যা (২ পার্টনার):</span>
          <span>
            {partner1Name.split(' ')[0]} ({partner1Share}%): <strong className="text-stone-900 tabular-nums">{formatTaka(p1Profit)}</strong>
          </span>
          <span aria-hidden="true" className="text-stone-300">·</span>
          <span>
            {partner2Name.split(' ')[0]} ({partner2Share}%): <strong className="text-stone-900 tabular-nums">{formatTaka(p2Profit)}</strong>
          </span>
        </div>
        <span className="text-[11px] text-stone-400">
          দিন শেষে লাভের ৫০/৫০ বণ্টন খতিয়ানে জমা হয়
        </span>
      </div>
    </div>
  );
};
