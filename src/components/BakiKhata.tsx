import React, { useState } from 'react';
import {
  Users,
  Search,
  PlusCircle,
  Phone,
  MessageSquare,
  ArrowDownLeft,
  ArrowUpRight,
  Check,
  Copy,
  Trash2,
} from 'lucide-react';
import { Customer, Transaction } from '../types';
import { formatTaka, getTodayDateString } from '../utils/formatters';

interface BakiKhataProps {
  customers: Customer[];
  onAddOrUpdateCustomerDue: (name: string, phone: string, dueChange: number) => string;
  onDeleteCustomer: (id: string) => void;
  onAddTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => void;
  selectedDate: string;
  shopName: string;
}

export const BakiKhata: React.FC<BakiKhataProps> = ({
  customers,
  onAddOrUpdateCustomerDue,
  onDeleteCustomer,
  onAddTransaction,
  selectedDate,
  shopName,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [initialDue, setInitialDue] = useState<string>('');

  // Quick Action Modal (Give Baki or Collect Baki for specific customer)
  const [activeCustomer, setActiveCustomer] = useState<Customer | null>(null);
  const [actionType, setActionType] = useState<'given' | 'paid'>('paid');
  const [actionAmount, setActionAmount] = useState<string>('');
  const [actionNote, setActionNote] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const totalMarketDue = customers.reduce((sum, c) => sum + (c.totalDue > 0 ? c.totalDue : 0), 0);
  const activeDueCustomersCount = customers.filter((c) => c.totalDue > 0).length;

  const filteredCustomers = customers.filter((c) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return c.name.toLowerCase().includes(term) || c.phone.includes(term);
  });

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const due = parseFloat(initialDue) || 0;
    const newId = onAddOrUpdateCustomerDue(name.trim(), phone.trim(), due);

    if (due > 0) {
      onAddTransaction({
        date: selectedDate,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'baki_given',
        title: `${name.trim()} - পূর্বের বকেয়া খাতা এন্ট্রি`,
        amount: due,
        cashInHandChange: 0,
        customerId: newId,
        customerName: name.trim(),
        customerPhone: phone.trim(),
        note: 'নতুন গ্রাহক যোগ ও পূর্বের বাকি এন্ট্রি',
      });
    }

    setShowAddModal(false);
    setName('');
    setPhone('');
    setAddress('');
    setInitialDue('');
  };

  const handleExecuteQuickAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCustomer) return;
    const amt = parseFloat(actionAmount);
    if (!amt || amt <= 0) return;

    if (actionType === 'paid') {
      // Baki paid: customer pays cash -> cash in hand increases, customer due decreases
      onAddOrUpdateCustomerDue(activeCustomer.name, activeCustomer.phone, -amt);
      onAddTransaction({
        date: selectedDate,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'baki_paid',
        title: `${activeCustomer.name} - বাকি আদায় (পরিশোধ)`,
        amount: amt,
        cashInHandChange: amt,
        customerId: activeCustomer.id,
        customerName: activeCustomer.name,
        customerPhone: activeCustomer.phone,
        note: actionNote || 'বাকি পরিশোধের ক্যাশ টাকা ড্রয়ারে জমা হলো',
      });
    } else {
      // Baki given: customer takes goods on credit -> customer due increases, no cash impact
      onAddOrUpdateCustomerDue(activeCustomer.name, activeCustomer.phone, amt);
      onAddTransaction({
        date: selectedDate,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'baki_given',
        title: `${activeCustomer.name} - বাকি দেওয়া`,
        amount: amt,
        cashInHandChange: 0,
        customerId: activeCustomer.id,
        customerName: activeCustomer.name,
        customerPhone: activeCustomer.phone,
        note: actionNote || 'চা, সিগারেট বা ফ্লেক্সিলোড বাকি দেওয়া হলো',
      });
    }

    setActiveCustomer(null);
    setActionAmount('');
    setActionNote('');
  };

  const handleCopySmsReminder = (customer: Customer) => {
    const text = `আসসালামু আলাইকুম ${customer.name} ভাই, ${shopName} থেকে আপনার বকেয়া হিসাব: ৳ ${customer.totalDue} টাকা। সুবিধামতো দোকানে এসে হিসাবটি পরিশোধ করার জন্য অনুরোধ করা হলো। ধন্যবাদ!`;
    navigator.clipboard.writeText(text);
    setCopiedId(customer.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Market Due Summary */}
      <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs text-stone-500 font-medium mb-1">
            বাজারে মোট বকেয়া পাওনা (কাস্টমার বাকি)
          </div>
          <div className="text-3xl font-bold text-rose-700 tabular-nums">
            {formatTaka(totalMarketDue)}
          </div>
          <div className="text-xs text-stone-500 mt-1">
            মোট বকেয়া কাস্টমার: <strong className="text-stone-800">{activeDueCustomersCount} জন</strong>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-xs transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          <span>নতুন বাকি কাস্টমার যোগ</span>
        </button>
      </div>

      {/* Customer List Card */}
      <div className="bg-white border border-stone-200 rounded-xl shadow-xs overflow-hidden">
        {/* Search Bar */}
        <div className="p-4 border-b border-stone-200">
          <div className="relative max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="কাস্টমারের নাম বা ফোন নম্বর দিয়ে খুঁজুন..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* Customer Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-stone-50 text-stone-500 font-semibold border-b border-stone-200">
                <th className="py-3 px-4">কাস্টমার নাম ও মোবাইল</th>
                <th className="py-3 px-4">ঠিকানা</th>
                <th className="py-3 px-4 text-right">বর্তমান বকেয়া (৳)</th>
                <th className="py-3 px-4 text-center">দ্রুত হিসাব</th>
                <th className="py-3 px-4 text-center">তাগাদা এসএমএস</th>
                <th className="py-3 px-4 text-center w-12">মুছুন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-stone-400">
                    কোনো কাস্টমার পাওয়া যায়নি
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c) => (
                  <tr key={c.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-stone-900 text-sm">{c.name}</div>
                      {c.phone ? (
                        <div className="text-xs text-stone-500 flex items-center gap-1 font-mono mt-0.5">
                          <Phone className="w-3 h-3 text-stone-400" />
                          <span>{c.phone}</span>
                        </div>
                      ) : (
                        <div className="text-[11px] text-stone-400">ফোন নম্বর নেই</div>
                      )}
                    </td>

                    <td className="py-3 px-4 text-stone-600">
                      {c.address || 'লোকাল কাস্টমার'}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className={`text-base font-bold tabular-nums ${c.totalDue > 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
                        {formatTaka(c.totalDue)}
                      </div>
                      <div className="text-[10px] text-stone-400">
                        {c.totalDue > 0 ? 'পাওনা বাকি' : 'কোনো বাকি নেই'}
                      </div>
                    </td>

                    {/* Quick Give/Collect Buttons */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setActiveCustomer(c);
                            setActionType('paid');
                            setActionAmount('');
                          }}
                          className="px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded transition-colors"
                        >
                          + বাকি আদায়
                        </button>
                        <button
                          onClick={() => {
                            setActiveCustomer(c);
                            setActionType('given');
                            setActionAmount('');
                          }}
                          className="px-2.5 py-1 text-xs font-semibold text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded transition-colors"
                        >
                          - বাকি দিন
                        </button>
                      </div>
                    </td>

                    {/* Copy SMS Reminder */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      {c.totalDue > 0 ? (
                        <button
                          onClick={() => handleCopySmsReminder(c)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-stone-600 bg-stone-100 hover:bg-stone-200 rounded transition-colors"
                          title="তাগাদার মেসেজ কপি করুন"
                        >
                          {copiedId === c.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-700 font-semibold">কপি হয়েছে!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-stone-500" />
                              <span>তাগাদা কপি</span>
                            </>
                          )}
                        </button>
                      ) : (
                        <span className="text-[11px] text-stone-300">-</span>
                      )}
                    </td>

                    {/* Delete */}
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => {
                          if (confirm(`'${c.name}' কে তালিকা থেকে মুছে ফেলতে চান?`)) {
                            onDeleteCustomer(c.id);
                          }
                        }}
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
      </div>

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-stone-200 w-full max-w-md p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-bold text-stone-900 text-base">
                নতুন বাকি কাস্টমার যুক্ত করুন
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-stone-400 hover:text-stone-700 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  কাস্টমারের নাম *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="যেমন: কবির ভাই (মুদি দোকান)"
                  className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  মোবাইল নম্বর
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01xxxxxxxxx"
                  className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  ঠিকানা বা পরিচিতি
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="যেমন: বাজার রোড, রিকশা স্ট্যান্ড"
                  className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  পূর্বের বাকি থাকলে (টাকা / ৳)
                </label>
                <input
                  type="number"
                  step="any"
                  value={initialDue}
                  onChange={(e) => setInitialDue(e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg font-bold tabular-nums"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-xs text-stone-600"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-xs"
                >
                  কাস্টমার সেভ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Give / Collect Baki Modal */}
      {activeCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-stone-200 w-full max-w-md p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h3 className="font-bold text-stone-900 text-base">
                  {activeCustomer.name}
                </h3>
                <p className="text-xs text-stone-500">
                  বর্তমান বাকি: <strong className="text-rose-700 font-bold tabular-nums">{formatTaka(activeCustomer.totalDue)}</strong>
                </p>
              </div>
              <button
                onClick={() => setActiveCustomer(null)}
                className="text-stone-400 hover:text-stone-700 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleExecuteQuickAction} className="space-y-4">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setActionType('paid')}
                  className={`py-2 px-3 rounded-lg font-bold transition-all ${
                    actionType === 'paid'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-stone-100 text-stone-700'
                  }`}
                >
                  + বাকি আদায় (ক্যাশ জমা)
                </button>
                <button
                  type="button"
                  onClick={() => setActionType('given')}
                  className={`py-2 px-3 rounded-lg font-bold transition-all ${
                    actionType === 'given'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-stone-100 text-stone-700'
                  }`}
                >
                  - নতুন বাকি দেওয়া
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  টাকার পরিমাণ (৳) *
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={actionAmount}
                  onChange={(e) => setActionAmount(e.target.value)}
                  placeholder="0"
                  autoFocus
                  className="w-full px-3 py-2 text-base font-bold bg-stone-50 border border-stone-300 rounded-lg tabular-nums"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  বিবরণ / নোট
                </label>
                <input
                  type="text"
                  value={actionNote}
                  onChange={(e) => setActionNote(e.target.value)}
                  placeholder={actionType === 'paid' ? 'যেমন: নগদ ৫০০ টাকা পরিশোধ' : 'যেমন: ৪ কাপ চা ও সিগারেট বাকি'}
                  className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-lg"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setActiveCustomer(null)}
                  className="px-3 py-1.5 text-xs text-stone-600"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className={`px-4 py-1.5 text-xs font-bold text-white rounded-lg shadow-xs ${
                    actionType === 'paid' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  হিসাব নিশ্চিত করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
