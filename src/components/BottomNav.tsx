import React from 'react';
import { Home, Users, BarChart3, Settings, BellRing } from 'lucide-react';
import { NavTab } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface BottomNavProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  pendingRemindersCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onSelectTab,
  pendingRemindersCount = 0,
}) => {
  const { t } = useLanguage();

  return (
    <nav className="bg-white fixed bottom-0 w-full md:max-w-md left-0 md:left-1/2 md:-translate-x-1/2 z-50 flex justify-around items-center px-2 py-2 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.06)] border-t border-[#c6c5d4]/40">
      {/* Home Tab */}
      <button
        id="nav-tab-home"
        onClick={() => onSelectTab('home')}
        className={`flex flex-col items-center justify-center rounded-xl py-1.5 px-2.5 min-w-[58px] transition-all duration-150 active:scale-95 cursor-pointer ${
          activeTab === 'home'
            ? 'bg-[#1a237e] text-white font-semibold shadow-sm'
            : 'text-[#454652] hover:bg-[#eceef1]'
        }`}
      >
        <Home className="w-5 h-5 mb-0.5" />
        <span className="text-[10px] sm:text-[11px] leading-tight truncate">{t.navHome}</span>
      </button>

      {/* Customers Tab */}
      <button
        id="nav-tab-customers"
        onClick={() => onSelectTab('customers')}
        className={`flex flex-col items-center justify-center rounded-xl py-1.5 px-2.5 min-w-[58px] transition-all duration-150 active:scale-95 cursor-pointer ${
          activeTab === 'customers'
            ? 'bg-[#1a237e] text-white font-semibold shadow-sm'
            : 'text-[#454652] hover:bg-[#eceef1]'
        }`}
      >
        <Users className="w-5 h-5 mb-0.5" />
        <span className="text-[10px] sm:text-[11px] leading-tight truncate">{t.navCustomers}</span>
      </button>

      {/* Reminders Hub Tab (from PRD 8-day engine) */}
      <button
        id="nav-tab-reminders"
        onClick={() => onSelectTab('reminders')}
        className={`relative flex flex-col items-center justify-center rounded-xl py-1.5 px-2.5 min-w-[58px] transition-all duration-150 active:scale-95 cursor-pointer ${
          activeTab === 'reminders'
            ? 'bg-[#1a237e] text-white font-semibold shadow-sm'
            : 'text-[#454652] hover:bg-[#eceef1]'
        }`}
      >
        <BellRing className="w-5 h-5 mb-0.5" />
        <span className="text-[10px] sm:text-[11px] leading-tight truncate">{t.navReminders}</span>
        {pendingRemindersCount > 0 && activeTab !== 'reminders' && (
          <span className="absolute top-1 right-2 w-2 h-2 bg-[#ba1a1a] rounded-full ring-2 ring-white" />
        )}
      </button>

      {/* Reports Tab */}
      <button
        id="nav-tab-reports"
        onClick={() => onSelectTab('reports')}
        className={`flex flex-col items-center justify-center rounded-xl py-1.5 px-2.5 min-w-[58px] transition-all duration-150 active:scale-95 cursor-pointer ${
          activeTab === 'reports'
            ? 'bg-[#1a237e] text-white font-semibold shadow-sm'
            : 'text-[#454652] hover:bg-[#eceef1]'
        }`}
      >
        <BarChart3 className="w-5 h-5 mb-0.5" />
        <span className="text-[10px] sm:text-[11px] leading-tight truncate">{t.navReports}</span>
      </button>

      {/* Settings Tab */}
      <button
        id="nav-tab-settings"
        onClick={() => onSelectTab('settings')}
        className={`flex flex-col items-center justify-center rounded-xl py-1.5 px-2.5 min-w-[58px] transition-all duration-150 active:scale-95 cursor-pointer ${
          activeTab === 'settings'
            ? 'bg-[#1a237e] text-white font-semibold shadow-sm'
            : 'text-[#454652] hover:bg-[#eceef1]'
        }`}
      >
        <Settings className="w-5 h-5 mb-0.5" />
        <span className="text-[10px] sm:text-[11px] leading-tight truncate">{t.navSettings}</span>
      </button>
    </nav>
  );
};

