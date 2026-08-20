import React, { useState } from 'react';
import { ArrowLeft, MessageSquare, Copy, Check, ExternalLink, Phone } from 'lucide-react';
import { Customer, StoreProfile } from '../types';
import { formatCurrency, getWhatsAppUrl, getSMSUrl } from '../utils/formatters';
import { useLanguage } from '../context/LanguageContext';

interface ReminderMessageModalProps {
  isOpen: boolean;
  customer: Customer | null;
  store: StoreProfile;
  onClose: () => void;
  onSent: (customerId: string, channel: 'WHATSAPP' | 'SMS') => void;
}

export const ReminderMessageModal: React.FC<ReminderMessageModalProps> = ({
  isOpen,
  customer,
  store,
  onClose,
  onSent,
}) => {
  const { t, language, generateLocalizedReminder } = useLanguage();
  const [copied, setCopied] = useState(false);

  if (!isOpen || !customer) return null;

  const message = generateLocalizedReminder(
    customer.name,
    customer.balance,
    store.name,
    store.upiId
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppSend = () => {
    onSent(customer.id, 'WHATSAPP');
    window.open(getWhatsAppUrl(customer.phone, message), '_blank');
    onClose();
  };

  const handleSMSSend = () => {
    onSent(customer.id, 'SMS');
    window.open(getSMSUrl(customer.phone, message), '_self');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] flex flex-col justify-end md:justify-center items-center">
      <div className="bg-[#f7f9fc] w-full md:max-w-md h-auto max-h-[90vh] md:rounded-3xl flex flex-col overflow-y-auto shadow-2xl animate-in slide-in-from-bottom duration-200">
        {/* Header */}
        <header className="bg-white w-full sticky top-0 border-b border-[#c6c5d4]/40 z-10 flex justify-between items-center px-4 h-14 shadow-sm">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="text-[#454652] hover:bg-[#eceef1] active:opacity-80 transition-colors p-2 rounded-full -ml-2 cursor-pointer"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5 text-[#191c1e]" />
            </button>
            <h1 className="text-lg font-bold text-[#000666]">{t.sendReminder}</h1>
          </div>
        </header>

        {/* Content */}
        <div className="p-4 flex flex-col gap-4">
          {/* Customer info */}
          <div className="bg-white rounded-2xl p-3.5 border border-[#c6c5d4]/40 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs text-[#767683]">{language === 'mr' ? 'ग्राहक' : 'Recipient'}</p>
              <h3 className="text-sm font-bold text-[#191c1e]">{customer.name}</h3>
              <p className="text-xs text-[#454652]">{customer.phone}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-[#767683]">{t.balanceDue}</p>
              <p className="text-base font-bold text-[#ba1a1a] font-display">
                ₹ {formatCurrency(customer.balance)}
              </p>
            </div>
          </div>

          {/* Message Preview (Faithful to PRD Section 9.9) */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center px-1">
              <label className="text-xs font-bold text-[#454652]">
                {language === 'mr' ? 'स्मरणपत्र संदेश (मराठी)' : 'Standard Reminder Template (English)'}
              </label>
              <button
                type="button"
                onClick={handleCopy}
                className="text-[11px] font-bold text-[#000666] flex items-center gap-1 hover:underline cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? (language === 'mr' ? 'कॉपी केले!' : 'Copied!') : (language === 'mr' ? 'कॉपी करा' : 'Copy Text')}</span>
              </button>
            </div>

            <div className="bg-[#e7f7f4] border border-[#70d8c8] rounded-2xl p-3.5 text-xs text-[#00201c] whitespace-pre-line leading-relaxed shadow-inner font-medium">
              {message}
            </div>
            <p className="text-[10px] text-[#767683] px-1">
              • {t.autoRemindersDesc}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-2.5 pt-2">
            <button
              id="btn-send-whatsapp"
              type="button"
              onClick={handleWhatsAppSend}
              className="w-full h-12 bg-[#006b5f] hover:bg-[#00554c] text-white font-bold text-sm rounded-xl shadow-md active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>{language === 'mr' ? 'WhatsApp वर पाठवा' : 'Send via WhatsApp'}</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </button>

            <button
              id="btn-send-sms"
              type="button"
              onClick={handleSMSSend}
              className="w-full h-11 bg-white hover:bg-[#eceef1] text-[#000666] border border-[#c6c5d4] font-bold text-xs rounded-xl shadow-sm active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>{language === 'mr' ? 'साध्या SMS द्वारे पाठवा' : 'Send via Regular SMS'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

