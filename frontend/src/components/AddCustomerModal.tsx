import React, { useState } from 'react';
import { ArrowLeft, UserPlus, Phone, User, FileText, BellRing } from 'lucide-react';
import { Customer } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface AddCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCustomer: (customerData: {
    name: string;
    phone: string;
    initialBalance: number;
    reminderEnabled: boolean;
    notes?: string;
  }) => void;
  existingCustomers: Customer[];
}

export const AddCustomerModal: React.FC<AddCustomerModalProps> = ({
  isOpen,
  onClose,
  onAddCustomer,
  existingCustomers,
}) => {
  const { t, language } = useLanguage();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+91 ');
  const [balanceType, setBalanceType] = useState<'NONE' | 'GET' | 'GIVE'>('NONE');
  const [balanceAmount, setBalanceAmount] = useState('');
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg(language === 'mr' ? 'ग्राहकाचे नाव आवश्यक आहे.' : 'Customer name is required.');
      return;
    }

    const cleanPhone = phone.trim();
    if (cleanPhone.length < 10) {
      setErrorMsg(language === 'mr' ? 'कृपया वैध १० अंकी मोबाईल नंबर टाका.' : 'Please enter a valid 10-digit mobile number.');
      return;
    }

    // Check duplicate phone (PRD Section 10)
    const isDuplicate = existingCustomers.some(
      (c) => c.phone.replace(/[^0-9]/g, '') === cleanPhone.replace(/[^0-9]/g, '')
    );
    if (isDuplicate) {
      setErrorMsg(language === 'mr' ? 'या मोबाईल नंबरचा ग्राहक आधीपासून अस्तित्वात आहे.' : 'A customer with this phone number already exists.');
      return;
    }

    let initialBal = 0;
    if (balanceType === 'GET') {
      initialBal = parseFloat(balanceAmount) || 0;
    } else if (balanceType === 'GIVE') {
      initialBal = -(parseFloat(balanceAmount) || 0);
    }

    onAddCustomer({
      name: name.trim(),
      phone: cleanPhone,
      initialBalance: initialBal,
      reminderEnabled,
      notes: notes.trim(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] flex flex-col justify-end md:justify-center items-center">
      <div className="bg-[#f7f9fc] w-full md:max-w-md h-full md:h-auto md:max-h-[90vh] md:rounded-3xl flex flex-col overflow-y-auto shadow-2xl animate-in slide-in-from-bottom duration-200">
        {/* Header */}
        <header className="bg-white w-full sticky top-0 border-b border-[#c6c5d4]/40 z-10 flex justify-between items-center px-4 h-14 shadow-sm">
          <div className="flex items-center gap-2">
            <button
              id="btn-add-customer-back"
              type="button"
              onClick={onClose}
              className="text-[#454652] hover:bg-[#eceef1] active:opacity-80 transition-colors p-2 rounded-full -ml-2 cursor-pointer"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5 text-[#191c1e]" />
            </button>
            <h1 className="text-lg font-bold text-[#000666]">{t.addNewCustomer}</h1>
          </div>
        </header>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col p-4 gap-4 pb-8">
          {/* Customer Name */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="cust-name-input" className="text-xs font-bold text-[#191c1e]">
              {t.customerName} <span className="text-[#ba1a1a]">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#767683]" />
              <input
                id="cust-name-input"
                type="text"
                required
                placeholder={language === 'mr' ? 'उदा. राहुल पाटील' : 'e.g., Rajesh Sharma'}
                value={name}
                onChange={(e) => { setName(e.target.value); setErrorMsg(''); }}
                className="w-full h-11 pl-9 pr-3 rounded-xl bg-white border border-[#c6c5d4]/70 text-sm text-[#191c1e] focus:border-[#000666] focus:ring-1 focus:ring-[#000666] outline-none shadow-sm"
                autoFocus
              />
            </div>
          </div>

          {/* Phone Number */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="cust-phone-input" className="text-xs font-bold text-[#191c1e]">
              {t.phoneNumber} <span className="text-[#ba1a1a]">*</span>
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#767683]" />
              <input
                id="cust-phone-input"
                type="tel"
                required
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => { setPhone(e.target.value); setErrorMsg(''); }}
                className="w-full h-11 pl-9 pr-3 rounded-xl bg-white border border-[#c6c5d4]/70 text-sm text-[#191c1e] focus:border-[#000666] focus:ring-1 focus:ring-[#000666] outline-none shadow-sm"
              />
            </div>
          </div>

          {/* Starting Balance */}
          <div className="flex flex-col gap-2 bg-white p-3.5 rounded-2xl border border-[#c6c5d4]/40 shadow-sm">
            <label className="text-xs font-bold text-[#191c1e]">
              {t.currentBalance}
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setBalanceType('NONE')}
                className={`py-2 px-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                  balanceType === 'NONE'
                    ? 'bg-[#1a237e] text-white border-transparent shadow-sm'
                    : 'bg-[#f7f9fc] text-[#454652] border-[#c6c5d4]/60'
                }`}
              >
                ₹ 0 ({t.settled})
              </button>
              <button
                type="button"
                onClick={() => setBalanceType('GET')}
                className={`py-2 px-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                  balanceType === 'GET'
                    ? 'bg-[#ba1a1a] text-white border-transparent shadow-sm'
                    : 'bg-[#f7f9fc] text-[#ba1a1a] border-[#ba1a1a]/30'
                }`}
              >
                {t.youWillGet}
              </button>
              <button
                type="button"
                onClick={() => setBalanceType('GIVE')}
                className={`py-2 px-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                  balanceType === 'GIVE'
                    ? 'bg-[#006b5f] text-white border-transparent shadow-sm'
                    : 'bg-[#f7f9fc] text-[#006b5f] border-[#006b5f]/30'
                }`}
              >
                {t.youWillGive}
              </button>
            </div>

            {balanceType !== 'NONE' && (
              <div className="mt-2">
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder={language === 'mr' ? 'शिल्लक रक्कम टाका (₹)' : 'Enter opening balance (₹)'}
                  value={balanceAmount}
                  onChange={(e) => setBalanceAmount(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-[#f7f9fc] border border-[#c6c5d4] text-sm text-[#191c1e] font-semibold focus:border-[#000666] outline-none"
                />
              </div>
            )}
          </div>

          {/* 8-Day Auto Reminders Preference */}
          <div className="bg-white rounded-2xl p-3.5 border border-[#c6c5d4]/40 flex justify-between items-center shadow-sm">
            <div className="flex items-center gap-2.5">
              <BellRing className="w-4 h-4 text-[#006b5f]" />
              <div>
                <p className="text-xs font-bold text-[#191c1e]">{t.autoReminders8Day}</p>
                <p className="text-[11px] text-[#767683]">{t.autoRemindersDesc}</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={reminderEnabled}
                onChange={(e) => setReminderEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-[#c6c5d4] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#000666]" />
            </label>
          </div>

          {/* Address / Notes */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="cust-notes-input" className="text-xs font-bold text-[#191c1e]">
              {t.addNoteOptional}
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 absolute left-3 top-3 text-[#767683]" />
              <textarea
                id="cust-notes-input"
                rows={2}
                placeholder={language === 'mr' ? 'उदा. फ्लॅट २०३, जवळचे मंदिर किंवा पत्ता' : 'e.g., Flat 203, Galaxy Tower or relative of Suresh'}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-[#c6c5d4]/70 text-sm text-[#191c1e] placeholder:text-[#767683] focus:border-[#000666] outline-none shadow-sm resize-none"
              />
            </div>
          </div>

          {errorMsg && (
            <p className="text-xs font-semibold text-[#ba1a1a] bg-red-50 p-2.5 rounded-xl border border-red-200 text-center">
              {errorMsg}
            </p>
          )}

          {/* Submit */}
          <div className="mt-auto pt-4">
            <button
              id="btn-save-customer"
              type="submit"
              className="w-full h-12 bg-[#000666] hover:bg-[#1a237e] text-white font-bold text-base rounded-xl shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <UserPlus className="w-5 h-5" />
              <span>{t.addNewCustomer}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

