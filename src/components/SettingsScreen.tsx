import React, { useState } from 'react';
import { 
  Store, 
  User, 
  Phone, 
  MapPin, 
  QrCode, 
  BellRing, 
  ShieldCheck, 
  RotateCcw, 
  Download, 
  Check, 
  Sliders, 
  Save, 
  History,
  AlertTriangle,
  LogIn,
  UserCheck
} from 'lucide-react';
import { StoreProfile, AuditLog, UserSession } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface SettingsScreenProps {
  store: StoreProfile;
  currentUser?: UserSession;
  auditLogs: AuditLog[];
  onUpdateStore: (updated: Partial<StoreProfile>) => void;
  onResetDemoData: () => void;
  onExportBackupJSON: () => void;
  onOpenLogin?: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  store,
  currentUser,
  auditLogs,
  onUpdateStore,
  onResetDemoData,
  onExportBackupJSON,
  onOpenLogin,
}) => {
  const { t, language } = useLanguage();
  const [storeName, setStoreName] = useState(store.name);
  const [ownerName, setOwnerName] = useState(store.ownerName);
  const [phone, setPhone] = useState(store.phone);
  const [address, setAddress] = useState(store.address);
  const [upiId, setUpiId] = useState(store.upiId);
  const [reminderInterval, setReminderInterval] = useState(store.reminderIntervalDays || 8);
  const [autoReminders, setAutoReminders] = useState(store.autoRemindersEnabled);
  const [userRole, setUserRole] = useState<'Owner' | 'Staff'>(store.userRole);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [showLogs, setShowLogs] = useState(false);

  // Backup status calculation
  const lastBackupDate = store.lastBackupDate;
  let daysSinceBackup: number | null = null;
  let isOverdue = false;
  let formattedBackupDate = '';

  if (lastBackupDate) {
    const backupTime = new Date(lastBackupDate).getTime();
    const diffMs = Math.max(0, Date.now() - backupTime);
    daysSinceBackup = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    isOverdue = daysSinceBackup > 7;

    const d = new Date(lastBackupDate);
    formattedBackupDate = d.toLocaleDateString(language === 'mr' ? 'mr-IN' : 'en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } else {
    isOverdue = true; // Never backed up
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateStore({
      name: storeName.trim() || 'Kirana Store',
      ownerName: ownerName.trim(),
      phone: phone.trim(),
      address: address.trim(),
      upiId: upiId.trim(),
      reminderIntervalDays: Number(reminderInterval),
      autoRemindersEnabled: autoReminders,
      userRole,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <main className="flex-1 px-4 py-4 flex flex-col gap-4 pb-28 max-w-md mx-auto w-full">
      {/* Header */}
      <div className="flex justify-between items-center px-1">
        <div>
          <h2 className="text-xl font-bold text-[#000666] tracking-tight">{t.storeSettingsTitle}</h2>
          <p className="text-xs text-[#767683]">{t.storeSettingsSubtitle}</p>
        </div>
      </div>

      {savedSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{language === 'mr' ? 'बदल यशस्वीरित्या सेव्ह केले!' : 'Settings saved successfully!'}</span>
        </div>
      )}

      {/* Backup Status Banner (PRD & 7-Day prompt) */}
      {isOverdue ? (
        <div
          id="banner-backup-overdue"
          className="bg-amber-50/95 border border-amber-300 rounded-2xl p-4 shadow-sm flex flex-col gap-3 transition-all"
        >
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-200/90 flex items-center justify-center text-amber-800 flex-shrink-0 mt-0.5 shadow-xs">
              <AlertTriangle className="w-5 h-5 text-amber-700" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <h3 className="text-xs font-bold text-amber-950 uppercase tracking-wide">
                  {t.backupOverdueTitle}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 border border-amber-300/60">
                  {daysSinceBackup !== null ? `${daysSinceBackup} ${t.daysAgoText}` : t.noBackupYet}
                </span>
              </div>
              <p className="text-xs text-amber-900/90 mt-1 leading-relaxed">
                {lastBackupDate
                  ? `${language === 'mr' ? 'शेवटचा बॅकअप' : 'Last backup was downloaded on'} ${formattedBackupDate} (${daysSinceBackup} ${t.daysAgoText}). ${t.backupOverdueDesc}`
                  : t.backupOverdueDesc}
              </p>
            </div>
          </div>

          <button
            id="btn-banner-download-backup"
            type="button"
            onClick={onExportBackupJSON}
            className="w-full h-10 bg-amber-800 hover:bg-amber-900 active:bg-amber-950 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer active:scale-[0.98]"
          >
            <Download className="w-4 h-4" />
            <span>{t.downloadNewBackupBtn}</span>
          </button>
        </div>
      ) : (
        <div
          id="banner-backup-uptodate"
          className="bg-emerald-50/90 border border-emerald-200/90 rounded-2xl p-3.5 shadow-sm flex items-center justify-between gap-3"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-emerald-100/90 border border-emerald-200 flex items-center justify-center text-emerald-800 flex-shrink-0">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold text-emerald-950">
                  {t.backupUpToDateTitle}
                </h3>
                <span className="text-[10px] font-semibold px-1.5 py-0.2 bg-emerald-200/70 text-emerald-900 rounded-md">
                  {daysSinceBackup === 0 ? (language === 'mr' ? 'आज' : 'Today') : `${daysSinceBackup} ${t.daysAgoText}`}
                </span>
              </div>
              <p className="text-[11px] text-emerald-900/80 truncate">
                {language === 'mr' ? 'शेवटचा बॅकअप:' : 'Last backup:'} {formattedBackupDate}
              </p>
            </div>
          </div>

          <button
            id="btn-banner-refresh-backup"
            type="button"
            onClick={onExportBackupJSON}
            className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer flex-shrink-0 active:scale-95 shadow-xs"
            title="Download fresh backup"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{language === 'mr' ? 'बॅकअप' : 'Backup'}</span>
          </button>
        </div>
      )}

      <form onSubmit={handleSave} className="flex flex-col gap-4">
        {/* Store Profile Card */}
        <section className="bg-white rounded-2xl p-4 border border-[#c6c5d4]/40 shadow-sm flex flex-col gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-[#000666] uppercase tracking-wider pb-1 border-b border-[#eceef1]">
            <Store className="w-4 h-4" />
            <span>{t.storeProfileSection}</span>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-[#191c1e]">{t.storeNameLabel}</label>
            <input
              type="text"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="h-10 px-3 rounded-xl bg-[#f7f9fc] border border-[#c6c5d4]/70 text-xs font-semibold text-[#191c1e] focus:border-[#000666] outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#191c1e]">{t.ownerNameLabel}</label>
              <input
                type="text"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                className="h-10 px-3 rounded-xl bg-[#f7f9fc] border border-[#c6c5d4]/70 text-xs font-semibold text-[#191c1e] focus:border-[#000666] outline-none"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#191c1e]">{t.storeContactLabel}</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-10 px-3 rounded-xl bg-[#f7f9fc] border border-[#c6c5d4]/70 text-xs font-semibold text-[#191c1e] focus:border-[#000666] outline-none"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-[#191c1e]">{t.storeAddressLabel}</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="h-10 px-3 rounded-xl bg-[#f7f9fc] border border-[#c6c5d4]/70 text-xs text-[#191c1e] focus:border-[#000666] outline-none"
            />
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-[#191c1e]">{t.upiIdLabel}</label>
              <button
                type="button"
                onClick={() => setShowQR(!showQR)}
                className="text-[11px] font-bold text-[#006b5f] flex items-center gap-1 hover:underline cursor-pointer"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>{showQR ? t.hideQR : t.showQR}</span>
              </button>
            </div>
            <input
              type="text"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              placeholder="e.g., kiranastore@oksbi"
              className="h-10 px-3 rounded-xl bg-[#f7f9fc] border border-[#c6c5d4]/70 text-xs font-semibold text-[#191c1e] focus:border-[#000666] outline-none"
            />
          </div>

          {showQR && (
            <div className="p-4 bg-[#f2f4f7] rounded-xl flex flex-col items-center justify-center text-center border border-[#c6c5d4]/40 mt-1">
              <div className="w-32 h-32 bg-white p-2 rounded-xl shadow-md border border-[#c6c5d4] flex items-center justify-center">
                {/* SVG UPI QR illustration */}
                <div className="w-full h-full border-2 border-dashed border-[#000666] flex flex-col items-center justify-center rounded p-1">
                  <QrCode className="w-16 h-16 text-[#000666]" />
                  <span className="text-[9px] font-bold text-[#000666] mt-1">BHIM UPI</span>
                </div>
              </div>
              <p className="text-xs font-bold text-[#191c1e] mt-2">{upiId || 'kiranastore@oksbi'}</p>
              <p className="text-[10px] text-[#767683]">
                {language === 'mr' ? 'ग्राहक थेट स्कॅन करून पेमेंट करू शकतात' : 'Customers can scan and pay directly'}
              </p>
            </div>
          )}
        </section>

        {/* 8-Day Reminder Policy Settings (PRD Section 9.8) */}
        <section className="bg-white rounded-2xl p-4 border border-[#c6c5d4]/40 shadow-sm flex flex-col gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-[#000666] uppercase tracking-wider pb-1 border-b border-[#eceef1]">
            <BellRing className="w-4 h-4 text-[#006b5f]" />
            <span>{t.automatedReminderRules}</span>
          </div>

          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs font-bold text-[#191c1e]">{t.enableAutoReminders}</p>
              <p className="text-[11px] text-[#767683]">{t.autoRemindersDesc}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={autoReminders}
                onChange={(e) => setAutoReminders(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-[#c6c5d4] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#000666]" />
            </label>
          </div>

          <div className="flex flex-col gap-1.5 pt-1">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-[#191c1e]">{t.defaultReminderInterval}</label>
              <span className="text-xs font-bold text-[#000666] bg-[#e0e0ff] px-2 py-0.5 rounded-md">
                {reminderInterval} {language === 'mr' ? 'दिवस' : 'Days'}
              </span>
            </div>
            <input
              type="range"
              min="3"
              max="30"
              step="1"
              value={reminderInterval}
              onChange={(e) => setReminderInterval(Number(e.target.value))}
              className="w-full accent-[#000666]"
            />
            <p className="text-[10px] text-[#767683]">
              {language === 'mr' ? 'डीफॉल्ट कालावधी ८ दिवस निश्चित केला आहे.' : 'Default is 8 days as defined in the PRD business rule.'}
            </p>
          </div>
        </section>

        {/* Roles & Permissions / Active User Session */}
        <section className="bg-white rounded-2xl p-4 border border-[#c6c5d4]/40 shadow-sm flex flex-col gap-3">
          <div className="flex items-center justify-between pb-1 border-b border-[#eceef1]">
            <div className="flex items-center gap-2 text-xs font-bold text-[#000666] uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-[#1a237e]" />
              <span>{t.activeRoleSimulation}</span>
            </div>
            {onOpenLogin && (
              <button
                id="btn-settings-open-customer-login"
                type="button"
                onClick={onOpenLogin}
                className="text-[11px] font-bold text-[#000666] hover:text-[#1a237e] flex items-center gap-1 bg-[#eef1f6] hover:bg-[#e2e7ef] px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{t.switchToCustomerLogin}</span>
              </button>
            )}
          </div>

          {currentUser && (
            <div className="bg-[#f7f9fc] rounded-xl p-3 border border-[#c6c5d4]/50 flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-[#000666]/10 text-[#000666] flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#191c1e] truncate">{currentUser.name}</p>
                  <p className="text-[10px] text-[#767683]">{currentUser.phone || (language === 'mr' ? 'अतिथी' : 'Guest')}</p>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                currentUser.role === 'Owner' ? 'bg-[#1a237e] text-white' : 'bg-amber-100 text-amber-900 border border-amber-300'
              }`}>
                {currentUser.role === 'Owner' ? t.ownerRole : t.staffRole}
              </span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setUserRole('Owner')}
              className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                userRole === 'Owner'
                  ? 'bg-[#1a237e] text-white border-transparent shadow-sm'
                  : 'bg-[#f7f9fc] text-[#454652] border-[#c6c5d4]'
              }`}
            >
              {t.ownerRole}
            </button>
            <button
              type="button"
              onClick={() => setUserRole('Staff')}
              className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                userRole === 'Staff'
                  ? 'bg-[#1a237e] text-white border-transparent shadow-sm'
                  : 'bg-[#f7f9fc] text-[#454652] border-[#c6c5d4]'
              }`}
            >
              {t.staffRole}
            </button>
          </div>
        </section>

        {/* Save Button */}
        <button
          id="btn-save-settings"
          type="submit"
          className="w-full h-12 bg-[#000666] hover:bg-[#1a237e] text-white font-bold text-sm rounded-xl shadow-md active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>{t.saveChanges}</span>
        </button>
      </form>

      {/* Data Management & Audit Section */}
      <section className="bg-white rounded-2xl p-4 border border-[#c6c5d4]/40 shadow-sm flex flex-col gap-3">
        <h3 className="text-xs font-bold text-[#000666] uppercase tracking-wider">
          {t.dataManagement}
        </h3>

        <div className="grid grid-cols-2 gap-2">
          <button
            id="btn-backup-ledger-secondary"
            onClick={onExportBackupJSON}
            className="py-2.5 px-3 bg-[#f7f9fc] hover:bg-[#eceef1] text-[#191c1e] text-xs font-bold rounded-xl border border-[#c6c5d4]/60 flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#000666]" />
            <span>{t.backupLedger}</span>
          </button>

          <button
            id="btn-reset-demo"
            onClick={() => {
              if (confirm(language === 'mr' ? 'सर्व नमुना डेटा पूर्ववत रीसेट करायचा आहे का?' : 'Reset to initial sample store data?')) {
                onResetDemoData();
              }
            }}
            className="py-2.5 px-3 bg-[#f7f9fc] hover:bg-[#eceef1] text-[#ba1a1a] text-xs font-bold rounded-xl border border-[#c6c5d4]/60 flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t.resetDemo}</span>
          </button>
        </div>

        {/* Audit Log Toggle */}
        <div className="pt-2 border-t border-[#eceef1]">
          <button
            id="btn-toggle-audit-logs"
            onClick={() => setShowLogs(!showLogs)}
            className="w-full text-left text-xs font-bold text-[#454652] hover:text-[#000666] flex items-center justify-between cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <History className="w-3.5 h-3.5" />
              <span>{t.auditLogs} ({auditLogs.length})</span>
            </span>
            <span className="text-[10px] text-[#767683]">{showLogs ? (language === 'mr' ? 'लपवा' : 'Hide') : (language === 'mr' ? 'पहा' : 'View')}</span>
          </button>

          {showLogs && (
            <div className="mt-2 bg-[#f7f9fc] rounded-xl p-2.5 max-h-48 overflow-y-auto divide-y divide-[#e0e3e6] text-[11px]">
              {auditLogs.map((log) => (
                <div key={log.id} className="py-1.5">
                  <div className="flex justify-between items-center text-[#191c1e] font-semibold">
                    <span>{log.action}</span>
                    <span className="text-[10px] text-[#767683]">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[#454652] mt-0.5">{log.details || log.actor}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
};
