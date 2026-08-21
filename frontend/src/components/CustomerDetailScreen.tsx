import React, { useState } from 'react';
import { 
  ArrowLeft, 
  MoreVertical, 
  Phone, 
  MessageSquare, 
  BellRing, 
  Filter, 
  Trash2, 
} from 'lucide-react';
import { Customer, Transaction, StoreProfile } from '../types';
import { formatCurrency, getInitials, getWhatsAppUrl } from '../utils/formatters';
import { useLanguage } from '../context/LanguageContext';
import { LanguageToggle } from './LanguageToggle';

interface CustomerDetailScreenProps {
  customer: Customer;
  transactions: Transaction[];
  store: StoreProfile;
  onBack: () => void;
  onGiveCredit: () => void;
  onRecordPayment: () => void;
  onToggleReminder: (enabled: boolean) => void;
  onOpenReminderModal: () => void;
  onDeleteCustomer?: (customerId: string) => void;
}

type TxFilter = 'all' | 'credit' | 'payment';

export const CustomerDetailScreen: React.FC<CustomerDetailScreenProps> = ({
  customer,
  transactions,
  store,
  onBack,
  onGiveCredit,
  onRecordPayment,
  onToggleReminder,
  onOpenReminderModal,
  onDeleteCustomer,
}) => {
  const { t, language, generateLocalizedReminder } = useLanguage();
  const [filterType, setFilterType] = useState<TxFilter>('all');
  const [showMenu, setShowMenu] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  // Filter transactions for this customer
  const customerTransactions = transactions
    .filter((tx) => tx.customerId === customer.id)
    .filter((tx) => {
      if (filterType === 'credit') return tx.type === 'CREDIT';
      if (filterType === 'payment') return tx.type === 'PAYMENT';
      return true;
    });

  const isOwed = customer.balance > 0;
  const isAdvance = customer.balance < 0;

  const handleCall = () => {
    window.open(`tel:${customer.phone}`, '_self');
  };

  const handleDirectWhatsApp = () => {
    const msg = generateLocalizedReminder(customer.name, customer.balance, store.name, store.upiId);
    window.open(getWhatsAppUrl(customer.phone, msg), '_blank');
  };

  return (
    <div className="min-h-screen bg-[#f7f9fc] flex flex-col max-w-md mx-auto w-full relative">
      {/* Top App Bar */}
      <header className="bg-white w-full top-0 sticky border-b border-[#c6c5d4]/40 z-40 flex justify-between items-center px-4 h-14 shadow-sm">
        <div className="flex items-center gap-2">
          <button
            id="btn-customer-back"
            onClick={onBack}
            className="text-[#454652] hover:bg-[#eceef1] active:opacity-80 transition-colors p-2 rounded-full -ml-2 cursor-pointer"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-[#191c1e]" />
          </button>
          <span className="text-xl font-bold text-[#000666] tracking-tight">
            {t.appName}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <LanguageToggle variant="header" />

          <div className="relative">
            <button
              id="btn-customer-menu"
              onClick={() => setShowMenu(!showMenu)}
              className="text-[#454652] hover:bg-[#eceef1] active:opacity-80 transition-colors p-2 rounded-full cursor-pointer"
              aria-label="Options"
            >
              <MoreVertical className="w-5 h-5 text-[#191c1e]" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-12 w-52 bg-white rounded-xl shadow-xl border border-[#c6c5d4]/50 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                <button
                  onClick={() => { setShowMenu(false); handleCall(); }}
                  className="w-full text-left px-3.5 py-2 text-xs flex items-center gap-2.5 text-[#191c1e] hover:bg-[#f2f4f7] cursor-pointer"
                >
                  <Phone className="w-4 h-4 text-[#000666]" />
                  <span>{t.callCustomer}</span>
                </button>
                <button
                  onClick={() => { setShowMenu(false); onOpenReminderModal(); }}
                  className="w-full text-left px-3.5 py-2 text-xs flex items-center gap-2.5 text-[#191c1e] hover:bg-[#f2f4f7] cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4 text-[#006b5f]" />
                  <span>{t.sendReminder}</span>
                </button>
                {onDeleteCustomer && (
                  <button
                    onClick={() => { 
                      setShowMenu(false); 
                      if (confirm(t.deleteConfirm)) {
                        onDeleteCustomer(customer.id);
                      }
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs flex items-center gap-2.5 text-[#ba1a1a] hover:bg-red-50 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4 text-[#ba1a1a]" />
                    <span>{t.deleteCustomer}</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Canvas */}
      <main className="flex-1 px-4 py-4 flex flex-col gap-4 pb-32">
        {/* Customer Profile Summary Card */}
        <section className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-4 flex flex-col items-center border border-[#c6c5d4]/40">
          {/* Avatar */}
          <div className="w-16 h-16 bg-[#1a237e] text-white rounded-full flex items-center justify-center font-bold text-xl mb-2.5 shadow-md">
            {getInitials(customer.name)}
          </div>

          <h1 className="text-xl font-bold text-[#191c1e] text-center">
            {customer.name}
          </h1>

          <div className="flex items-center gap-3 mt-1 text-[#454652]">
            <a 
              href={`tel:${customer.phone}`}
              className="flex items-center gap-1.5 text-xs font-semibold text-[#000666] bg-[#eceef1] px-2.5 py-1 rounded-full hover:bg-[#e0e3e6] transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>{customer.phone}</span>
            </a>
          </div>

          {/* TOTAL BALANCE DUE CARD */}
          <div
            className={`w-full mt-4 rounded-xl p-4 flex flex-col items-center justify-center border transition-colors ${
              isOwed
                ? 'bg-[#ffdad6]/60 text-[#93000a] border-[#ba1a1a]/20'
                : isAdvance
                ? 'bg-[#8df5e4]/40 text-[#007165] border-[#006b5f]/20'
                : 'bg-[#eceef1] text-[#454652] border-[#c6c5d4]'
            }`}
          >
            <span className="text-[11px] font-bold uppercase tracking-wider opacity-85 mb-0.5">
              {isOwed ? t.balanceDue : isAdvance ? t.advanceBalance : t.accountSettled}
            </span>
            <div className="text-[36px] font-bold tracking-tight font-display my-0.5 leading-none">
              ₹ {formatCurrency(customer.balance)}
            </div>
            <span className="text-xs font-semibold mt-1">
              {isOwed
                ? `${customer.name} - ${t.youWillGet}`
                : isAdvance
                ? `${t.youWillGive} (${t.filterAdvance})`
                : t.accountSettled}
            </span>
          </div>

          {/* Quick WhatsApp Nudge Button if balance is due */}
          {isOwed && (
            <button
              onClick={onOpenReminderModal}
              className="w-full mt-3 py-2 px-3 bg-[#006b5f]/10 text-[#006b5f] hover:bg-[#006b5f]/20 border border-[#006b5f]/30 rounded-xl text-xs font-bold flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{t.sendReminder}</span>
            </button>
          )}
        </section>

        {/* Reminders Toggle Card */}
        <div className="bg-white rounded-2xl p-3.5 border border-[#c6c5d4]/40 flex justify-between items-center shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#8df5e4]/60 text-[#007165] flex items-center justify-center flex-shrink-0">
              <BellRing className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-[#191c1e]">
                {t.autoReminders8Day}
              </h3>
              <p className="text-[11px] text-[#767683]">
                {t.autoRemindersDesc}
              </p>
            </div>
          </div>

          {/* Custom Toggle */}
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              id="toggle-auto-reminders"
              type="checkbox"
              checked={customer.reminderEnabled}
              onChange={(e) => onToggleReminder(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-[#c6c5d4] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#000666]" />
          </label>
        </div>

        {/* Transaction History Header */}
        <div className="flex justify-between items-center px-1">
          <h2 className="text-lg font-bold text-[#191c1e]">{t.customerLedger}</h2>
          <div className="relative">
            <button
              id="btn-filter-transactions"
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className="flex items-center gap-1.5 bg-[#f2f4f7] px-3 py-1.5 rounded-full text-xs font-semibold text-[#454652] hover:bg-[#e6e8eb] transition-colors border border-[#c6c5d4]/60 cursor-pointer"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>{filterType === 'all' ? t.filterAllTx : filterType === 'credit' ? t.filterGave : t.filterGot}</span>
            </button>

            {showFilterMenu && (
              <div className="absolute right-0 top-9 w-36 bg-white rounded-xl shadow-lg border border-[#c6c5d4]/50 py-1 z-30">
                <button
                  onClick={() => { setFilterType('all'); setShowFilterMenu(false); }}
                  className={`w-full text-left px-3 py-1.5 text-xs cursor-pointer ${filterType === 'all' ? 'bg-[#f2f4f7] font-bold text-[#000666]' : 'text-[#191c1e]'}`}
                >
                  {t.filterAllTx}
                </button>
                <button
                  onClick={() => { setFilterType('credit'); setShowFilterMenu(false); }}
                  className={`w-full text-left px-3 py-1.5 text-xs cursor-pointer ${filterType === 'credit' ? 'bg-[#f2f4f7] font-bold text-[#000666]' : 'text-[#191c1e]'}`}
                >
                  {t.filterGave}
                </button>
                <button
                  onClick={() => { setFilterType('payment'); setShowFilterMenu(false); }}
                  className={`w-full text-left px-3 py-1.5 text-xs cursor-pointer ${filterType === 'payment' ? 'bg-[#f2f4f7] font-bold text-[#000666]' : 'text-[#191c1e]'}`}
                >
                  {t.filterGot}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Transaction List */}
        <div className="bg-white rounded-2xl border border-[#c6c5d4]/40 overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex flex-col divide-y divide-[#eceef1]">
          {customerTransactions.length === 0 ? (
            <div className="p-8 text-center text-[#767683]">
              <p className="text-xs">{t.noTxForFilter}</p>
            </div>
          ) : (
            customerTransactions.map((tx) => {
              const isCredit = tx.type === 'CREDIT';
              return (
                <div
                  key={tx.id}
                  id={`cust-tx-${tx.id}`}
                  className="flex items-center p-3.5 relative min-h-[64px] hover:bg-[#f7f9fc] transition-colors"
                >
                  {/* Left color bar */}
                  <div
                    className={`absolute left-0 top-0 bottom-0 w-1 ${
                      isCredit ? 'bg-[#ba1a1a]' : 'bg-[#006b5f]'
                    }`}
                  />

                  <div className="flex-grow pl-2 pr-2">
                    <p className="text-sm font-bold text-[#191c1e]">
                      {tx.note || (isCredit ? (language === 'mr' ? 'उधारी नोंद' : 'Credit Entry') : (language === 'mr' ? 'पेमेंट जमा' : 'Payment Received'))}
                    </p>
                    <p className="text-xs text-[#767683] mt-0.5">
                      {tx.formattedDate || new Date(tx.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      {' • '}
                      {tx.formattedTime || new Date(tx.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p
                      className={`text-sm font-bold font-display ${
                        isCredit ? 'text-[#ba1a1a]' : 'text-[#006b5f]'
                      }`}
                    >
                      ₹ {formatCurrency(tx.amount)}
                    </p>
                    <p
                      className={`text-[11px] font-semibold ${
                        isCredit ? 'text-[#ba1a1a]/80' : 'text-[#006b5f]/80'
                      }`}
                    >
                      {isCredit ? t.filterGave : t.filterGot}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      {/* Split Action Footer (Contextual Actions from Screenshot) */}
      <div className="fixed bottom-0 left-0 md:left-1/2 md:-translate-x-1/2 w-full md:max-w-md z-40 bg-white border-t border-[#c6c5d4]/60 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] p-3 flex gap-3 pb-safe">
        <button
          id="btn-split-you-gave"
          onClick={onGiveCredit}
          className="flex-1 bg-[#ba1a1a] hover:bg-[#a01616] text-white h-12 rounded-xl font-bold text-sm flex flex-col items-center justify-center active:scale-[0.98] transition-all shadow-md cursor-pointer"
        >
          <span className="text-[10px] uppercase tracking-wider opacity-90 leading-none">
            {t.gaveCredit.toUpperCase()}
          </span>
          <span className="text-sm font-bold mt-0.5">₹ {language === 'mr' ? 'उधारी' : 'RED'}</span>
        </button>

        <button
          id="btn-split-you-got"
          onClick={onRecordPayment}
          className="flex-1 bg-[#006b5f] hover:bg-[#00554c] text-white h-12 rounded-xl font-bold text-sm flex flex-col items-center justify-center active:scale-[0.98] transition-all shadow-md cursor-pointer"
        >
          <span className="text-[10px] uppercase tracking-wider opacity-90 leading-none">
            {t.gotPayment.toUpperCase()}
          </span>
          <span className="text-sm font-bold mt-0.5">₹ {language === 'mr' ? 'जमा' : 'GREEN'}</span>
        </button>
      </div>
    </div>
  );
};

