import React from 'react';
import { Store, Bell, User, UserCheck } from 'lucide-react';
import { StoreProfile, UserSession } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { LanguageToggle } from './LanguageToggle';

interface HeaderProps {
  store: StoreProfile;
  currentUser: UserSession;
  pendingRemindersCount: number;
  onOpenReminders: () => void;
  onOpenStoreSettings: () => void;
  onOpenLogin: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  store,
  currentUser,
  pendingRemindersCount,
  onOpenReminders,
  onOpenStoreSettings,
  onOpenLogin,
}) => {
  const { t } = useLanguage();

  return (
    <header className="bg-[#f7f9fc] w-full top-0 sticky flex justify-between items-center px-4 h-14 border-b border-[#c6c5d4]/40 z-40">
      <div 
        onClick={onOpenStoreSettings}
        className="flex items-center gap-2.5 cursor-pointer group"
      >
        <div className="w-8 h-8 rounded-full bg-[#1a237e] flex items-center justify-center text-white shadow-sm group-hover:opacity-90 transition-opacity flex-shrink-0">
          <Store className="w-4 h-4 text-white" />
        </div>
        <div className="min-w-0">
          <h1 className="text-lg font-bold text-[#000666] tracking-tight leading-none truncate">
            {t.appName}
          </h1>
          <span className="text-[10px] text-[#454652] font-medium block truncate">
            {store.name} {store.userRole === 'Staff' && <span className="bg-amber-100 text-amber-800 px-1 rounded text-[9px]">{t.staffBadge}</span>}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Customer Portal / Switch to Customer Login */}
        <button
          id="btn-header-customer-view"
          type="button"
          onClick={onOpenLogin}
          aria-label={t.customerLoginTitle}
          className="flex items-center gap-1.5 h-8.5 px-2.5 rounded-full bg-white hover:bg-[#eef1f6] active:bg-[#e2e7ef] text-[#000666] border border-[#c6c5d4]/80 shadow-xs transition-all cursor-pointer active:scale-95 flex-shrink-0"
        >
          <div className="w-5 h-5 rounded-full bg-[#000666]/10 text-[#000666] flex items-center justify-center text-[10px] font-bold">
            {currentUser.role === 'Staff' ? <UserCheck className="w-3 h-3 text-amber-700" /> : <User className="w-3 h-3" />}
          </div>
          <span className="text-xs font-bold max-w-[85px] sm:max-w-[120px] truncate">
            {currentUser.isLoggedIn ? currentUser.name.split(' ')[0] : t.customerLoginTitle}
          </span>
          <span className={`w-2 h-2 rounded-full ${currentUser.role === 'Owner' ? 'bg-[#006b5f]' : 'bg-amber-500'}`} />
        </button>

        {/* 2-Language Button (English | मराठी) */}
        <LanguageToggle variant="header" />

        <button
          id="btn-header-notifications"
          onClick={onOpenReminders}
          aria-label={t.notifications}
          className="relative w-8.5 h-8.5 rounded-full flex items-center justify-center text-[#454652] hover:bg-[#e6e8eb] transition-colors active:scale-95 flex-shrink-0"
        >
          <Bell className="w-4 h-4 text-[#000666]" />
          {pendingRemindersCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#ba1a1a] rounded-full ring-2 ring-white animate-pulse" />
          )}
        </button>
      </div>
    </header>
  );
};

