import React, { useState } from 'react';
import {
  X,
  Coins,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Calculator,
} from 'lucide-react';
import { DailyClosing, NoteCounter } from '../types';
import { formatTaka } from '../utils/formatters';

interface DailyClosingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string;
  openingCash: number;
  expectedClosingCash: number;
  salesTotal: number;
  expenseTotal: number;
  commissionTotal: number;
  netProfit: number;
  bakiCollected: number;
  bakiGiven: number;
  partnerWithdrawn: number;
  onSaveClosing: (closing: DailyClosing) => void;
}

export const DailyClosingModal: React.FC<DailyClosingModalProps> = ({
  isOpen,
  onClose,
  selectedDate,
  openingCash,
  expectedClosingCash,
  salesTotal,
  expenseTotal,
  commissionTotal,
  netProfit,
  bakiCollected,
  bakiGiven,
  partnerWithdrawn,
  onSaveClosing,
}) => {
  const [notes, setNotes] = useState<NoteCounter>({
    note1000: 0,
    note500: 0,
    note200: 0,
    note100: 0,
    note50: 0,
    note20: 0,
    note10: 0,
    note5: 0,
    coins: 0,
  });

  const [closingNotes, setClosingNotes] = useState<string>('');

  if (!isOpen) return null;

  const countedTotal =
    notes.note1000 * 1000 +
    notes.note500 * 500 +
    notes.note200 * 200 +
    notes.note100 * 100 +
    notes.note50 * 50 +
    notes.note20 * 20 +
    notes.note10 * 10 +
    notes.note5 * 5 +
    notes.coins;

  const difference = countedTotal - expectedClosingCash;

  const handleNoteChange = (key: keyof NoteCounter, value: string) => {
    const parsed = parseInt(value, 10);
    setNotes((prev) => ({
      ...prev,
      [key]: isNaN(parsed) || parsed < 0 ? 0 : parsed,
    }));
  };

  const handleSave = () => {
    const closing: DailyClosing = {
      date: selectedDate,
      openingCash,
      salesTotal,
      expenseTotal,
      mfsCommissionTotal: commissionTotal,
      netProfit,
      bakiCollected,
      bakiGiven,
      partnerWithdrawn,
      expectedClosingCash,
      actualCountedCash: countedTotal,
      difference,
      isClosed: true,
      notes: closingNotes,
      closedAt: new Date().toLocaleTimeString(),
    };
    onSaveClosing(closing);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl border border-stone-200 w-full max-w-2xl my-8 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200 bg-stone-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-100 text-amber-800 rounded-lg">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-stone-900">
                দিনের ক্যাশ গণনা ও ক্লোজিং মেলানো
              </h2>
              <p className="text-xs text-stone-500">
                ড্রয়ারের নগদ টাকা গুনে হিসাবের সাথে মিলিয়ে নিন
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Summary Reconciliation Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-stone-50 rounded-lg border border-stone-200">
              <span className="text-[11px] text-stone-500 block">হিসাব অনুযায়ী প্রত্যাশিত ক্যাশ</span>
              <span className="text-lg font-bold text-stone-900 tabular-nums">
                {formatTaka(expectedClosingCash)}
              </span>
            </div>

            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
              <span className="text-[11px] text-amber-800 block">হাতে গুনে পাওয়া ক্যাশ</span>
              <span className="text-lg font-bold text-amber-950 tabular-nums">
                {formatTaka(countedTotal)}
              </span>
            </div>

            <div className={`p-3 rounded-lg border ${
              difference === 0
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : difference > 0
                ? 'bg-blue-50 border-blue-200 text-blue-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}>
              <span className="text-[11px] block">ক্যাশ পার্থক্য (ঘাটতি/বাড়তি)</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                {difference === 0 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span className="text-lg font-bold tabular-nums">
                  {difference === 0 ? 'হিসাব মিলেছে!' : formatTaka(Math.abs(difference))}
                </span>
              </div>
            </div>
          </div>

          {/* Physical Cash Note Counter */}
          <div>
            <h3 className="text-xs font-bold text-stone-700 mb-2 flex items-center gap-1">
              <Coins className="w-3.5 h-3.5 text-amber-600" />
              <span>নোটের সংখ্যা লিখুন (স্বয়ংক্রিয় গুণ হবে)</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
              {[
                { key: 'note1000' as const, noteVal: 1000, label: '১,০০০ টাকার নোট' },
                { key: 'note500' as const, noteVal: 500, label: '৫০০ টাকার নোট' },
                { key: 'note200' as const, noteVal: 200, label: '২০০ টাকার নোট' },
                { key: 'note100' as const, noteVal: 100, label: '১০০ টাকার নোট' },
                { key: 'note50' as const, noteVal: 50, label: '৫০ টাকার নোট' },
                { key: 'note20' as const, noteVal: 20, label: '২০ টাকার নোট' },
                { key: 'note10' as const, noteVal: 10, label: '১০ টাকার নোট' },
                { key: 'note5' as const, noteVal: 5, label: '৫ টাকার নোট' },
              ].map((item) => {
                const subtotal = (notes[item.key] || 0) * item.noteVal;
                return (
                  <div key={item.key} className="p-2 bg-stone-50 rounded-lg border border-stone-200">
                    <div className="flex items-center justify-between text-stone-600 mb-1">
                      <span>{item.label}</span>
                      <span className="font-bold text-stone-900 tabular-nums">
                        ৳ {subtotal}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="0"
                        value={notes[item.key] || ''}
                        onChange={(e) => handleNoteChange(item.key, e.target.value)}
                        placeholder="সংখ্যা (টি)"
                        className="w-full px-2 py-1 text-xs bg-white border border-stone-300 rounded text-center font-bold tabular-nums"
                      />
                      <span className="text-[11px] text-stone-400">টি</span>
                    </div>
                  </div>
                );
              })}

              {/* Coins Input */}
              <div className="p-2 bg-stone-50 rounded-lg border border-stone-200">
                <div className="flex items-center justify-between text-stone-600 mb-1">
                  <span>খুচরা পয়সা ও কয়েন</span>
                  <span className="font-bold text-stone-900 tabular-nums">
                    ৳ {notes.coins || 0}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={notes.coins || ''}
                    onChange={(e) => handleNoteChange('coins', e.target.value)}
                    placeholder="মোট টাকা"
                    className="w-full px-2 py-1 text-xs bg-white border border-stone-300 rounded text-center font-bold tabular-nums"
                  />
                  <span className="text-[11px] text-stone-400">৳</span>
                </div>
              </div>
            </div>
          </div>

          {/* Closing Notes */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              ক্লোজিং মন্তব্য বা পার্টনার নোট (ঐচ্ছিক)
            </label>
            <input
              type="text"
              value={closingNotes}
              onChange={(e) => setClosingNotes(e.target.value)}
              placeholder="যেমন: আজকের হিসাব ২ পার্টনার মিলে বুঝে নিলাম"
              className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-lg"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900"
            >
              বন্ধ করুন
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-xs transition-colors"
            >
              <FileCheck className="w-4 h-4" />
              <span>দিনের ক্লোজিং সম্পন্ন ও সেভ করুন</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
