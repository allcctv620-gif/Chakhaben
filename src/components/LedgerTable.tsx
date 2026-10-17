import React, { useState } from 'react';
import {
  Search,
  Trash2,
  Coffee,
  ShoppingBag,
  ArrowDownLeft,
  ArrowUpRight,
  Radio,
  Users,
  UserCheck,
  PlusCircle,
} from 'lucide-react';
import { Transaction, TransactionType } from '../types';
import { formatTaka } from '../utils/formatters';

interface LedgerTableProps {
  transactions: Transaction[];
  onDeleteTransaction: (id: string) => void;
  onOpenNewEntry: () => void;
  selectedDate: string;
}

export const LedgerTable: React.FC<LedgerTableProps> = ({
  transactions,
  onDeleteTransaction,
  onOpenNewEntry,
  selectedDate,
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredTransactions = transactions.filter((t) => {
    // Filter by type
    if (filterType === 'sale' && t.type !== 'tea_sale') return false;
    if (filterType === 'expense' && t.type !== 'expense') return false;
    if (filterType === 'mfs' && !['mfs_cashout', 'mfs_cashin'].includes(t.type)) return false;
    if (filterType === 'flexi' && t.type !== 'flexiload') return false;
    if (filterType === 'baki' && !['baki_given', 'baki_paid'].includes(t.type)) return false;
    if (filterType === 'partner' && t.type !== 'partner_withdraw') return false;

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(term);
      const matchNote = t.note?.toLowerCase().includes(term);
      const matchCustomer = t.customerName?.toLowerCase().includes(term);
      const matchProvider = t.simProvider?.toLowerCase().includes(term);
      if (!matchTitle && !matchNote && !matchCustomer && !matchProvider) return false;
    }
    return true;
  });

  const getTypeIcon = (type: TransactionType) => {
    switch (type) {
      case 'tea_sale':
        return <Coffee className="w-4 h-4 text-emerald-600" />;
      case 'expense':
        return <ShoppingBag className="w-4 h-4 text-rose-600" />;
      case 'mfs_cashout':
        return <ArrowDownLeft className="w-4 h-4 text-amber-600" />;
      case 'mfs_cashin':
        return <ArrowUpRight className="w-4 h-4 text-blue-600" />;
      case 'flexiload':
        return <Radio className="w-4 h-4 text-purple-600" />;
      case 'baki_given':
      case 'baki_paid':
        return <Users className="w-4 h-4 text-amber-700" />;
      case 'partner_withdraw':
        return <UserCheck className="w-4 h-4 text-stone-700" />;
      default:
        return <Coffee className="w-4 h-4 text-stone-500" />;
    }
  };

  const getTypeBadge = (t: Transaction) => {
    switch (t.type) {
      case 'tea_sale':
        return <span className="text-emerald-700 text-xs font-semibold">বিক্রি</span>;
      case 'expense':
        return <span className="text-rose-700 text-xs font-semibold">খরচ</span>;
      case 'mfs_cashout':
        return <span className="text-amber-700 text-xs font-semibold">ক্যাশ আউট</span>;
      case 'mfs_cashin':
        return <span className="text-blue-700 text-xs font-semibold">ক্যাশ ইন</span>;
      case 'flexiload':
        return <span className="text-purple-700 text-xs font-semibold">ফ্লেক্সিলোড</span>;
      case 'baki_given':
        return <span className="text-rose-600 text-xs font-semibold">বাকি দেওয়া</span>;
      case 'baki_paid':
        return <span className="text-emerald-600 text-xs font-semibold">বাকি আদায়</span>;
      case 'partner_withdraw':
        return <span className="text-stone-700 text-xs font-semibold">উত্তোলন</span>;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white border border-stone-200 rounded-xl shadow-xs overflow-hidden">
      {/* Header and Filter Controls */}
      <div className="p-4 border-b border-stone-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-lg overflow-x-auto text-xs font-medium">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-colors ${
              filterType === 'all'
                ? 'bg-white text-stone-900 font-bold shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            সব ({transactions.length})
          </button>
          <button
            onClick={() => setFilterType('sale')}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-colors ${
              filterType === 'sale'
                ? 'bg-white text-stone-900 font-bold shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            বিক্রি
          </button>
          <button
            onClick={() => setFilterType('expense')}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-colors ${
              filterType === 'expense'
                ? 'bg-white text-stone-900 font-bold shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            খরচ
          </button>
          <button
            onClick={() => setFilterType('mfs')}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-colors ${
              filterType === 'mfs'
                ? 'bg-white text-stone-900 font-bold shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            বিকাশ/নগদ
          </button>
          <button
            onClick={() => setFilterType('flexi')}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-colors ${
              filterType === 'flexi'
                ? 'bg-white text-stone-900 font-bold shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            ফ্লেক্সিলোড
          </button>
          <button
            onClick={() => setFilterType('baki')}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-colors ${
              filterType === 'baki'
                ? 'bg-white text-stone-900 font-bold shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            বাকি
          </button>
          <button
            onClick={() => setFilterType('partner')}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-colors ${
              filterType === 'partner'
                ? 'bg-white text-stone-900 font-bold shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            পার্টনার
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative min-w-[200px] sm:min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="বিবরণ বা কাস্টমার খুঁজুন..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* Transactions Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-stone-50/70 border-b border-stone-200 text-stone-500 font-semibold">
              <th className="py-2.5 px-4 w-20">সময়</th>
              <th className="py-2.5 px-4">বিবরণ ও বিবরণী</th>
              <th className="py-2.5 px-4">ধরণ</th>
              <th className="py-2.5 px-4 text-right">মূল লেনদেন</th>
              <th className="py-2.5 px-4 text-right">ক্যাশ প্রভাব</th>
              <th className="py-2.5 px-4 text-right">লাভ / কমিশন</th>
              <th className="py-2.5 px-4 text-center w-16">মুছুন</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-stone-400">
                  <div className="max-w-xs mx-auto space-y-2">
                    <p className="font-medium text-stone-600">কোনো হিসাব পাওয়া যায়নি</p>
                    <p className="text-[11px] text-stone-400">
                      এই ফিল্টারে বা তারিখে কোনো এন্ট্রি নেই। নতুন এন্ট্রি করতে নিচে ক্লিক করুন।
                    </p>
                    <button
                      onClick={onOpenNewEntry}
                      className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-md transition-colors"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>নতুন হিসাব যোগ করুন</span>
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              filteredTransactions.map((t) => (
                <tr key={t.id} className="hover:bg-stone-50/70 transition-colors">
                  {/* Time */}
                  <td className="py-3 px-4 font-mono text-stone-500 whitespace-nowrap">
                    {t.time}
                  </td>

                  {/* Title & Details */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded-md bg-stone-100 shrink-0">
                        {getTypeIcon(t.type)}
                      </div>
                      <div>
                        <div className="font-semibold text-stone-900 leading-snug">
                          {t.title}
                        </div>
                        {t.note && (
                          <div className="text-[11px] text-stone-500 mt-0.5 line-clamp-1">
                            {t.note}
                          </div>
                        )}
                        {t.operator && (
                          <div className="text-[11px] text-purple-700 font-medium">
                            অপারেটর: {t.operator}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Type Badge */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    {getTypeBadge(t)}
                  </td>

                  {/* Face Amount */}
                  <td className="py-3 px-4 text-right font-bold text-stone-900 tabular-nums whitespace-nowrap">
                    {formatTaka(t.amount)}
                  </td>

                  {/* Cash in Hand Impact */}
                  <td className="py-3 px-4 text-right font-bold tabular-nums whitespace-nowrap">
                    {t.cashInHandChange > 0 ? (
                      <span className="text-emerald-700">+{formatTaka(t.cashInHandChange)}</span>
                    ) : t.cashInHandChange < 0 ? (
                      <span className="text-rose-700">-{formatTaka(Math.abs(t.cashInHandChange))}</span>
                    ) : (
                      <span className="text-stone-400">৳ ০ (বাকি)</span>
                    )}
                  </td>

                  {/* Commission */}
                  <td className="py-3 px-4 text-right font-bold tabular-nums whitespace-nowrap">
                    {t.commission ? (
                      <span className="text-amber-700 font-semibold">+{formatTaka(t.commission)}</span>
                    ) : (
                      <span className="text-stone-300">-</span>
                    )}
                  </td>

                  {/* Action */}
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => {
                        if (confirm(`'${t.title}' এন্ট্রিটি মুছে ফেলতে চান?`)) {
                          onDeleteTransaction(t.id);
                        }
                      }}
                      title="মুছে ফেলুন"
                      className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer with Counts */}
      {filteredTransactions.length > 0 && (
        <div className="p-3 bg-stone-50/60 border-t border-stone-200 text-xs text-stone-500 flex items-center justify-between">
          <span>মোট লেনদেন সংখ্যা: <strong className="text-stone-800 tabular-nums">{filteredTransactions.length}টি</strong></span>
          <span className="text-[11px] text-stone-400">প্রতিটি হিসাব স্বয়ংক্রিয়ভাবে সেভ করা থাকে</span>
        </div>
      )}
    </div>
  );
};
