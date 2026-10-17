import React, { useState, useEffect, useMemo } from 'react';
import {
  Customer,
  DailyClosing,
  Partner,
  ShopSettings,
  SimBalances,
  Transaction,
} from './types';
import {
  getStoredCustomers,
  getStoredPartners,
  getStoredSettings,
  getStoredSimBalances,
  getStoredTransactions,
  saveClosing,
  saveCustomers,
  savePartners,
  saveSettings,
  saveSimBalances,
  saveTransactions,
} from './utils/storage';
import { getTodayDateString } from './utils/formatters';
import { Header } from './components/Header';
import { DailyStats } from './components/DailyStats';
import { LedgerTable } from './components/LedgerTable';
import { MfsSimTracker } from './components/MfsSimTracker';
import { BakiKhata } from './components/BakiKhata';
import { PartnerKhata } from './components/PartnerKhata';
import { ReportsView } from './components/ReportsView';
import { NewEntryModal } from './components/NewEntryModal';
import { DailyClosingModal } from './components/DailyClosingModal';
import { SettingsModal } from './components/SettingsModal';
import { PrintDailyReport } from './components/PrintDailyReport';

export default function App() {
  const [settings, setSettings] = useState<ShopSettings>(getStoredSettings);
  const [partners, setPartners] = useState<Partner[]>(getStoredPartners);
  const [customers, setCustomers] = useState<Customer[]>(getStoredCustomers);
  const [transactions, setTransactions] = useState<Transaction[]>(getStoredTransactions);
  const [simBalances, setSimBalances] = useState<SimBalances>(getStoredSimBalances);

  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
  const [activeTab, setActiveTab] = useState<'ledger' | 'mfs' | 'baki' | 'partners' | 'reports'>('ledger');

  // Modals state
  const [isNewEntryOpen, setIsNewEntryOpen] = useState<boolean>(false);
  const [newEntryTab, setNewEntryTab] = useState<
    'tea_sale' | 'expense' | 'mfs_cashout' | 'mfs_cashin' | 'flexiload' | 'baki' | 'partner_withdraw'
  >('tea_sale');
  const [isClosingOpen, setIsClosingOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isPrintOpen, setIsPrintOpen] = useState<boolean>(false);

  // Sync to localStorage
  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    savePartners(partners);
  }, [partners]);

  useEffect(() => {
    saveCustomers(customers);
  }, [customers]);

  useEffect(() => {
    saveTransactions(transactions);
  }, [transactions]);

  useEffect(() => {
    saveSimBalances(simBalances);
  }, [simBalances]);

  // Filter transactions for the selected date
  const selectedDateTransactions = useMemo(() => {
    return transactions.filter((t) => t.date === selectedDate);
  }, [transactions, selectedDate]);

  // Calculate stats for the selected date
  const stats = useMemo(() => {
    const salesTotal = selectedDateTransactions
      .filter((t) => t.type === 'tea_sale')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenseTotal = selectedDateTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const commissionTotal = selectedDateTransactions.reduce(
      (sum, t) => sum + (t.commission || 0),
      0
    );

    const netProfit = salesTotal + commissionTotal - expenseTotal;

    const bakiCollected = selectedDateTransactions
      .filter((t) => t.type === 'baki_paid')
      .reduce((sum, t) => sum + t.amount, 0);

    const bakiGiven = selectedDateTransactions
      .filter((t) => t.type === 'baki_given')
      .reduce((sum, t) => sum + t.amount, 0);

    const partnerWithdrawn = selectedDateTransactions
      .filter((t) => t.type === 'partner_withdraw')
      .reduce((sum, t) => sum + t.amount, 0);

    // Compute live Drawer Cash in hand:
    // Base opening cash + all cash impacts across all transactions
    const totalCashChange = transactions.reduce(
      (sum, t) => sum + t.cashInHandChange,
      0
    );
    const calculatedCashInHand = Math.max(0, settings.openingCash + totalCashChange);

    // Expected closing cash for selected date
    const dailyCashChange = selectedDateTransactions.reduce(
      (sum, t) => sum + t.cashInHandChange,
      0
    );
    const expectedClosingCash = Math.max(0, settings.openingCash + dailyCashChange);

    return {
      salesTotal,
      expenseTotal,
      commissionTotal,
      netProfit,
      bakiCollected,
      bakiGiven,
      partnerWithdrawn,
      cashInHand: calculatedCashInHand,
      expectedClosingCash,
    };
  }, [selectedDateTransactions, transactions, settings.openingCash]);

  // Handlers
  const handleAddTransaction = (newTx: Omit<Transaction, 'id' | 'createdAt'>) => {
    const tx: Transaction = {
      ...newTx,
      id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      createdAt: Date.now(),
    };

    setTransactions((prev) => [tx, ...prev]);

    // If transaction affects SIM electronic balance, update simBalances accordingly
    if (newTx.simBalanceChange && newTx.simProvider) {
      setSimBalances((prev) => {
        const copy = { ...prev, lastUpdated: new Date().toISOString() };
        if (newTx.simProvider === 'bkash') {
          copy.bkashAgent += newTx.simBalanceChange!;
        } else if (newTx.simProvider === 'nagad') {
          copy.nagadAgent += newTx.simBalanceChange!;
        } else if (newTx.simProvider === 'rocket') {
          copy.rocketAgent += newTx.simBalanceChange!;
        } else if (newTx.simProvider === 'flexiload') {
          copy.flexiload += newTx.simBalanceChange!;
        }
        return copy;
      });
    }

    // If transaction is partner withdraw, update partner totalWithdrawn
    if (newTx.type === 'partner_withdraw' && newTx.partnerId) {
      setPartners((prev) =>
        prev.map((p) =>
          p.id === newTx.partnerId
            ? { ...p, totalWithdrawn: (p.totalWithdrawn || 0) + newTx.amount }
            : p
        )
      );
    }
  };

  const handleDeleteTransaction = (id: string) => {
    const txToDelete = transactions.find((t) => t.id === id);
    if (!txToDelete) return;

    // Rollback SIM balance impact if any
    if (txToDelete.simBalanceChange && txToDelete.simProvider) {
      setSimBalances((prev) => {
        const copy = { ...prev, lastUpdated: new Date().toISOString() };
        if (txToDelete.simProvider === 'bkash') {
          copy.bkashAgent -= txToDelete.simBalanceChange!;
        } else if (txToDelete.simProvider === 'nagad') {
          copy.nagadAgent -= txToDelete.simBalanceChange!;
        } else if (txToDelete.simProvider === 'rocket') {
          copy.rocketAgent -= txToDelete.simBalanceChange!;
        } else if (txToDelete.simProvider === 'flexiload') {
          copy.flexiload -= txToDelete.simBalanceChange!;
        }
        return copy;
      });
    }

    // Rollback partner withdrawal if any
    if (txToDelete.type === 'partner_withdraw' && txToDelete.partnerId) {
      setPartners((prev) =>
        prev.map((p) =>
          p.id === txToDelete.partnerId
            ? { ...p, totalWithdrawn: Math.max(0, (p.totalWithdrawn || 0) - txToDelete.amount) }
            : p
        )
      );
    }

    // Rollback customer due if any
    if (txToDelete.customerId && (txToDelete.type === 'baki_given' || txToDelete.type === 'baki_paid')) {
      const rollbackAmount = txToDelete.type === 'baki_given' ? -txToDelete.amount : txToDelete.amount;
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === txToDelete.customerId
            ? { ...c, totalDue: Math.max(0, c.totalDue + rollbackAmount) }
            : c
        )
      );
    }

    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const handleAddOrUpdateCustomerDue = (
    name: string,
    phone: string,
    dueChange: number
  ): string => {
    let customerId = '';
    setCustomers((prev) => {
      const existing = prev.find(
        (c) =>
          (phone && c.phone === phone) ||
          c.name.trim().toLowerCase() === name.trim().toLowerCase()
      );

      if (existing) {
        customerId = existing.id;
        return prev.map((c) =>
          c.id === existing.id
            ? {
                ...c,
                totalDue: Math.max(0, c.totalDue + dueChange),
                lastActive: selectedDate,
                totalTransactionsCount: c.totalTransactionsCount + 1,
              }
            : c
        );
      } else {
        customerId = `c-${Date.now()}`;
        const newCust: Customer = {
          id: customerId,
          name: name.trim(),
          phone: phone.trim(),
          totalDue: Math.max(0, dueChange),
          totalTransactionsCount: 1,
          lastActive: selectedDate,
          createdAt: selectedDate,
        };
        return [newCust, ...prev];
      }
    });
    return customerId;
  };

  const handleDeleteCustomer = (id: string) => {
    setCustomers((prev) => prev.filter((c) => c.id !== id));
  };

  const handleSaveClosing = (closing: DailyClosing) => {
    saveClosing(closing);
  };

  const handleReloadData = () => {
    setSettings(getStoredSettings());
    setPartners(getStoredPartners());
    setCustomers(getStoredCustomers());
    setTransactions(getStoredTransactions());
    setSimBalances(getStoredSimBalances());
  };

  const openNewEntryWithTab = (
    tab: 'tea_sale' | 'expense' | 'mfs_cashout' | 'mfs_cashin' | 'flexiload' | 'baki' | 'partner_withdraw'
  ) => {
    setNewEntryTab(tab);
    setIsNewEntryOpen(true);
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewEntry={() => openNewEntryWithTab('tea_sale')}
        onOpenClosing={() => setIsClosingOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenPrint={() => setIsPrintOpen(true)}
        shopName={settings.shopName}
      />

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Daily Stats KPI bar (always available to check current business pulse) */}
        <DailyStats
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          salesTotal={stats.salesTotal}
          expenseTotal={stats.expenseTotal}
          commissionTotal={stats.commissionTotal}
          netProfit={stats.netProfit}
          cashInHand={stats.cashInHand}
          partner1Name={partners[0]?.name || 'পার্টনার ১'}
          partner2Name={partners[1]?.name || 'পার্টনার ২'}
          partner1Share={partners[0]?.sharePercent || 50}
          partner2Share={partners[1]?.sharePercent || 50}
          onOpenQuickSale={() => openNewEntryWithTab('tea_sale')}
          onOpenQuickExpense={() => openNewEntryWithTab('expense')}
          onOpenClosing={() => setIsClosingOpen(true)}
        />

        {/* View Routing */}
        {activeTab === 'ledger' && (
          <LedgerTable
            transactions={selectedDateTransactions}
            onDeleteTransaction={handleDeleteTransaction}
            onOpenNewEntry={() => openNewEntryWithTab('tea_sale')}
            selectedDate={selectedDate}
          />
        )}

        {activeTab === 'mfs' && (
          <MfsSimTracker
            balances={simBalances}
            onUpdateBalances={setSimBalances}
            onAddTransaction={handleAddTransaction}
            selectedDate={selectedDate}
            cashInHand={stats.cashInHand}
          />
        )}

        {activeTab === 'baki' && (
          <BakiKhata
            customers={customers}
            onAddOrUpdateCustomerDue={handleAddOrUpdateCustomerDue}
            onDeleteCustomer={handleDeleteCustomer}
            onAddTransaction={handleAddTransaction}
            selectedDate={selectedDate}
            shopName={settings.shopName}
          />
        )}

        {activeTab === 'partners' && (
          <PartnerKhata
            partners={partners}
            onUpdatePartners={setPartners}
            transactions={transactions}
            onAddTransaction={handleAddTransaction}
            selectedDate={selectedDate}
          />
        )}

        {activeTab === 'reports' && (
          <ReportsView
            transactions={transactions}
            partners={partners}
            selectedDate={selectedDate}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="no-print bg-white border-t border-stone-200 py-4 mt-auto text-center text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            {settings.shopName} · {settings.address} · {settings.mobile}
          </span>
          <div className="flex items-center gap-3 text-[11px] text-stone-400">
            <span>২ অংশীদার ডিজিটাল হিসাব খাতা</span>
            <span>·</span>
            <span>ক্যাশ ও ব্যালেন্স স্বয়ংক্রিয় সংরক্ষিত</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <NewEntryModal
        isOpen={isNewEntryOpen}
        onClose={() => setIsNewEntryOpen(false)}
        onAddTransaction={handleAddTransaction}
        onAddOrUpdateCustomerDue={handleAddOrUpdateCustomerDue}
        customers={customers}
        partners={partners}
        settings={settings}
        defaultTab={newEntryTab}
        selectedDate={selectedDate}
      />

      <DailyClosingModal
        isOpen={isClosingOpen}
        onClose={() => setIsClosingOpen(false)}
        selectedDate={selectedDate}
        openingCash={settings.openingCash}
        expectedClosingCash={stats.expectedClosingCash}
        salesTotal={stats.salesTotal}
        expenseTotal={stats.expenseTotal}
        commissionTotal={stats.commissionTotal}
        netProfit={stats.netProfit}
        bakiCollected={stats.bakiCollected}
        bakiGiven={stats.bakiGiven}
        partnerWithdrawn={stats.partnerWithdrawn}
        onSaveClosing={handleSaveClosing}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={setSettings}
        onDataReset={handleReloadData}
      />

      <PrintDailyReport
        isOpen={isPrintOpen}
        onClose={() => setIsPrintOpen(false)}
        selectedDate={selectedDate}
        transactions={selectedDateTransactions}
        partners={partners}
        settings={settings}
        cashInHand={stats.cashInHand}
      />
    </div>
  );
}
