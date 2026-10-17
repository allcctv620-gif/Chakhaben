import React from 'react';
import {
  Coffee,
  PlusCircle,
  ReceiptText,
  Smartphone,
  Users,
  PieChart,
  Settings,
  Printer,
  CalendarDays,
} from 'lucide-react';

interface HeaderProps {
  activeTab: 'ledger' | 'mfs' | 'baki' | 'partners' | 'reports';
  setActiveTab: (tab: 'ledger' | 'mfs' | 'baki' | 'partners' | 'reports') => void;
  onOpenNewEntry: () => void;
  onOpenClosing: () => void;
  onOpenSettings: () => void;
  onOpenPrint: () => void;
  shopName: string;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewEntry,
  onOpenClosing,
  onOpenSettings,
  onOpenPrint,
  shopName,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 h-16">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-amber-600 flex items-center justify-center text-white shadow-xs">
              <Coffee className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-bold text-stone-900 tracking-tight leading-tight block truncate max-w-[200px] sm:max-w-none">
                {shopName}
              </span>
              <span className="text-xs text-stone-500 font-medium block">
                চা ও মোবাইল ব্যাংকিং হিসাব খাতা
              </span>
            </div>
          </div>

          {/* Zone 2: Navigation links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <button
              onClick={() => setActiveTab('ledger')}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'ledger'
                  ? 'bg-amber-50 text-amber-900 font-semibold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              <ReceiptText className="w-4 h-4 text-stone-500" />
              <span>দৈনিক খতিয়ান</span>
            </button>

            <button
              onClick={() => setActiveTab('mfs')}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'mfs'
                  ? 'bg-amber-50 text-amber-900 font-semibold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              <Smartphone className="w-4 h-4 text-stone-500" />
              <span>বিকাশ ও ফ্লেক্সি</span>
            </button>

            <button
              onClick={() => setActiveTab('baki')}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'baki'
                  ? 'bg-amber-50 text-amber-900 font-semibold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              <Users className="w-4 h-4 text-stone-500" />
              <span>বাকির খাতা</span>
            </button>

            <button
              onClick={() => setActiveTab('partners')}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'partners'
                  ? 'bg-amber-50 text-amber-900 font-semibold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              <PieChart className="w-4 h-4 text-stone-500" />
              <span>২ অংশীদার হিসাব</span>
            </button>

            <button
              onClick={() => setActiveTab('reports')}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'reports'
                  ? 'bg-amber-50 text-amber-900 font-semibold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              <CalendarDays className="w-4 h-4 text-stone-500" />
              <span>রিপোর্ট ও হিস্যা</span>
            </button>
          </nav>

          {/* Zone 3: 1 Primary CTA Button + secondary controls */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onOpenClosing}
              title="দিনের হিসাব ও নোট কাউন্টার মেলান"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors whitespace-nowrap"
            >
              <span>ক্যাশ মেলানো</span>
            </button>

            <button
              onClick={onOpenPrint}
              title="দৈনিক মেমো প্রিন্ট করুন"
              className="p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
            >
              <Printer className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenSettings}
              title="দোকান ও পার্টনার সেটিংস"
              className="p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
            >
              <Settings className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenNewEntry}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 active:bg-amber-800 rounded-lg shadow-xs transition-colors whitespace-nowrap"
            >
              <PlusCircle className="w-4 h-4" />
              <span>নতুন হিসাব যোগ</span>
            </button>
          </div>
        </div>

        {/* Mobile secondary navigation strip */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-stone-100 text-xs font-medium overflow-x-auto">
          <button
            onClick={() => setActiveTab('ledger')}
            className={`px-2.5 py-1.5 rounded-md whitespace-nowrap ${
              activeTab === 'ledger' ? 'bg-amber-100 text-amber-900 font-bold' : 'text-stone-600'
            }`}
          >
            খতিয়ান
          </button>
          <button
            onClick={() => setActiveTab('mfs')}
            className={`px-2.5 py-1.5 rounded-md whitespace-nowrap ${
              activeTab === 'mfs' ? 'bg-amber-100 text-amber-900 font-bold' : 'text-stone-600'
            }`}
          >
            বিকাশ/ফ্লেক্সি
          </button>
          <button
            onClick={() => setActiveTab('baki')}
            className={`px-2.5 py-1.5 rounded-md whitespace-nowrap ${
              activeTab === 'baki' ? 'bg-amber-100 text-amber-900 font-bold' : 'text-stone-600'
            }`}
          >
            বাকির খাতা
          </button>
          <button
            onClick={() => setActiveTab('partners')}
            className={`px-2.5 py-1.5 rounded-md whitespace-nowrap ${
              activeTab === 'partners' ? 'bg-amber-100 text-amber-900 font-bold' : 'text-stone-600'
            }`}
          >
            ২ পার্টনার
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-2.5 py-1.5 rounded-md whitespace-nowrap ${
              activeTab === 'reports' ? 'bg-amber-100 text-amber-900 font-bold' : 'text-stone-600'
            }`}
          >
            রিপোর্ট
          </button>
        </div>
      </div>
    </header>
  );
};
