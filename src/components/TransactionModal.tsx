import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, CheckCircle2, FileText } from 'lucide-react';
import { Customer, TransactionType } from '../types';
import confetti from 'canvas-confetti';
import { useLanguage } from '../context/LanguageContext';

interface TransactionModalProps {
  isOpen: boolean;
  type: TransactionType;
  selectedCustomer: Customer | null;
  allCustomers: Customer[];
  onClose: () => void;
  onSubmit: (data: {
    customerId: string;
    type: TransactionType;
    amount: number;
    note: string;
    customDate?: string;
  }) => void;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  type,
  selectedCustomer,
  allCustomers,
  onClose,
  onSubmit,
}) => {
  const { t, language } = useLanguage();
  const [customerId, setCustomerId] = useState<string>('');
  const [amountStr, setAmountStr] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isCredit = type === 'CREDIT';

  // Quick note suggestions in English and Marathi
  const creditSuggestions = language === 'mr'
    ? ['किराणा सामान', 'दूध आणि डेअरी', 'खाद्यतेल १L', 'मसाले व साखर', 'गहू पीठ १०kg', 'बिस्किटे व चहापत्ती']
    : ['Groceries - 5kg Rice', 'Dairy & Milk', 'Cooking Oil 1L', 'Spices & Masala', 'Biscuits & Tea', 'Wheat Flour 10kg'];

  const paymentSuggestions = language === 'mr'
    ? ['रोख रक्कम (Cash)', 'UPI / फोनपे / GPay', 'काही रक्कम जमा', 'पूर्ण हिशोब चुकता']
    : ['Cash Payment', 'GPay / UPI Payment', 'Partial Cash Settlement', 'Full Payment Cleared'];

  useEffect(() => {
    if (isOpen) {
      if (selectedCustomer) {
        setCustomerId(selectedCustomer.id);
      } else if (allCustomers.length > 0) {
        setCustomerId(allCustomers[0].id);
      }
      setAmountStr('');
      setNote('');
      setErrorMsg('');
      setIsSubmitting(false);

      // Auto focus input
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    }
  }, [isOpen, selectedCustomer, allCustomers]);

  if (!isOpen) return null;

  const currentCustomer = allCustomers.find((c) => c.id === customerId) || selectedCustomer;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val.length <= 7) {
      setAmountStr(val);
      if (errorMsg) setErrorMsg('');
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) {
      setErrorMsg(language === 'mr' ? 'कृपया ग्राहक निवडा.' : 'Please select a customer.');
      return;
    }
    const numAmount = parseFloat(amountStr);
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMsg(language === 'mr' ? 'कृपया ₹० पेक्षा जास्त रक्कम टाका' : 'Please enter a valid amount greater than ₹0');
      return;
    }

    setIsSubmitting(true);

    if (!isCredit) {
      // Trigger small celebratory confetti for payment received
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#006b5f', '#8df5e4', '#1a237e'],
        });
      } catch (err) {
        // ignore if blocked
      }
    }

    onSubmit({
      customerId,
      type,
      amount: numAmount,
      note: note.trim() || (isCredit ? (language === 'mr' ? 'उधारी विक्री' : 'Credit Sale') : (language === 'mr' ? 'पेमेंट जमा' : 'Payment Received')),
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] flex flex-col justify-end md:justify-center items-center">
      <div className="bg-[#f7f9fc] w-full md:max-w-md h-full md:h-auto md:max-h-[92vh] md:rounded-3xl flex flex-col overflow-y-auto shadow-2xl animate-in slide-in-from-bottom duration-200">
        {/* Top App Bar */}
        <header className="bg-white w-full sticky top-0 border-b border-[#c6c5d4]/40 z-10 flex justify-between items-center px-4 h-14 shadow-sm">
          <div className="flex items-center gap-2">
            <button
              id="btn-tx-modal-back"
              type="button"
              onClick={onClose}
              className="text-[#454652] hover:bg-[#eceef1] active:opacity-80 transition-colors p-2 rounded-full -ml-2 cursor-pointer"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5 text-[#191c1e]" />
            </button>
          </div>
          <h1 className="text-lg font-bold text-[#000666]">
            {isCredit ? t.gaveCredit : t.gotPayment}
          </h1>
          <div className="w-8"></div>
        </header>

        {/* Form Body */}
        <form onSubmit={handleFormSubmit} className="flex-1 flex flex-col p-4 gap-4 pb-8">
          {/* Customer info / selector */}
          <div className="text-center mt-1">
            <p className="text-sm text-[#454652]">
              {isCredit ? (language === 'mr' ? 'उधारी दिली जाणाऱ्या ग्राहकाचे नाव' : 'Giving credit to') : (language === 'mr' ? 'जमा रक्कम देणाऱ्या ग्राहकाचे नाव' : 'Recording payment from')}
            </p>
            {selectedCustomer ? (
              <h2 className="text-xl font-bold text-[#000666] mt-0.5 font-display">
                {selectedCustomer.name}
              </h2>
            ) : (
              <div className="mt-2 text-left max-w-xs mx-auto">
                <label className="text-xs font-semibold text-[#767683] block mb-1">
                  {t.selectCustomer}
                </label>
                <select
                  id="select-tx-customer"
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl bg-white border border-[#c6c5d4] text-sm font-semibold text-[#191c1e] focus:border-[#000666] outline-none shadow-sm"
                >
                  {allCustomers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.phone}) - Bal: ₹{c.balance}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Amount Input Card */}
          <div className="bg-white rounded-2xl p-6 shadow-[0_4px_16px_rgba(0,6,102,0.08)] border border-[#c6c5d4]/40 flex flex-col items-center">
            <label htmlFor="tx-amount" className="text-xs font-bold text-[#767683] uppercase tracking-wider mb-2">
              {t.amount}
            </label>
            <div className="flex items-center justify-center border-b-2 border-[#000666] pb-2 w-full max-w-[220px]">
              <span
                className={`text-3xl font-bold mr-2 font-display ${
                  isCredit ? 'text-[#ba1a1a]' : 'text-[#006b5f]'
                }`}
              >
                ₹
              </span>
              <input
                ref={inputRef}
                id="tx-amount"
                type="number"
                inputMode="numeric"
                placeholder="0"
                value={amountStr}
                onChange={handleAmountChange}
                className={`text-3xl font-bold bg-transparent border-none p-0 focus:ring-0 text-center w-full outline-none font-display placeholder:text-[#c6c5d4] ${
                  isCredit ? 'text-[#ba1a1a]' : 'text-[#006b5f]'
                }`}
                autoFocus
              />
            </div>
            {currentCustomer && (
              <p className="text-xs text-[#767683] mt-3">
                {t.currentBalance}: <span className="font-semibold">₹{Math.abs(currentCustomer.balance)}</span>
                {currentCustomer.balance > 0 ? ` (${t.balanceDue})` : currentCustomer.balance < 0 ? ` (${t.filterAdvance})` : ` (${t.settled})`}
              </p>
            )}
          </div>

          {/* Note Input */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="tx-note" className="text-xs font-bold text-[#454652]">
              {t.addNoteOptional}
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#767683]" />
              <input
                id="tx-note"
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={isCredit ? (language === 'mr' ? 'उदा. किराणा - ५ किलो तांदूळ' : 'e.g., Groceries - 5kg Rice') : (language === 'mr' ? 'उदा. रोख पेमेंट / Google Pay' : 'e.g., Cash Payment / GPay')}
                className="w-full h-11 pl-9 pr-3 rounded-xl bg-white border border-[#c6c5d4]/60 text-sm text-[#191c1e] placeholder:text-[#767683] focus:border-[#000666] focus:ring-1 focus:ring-[#000666] outline-none transition-colors shadow-sm"
              />
            </div>

            {/* Quick chips suggestions */}
            <div className="flex flex-wrap gap-1.5 mt-1">
              {(isCredit ? creditSuggestions : paymentSuggestions).slice(0, 4).map((sug, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setNote(sug)}
                  className="text-[11px] font-medium bg-[#eceef1] hover:bg-[#e0e3e6] text-[#454652] px-2.5 py-1 rounded-full transition-colors active:scale-95 cursor-pointer"
                >
                  + {sug}
                </button>
              ))}
            </div>
          </div>

          {errorMsg && (
            <p className="text-xs font-semibold text-[#ba1a1a] bg-red-50 p-2.5 rounded-xl border border-red-200 text-center">
              {errorMsg}
            </p>
          )}

          {/* Confirm Button */}
          <div className="mt-auto pt-4">
            <button
              id="btn-tx-submit"
              type="submit"
              disabled={isSubmitting}
              className={`w-full h-12 text-white font-bold text-base rounded-xl shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer ${
                isCredit
                  ? 'bg-[#ba1a1a] hover:bg-[#a01616]'
                  : 'bg-[#006b5f] hover:bg-[#00554c]'
              }`}
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>{isCredit ? t.confirmCredit : t.confirmPayment}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

