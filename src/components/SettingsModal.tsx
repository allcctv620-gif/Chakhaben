import React, { useState } from 'react';
import {
  X,
  Settings,
  Save,
  Download,
  Upload,
  RotateCcw,
  Store,
  Percent,
} from 'lucide-react';
import { ShopSettings } from '../types';
import { exportAllDataAsJSON, importAllDataFromJSON, resetToDemoData } from '../utils/storage';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ShopSettings;
  onSaveSettings: (settings: ShopSettings) => void;
  onDataReset: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onDataReset,
}) => {
  const [formData, setFormData] = useState<ShopSettings>({ ...settings });
  const [importText, setImportText] = useState<string>('');
  const [importStatus, setImportStatus] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    onClose();
  };

  const handleExport = () => {
    const jsonStr = exportAllDataAsJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dokan_khata_backup_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
  };

  const handleImport = () => {
    if (!importText.trim()) return;
    const success = importAllDataFromJSON(importText);
    if (success) {
      setImportStatus('ডাটা সফলভাবে রিস্টোর হয়েছে!');
      setTimeout(() => {
        onDataReset();
        onClose();
      }, 1000);
    } else {
      setImportStatus('ভুল ফরম্যাট! সঠিক JSON ফাইল পেস্ট করুন।');
    }
  };

  const handleReset = () => {
    if (confirm('আপনি কি সব ডাটা মুছে দিয়ে ডেমো ডাটা রিসেট করতে চান? এই কাজ ফেরানো যাবে না।')) {
      resetToDemoData();
      onDataReset();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl border border-stone-200 w-full max-w-xl my-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200 bg-stone-50">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-stone-600" />
            <h2 className="text-base sm:text-lg font-bold text-stone-900">
              দোকান ও কমিশন সেটিংস
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Shop Information */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5 text-amber-600" />
              <span>দোকানের সাধারণ তথ্য</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-stone-600 mb-1 font-semibold">দোকানের নাম *</label>
                <input
                  type="text"
                  required
                  value={formData.shopName}
                  onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-stone-600 mb-1 font-semibold">ট্যাগলাইন / ধরণ</label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-stone-600 mb-1 font-semibold">মোবাইল নম্বর</label>
                <input
                  type="text"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg font-mono focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-stone-600 mb-1 font-semibold">ঠিকানা / লোকেশন</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* MFS Commission Rates */}
          <div className="space-y-3 pt-2 border-t border-stone-100">
            <h3 className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
              <Percent className="w-3.5 h-3.5 text-amber-600" />
              <span>মোবাইল ব্যাংকিং ও ফ্লেক্সিলোড কমিশন হার</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-stone-600 mb-1 font-semibold">
                  বিকাশ (প্রতি হাজারে ৳)
                </label>
                <input
                  type="number"
                  step="any"
                  value={formData.bkashCommissionRatePerThousand}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      bkashCommissionRatePerThousand: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg tabular-nums font-bold"
                />
                <span className="text-[10px] text-stone-400 mt-0.5 block">স্ট্যান্ডার্ড ৳ ৪.১৪</span>
              </div>

              <div>
                <label className="block text-stone-600 mb-1 font-semibold">
                  নগদ (প্রতি হাজারে ৳)
                </label>
                <input
                  type="number"
                  step="any"
                  value={formData.nagadCommissionRatePerThousand}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      nagadCommissionRatePerThousand: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg tabular-nums font-bold"
                />
                <span className="text-[10px] text-stone-400 mt-0.5 block">স্ট্যান্ডার্ড ৳ ৪.০০</span>
              </div>

              <div>
                <label className="block text-stone-600 mb-1 font-semibold">
                  ফ্লেক্সিলোড (%)
                </label>
                <input
                  type="number"
                  step="any"
                  value={formData.flexiCommissionRatePercent}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      flexiCommissionRatePercent: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg tabular-nums font-bold"
                />
                <span className="text-[10px] text-stone-400 mt-0.5 block">স্ট্যান্ডার্ড ২.৭০%</span>
              </div>
            </div>
          </div>

          {/* Backup & Restore */}
          <div className="space-y-3 pt-2 border-t border-stone-100">
            <h3 className="text-xs font-bold text-stone-700">
              ডাটা ব্যাকআপ ও রিস্টোর
            </h3>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleExport}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-md transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>কম্পিউটার/ফোনে ব্যাকআপ নামান (JSON)</span>
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-md transition-colors ml-auto"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>ডেমো ডাটা রিসেট</span>
              </button>
            </div>

            {/* Paste JSON to restore */}
            <div className="pt-2">
              <label className="block text-[11px] text-stone-500 mb-1">
                পূর্বের ব্যাকআপ কোড পেস্ট করে রিস্টোর করতে পারেন:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder="JSON ব্যাকআপ কোড এখানে পেস্ট করুন..."
                  className="flex-1 px-2.5 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-md font-mono"
                />
                <button
                  type="button"
                  onClick={handleImport}
                  className="px-3 py-1.5 text-xs font-bold text-stone-800 bg-stone-200 hover:bg-stone-300 rounded-md shrink-0"
                >
                  রিস্টোর
                </button>
              </div>
              {importStatus && (
                <p className="text-xs font-medium text-emerald-700 mt-1">
                  {importStatus}
                </p>
              )}
            </div>
          </div>

          {/* Footer Submit */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900"
            >
              বাতিল
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>সেটিংস সেভ করুন</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
