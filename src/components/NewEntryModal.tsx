import React, { useState, useEffect } from 'react';
import {
  X,
  Coffee,
  ShoppingBag,
  Smartphone,
  ArrowDownLeft,
  ArrowUpRight,
  Radio,
  Users,
  UserCheck,
  Check,
} from 'lucide-react';
import {
  Customer,
  ExpenseCategory,
  MfsProvider,
  Partner,
  ShopSettings,
  TeaSaleCategory,
  Transaction,
  TransactionType,
} from '../types';
import { getCurrentTimeString, getTodayDateString, formatTaka } from '../utils/formatters';

interface NewEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => void;
  onAddOrUpdateCustomerDue: (name: string, phone: string, dueChange: number) => string;
  customers: Customer[];
  partners: Partner[];
  settings: ShopSettings;
  defaultTab?: 'tea_sale' | 'expense' | 'mfs_cashout' | 'mfs_cashin' | 'flexiload' | 'baki' | 'partner_withdraw';
  selectedDate: string;
}

export const NewEntryModal: React.FC<NewEntryModalProps> = ({
  isOpen,
  onClose,
  onAddTransaction,
  onAddOrUpdateCustomerDue,
  customers,
  partners,
  settings,
  defaultTab = 'tea_sale',
  selectedDate,
}) => {
  const [activeTab, setActiveTab] = useState<
    'tea_sale' | 'expense' | 'mfs_cashout' | 'mfs_cashin' | 'flexiload' | 'baki' | 'partner_withdraw'
  >(defaultTab);

  // Common fields
  const [amount, setAmount] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [time, setTime] = useState<string>(getCurrentTimeString());

  // Tea Sale fields
  const [teaCategory, setTeaCategory] = useState<TeaSaleCategory>('milk_tea');

  // Expense fields
  const [expenseCategory, setExpenseCategory] = useState<ExpenseCategory>('milk');
  const [expenseTitle, setExpenseTitle] = useState<string>('');

  // MFS fields
  const [mfsProvider, setMfsProvider] = useState<MfsProvider>('bkash');
  const [customCommission, setCustomCommission] = useState<string>('');

  // Flexiload fields
  const [flexiOperator, setFlexiOperator] = useState<string>('Grameenphone');
  const [customerPhone, setCustomerPhone] = useState<string>('');

  // Baki fields
  const [bakiType, setBakiType] = useState<'given' | 'paid'>('given');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [newCustomerName, setNewCustomerName] = useState<string>('');
  const [newCustomerPhone, setNewCustomerPhone] = useState<string>('');

  // Partner fields
  const [selectedPartnerId, setSelectedPartnerId] = useState<'p1' | 'p2'>('p1');

  useEffect(() => {
    if (isOpen) {
      setActiveTab(defaultTab);
      setTime(getCurrentTimeString());
      setAmount('');
      setNote('');
      setCustomCommission('');
      setExpenseTitle('');
    }
  }, [isOpen, defaultTab]);

  if (!isOpen) return null;

  // Auto-calculated commission for MFS Cash Out
  const numAmount = parseFloat(amount) || 0;
  const calculatedMfsCommission = (() => {
    if (customCommission !== '') return parseFloat(customCommission) || 0;
    if (mfsProvider === 'bkash') {
      return Math.round((numAmount * (settings.bkashCommissionRatePerThousand / 1000)) * 100) / 100;
    }
    if (mfsProvider === 'nagad') {
      return Math.round((numAmount * (settings.nagadCommissionRatePerThousand / 1000)) * 100) / 100;
    }
    if (mfsProvider === 'rocket') {
      return Math.round((numAmount * (settings.rocketCommissionRatePerThousand / 1000)) * 100) / 100;
    }
    return 0;
  })();

  // Auto-calculated commission for Flexiload
  const calculatedFlexiCommission = (() => {
    if (customCommission !== '') return parseFloat(customCommission) || 0;
    return Math.round((numAmount * (settings.flexiCommissionRatePercent / 100)) * 100) / 100;
  })();

  const handleQuickAddAmount = (addValue: number) => {
    const current = parseFloat(amount) || 0;
    setAmount(String(current + addValue));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (numAmount <= 0) return;

    if (activeTab === 'tea_sale') {
      const categoryNames: Record<TeaSaleCategory, string> = {
        milk_tea: 'দুধ চা বিক্রি',
        black_tea: 'রঙ চা / লেবু চা বিক্রি',
        coffee: 'কফি বিক্রি',
        bakery_snacks: 'বিস্কুট ও নাস্তা বিক্রি',
        cigarette: 'সিগারেট বিক্রি',
        cold_drinks: 'কোল্ড ড্রিংকস ও পানি',
        general_counter: 'কাউন্টার ক্যাশ সেল',
      };

      onAddTransaction({
        date: selectedDate,
        time,
        type: 'tea_sale',
        title: categoryNames[teaCategory],
        amount: numAmount,
        cashInHandChange: numAmount,
        category: teaCategory,
        note: note || undefined,
      });
    } else if (activeTab === 'expense') {
      const categoryTitles: Record<ExpenseCategory, string> = {
        milk: 'দুধ কেনা',
        sugar_tea: 'চিনি ও চা পাতা কেনা',
        cylinder_gas: 'গ্যাস সিলিন্ডার / জ্বালানী',
        bakery_biscuit: 'বিস্কুট ও বেকারি স্টক',
        cigarette_stock: 'সিগারেট স্টক কেনা',
        cups_plastic: 'কাপ ও পরিচ্ছন্নতা সামগ্রী',
        rent_bill: 'দোকান ভাড়া ও বিদ্যুৎ বিল',
        personal_snacks: 'নাস্তা ও টুকিটাকি খরচ',
        other_expense: 'অন্যান্য খরচ',
      };

      onAddTransaction({
        date: selectedDate,
        time,
        type: 'expense',
        title: expenseTitle || categoryTitles[expenseCategory],
        amount: numAmount,
        cashInHandChange: -numAmount,
        category: expenseCategory,
        note: note || undefined,
      });
    } else if (activeTab === 'mfs_cashout') {
      const providerLabel = mfsProvider === 'bkash' ? 'বিকাশ' : mfsProvider === 'nagad' ? 'নগদ' : 'রকেট';
      onAddTransaction({
        date: selectedDate,
        time,
        type: 'mfs_cashout',
        title: `${providerLabel} ক্যাশ আউট (কমিশন লাভ)`,
        amount: numAmount,
        commission: calculatedMfsCommission,
        simProvider: mfsProvider,
        cashInHandChange: -numAmount, // Handed physical cash to customer
        simBalanceChange: numAmount,  // E-money received on SIM
        note: note || undefined,
      });
    } else if (activeTab === 'mfs_cashin') {
      const providerLabel = mfsProvider === 'bkash' ? 'বিকাশ' : mfsProvider === 'nagad' ? 'নগদ' : 'রকেট';
      onAddTransaction({
        date: selectedDate,
        time,
        type: 'mfs_cashin',
        title: `${providerLabel} ক্যাশ ইন (টাকা পাঠানো)`,
        amount: numAmount,
        simProvider: mfsProvider,
        cashInHandChange: numAmount,  // Customer paid physical cash
        simBalanceChange: -numAmount, // Sent e-money from SIM
        note: note || undefined,
      });
    } else if (activeTab === 'flexiload') {
      onAddTransaction({
        date: selectedDate,
        time,
        type: 'flexiload',
        title: `${flexiOperator} রিচার্জ (${customerPhone || 'কাস্টমার'})`,
        amount: numAmount,
        commission: calculatedFlexiCommission,
        simProvider: 'flexiload',
        operator: flexiOperator,
        customerPhone: customerPhone || undefined,
        cashInHandChange: numAmount,  // Customer paid cash
        simBalanceChange: -numAmount, // Balance deducted from Flexi SIM
        note: note || undefined,
      });
    } else if (activeTab === 'baki') {
      let custId = selectedCustomerId;
      let custName = '';
      let custPhone = '';

      if (selectedCustomerId === 'new' || !selectedCustomerId) {
        if (!newCustomerName.trim()) return;
        custName = newCustomerName.trim();
        custPhone = newCustomerPhone.trim();
        custId = onAddOrUpdateCustomerDue(
          custName,
          custPhone,
          bakiType === 'given' ? numAmount : -numAmount
        );
      } else {
        const found = customers.find((c) => c.id === selectedCustomerId);
        if (found) {
          custName = found.name;
          custPhone = found.phone;
          onAddOrUpdateCustomerDue(
            found.name,
            found.phone,
            bakiType === 'given' ? numAmount : -numAmount
          );
        }
      }

      if (bakiType === 'given') {
        onAddTransaction({
          date: selectedDate,
          time,
          type: 'baki_given',
          title: `${custName} - বাকি দেওয়া`,
          amount: numAmount,
          cashInHandChange: 0, // Product given, no cash received
          customerId: custId,
          customerName: custName,
          customerPhone: custPhone,
          note: note || undefined,
        });
      } else {
        onAddTransaction({
          date: selectedDate,
          time,
          type: 'baki_paid',
          title: `${custName} - বাকি আদায় (পরিশোধ)`,
          amount: numAmount,
          cashInHandChange: numAmount, // Cash received in drawer
          customerId: custId,
          customerName: custName,
          customerPhone: custPhone,
          note: note || undefined,
        });
      }
    } else if (activeTab === 'partner_withdraw') {
      const partner = partners.find((p) => p.id === selectedPartnerId) || partners[0];
      onAddTransaction({
        date: selectedDate,
        time,
        type: 'partner_withdraw',
        title: `${partner.name.split(' ')[0]} - ব্যক্তিগত উত্তোলন`,
        amount: numAmount,
        cashInHandChange: -numAmount,
        partnerId: selectedPartnerId,
        note: note || 'ব্যক্তিগত হাতখরচ উত্তোলন',
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl border border-stone-200 w-full max-w-xl my-8 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200 bg-stone-50/50">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-stone-900">
              নতুন হিসাব এন্ট্রি করুন
            </h2>
            <p className="text-xs text-stone-500">
              দৈনিক ক্যাশ ও লেনদেনের খতিয়ানে যুক্ত করুন
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-stone-200 bg-stone-100/60 p-1.5 gap-1 overflow-x-auto text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('tea_sale')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'tea_sale'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Coffee className="w-3.5 h-3.5 text-emerald-600" />
            <span>চা ও নাস্তা বিক্রি</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('expense')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'expense'
                ? 'bg-white text-rose-800 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5 text-rose-600" />
            <span>দোকান খরচ</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('mfs_cashout')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'mfs_cashout'
                ? 'bg-white text-amber-800 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <ArrowDownLeft className="w-3.5 h-3.5 text-amber-600" />
            <span>ক্যাশ আউট (লাভ)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('mfs_cashin')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'mfs_cashin'
                ? 'bg-white text-blue-800 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5 text-blue-600" />
            <span>ক্যাশ ইন</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('flexiload')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'flexiload'
                ? 'bg-white text-purple-800 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-purple-600" />
            <span>ফ্লেক্সিলোড</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('baki')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'baki'
                ? 'bg-white text-amber-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-amber-700" />
            <span>বাকির খাতা</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('partner_withdraw')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'partner_withdraw'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5 text-stone-700" />
            <span>পার্টনার উত্তোলন</span>
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Amount Input with Quick Preset buttons */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              টাকার পরিমাণ (টাকা / ৳) *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 font-bold text-lg">
                ৳
              </span>
              <input
                type="number"
                step="any"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                autoFocus
                className="w-full pl-9 pr-4 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-lg font-bold text-stone-900 tabular-nums focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>

            {/* Quick Add Buttons */}
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              <span className="text-[11px] text-stone-400 font-medium mr-1">দ্রুত যোগ:</span>
              {[10, 20, 50, 100, 200, 500, 1000].map((val) => (
                <button
                  type="button"
                  key={val}
                  onClick={() => handleQuickAddAmount(val)}
                  className="px-2 py-1 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-md transition-colors tabular-nums"
                >
                  +{val}
                </button>
              ))}
              {amount && (
                <button
                  type="button"
                  onClick={() => setAmount('')}
                  className="px-2 py-1 text-xs font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-md transition-colors"
                >
                  মুছুন
                </button>
              )}
            </div>
          </div>

          {/* TAB 1: TEA SALE */}
          {activeTab === 'tea_sale' && (
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-stone-700">
                বিক্রির ধরণ নির্বাচন করুন
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                {[
                  { id: 'milk_tea', label: 'দুধ চা' },
                  { id: 'black_tea', label: 'রঙ / লেবু চা' },
                  { id: 'coffee', label: 'কফি' },
                  { id: 'bakery_snacks', label: 'বিস্কুট / নাস্তা' },
                  { id: 'cigarette', label: 'সিগারেট' },
                  { id: 'cold_drinks', label: 'কোল্ড ড্রিংকস' },
                  { id: 'general_counter', label: 'মোট ক্যাশ সেল' },
                ].map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => setTeaCategory(item.id as TeaSaleCategory)}
                    className={`p-2 rounded-lg border text-left transition-colors font-medium ${
                      teaCategory === item.id
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold'
                        : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: EXPENSE */}
          {activeTab === 'expense' && (
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-stone-700">
                খরচের খাত নির্বাচন করুন
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                {[
                  { id: 'milk', label: 'দুধ কেনা' },
                  { id: 'sugar_tea', label: 'চিনি ও পাতা' },
                  { id: 'cylinder_gas', label: 'সিলিন্ডার গ্যাস' },
                  { id: 'bakery_biscuit', label: 'বিস্কুট ও পাউরুটি' },
                  { id: 'cigarette_stock', label: 'সিগারেট স্টক' },
                  { id: 'cups_plastic', label: 'কাপ ও সামগ্রী' },
                  { id: 'rent_bill', label: 'ভাড়া ও বিদ্যুৎ বিল' },
                  { id: 'personal_snacks', label: 'নাস্তা ও হাতখরচ' },
                  { id: 'other_expense', label: 'অন্যান্য খরচ' },
                ].map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => setExpenseCategory(item.id as ExpenseCategory)}
                    className={`p-2 rounded-lg border text-left transition-colors font-medium ${
                      expenseCategory === item.id
                        ? 'border-rose-600 bg-rose-50 text-rose-900 font-bold'
                        : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  খরচের বিবরণ (ঐচ্ছিক)
                </label>
                <input
                  type="text"
                  value={expenseTitle}
                  onChange={(e) => setExpenseTitle(e.target.value)}
                  placeholder="যেমন: ৩ লিটার খাঁটি তরল দুধ কেনা"
                  className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>
            </div>
          )}

          {/* TAB 3: MFS CASH OUT */}
          {activeTab === 'mfs_cashout' && (
            <div className="space-y-3 bg-amber-50/50 p-3.5 rounded-lg border border-amber-200">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-stone-800">সার্ভিস:</span>
                {(['bkash', 'nagad', 'rocket'] as MfsProvider[]).map((prov) => (
                  <button
                    type="button"
                    key={prov}
                    onClick={() => setMfsProvider(prov)}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                      mfsProvider === prov
                        ? prov === 'bkash'
                          ? 'bg-pink-600 text-white shadow-xs'
                          : prov === 'nagad'
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'bg-purple-700 text-white shadow-xs'
                        : 'bg-white text-stone-700 border border-stone-200'
                    }`}
                  >
                    {prov === 'bkash' ? 'বিকাশ (bKash)' : prov === 'nagad' ? 'নগদ (Nagad)' : 'রকেট (Rocket)'}
                  </button>
                ))}
              </div>

              <div className="text-xs text-stone-600 space-y-1 pt-1">
                <p>• কাস্টমার ক্যাশ টাকা নিয়ে যাবে: <strong className="text-rose-700 tabular-nums">-{formatTaka(numAmount)}</strong> (ক্যাশ ড্রয়ার থেকে কমবে)</p>
                <p>• এজেন্ট সিমে ব্যালেন্স ঢুকবে: <strong className="text-emerald-700 tabular-nums">+{formatTaka(numAmount)}</strong></p>
                <div className="flex items-center justify-between pt-1 font-semibold text-amber-900 border-t border-amber-200">
                  <span>আপনার অর্জিত কমিশন (দোকানের লাভ):</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold tabular-nums text-emerald-800">
                      {formatTaka(calculatedMfsCommission)}
                    </span>
                    <input
                      type="number"
                      step="any"
                      placeholder="কাস্টম"
                      value={customCommission}
                      onChange={(e) => setCustomCommission(e.target.value)}
                      title="কমিশন পরিবর্তন করতে চাইলে লিখুন"
                      className="w-16 px-1.5 py-0.5 text-xs bg-white border border-amber-300 rounded text-right tabular-nums"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: MFS CASH IN */}
          {activeTab === 'mfs_cashin' && (
            <div className="space-y-3 bg-blue-50/50 p-3.5 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-stone-800">সার্ভিস:</span>
                {(['bkash', 'nagad', 'rocket'] as MfsProvider[]).map((prov) => (
                  <button
                    type="button"
                    key={prov}
                    onClick={() => setMfsProvider(prov)}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                      mfsProvider === prov
                        ? prov === 'bkash'
                          ? 'bg-pink-600 text-white shadow-xs'
                          : prov === 'nagad'
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'bg-purple-700 text-white shadow-xs'
                        : 'bg-white text-stone-700 border border-stone-200'
                    }`}
                  >
                    {prov === 'bkash' ? 'বিকাশ' : prov === 'nagad' ? 'নগদ' : 'রকেট'}
                  </button>
                ))}
              </div>

              <div className="text-xs text-stone-600 space-y-1 pt-1">
                <p>• কাস্টমার আপনাকে ক্যাশ টাকা দিয়েছে: <strong className="text-emerald-700 tabular-nums">+{formatTaka(numAmount)}</strong> (ক্যাশ ড্রয়ারে বাড়বে)</p>
                <p>• এজেন্ট সিম থেকে গ্রাহকের নাম্বারে টাকা পাঠানো হয়েছে: <strong className="text-rose-700 tabular-nums">-{formatTaka(numAmount)}</strong></p>
              </div>
            </div>
          )}

          {/* TAB 5: FLEXILOAD */}
          {activeTab === 'flexiload' && (
            <div className="space-y-3 bg-purple-50/50 p-3.5 rounded-lg border border-purple-200">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold text-stone-800">অপারেটর:</span>
                {['Grameenphone', 'Banglalink', 'Robi', 'Airtel', 'Teletalk'].map((op) => (
                  <button
                    type="button"
                    key={op}
                    onClick={() => setFlexiOperator(op)}
                    className={`px-2.5 py-1 rounded text-xs font-semibold ${
                      flexiOperator === op
                        ? 'bg-purple-700 text-white'
                        : 'bg-white text-stone-700 border border-stone-200'
                    }`}
                  >
                    {op}
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  মোবাইল নম্বর (ঐচ্ছিক)
                </label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="017xxxxxxxx"
                  className="w-full px-3 py-2 text-sm bg-white border border-purple-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 font-mono"
                />
              </div>

              <div className="flex items-center justify-between text-xs pt-1 border-t border-purple-200 font-medium text-purple-900">
                <span>রিচার্জ লাভ (কমিশন {settings.flexiCommissionRatePercent}%):</span>
                <span className="font-bold tabular-nums text-emerald-800">
                  +{formatTaka(calculatedFlexiCommission)}
                </span>
              </div>
            </div>
          )}

          {/* TAB 6: BAKI KHATA */}
          {activeTab === 'baki' && (
            <div className="space-y-3 bg-amber-50/30 p-3.5 rounded-lg border border-amber-200">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setBakiType('given')}
                  className={`flex-1 py-1.5 px-3 rounded-md text-xs font-bold transition-all ${
                    bakiType === 'given'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-stone-100 text-stone-700'
                  }`}
                >
                  বাকি দেওয়া (দেনা বৃদ্ধি)
                </button>
                <button
                  type="button"
                  onClick={() => setBakiType('paid')}
                  className={`flex-1 py-1.5 px-3 rounded-md text-xs font-bold transition-all ${
                    bakiType === 'paid'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-stone-100 text-stone-700'
                  }`}
                >
                  বাকি আদায় (ক্যাশ জমা)
                </button>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  কাস্টমার নির্বাচন করুন
                </label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                >
                  <option value="">-- তালিকা থেকে কাস্টমার বেছে নিন --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.phone || 'নম্বর নেই'}) - বর্তমান বাকি: ৳ {c.totalDue}
                    </option>
                  ))}
                  <option value="new">+ নতুন কাস্টমার যোগ করুন</option>
                </select>
              </div>

              {(selectedCustomerId === 'new' || selectedCustomerId === '') && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="block text-[11px] font-medium text-stone-600 mb-0.5">
                      কাস্টমারের নাম *
                    </label>
                    <input
                      type="text"
                      value={newCustomerName}
                      onChange={(e) => setNewCustomerName(e.target.value)}
                      placeholder="যেমন: মো: রফিক ভাই"
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-stone-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-stone-600 mb-0.5">
                      মোবাইল নম্বর (ঐচ্ছিক)
                    </label>
                    <input
                      type="tel"
                      value={newCustomerPhone}
                      onChange={(e) => setNewCustomerPhone(e.target.value)}
                      placeholder="01xxxxxxxxx"
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-stone-300 rounded-md font-mono"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 7: PARTNER WITHDRAW */}
          {activeTab === 'partner_withdraw' && (
            <div className="space-y-3 bg-stone-50 p-3.5 rounded-lg border border-stone-200">
              <label className="block text-xs font-semibold text-stone-700">
                কোন পার্টনার টাকা তুলছেন?
              </label>
              <div className="grid grid-cols-2 gap-2">
                {partners.map((p) => (
                  <button
                    type="button"
                    key={p.id}
                    onClick={() => setSelectedPartnerId(p.id)}
                    className={`p-2.5 rounded-lg border text-left transition-all ${
                      selectedPartnerId === p.id
                        ? 'border-amber-600 bg-amber-50 text-amber-950 font-bold'
                        : 'border-stone-200 bg-white text-stone-700'
                    }`}
                  >
                    <div className="text-xs">{p.name}</div>
                    <div className="text-[11px] text-stone-500 font-normal mt-0.5">
                      শেয়ার: {p.sharePercent}% · উত্তোলন: ৳ {p.totalWithdrawn}
                    </div>
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-stone-500">
                * পার্টনারের উত্তোলন ক্যাশ ড্রয়ার থেকে সরাসরি মাইনাস হবে এবং পার্টনার ড্রয়িং খাতায় রেকর্ড থাকবে।
              </p>
            </div>
          )}

          {/* Common Note and Time input */}
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-stone-700 mb-1">
                নোট বা মন্তব্য (ঐচ্ছিক)
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="অতিরিক্ত কোনো তথ্য থাকলে লিখুন"
                className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-lg focus:bg-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                সময়
              </label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-lg text-center font-mono"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={numAmount <= 0}
              className="inline-flex items-center gap-1.5 px-5 py-2 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 active:bg-amber-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-xs transition-colors"
            >
              <Check className="w-4 h-4" />
              <span>খাতায় যুক্ত করুন</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
