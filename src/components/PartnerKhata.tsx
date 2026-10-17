import React, { useState } from 'react';
import {
  Users,
  PieChart,
  UserCheck,
  TrendingUp,
  Wallet,
  ArrowRightLeft,
  PlusCircle,
  Edit2,
  Check,
} from 'lucide-react';
import { Partner, Transaction } from '../types';
import { formatTaka } from '../utils/formatters';

interface PartnerKhataProps {
  partners: Partner[];
  onUpdatePartners: (updated: Partner[]) => void;
  transactions: Transaction[];
  onAddTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => void;
  selectedDate: string;
}

export const PartnerKhata: React.FC<PartnerKhataProps> = ({
  partners,
  onUpdatePartners,
  transactions,
  onAddTransaction,
  selectedDate,
}) => {
  const [showWithdrawModal, setShowWithdrawModal] = useState<boolean>(false);
  const [withdrawPartnerId, setWithdrawPartnerId] = useState<'p1' | 'p2'>('p1');
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [withdrawNote, setWithdrawNote] = useState<string>('');

  const [showEditSettings, setShowEditSettings] = useState<boolean>(false);
  const [p1Name, setP1Name] = useState<string>(partners[0]?.name || 'পার্টনার ১');
  const [p1Share, setP1Share] = useState<string>(String(partners[0]?.sharePercent || 50));
  const [p1Capital, setP1Capital] = useState<string>(String(partners[0]?.initialCapital || 30000));
  const [p2Name, setP2Name] = useState<string>(partners[1]?.name || 'পার্টনার ২');
  const [p2Share, setP2Share] = useState<string>(String(partners[1]?.sharePercent || 50));
  const [p2Capital, setP2Capital] = useState<string>(String(partners[1]?.initialCapital || 30000));

  // Compute Total Business Net Profit across all recorded transactions
  const totalSales = transactions
    .filter((t) => t.type === 'tea_sale')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalCommissions = transactions.reduce(
    (sum, t) => sum + (t.commission || 0),
    0
  );

  const totalExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalNetProfit = totalSales + totalCommissions - totalExpenses;

  // Partner 1 & 2 details
  const p1 = partners[0] || { id: 'p1', name: 'পার্টনার ১', phone: '', sharePercent: 50, initialCapital: 30000, totalWithdrawn: 0 };
  const p2 = partners[1] || { id: 'p2', name: 'পার্টনার ২', phone: '', sharePercent: 50, initialCapital: 30000, totalWithdrawn: 0 };

  // Calculate actual total withdrawn from transactions for 100% accuracy
  const p1ActualWithdrawn = transactions
    .filter((t) => t.type === 'partner_withdraw' && t.partnerId === 'p1')
    .reduce((sum, t) => sum + t.amount, 0) + (p1.totalWithdrawn || 0);

  const p2ActualWithdrawn = transactions
    .filter((t) => t.type === 'partner_withdraw' && t.partnerId === 'p2')
    .reduce((sum, t) => sum + t.amount, 0) + (p2.totalWithdrawn || 0);

  const p1ProfitShare = Math.round((totalNetProfit * (p1.sharePercent / 100)) * 100) / 100;
  const p2ProfitShare = Math.round((totalNetProfit * (p2.sharePercent / 100)) * 100) / 100;

  // Remaining profit balance = Profit Share - Total Withdrawn
  const p1Balance = p1ProfitShare - p1ActualWithdrawn;
  const p2Balance = p2ProfitShare - p2ActualWithdrawn;

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(withdrawAmount);
    if (!amt || amt <= 0) return;

    const partner = partners.find((p) => p.id === withdrawPartnerId) || partners[0];

    onAddTransaction({
      date: selectedDate,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'partner_withdraw',
      title: `${partner.name.split(' ')[0]} - ব্যক্তিগত হাতখরচ উত্তোলন`,
      amount: amt,
      cashInHandChange: -amt, // Drawer cash decreases
      partnerId: withdrawPartnerId,
      note: withdrawNote || 'ব্যক্তিগত প্রয়োজনে ক্যাশ ড্রয়ার থেকে উত্তোলন',
    });

    // Update partner state
    const updated = partners.map((p) => {
      if (p.id === withdrawPartnerId) {
        return { ...p, totalWithdrawn: (p.totalWithdrawn || 0) + amt };
      }
      return p;
    });
    onUpdatePartners(updated);

    setShowWithdrawModal(false);
    setWithdrawAmount('');
    setWithdrawNote('');
  };

  const handleSavePartnerSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const share1 = parseFloat(p1Share) || 50;
    const share2 = 100 - share1;

    const updated: Partner[] = [
      {
        ...p1,
        name: p1Name.trim(),
        sharePercent: share1,
        initialCapital: parseFloat(p1Capital) || 0,
      },
      {
        ...p2,
        name: p2Name.trim(),
        sharePercent: share2,
        initialCapital: parseFloat(p2Capital) || 0,
      },
    ];

    onUpdatePartners(updated);
    setShowEditSettings(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Partnership Overview */}
      <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs text-stone-500 font-medium mb-1">
            দোকানের মোট অর্জিত সর্বমোট নিট লাভ (সব দিন মিলিয়ে)
          </div>
          <div className="text-3xl font-bold text-stone-900 tabular-nums">
            {formatTaka(totalNetProfit)}
          </div>
          <div className="text-xs text-stone-500 mt-1 flex items-center gap-2">
            <span>মোট বিক্রি: {formatTaka(totalSales)}</span>
            <span>·</span>
            <span>মোট কমিশন: {formatTaka(totalCommissions)}</span>
            <span>·</span>
            <span>মোট খরচ: {formatTaka(totalExpenses)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          <button
            onClick={() => setShowEditSettings(true)}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors whitespace-nowrap"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>পার্টনার শেয়ার পরিবর্তন</span>
          </button>
          <button
            onClick={() => setShowWithdrawModal(true)}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-xs transition-colors whitespace-nowrap"
          >
            <PlusCircle className="w-4 h-4" />
            <span>পার্টনার উত্তোলন যোগ</span>
          </button>
        </div>
      </div>

      {/* 2 Partners Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Partner 1 Card */}
        <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-sm">
                ১
              </div>
              <div>
                <h3 className="font-bold text-stone-900 text-base">{p1.name}</h3>
                <p className="text-xs text-stone-500 font-medium">
                  অংশীদারিত্ব (শেয়ার): <strong className="text-amber-800">{p1.sharePercent}%</strong>
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold text-stone-600 bg-stone-100 px-2.5 py-1 rounded-md">
              মূলধন: {formatTaka(p1.initialCapital)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-stone-50 p-3 rounded-lg border border-stone-100">
              <span className="text-stone-500 block mb-1">অর্জিত মোট লাভ হিস্যা</span>
              <span className="text-lg font-bold text-emerald-700 tabular-nums">
                {formatTaka(p1ProfitShare)}
              </span>
              <span className="text-[10px] text-stone-400 block mt-0.5">
                মোট লাভের {p1.sharePercent}%
              </span>
            </div>

            <div className="bg-stone-50 p-3 rounded-lg border border-stone-100">
              <span className="text-stone-500 block mb-1">ব্যক্তিগত মোট উত্তোলন</span>
              <span className="text-lg font-bold text-rose-700 tabular-nums">
                {formatTaka(p1ActualWithdrawn)}
              </span>
              <span className="text-[10px] text-stone-400 block mt-0.5">
                ক্যাশ থেকে তুলে নিয়েছেন
              </span>
            </div>
          </div>

          <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-700">
              বর্তমান অবণ্টিত পাওনা / জমা লাভ:
            </span>
            <div className="text-right">
              <span className={`text-xl font-bold tabular-nums ${p1Balance >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                {formatTaka(p1Balance)}
              </span>
              <span className="text-[10px] text-stone-400 block">
                {p1Balance >= 0 ? 'পার্টনার পাবেন' : 'পার্টনার বেশি তুলেছেন'}
              </span>
            </div>
          </div>
        </div>

        {/* Partner 2 Card */}
        <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-900 flex items-center justify-center font-bold text-sm">
                ২
              </div>
              <div>
                <h3 className="font-bold text-stone-900 text-base">{p2.name}</h3>
                <p className="text-xs text-stone-500 font-medium">
                  অংশীদারিত্ব (শেয়ার): <strong className="text-blue-800">{p2.sharePercent}%</strong>
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold text-stone-600 bg-stone-100 px-2.5 py-1 rounded-md">
              মূলধন: {formatTaka(p2.initialCapital)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-stone-50 p-3 rounded-lg border border-stone-100">
              <span className="text-stone-500 block mb-1">অর্জিত মোট লাভ হিস্যা</span>
              <span className="text-lg font-bold text-emerald-700 tabular-nums">
                {formatTaka(p2ProfitShare)}
              </span>
              <span className="text-[10px] text-stone-400 block mt-0.5">
                মোট লাভের {p2.sharePercent}%
              </span>
            </div>

            <div className="bg-stone-50 p-3 rounded-lg border border-stone-100">
              <span className="text-stone-500 block mb-1">ব্যক্তিগত মোট উত্তোলন</span>
              <span className="text-lg font-bold text-rose-700 tabular-nums">
                {formatTaka(p2ActualWithdrawn)}
              </span>
              <span className="text-[10px] text-stone-400 block mt-0.5">
                ক্যাশ থেকে তুলে নিয়েছেন
              </span>
            </div>
          </div>

          <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-700">
              বর্তমান অবণ্টিত পাওনা / জমা লাভ:
            </span>
            <div className="text-right">
              <span className={`text-xl font-bold tabular-nums ${p2Balance >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                {formatTaka(p2Balance)}
              </span>
              <span className="text-[10px] text-stone-400 block">
                {p2Balance >= 0 ? 'পার্টনার পাবেন' : 'পার্টনার বেশি তুলেছেন'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Partner Withdrawals Log */}
      <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs space-y-3">
        <h4 className="font-bold text-stone-900 text-sm">
          পার্টনারদের উত্তোলনের ইতিহাস (ড্রয়িং লগ)
        </h4>

        {transactions.filter((t) => t.type === 'partner_withdraw').length === 0 ? (
          <p className="text-xs text-stone-400 py-4 text-center">
            এখন পর্যন্ত কোনো পার্টনার ক্যাশ থেকে টাকা তোলেননি।
          </p>
        ) : (
          <div className="divide-y divide-stone-100 text-xs">
            {transactions
              .filter((t) => t.type === 'partner_withdraw')
              .map((t) => (
                <div key={t.id} className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-stone-400">{t.date} · {t.time}</span>
                    <span className="font-bold text-stone-900">{t.title}</span>
                    {t.note && <span className="text-stone-500">({t.note})</span>}
                  </div>
                  <span className="font-bold text-rose-700 tabular-nums">
                    -{formatTaka(t.amount)}
                  </span>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-stone-200 w-full max-w-md p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-bold text-stone-900 text-base">
                পার্টনারের ব্যক্তিগত উত্তোলন এন্ট্রি
              </h3>
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="text-stone-400 hover:text-stone-700 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleWithdrawSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  কোন অংশীদার ক্যাশ ড্রয়ার থেকে টাকা নিচ্ছেন?
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setWithdrawPartnerId('p1')}
                    className={`p-2.5 rounded-lg border text-left font-bold ${
                      withdrawPartnerId === 'p1'
                        ? 'border-amber-600 bg-amber-50 text-amber-900'
                        : 'border-stone-200 bg-stone-50 text-stone-700'
                    }`}
                  >
                    <div>{p1.name}</div>
                    <div className="text-[10px] text-stone-500 font-normal">শেয়ার: {p1.sharePercent}%</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setWithdrawPartnerId('p2')}
                    className={`p-2.5 rounded-lg border text-left font-bold ${
                      withdrawPartnerId === 'p2'
                        ? 'border-amber-600 bg-amber-50 text-amber-900'
                        : 'border-stone-200 bg-stone-50 text-stone-700'
                    }`}
                  >
                    <div>{p2.name}</div>
                    <div className="text-[10px] text-stone-500 font-normal">শেয়ার: {p2.sharePercent}%</div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  টাকার পরিমাণ (৳) *
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 text-base font-bold bg-stone-50 border border-stone-300 rounded-lg tabular-nums"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  উত্তোলনের কারণ / মন্তব্য
                </label>
                <input
                  type="text"
                  value={withdrawNote}
                  onChange={(e) => setWithdrawNote(e.target.value)}
                  placeholder="যেমন: দুপুরের হাতখরচ, পারিবারিক বাজার"
                  className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-lg"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowWithdrawModal(false)}
                  className="px-3 py-1.5 text-xs text-stone-600"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg"
                >
                  উত্তোলন সেভ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Partner Details Modal */}
      {showEditSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-stone-200 w-full max-w-lg p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-bold text-stone-900 text-base">
                ২ পার্টনারের নাম ও শেয়ার সেটিংস
              </h3>
              <button
                onClick={() => setShowEditSettings(false)}
                className="text-stone-400 hover:text-stone-700 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePartnerSettings} className="space-y-4">
              {/* Partner 1 Fields */}
              <div className="p-3.5 bg-stone-50 rounded-lg border border-stone-200 space-y-2">
                <h4 className="text-xs font-bold text-stone-900">পার্টনার ১ তথ্য</h4>
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <label className="block text-[11px] text-stone-600 mb-0.5">নাম</label>
                    <input
                      type="text"
                      value={p1Name}
                      onChange={(e) => setP1Name(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-stone-300 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-stone-600 mb-0.5">শেয়ার (%)</label>
                    <input
                      type="number"
                      value={p1Share}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        setP1Share(e.target.value);
                        setP2Share(String(100 - val));
                      }}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-stone-300 rounded tabular-nums font-bold"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] text-stone-600 mb-0.5">প্রাথমিক মূলধন (৳)</label>
                  <input
                    type="number"
                    value={p1Capital}
                    onChange={(e) => setP1Capital(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-stone-300 rounded tabular-nums"
                  />
                </div>
              </div>

              {/* Partner 2 Fields */}
              <div className="p-3.5 bg-stone-50 rounded-lg border border-stone-200 space-y-2">
                <h4 className="text-xs font-bold text-stone-900">পার্টনার ২ তথ্য</h4>
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <label className="block text-[11px] text-stone-600 mb-0.5">নাম</label>
                    <input
                      type="text"
                      value={p2Name}
                      onChange={(e) => setP2Name(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-stone-300 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-stone-600 mb-0.5">শেয়ার (%)</label>
                    <input
                      type="number"
                      value={p2Share}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        setP2Share(e.target.value);
                        setP1Share(String(100 - val));
                      }}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-stone-300 rounded tabular-nums font-bold"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] text-stone-600 mb-0.5">প্রাথমিক মূলধন (৳)</label>
                  <input
                    type="number"
                    value={p2Capital}
                    onChange={(e) => setP2Capital(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-stone-300 rounded tabular-nums"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowEditSettings(false)}
                  className="px-3 py-1.5 text-xs text-stone-600"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg"
                >
                  পরিবর্তন সেভ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
