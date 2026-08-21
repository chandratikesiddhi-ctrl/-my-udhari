import React, { useState } from 'react';
import { 
  X, 
  Store, 
  UserCheck, 
  KeyRound, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import { StoreProfile, UserSession } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface StoreLoginModalProps {
  isOpen: boolean;
  store: StoreProfile;
  onClose: () => void;
  onStoreLogin: (session: UserSession) => void;
}

export const StoreLoginModal: React.FC<StoreLoginModalProps> = ({
  isOpen,
  store,
  onClose,
  onStoreLogin,
}) => {
  const { t, language } = useLanguage();
  const [selectedRole, setSelectedRole] = useState<'Owner' | 'Staff'>('Owner');
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Default PIN check (1234 or any 4 digit PIN)
    if (pin.length < 4) {
      setErrorMsg(language === 'mr' ? 'कृपया ४ अंकी पिन टाका' : 'Please enter 4-digit PIN');
      return;
    }

    if (selectedRole === 'Owner') {
      const ownerSession: UserSession = {
        id: 'owner-session',
        name: store.ownerName || 'Rajesh Sharma',
        phone: store.phone || '+91 98230 12345',
        role: 'Owner',
        isLoggedIn: true,
      };
      onStoreLogin(ownerSession);
    } else {
      const staffSession: UserSession = {
        id: 'staff-session',
        name: 'Suresh Kumar (Staff)',
        phone: '+91 98220 54321',
        role: 'Staff',
        isLoggedIn: true,
      };
      onStoreLogin(staffSession);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div 
        id="store-login-dialog"
        className="bg-white w-full max-w-sm rounded-3xl shadow-2xl border border-[#c6c5d4]/60 overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="bg-[#000666] text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
              <ShieldCheck className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold leading-tight">{t.staffLoginTitle}</h2>
              <p className="text-[11px] text-white/80">{store.name}</p>
            </div>
          </div>
          <button
            id="btn-close-store-login"
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleLoginSubmit} className="p-5 space-y-4">
          <p className="text-xs text-[#454652] font-medium leading-relaxed">
            {t.staffLoginSubtitle}
          </p>

          {/* Role selector */}
          <div className="grid grid-cols-2 gap-2 bg-[#f0f2f5] p-1 rounded-2xl">
            <button
              type="button"
              onClick={() => { setSelectedRole('Owner'); setErrorMsg(''); }}
              className={`py-2 px-3 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                selectedRole === 'Owner'
                  ? 'bg-white text-[#000666] shadow-xs'
                  : 'text-[#454652] hover:text-[#191c1e]'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>{t.ownerAccount}</span>
            </button>
            <button
              type="button"
              onClick={() => { setSelectedRole('Staff'); setErrorMsg(''); }}
              className={`py-2 px-3 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                selectedRole === 'Staff'
                  ? 'bg-white text-[#000666] shadow-xs'
                  : 'text-[#454652] hover:text-[#191c1e]'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>{t.staffAccount}</span>
            </button>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-[#ba1a1a] text-xs font-semibold flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* PIN Input */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label htmlFor="input-store-pin" className="text-xs font-bold text-[#191c1e]">
                {t.enterStaffPin}
              </label>
              <span className="text-[10px] text-[#767683]">{language === 'mr' ? 'डीफॉल्ट: १२३४' : 'Default: 1234'}</span>
            </div>
            <div className="relative">
              <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#767683]" />
              <input
                id="input-store-pin"
                type="password"
                maxLength={4}
                required
                autoFocus
                placeholder="••••"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                className="w-full h-11 pl-9 pr-3 rounded-xl bg-[#f7f9fc] border border-[#c6c5d4] text-center text-lg font-bold tracking-widest text-[#191c1e] outline-none focus:bg-white focus:border-[#000666] focus:ring-1 focus:ring-[#000666]"
              />
            </div>
          </div>

          <button
            id="btn-submit-store-login"
            type="submit"
            className="w-full h-11 bg-[#000666] hover:bg-[#1a237e] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-98"
          >
            <span>{t.loginToStoreLedger}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
