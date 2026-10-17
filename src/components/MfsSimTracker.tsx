import React, { useState } from 'react';
import {
  Smartphone,
  Wallet,
  ArrowRightLeft,
  CheckCircle,
  Radio,
  PlusCircle,
  RefreshCw,
  Coins,
} from 'lucide-react';
import { MfsProvider, SimBalances, Transaction } from '../types';
import { formatTaka } from '../utils/formatters';

interface MfsSimTrackerProps {
  balances: SimBalances;
  onUpdateBalances: (newBalances: SimBalances) => void;
  onAddTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => void;
  selectedDate: string;
  cashInHand: number;
}

export const MfsSimTracker: React.FC<MfsSimTrackerProps> = ({
  balances,
  onUpdateBalances,
  onAddTransaction,
  selectedDate,
  cashInHand,
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [bkash, setBkash] = useState<string>(String(balances.bkashAgent));
  const [nagad, setNagad] = useState<string>(String(balances.nagadAgent));
  const [rocket, setRocket] = useState<string>(String(balances.rocketAgent));
  const [flexi, setFlexi] = useState<string>(String(balances.flexiload));

  // DSO Top-up modal state (buying balance from agent DSO with cash)
  const [showDsoModal, setShowDsoModal] = useState<boolean>(false);
  const [dsoProvider, setDsoProvider] = useState<MfsProvider>('bkash');
  const [dsoAmount, setDsoAmount] = useState<string>('');

  const totalCapital =
    cashInHand +
    balances.bkashAgent +
    balances.nagadAgent +
    balances.rocketAgent +
    balances.flexiload;

  const handleSaveManualBalances = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: SimBalances = {
      bkashAgent: parseFloat(bkash) || 0,
      nagadAgent: parseFloat(nagad) || 0,
      rocketAgent: parseFloat(rocket) || 0,
      flexiload: parseFloat(flexi) || 0,
      cashInHand: cashInHand,
      lastUpdated: new Date().toISOString(),
    };
    onUpdateBalances(updated);
    setIsEditing(false);
  };

  const handleDsoTopup = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(dsoAmount);
    if (!amt || amt <= 0) return;

    // DSO top-up means shopkeeper paid physical cash to company DSO and got SIM electronic balance
    let providerName = 'বিকাশ';
    if (dsoProvider === 'nagad') providerName = 'নগদ';
    if (dsoProvider === 'rocket') providerName = 'রকেট';
    if (dsoProvider === 'flexiload') providerName = 'ফ্লেক্সিলোড';

    onAddTransaction({
      date: selectedDate,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'capital_add',
      title: `${providerName} ডিএসও (DSO) থেকে ব্যালেন্স ক্রয়`,
      amount: amt,
      cashInHandChange: -amt, // Physical cash handed to DSO
      simBalanceChange: amt,  // E-money entered into SIM
      simProvider: dsoProvider,
      note: `ডিএসও থেকে ${formatTaka(amt)} ব্যালেন্স রিফিল`,
    });

    // Update the corresponding SIM balance
    const updated = { ...balances };
    if (dsoProvider === 'bkash') updated.bkashAgent += amt;
    else if (dsoProvider === 'nagad') updated.nagadAgent += amt;
    else if (dsoProvider === 'rocket') updated.rocketAgent += amt;
    else if (dsoProvider === 'flexiload') updated.flexiload += amt;
    onUpdateBalances(updated);

    setShowDsoModal(false);
    setDsoAmount('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Total Working Capital */}
      <div className="bg-gradient-to-r from-stone-900 to-stone-800 text-white rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs text-stone-300 font-medium mb-1">
              দোকানের সর্বমোট কার্যকরী মূলধন (ক্যাশ + সব সিমের ব্যালেন্স)
            </div>
            <div className="text-3xl sm:text-4xl font-bold tracking-tight text-white tabular-nums">
              {formatTaka(totalCapital)}
            </div>
            <div className="text-xs text-stone-300 mt-2 flex items-center gap-2">
              <span>নগদ ক্যাশ: <strong className="text-amber-400">{formatTaka(cashInHand)}</strong></span>
              <span>·</span>
              <span>মোট সিম ব্যালেন্স: <strong className="text-emerald-400">{formatTaka(totalCapital - cashInHand)}</strong></span>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto">
            <button
              onClick={() => setShowDsoModal(true)}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-stone-900 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors whitespace-nowrap"
            >
              <Coins className="w-4 h-4" />
              <span>DSO থেকে ব্যালেন্স কিনুন</span>
            </button>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-stone-200 bg-stone-700/80 hover:bg-stone-700 rounded-lg transition-colors whitespace-nowrap"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{isEditing ? 'বাতিল' : 'ব্যালেন্স আপডেট'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Manual SIM Balances Edit Form */}
      {isEditing && (
        <form
          onSubmit={handleSaveManualBalances}
          className="bg-amber-50/70 border border-amber-300 rounded-xl p-4 sm:p-5 shadow-xs space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-amber-950">
              এজেন্ট সিমের বর্তমান ব্যালেন্স সংশোধন করুন (SMS অনুযায়ী)
            </h3>
            <span className="text-xs text-stone-500">
              সরাসরি সিম চেক করে নতুন ব্যালেন্স লিখুন
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                বিকাশ এজেন্ট ব্যালেন্স (৳)
              </label>
              <input
                type="number"
                step="any"
                value={bkash}
                onChange={(e) => setBkash(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-lg tabular-nums font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                নগদ এজেন্ট ব্যালেন্স (৳)
              </label>
              <input
                type="number"
                step="any"
                value={nagad}
                onChange={(e) => setNagad(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-lg tabular-nums font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                রকেট এজেন্ট ব্যালেন্স (৳)
              </label>
              <input
                type="number"
                step="any"
                value={rocket}
                onChange={(e) => setRocket(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-lg tabular-nums font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                ফ্লেক্সিলোড ব্যালেন্স (৳)
              </label>
              <input
                type="number"
                step="any"
                value={flexi}
                onChange={(e) => setFlexi(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-lg tabular-nums font-bold"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-amber-200">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-3 py-1.5 text-xs font-medium text-stone-600 hover:text-stone-900"
            >
              বাতিল
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-bold text-white bg-amber-700 hover:bg-amber-800 rounded-md shadow-xs"
            >
              সেভ করুন
            </button>
          </div>
        </form>
      )}

      {/* Grid of Balances */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: bKash */}
        <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-pink-50 text-pink-700 flex items-center justify-center font-bold text-xs">
                বিকাশ
              </div>
              <div>
                <h4 className="text-sm font-bold text-stone-900">বিকাশ এজেন্ট</h4>
                <p className="text-[11px] text-stone-400">bKash Agent SIM</p>
              </div>
            </div>
            <span className="text-[11px] text-pink-700 font-semibold bg-pink-50 px-2 py-0.5 rounded">
              ১৬২৪৭
            </span>
          </div>
          <div className="text-2xl font-bold text-stone-900 tabular-nums">
            {formatTaka(balances.bkashAgent)}
          </div>
          <div className="text-[11px] text-stone-500 mt-2">
            ক্যাশ আউট হলে বাড়বে, ক্যাশ ইন হলে কমবে
          </div>
        </div>

        {/* Card 2: Nagad */}
        <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-xs">
                নগদ
              </div>
              <div>
                <h4 className="text-sm font-bold text-stone-900">নগদ এজেন্ট</h4>
                <p className="text-[11px] text-stone-400">Nagad Uddokta SIM</p>
              </div>
            </div>
            <span className="text-[11px] text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded">
              ১৬১৬৭
            </span>
          </div>
          <div className="text-2xl font-bold text-stone-900 tabular-nums">
            {formatTaka(balances.nagadAgent)}
          </div>
          <div className="text-[11px] text-stone-500 mt-2">
            উদ্যোক্তা একাউন্ট ব্যালেন্স
          </div>
        </div>

        {/* Card 3: Rocket */}
        <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-purple-50 text-purple-700 flex items-center justify-center font-bold text-xs">
                রকেট
              </div>
              <div>
                <h4 className="text-sm font-bold text-stone-900">রকেট এজেন্ট</h4>
                <p className="text-[11px] text-stone-400">DBBL Rocket / Upay</p>
              </div>
            </div>
            <span className="text-[11px] text-purple-700 font-semibold bg-purple-50 px-2 py-0.5 rounded">
              ১৬২১৬
            </span>
          </div>
          <div className="text-2xl font-bold text-stone-900 tabular-nums">
            {formatTaka(balances.rocketAgent)}
          </div>
          <div className="text-[11px] text-stone-500 mt-2">
            ডাচ-বাংলা রকেট এজেন্ট ব্যালেন্স
          </div>
        </div>

        {/* Card 4: Flexiload */}
        <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs">
                ফ্লেক্সি
              </div>
              <div>
                <h4 className="text-sm font-bold text-stone-900">ফ্লেক্সিলোড সিম</h4>
                <p className="text-[11px] text-stone-400">GP/BL/Robi/Airtel</p>
              </div>
            </div>
            <span className="text-[11px] text-blue-700 font-semibold bg-blue-50 px-2 py-0.5 rounded">
              রিচার্জ
            </span>
          </div>
          <div className="text-2xl font-bold text-stone-900 tabular-nums">
            {formatTaka(balances.flexiload)}
          </div>
          <div className="text-[11px] text-stone-500 mt-2">
            সব রিচার্জ সিমের মোট জমা
          </div>
        </div>
      </div>

      {/* Explanatory Guide Card for 2 Partners */}
      <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 text-xs text-stone-600 space-y-2">
        <h5 className="font-bold text-stone-900 text-sm flex items-center gap-1.5">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>মোবাইল ব্যাংকিং ও ক্যাশ সমন্বয় কীভাবে কাজ করে?</span>
        </h5>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          <p>
            <strong className="text-stone-800">১. ক্যাশ আউট (Cash Out):</strong> যখন কোনো গ্রাহক টাকা তুলতে আসেন, আপনি ক্যাশ ড্রয়ার থেকে নগদ টাকা দেন এবং আপনার বিকাশ বা নগদ সিমে ই-টাকা যুক্ত হয়। সাথে প্রতি হাজারে কমিশন আপনার লাভ হিসেবে জমা হয়।
          </p>
          <p>
            <strong className="text-stone-800">২. ক্যাশ ইন ও ফ্লেক্সিলোড:</strong> যখন কোনো গ্রাহক টাকা পাঠান বা রিচার্জ করেন, তিনি আপনাকে নগদ ক্যাশ দেন এবং সিম থেকে ইলেকট্রনিক টাকা কমে যায়।
          </p>
          <p>
            <strong className="text-stone-800">৩. মূলধন নিখুঁত থাকার সূত্র:</strong> হাতের নগদ টাকা + সব সিমের ব্যালেন্স যোগ করলে সবসময় আপনার দোকানের মোট চলতি মূলধনের সমান হতে হবে।
          </p>
          <p>
            <strong className="text-stone-800">৪. ডিএসও (DSO) থেকে কেনা:</strong> কোম্পানি প্রতিনিধি এলে নগদ ক্যাশ দিয়ে যখন সিমে ব্যালেন্স কিনবেন, তখন উপরে 'DSO থেকে ব্যালেন্স কিনুন' বাটনে এন্ট্রি দিন।
          </p>
        </div>
      </div>

      {/* DSO Purchase Modal */}
      {showDsoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-stone-200 w-full max-w-md p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-bold text-stone-900 text-base">
                DSO থেকে সিম ব্যালেন্স ক্রয়
              </h3>
              <button
                onClick={() => setShowDsoModal(false)}
                className="text-stone-400 hover:text-stone-700 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleDsoTopup} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  কোন সিমে ব্যালেন্স কিনলেন?
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { id: 'bkash', label: 'বিকাশ এজেন্ট' },
                    { id: 'nagad', label: 'নগদ এজেন্ট' },
                    { id: 'rocket', label: 'রকেট এজেন্ট' },
                    { id: 'flexiload', label: 'ফ্লেক্সিলোড' },
                  ].map((item) => (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => setDsoProvider(item.id as MfsProvider)}
                      className={`p-2 rounded-lg border text-center font-bold ${
                        dsoProvider === item.id
                          ? 'border-amber-600 bg-amber-50 text-amber-900'
                          : 'border-stone-200 bg-stone-50 text-stone-700'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  টাকার পরিমাণ (ডিএসও-কে দেওয়া নগদ ক্যাশ) *
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={dsoAmount}
                  onChange={(e) => setDsoAmount(e.target.value)}
                  placeholder="যেমন: 5000"
                  className="w-full px-3 py-2 text-base font-bold bg-stone-50 border border-stone-300 rounded-lg tabular-nums"
                />
                <p className="text-[11px] text-stone-400 mt-1">
                  * এই টাকা ক্যাশ ড্রয়ার থেকে মাইনাস হয়ে সংশ্লিষ্ট সিমের ব্যালেন্সে যোগ হবে।
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowDsoModal(false)}
                  className="px-3 py-1.5 text-xs text-stone-600"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg"
                >
                  ব্যালেন্স যোগ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
