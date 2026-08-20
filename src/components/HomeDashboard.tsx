import React from 'react';
import { Minus, Plus, Users, ArrowRight, BellRing } from 'lucide-react';
import { Customer, Transaction, StoreProfile } from '../types';
import { formatCurrency, getInitials, formatRelativeTime } from '../utils/formatters';
import { useLanguage } from '../context/LanguageContext';

interface HomeDashboardProps {
  store: StoreProfile;
  customers: Customer[];
  transactions: Transaction[];
  totalOutstanding: number;
  onOpenGiveCredit: () => void;
  onOpenGotPayment: () => void;
  onSelectCustomer: (customerId: string) => void;
  onViewAllCustomers: () => void;
  onViewReminders: () => void;
  eligibleRemindersCount: number;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  store,
  customers,
  transactions,
  totalOutstanding,
  onOpenGiveCredit,
  onOpenGotPayment,
  onSelectCustomer,
  onViewAllCustomers,
  onViewReminders,
  eligibleRemindersCount,
}) => {
  const { t, language } = useLanguage();
  // Get recent 6 transactions
  const recentTransactions = transactions.slice(0, 6);
  const activeCustomersCount = customers.length;

  return (
    <main className="flex-1 px-4 py-4 flex flex-col gap-5 pb-28 max-w-md mx-auto w-full">
      {/* Store Identity & Summary Card */}
      <section className="bg-white rounded-2xl p-4 shadow-[0_4px_16px_rgba(0,6,102,0.08)] border border-[#c6c5d4]/40 flex flex-col gap-4">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-[11px] font-semibold text-[#454652] uppercase tracking-wider">
              {t.kiranaTag}
            </p>
            <h2 className="text-xl font-bold text-[#191c1e] tracking-tight">
              {store.name}
            </h2>
          </div>
          <div 
            onClick={onViewAllCustomers}
            className="bg-[#8df5e4]/40 text-[#007165] px-3 py-1 rounded-full flex items-center gap-1.5 cursor-pointer hover:bg-[#8df5e4]/60 transition-colors"
          >
            <Users className="w-3.5 h-3.5" />
            <span className="text-xs font-bold">{activeCustomersCount} {t.navCustomers}</span>
          </div>
        </div>

        {/* Total Outstanding Hero */}
        <div className="bg-[#1a237e] text-white rounded-xl p-4 flex flex-col items-center justify-center text-center shadow-inner">
          <p className="text-xs font-medium text-[#bdc2ff] mb-1">
            {t.totalOutstanding} ({t.youWillGet})
          </p>
          <div className="text-[34px] font-bold tracking-tight flex items-baseline gap-1 font-display">
            <span className="text-2xl font-semibold opacity-80">₹</span>
            <span>{formatCurrency(totalOutstanding)}</span>
          </div>
        </div>
      </section>

      {/* 8-Day Automated Reminder Prompt Banner */}
      {eligibleRemindersCount > 0 && (
        <div 
          onClick={onViewReminders}
          className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center justify-between cursor-pointer hover:bg-amber-100/70 transition-all shadow-sm group"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-800 flex-shrink-0">
              <BellRing className="w-4 h-4 animate-bounce" />
            </div>
            <div>
              <p className="text-xs font-bold text-amber-900">
                {eligibleRemindersCount} {t.eightDayAlertDesc}
              </p>
              <p className="text-[11px] text-amber-700">
                {t.viewRemindersBtn}
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-amber-800 bg-amber-200/70 px-2 py-1 rounded-lg">
            {t.viewRemindersBtn}
          </span>
        </div>
      )}

      {/* Quick Actions Grid */}
      <section className="grid grid-cols-2 gap-3">
        {/* Gave Credit Button (Red) */}
        <button
          id="btn-quick-gave-credit"
          onClick={onOpenGiveCredit}
          className="bg-[#ba1a1a]/10 hover:bg-[#ba1a1a]/15 active:scale-[0.98] transition-all rounded-2xl p-4 flex flex-col items-center justify-center gap-2 border border-[#ba1a1a]/20 h-24 cursor-pointer shadow-sm group"
        >
          <div className="w-10 h-10 rounded-full bg-[#ba1a1a] text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
            <Minus className="w-5 h-5 stroke-[2.5]" />
          </div>
          <span className="text-sm text-[#ba1a1a] font-bold tracking-tight">
            {t.gaveCredit}
          </span>
        </button>

        {/* Got Payment Button (Green) */}
        <button
          id="btn-quick-got-payment"
          onClick={onOpenGotPayment}
          className="bg-[#006b5f]/10 hover:bg-[#006b5f]/15 active:scale-[0.98] transition-all rounded-2xl p-4 flex flex-col items-center justify-center gap-2 border border-[#006b5f]/20 h-24 cursor-pointer shadow-sm group"
        >
          <div className="w-10 h-10 rounded-full bg-[#006b5f] text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </div>
          <span className="text-sm text-[#006b5f] font-bold tracking-tight">
            {t.gotPayment}
          </span>
        </button>
      </section>

      {/* Recent Activity */}
      <section className="flex flex-col gap-2">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-lg font-bold text-[#191c1e] tracking-tight">
            {t.recentActivity}
          </h3>
          <button
            id="btn-view-all-activity"
            onClick={onViewAllCustomers}
            className="text-xs font-bold text-[#000666] hover:text-[#1a237e] px-2 py-1 hover:bg-[#eceef1] rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span>{t.viewAll}</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Transaction List */}
        <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-[#c6c5d4]/40 overflow-hidden flex flex-col divide-y divide-[#eceef1]">
          {recentTransactions.length === 0 ? (
            <div className="p-8 text-center text-[#454652]">
              <p className="text-sm">{t.noTransactionsYet}</p>
              <p className="text-xs text-[#767683] mt-1">{t.startByRecording}</p>
            </div>
          ) : (
            recentTransactions.map((tx) => {
              const isCredit = tx.type === 'CREDIT';
              return (
                <div
                  key={tx.id}
                  id={`tx-row-${tx.id}`}
                  onClick={() => onSelectCustomer(tx.customerId)}
                  className="flex items-center p-3.5 relative min-h-[64px] hover:bg-[#f2f4f7] active:bg-[#e6e8eb] transition-colors cursor-pointer"
                >
                  {/* Left color bar (4px) */}
                  <div
                    className={`absolute left-0 top-0 bottom-0 w-1 ${
                      isCredit ? 'bg-[#ba1a1a]' : 'bg-[#006b5f]'
                    }`}
                  />

                  {/* Avatar Circle */}
                  <div className="w-10 h-10 rounded-full bg-[#e0e3e6] flex items-center justify-center text-[#191c1e] font-bold text-sm mr-3 ml-2 flex-shrink-0">
                    {getInitials(tx.customerName)}
                  </div>

                  {/* Customer & Timestamp */}
                  <div className="flex-1 min-w-0 pr-2">
                    <p className="text-sm font-bold text-[#191c1e] truncate leading-tight">
                      {tx.customerName}
                    </p>
                    <p className="text-xs text-[#767683] mt-0.5 truncate">
                      {tx.formattedDate ? `${tx.formattedDate}, ${tx.formattedTime}` : formatRelativeTime(tx.timestamp)}
                      {tx.note && <span className="text-[#454652]"> • {tx.note}</span>}
                    </p>
                  </div>

                  {/* Amount & Label */}
                  <div className="text-right flex-shrink-0">
                    <p
                      className={`text-sm font-bold font-display ${
                        isCredit ? 'text-[#ba1a1a]' : 'text-[#006b5f]'
                      }`}
                    >
                      ₹ {formatCurrency(tx.amount)}
                    </p>
                    <p className="text-[11px] font-medium text-[#767683]">
                      {isCredit ? (language === 'mr' ? 'उधारी' : 'Credit') : (language === 'mr' ? 'जमा' : 'Payment')}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </main>
  );
};

