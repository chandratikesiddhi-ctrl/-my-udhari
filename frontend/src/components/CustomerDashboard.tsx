import React, { useState } from 'react';
import { 
  Store, 
  LogOut, 
  Phone, 
  ArrowUpRight, 
  ArrowDownLeft, 
  QrCode, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Receipt, 
  Sparkles,
  Search,
  Share2,
  Calendar,
  X
} from 'lucide-react';
import { Customer, StoreProfile, Transaction } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { LanguageToggle } from './LanguageToggle';

interface CustomerDashboardProps {
  customer: Customer;
  store: StoreProfile;
  transactions: Transaction[];
  onLogout: () => void;
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({
  customer,
  store,
  transactions,
  onLogout,
}) => {
  const { t, language } = useLanguage();
  const [filterType, setFilterType] = useState<'ALL' | 'CREDIT' | 'PAYMENT'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showQrModal, setShowQrModal] = useState(false);
  const [showStatementCopied, setShowStatementCopied] = useState(false);

  // Filter transactions for this specific customer only
  const customerTransactions = transactions
    .filter((tx) => tx.customerId === customer.id)
    .filter((tx) => {
      if (filterType === 'CREDIT') return tx.type === 'CREDIT';
      if (filterType === 'PAYMENT') return tx.type === 'PAYMENT';
      return true;
    })
    .filter((tx) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        tx.formattedDate.toLowerCase().includes(q) ||
        (tx.note && tx.note.toLowerCase().includes(q)) ||
        tx.amount.toString().includes(q)
      );
    });

  // Calculate stats
  const totalCreditTaken = transactions
    .filter((tx) => tx.customerId === customer.id && tx.type === 'CREDIT')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalAmountPaid = transactions
    .filter((tx) => tx.customerId === customer.id && tx.type === 'PAYMENT')
    .reduce((sum, tx) => sum + tx.amount, 0);

  // UPI Link generation
  const upiPayUrl = store.upiId
    ? `upi://pay?pa=${encodeURIComponent(store.upiId)}&pn=${encodeURIComponent(
        store.name
      )}&am=${customer.balance > 0 ? customer.balance : 0}&cu=INR&tn=${encodeURIComponent(
        `Udhari Payment - ${customer.name}`
      )}`
    : '';

  // Download / Copy Statement Summary
  const handleDownloadStatement = () => {
    let summary = `═══════════════════════════════════════\n`;
    summary += `      ${store.name.toUpperCase()} - PASSBOOK\n`;
    summary += `═══════════════════════════════════════\n`;
    summary += `Customer: ${customer.name}\n`;
    summary += `Phone: +91 ${customer.phone}\n`;
    summary += `Date: ${new Date().toLocaleDateString('en-IN')}\n\n`;
    summary += `Current Balance: ₹${Math.abs(customer.balance).toLocaleString('en-IN')} (${
      customer.balance > 0 ? 'You Owe' : customer.balance < 0 ? 'Advance' : 'Settled'
    })\n`;
    summary += `Total Udhari Taken: ₹${totalCreditTaken.toLocaleString('en-IN')}\n`;
    summary += `Total Amount Paid: ₹${totalAmountPaid.toLocaleString('en-IN')}\n\n`;
    summary += `───────────────────────────────────────\n`;
    summary += `RECENT TRANSACTIONS:\n`;
    summary += `───────────────────────────────────────\n`;

    const recent = transactions.filter((tx) => tx.customerId === customer.id);
    if (recent.length === 0) {
      summary += `No transactions found.\n`;
    } else {
      recent.forEach((tx) => {
        const sign = tx.type === 'CREDIT' ? '(+) Credit' : '(-) Paid';
        summary += `${tx.formattedDate} | ₹${tx.amount.toLocaleString('en-IN')} ${sign}\n`;
        if (tx.note) summary += `   Note: ${tx.note}\n`;
      });
    }

    summary += `───────────────────────────────────────\n`;
    summary += `Store UPI: ${store.upiId || 'N/A'}\n`;
    summary += `Store Phone: +91 ${store.phone}\n`;
    summary += `═══════════════════════════════════════\n`;

    // Download text file
    const element = document.createElement('a');
    const file = new Blob([summary], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `${customer.name.replace(/\s+/g, '_')}_Passbook_Statement.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    setShowStatementCopied(true);
    setTimeout(() => setShowStatementCopied(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#f7f9fc] text-[#191c1e] pb-12 selection:bg-[#000666] selection:text-white">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-[#000666] text-white border-b border-[#000666]/20 shadow-xs px-4 sm:px-6 py-3">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-2xl bg-white/10 flex items-center justify-center border border-white/15 flex-shrink-0">
              <Store className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-bold tracking-tight leading-tight truncate">
                {store.name}
              </h1>
              <p className="text-[11px] text-white/80 font-medium truncate">
                {t.customerPassbookTitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <LanguageToggle variant="header" />
            <button
              id="btn-customer-logout"
              type="button"
              onClick={onLogout}
              className="h-8.5 px-3 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border border-white/20 active:scale-95"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{t.logout}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Passbook Container */}
      <main className="max-w-xl mx-auto px-4 pt-4 space-y-4">
        {/* Customer Welcome & Identification Card */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#c6c5d4]/60 shadow-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-[#000666] text-white flex items-center justify-center font-bold text-lg flex-shrink-0 shadow-2xs">
              {customer.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h2 className="text-base font-bold text-[#191c1e] truncate">{customer.name}</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#eef1f6] text-[#000666] border border-[#c6c5d4]/40 flex-shrink-0">
                  {language === 'mr' ? 'ग्राहक' : 'Customer'}
                </span>
              </div>
              <p className="text-xs text-[#767683] font-medium mt-0.5">
                +91 {customer.phone.replace('+91', '').trim()}
              </p>
            </div>
          </div>

          {/* Quick statement download */}
          <button
            id="btn-download-passbook-statement"
            type="button"
            onClick={handleDownloadStatement}
            className="h-9 px-3 bg-[#f0f2f5] hover:bg-[#e2e7ef] text-[#000666] rounded-xl text-xs font-bold flex items-center gap-1.5 border border-[#c6c5d4]/60 transition-colors cursor-pointer flex-shrink-0 active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.downloadPassbook}</span>
          </button>
        </div>

        {showStatementCopied && (
          <div className="p-2.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0" />
            <span>{language === 'mr' ? 'पासबुक विवरण डाउनलोड झाले!' : 'Passbook statement downloaded successfully!'}</span>
          </div>
        )}

        {/* PRIMARY HERO BALANCE CARD */}
        <div className={`rounded-3xl p-5 sm:p-6 shadow-sm border transition-all text-white ${
          customer.balance > 0
            ? 'bg-gradient-to-br from-[#ba1a1a] to-[#93000a] border-[#ba1a1a]/30'
            : customer.balance < 0
            ? 'bg-gradient-to-br from-[#006b5f] to-[#004f46] border-[#006b5f]/30'
            : 'bg-gradient-to-br from-[#1a237e] to-[#000666] border-[#1a237e]/30'
        }`}>
          <div className="flex items-center justify-between text-white/90 text-xs font-bold uppercase tracking-wider mb-2">
            <span>{t.yourCurrentBalance}</span>
            <span className="bg-white/20 backdrop-blur-xs px-2.5 py-0.5 rounded-full text-[10px] font-bold">
              {customer.balance > 0
                ? t.youOweToStore
                : customer.balance < 0
                ? t.storeOwesYou
                : t.allClear}
            </span>
          </div>

          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              ₹{Math.abs(customer.balance).toLocaleString('en-IN')}
            </span>
            <span className="text-sm font-medium text-white/80">
              {customer.balance > 0 ? (language === 'mr' ? 'बाकी' : 'Due') : customer.balance < 0 ? (language === 'mr' ? 'जमा' : 'Advance') : ''}
            </span>
          </div>

          {/* If there is a pending balance, provide instant UPI Payment action */}
          {customer.balance > 0 && store.upiId && (
            <div className="pt-3 border-t border-white/20 flex flex-wrap items-center gap-2">
              <a
                id="btn-pay-via-upi-app"
                href={upiPayUrl}
                className="flex-1 min-w-[140px] h-10 bg-white hover:bg-white/90 text-[#ba1a1a] text-xs font-extrabold rounded-2xl flex items-center justify-center gap-1.5 shadow-sm transition-transform active:scale-98"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#ba1a1a]" />
                <span>{t.payStoreViaUpi}</span>
              </a>

              <button
                id="btn-show-upi-qr"
                type="button"
                onClick={() => setShowQrModal(true)}
                className="h-10 px-3.5 bg-white/15 hover:bg-white/25 active:bg-white/35 text-white text-xs font-bold rounded-2xl flex items-center justify-center gap-1.5 border border-white/30 transition-colors cursor-pointer"
              >
                <QrCode className="w-4 h-4" />
                <span>QR Code</span>
              </button>
            </div>
          )}
        </div>

        {/* 2-Metric Summary (Total Udhari Purchases vs Total Amount Paid) */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl p-3.5 border border-[#c6c5d4]/60 shadow-xs flex flex-col justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#ba1a1a]">
              <ArrowUpRight className="w-4 h-4" />
              <span>{t.totalCreditTaken}</span>
            </div>
            <p className="text-lg font-bold text-[#191c1e] mt-2">
              ₹{totalCreditTaken.toLocaleString('en-IN')}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-3.5 border border-[#c6c5d4]/60 shadow-xs flex flex-col justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#006b5f]">
              <ArrowDownLeft className="w-4 h-4" />
              <span>{t.totalPaidSoFar}</span>
            </div>
            <p className="text-lg font-bold text-[#191c1e] mt-2">
              ₹{totalAmountPaid.toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        {/* STORE DETAILS & CONTACT CARD */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#c6c5d4]/60 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#eceef1]">
            <div className="flex items-center gap-2 text-xs font-bold text-[#000666] uppercase tracking-wider">
              <Store className="w-4 h-4 text-[#1a237e]" />
              <span>{t.storeDetails}</span>
            </div>
            <a
              id="btn-call-shopkeeper"
              href={`tel:${store.phone}`}
              className="px-3 py-1.5 bg-[#000666] hover:bg-[#1a237e] active:bg-[#000444] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Phone className="w-3 h-3" />
              <span>{t.contactStore}</span>
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div>
              <p className="text-[#767683] font-medium">{language === 'mr' ? 'दुकानदार / मालक' : 'Shopkeeper / Owner'}:</p>
              <p className="font-bold text-[#191c1e]">{store.ownerName} ({store.name})</p>
            </div>
            <div>
              <p className="text-[#767683] font-medium">{language === 'mr' ? 'दुकान पत्ता' : 'Shop Address'}:</p>
              <p className="font-bold text-[#191c1e]">{store.address || 'Local Market Area'}</p>
            </div>
            {store.upiId && (
              <div>
                <p className="text-[#767683] font-medium">Store UPI ID:</p>
                <p className="font-bold text-[#000666] font-mono">{store.upiId}</p>
              </div>
            )}
            <div>
              <p className="text-[#767683] font-medium">{language === 'mr' ? 'फोन नंबर' : 'Phone Number'}:</p>
              <p className="font-bold text-[#191c1e]">+91 {store.phone}</p>
            </div>
          </div>
        </div>

        {/* TRANSACTIONS / PASSBOOK LEDGER ENTRIES */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#c6c5d4]/60 shadow-xs space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#eceef1]">
            <div className="flex items-center gap-2 text-xs font-bold text-[#000666] uppercase tracking-wider">
              <Receipt className="w-4 h-4 text-[#1a237e]" />
              <span>{t.transactionHistory} ({customerTransactions.length})</span>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 bg-[#f0f2f5] p-1 rounded-xl">
              {(['ALL', 'CREDIT', 'PAYMENT'] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilterType(f)}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-colors cursor-pointer ${
                    filterType === f
                      ? 'bg-[#000666] text-white shadow-2xs'
                      : 'text-[#454652] hover:text-[#191c1e]'
                  }`}
                >
                  {f === 'ALL' ? t.filterAllTx : f === 'CREDIT' ? t.filterCreditTx : t.filterPaymentTx}
                </button>
              ))}
            </div>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#767683]" />
            <input
              type="text"
              placeholder={language === 'mr' ? 'तारीख, माल किंवा रक्कम शोधा...' : 'Search by date, note, or amount...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-8.5 pr-3 rounded-xl bg-[#f7f9fc] border border-[#c6c5d4]/60 text-xs font-medium outline-none focus:border-[#000666] focus:bg-white"
            />
          </div>

          {/* List of Entries */}
          {customerTransactions.length === 0 ? (
            <div className="py-8 text-center text-[#767683]">
              <Clock className="w-8 h-8 mx-auto mb-2 text-[#767683]/50" />
              <p className="text-xs font-bold">{t.noTransactionsYet}</p>
            </div>
          ) : (
            <div className="divide-y divide-[#eceef1]">
              {customerTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="py-3 flex items-center justify-between gap-3 hover:bg-[#f7f9fc] px-2 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold flex-shrink-0 ${
                        tx.type === 'CREDIT'
                          ? 'bg-rose-50 text-[#ba1a1a] border border-rose-200'
                          : 'bg-teal-50 text-[#006b5f] border border-teal-200'
                      }`}
                    >
                      {tx.type === 'CREDIT' ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : (
                        <ArrowDownLeft className="w-4 h-4" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold text-[#191c1e]">
                          {tx.type === 'CREDIT'
                            ? (language === 'mr' ? 'उधारी खरेदी' : 'Credit Given')
                            : (language === 'mr' ? 'जमा रक्कम (पेमेंट)' : 'Payment Received')}
                        </span>
                        {tx.note && (
                          <span className="text-[11px] text-[#454652] truncate font-medium bg-[#f0f2f5] px-1.5 py-0.2 rounded">
                            {tx.note}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#767683] flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3" />
                        <span>{tx.formattedDate} • {tx.formattedTime}</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p
                      className={`text-sm font-extrabold ${
                        tx.type === 'CREDIT' ? 'text-[#ba1a1a]' : 'text-[#006b5f]'
                      }`}
                    >
                      {tx.type === 'CREDIT' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                    </p>
                    <p className="text-[10px] text-[#767683] font-medium">
                      {language === 'mr' ? 'शिल्लक' : 'Bal'}: ₹{tx.balanceAfter.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* QR Code Modal for Payment */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-[#c6c5d4]/60 text-center space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#191c1e]">{t.scanToPay}</h3>
              <button
                type="button"
                onClick={() => setShowQrModal(false)}
                className="w-7 h-7 rounded-full bg-[#f0f2f5] hover:bg-[#e2e7ef] flex items-center justify-center text-[#191c1e] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* QR Code Graphic Placeholder */}
            <div className="p-4 bg-[#f7f9fc] rounded-2xl border border-[#c6c5d4]/60 inline-block mx-auto">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                  upiPayUrl || store.upiId || 'upi://pay'
                )}`}
                alt="Store UPI QR Code"
                className="w-44 h-44 mx-auto rounded-xl"
                loading="lazy"
              />
            </div>

            <div>
              <p className="text-xs font-bold text-[#191c1e]">{store.name}</p>
              <p className="text-xs font-mono text-[#000666] font-bold mt-0.5">{store.upiId}</p>
              <p className="text-[11px] text-[#767683] mt-1">
                {language === 'mr' ? 'कोणत्याही UPI अ‍ॅपद्वारे (GPay, PhonePe, Paytm) स्कॅन करा' : 'Scan using any UPI App (GPay, PhonePe, Paytm)'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowQrModal(false)}
              className="w-full h-11 bg-[#000666] text-white text-xs font-bold rounded-xl cursor-pointer"
            >
              {language === 'mr' ? 'बंद करा' : 'Close'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
