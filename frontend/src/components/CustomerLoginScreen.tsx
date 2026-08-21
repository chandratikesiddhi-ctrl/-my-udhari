import React, { useState, useEffect } from 'react';
import { 
  Store, 
  Smartphone, 
  KeyRound, 
  ArrowRight, 
  RotateCcw, 
  AlertCircle, 
  CheckCircle2, 
  Lock, 
  Shield, 
  BookOpen
} from 'lucide-react';
import { Customer, StoreProfile, UserSession } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { LanguageToggle } from './LanguageToggle';

interface CustomerLoginScreenProps {
  store: StoreProfile;
  customers: Customer[];
  onCustomerLogin: (session: UserSession, customer: Customer) => void;
  onOpenStoreLogin: () => void;
}

export const CustomerLoginScreen: React.FC<CustomerLoginScreenProps> = ({
  store,
  customers,
  onCustomerLogin,
  onOpenStoreLogin,
}) => {
  const { t, language } = useLanguage();

  const [step, setStep] = useState<'MOBILE' | 'OTP'>('MOBILE');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [generatedOtp, setGeneratedOtp] = useState<string>('1234');
  const [matchedCustomer, setMatchedCustomer] = useState<Customer | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successInfo, setSuccessInfo] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  // Countdown timer for Resend OTP
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Clean phone input (digits only, max 10 digits)
  const handlePhoneChange = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 10);
    setPhone(digits);
    if (errorMsg) setErrorMsg('');
  };

  // Handle Send OTP
  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10) {
      setErrorMsg(t.invalidMobileErr);
      return;
    }

    // Match customer by phone in the store directory
    const normalizedEntered = phone;
    const found = customers.find((c) => {
      const cDigits = c.phone.replace(/\D/g, '');
      return cDigits.endsWith(normalizedEntered) || normalizedEntered.endsWith(cDigits.slice(-10));
    });

    if (!found) {
      // If customer is not found in the shop's ledger
      setErrorMsg(t.customerNotFoundErr);
      return;
    }

    // Generate 4-digit OTP (or preset demo 1234 / random)
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(code);
    setMatchedCustomer(found);
    setStep('OTP');
    setErrorMsg('');
    setOtp(['', '', '', '']);
    setResendCooldown(30);
    setSuccessInfo(`${t.otpSentTo} +91 ${phone} (Demo OTP: ${code})`);
  };

  // Handle OTP digit changes
  const handleOtpChange = (index: number, val: string) => {
    const digit = val.replace(/\D/g, '').slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    if (errorMsg) setErrorMsg('');

    // Auto-focus next input
    if (digit && index < 3) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      prevInput?.focus();
    }
  };

  // Handle Verify OTP
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const enteredOtp = otp.join('');
    if (enteredOtp.length < 4) {
      setErrorMsg(language === 'mr' ? 'कृपया पूर्ण ४ अंकी OTP प्रविष्ट करा' : 'Please enter full 4-digit OTP');
      return;
    }

    // Accept either generated OTP or demo 1234
    if (enteredOtp !== generatedOtp && enteredOtp !== '1234') {
      setErrorMsg(t.invalidOtpErr);
      return;
    }

    if (matchedCustomer) {
      const session: UserSession = {
        id: `customer-${matchedCustomer.id}`,
        name: matchedCustomer.name,
        phone: matchedCustomer.phone,
        role: 'Customer',
        isLoggedIn: true,
        customerId: matchedCustomer.id,
      };
      onCustomerLogin(session, matchedCustomer);
    }
  };

  // Resend OTP
  const handleResendOtp = () => {
    if (resendCooldown > 0) return;
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(code);
    setResendCooldown(30);
    setErrorMsg('');
    setSuccessInfo(`${t.otpSentTo} +91 ${phone} (Demo OTP: ${code})`);
  };

  return (
    <div className="min-h-screen bg-[#f7f9fc] text-[#191c1e] flex flex-col justify-between selection:bg-[#000666] selection:text-white">
      {/* Top Navigation Bar */}
      <header className="w-full bg-[#000666] text-white border-b border-[#000666]/20 py-3.5 px-4 sm:px-8 shadow-xs">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-white/10 flex items-center justify-center border border-white/15">
              <Store className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight leading-tight">
                {t.appName}
              </h1>
              <p className="text-[11px] text-white/80 font-medium">
                {store.name} • {t.kiranaTag}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <LanguageToggle variant="header" />
          </div>
        </div>
      </header>

      {/* Main Login Card Area */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
        <div className="w-full max-w-md">
          {/* Card Container */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-[#c6c5d4]/50 transition-all">
            {/* Header Icon & Title */}
            <div className="text-center mb-6">
              <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-[#f0f2f5] border border-[#c6c5d4]/60 flex items-center justify-center text-[#000666] shadow-2xs">
                <BookOpen className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-bold text-[#191c1e] tracking-tight">
                {t.customerLoginTitle}
              </h2>
              <p className="text-xs text-[#454652] mt-1 font-medium leading-relaxed max-w-xs mx-auto">
                {t.customerLoginSubtitle}
              </p>
            </div>

            {/* Error Message Box */}
            {errorMsg && (
              <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-[#ba1a1a] text-xs font-semibold flex items-start gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div className="flex-1">{errorMsg}</div>
              </div>
            )}

            {/* Success Info Box */}
            {successInfo && step === 'OTP' && (
              <div className="mb-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-medium flex items-center justify-between gap-2 animate-in fade-in">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                  <span>{successInfo}</span>
                </div>
              </div>
            )}

            {/* STEP 1: MOBILE NUMBER ENTRY */}
            {step === 'MOBILE' ? (
              <form onSubmit={handleSendOtp} className="space-y-5">
                <div className="space-y-1.5">
                  <label 
                    htmlFor="customer-phone-input" 
                    className="text-xs font-bold text-[#191c1e] block"
                  >
                    {t.enterMobileNumber}
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-3.5 flex items-center gap-1 text-sm font-bold text-[#454652] pointer-events-none border-r border-[#c6c5d4]/60 pr-2">
                      <Smartphone className="w-4 h-4 text-[#767683]" />
                      <span>+91</span>
                    </div>
                    <input
                      id="customer-phone-input"
                      type="tel"
                      inputMode="numeric"
                      required
                      autoFocus
                      placeholder="98230 12345"
                      value={phone}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      className="w-full h-12 pl-22 pr-4 rounded-2xl bg-[#f7f9fc] border border-[#c6c5d4] text-base font-semibold text-[#191c1e] placeholder-[#767683]/60 focus:bg-white focus:border-[#000666] focus:ring-2 focus:ring-[#000666]/10 outline-none transition-all"
                    />
                  </div>
                </div>

                <button
                  id="btn-customer-send-otp"
                  type="submit"
                  className="w-full h-12 bg-[#000666] hover:bg-[#1a237e] active:bg-[#000444] text-white text-sm font-bold rounded-2xl flex items-center justify-center gap-2 shadow-xs hover:shadow-sm transition-all cursor-pointer active:scale-98"
                >
                  <span>{t.sendOtpBtn}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* Helpful Hint for testing existing registered customer accounts */}
                {customers.length > 0 && (
                  <div className="pt-2 border-t border-[#eceef1]">
                    <p className="text-[11px] font-bold text-[#767683] mb-1.5 text-center">
                      {t.quickTestCustomerHint}:
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-1.5">
                      {customers.slice(0, 3).map((c) => {
                        const digits = c.phone.replace(/\D/g, '').slice(-10);
                        return (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => {
                              setPhone(digits);
                              setErrorMsg('');
                            }}
                            className="text-[11px] font-medium bg-[#f0f2f5] hover:bg-[#e2e7ef] text-[#191c1e] px-2.5 py-1 rounded-xl border border-[#c6c5d4]/50 transition-colors cursor-pointer"
                          >
                            {c.name.split(' ')[0]} ({digits})
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </form>
            ) : (
              /* STEP 2: OTP VERIFICATION */
              <form onSubmit={handleVerifyOtp} className="space-y-5 animate-in fade-in">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label 
                      htmlFor="otp-input-0" 
                      className="text-xs font-bold text-[#191c1e]"
                    >
                      {t.enter4DigitOtp}
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setStep('MOBILE');
                        setErrorMsg('');
                      }}
                      className="text-[11px] font-bold text-[#000666] hover:underline cursor-pointer"
                    >
                      {language === 'mr' ? 'नंबर बदला' : 'Change number'}
                    </button>
                  </div>

                  {/* 4-Digit OTP Boxes */}
                  <div className="grid grid-cols-4 gap-2.5">
                    {otp.map((digit, idx) => (
                      <input
                        key={idx}
                        id={`otp-input-${idx}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        autoFocus={idx === 0}
                        className="w-full h-13 text-center text-xl font-bold bg-[#f7f9fc] border border-[#c6c5d4] rounded-2xl text-[#191c1e] focus:bg-white focus:border-[#000666] focus:ring-2 focus:ring-[#000666]/10 outline-none transition-all"
                      />
                    ))}
                  </div>
                </div>

                <button
                  id="btn-customer-verify-login"
                  type="submit"
                  className="w-full h-12 bg-[#006b5f] hover:bg-[#00554c] active:bg-[#00423b] text-white text-sm font-bold rounded-2xl flex items-center justify-center gap-2 shadow-xs hover:shadow-sm transition-all cursor-pointer active:scale-98"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{t.verifyAndLoginBtn}</span>
                </button>

                {/* Resend OTP & Back */}
                <div className="flex items-center justify-between text-xs text-[#767683] pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setStep('MOBILE');
                      setErrorMsg('');
                    }}
                    className="hover:text-[#191c1e] transition-colors cursor-pointer"
                  >
                    ← {language === 'mr' ? 'मागे जा' : 'Back'}
                  </button>

                  <button
                    id="btn-resend-otp"
                    type="button"
                    disabled={resendCooldown > 0}
                    onClick={handleResendOtp}
                    className={`font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                      resendCooldown > 0
                        ? 'text-[#767683]/70 cursor-not-allowed'
                        : 'text-[#000666] hover:underline'
                    }`}
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>
                      {t.resendOtp}
                      {resendCooldown > 0 ? ` (${resendCooldown}s)` : ''}
                    </span>
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Secure Passbook Guarantee & Store Info */}
          <div className="mt-4 text-center space-y-3">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#767683] bg-white/70 px-3 py-1 rounded-full border border-[#c6c5d4]/40">
              <Shield className="w-3.5 h-3.5 text-[#006b5f]" />
              <span>{language === 'mr' ? '१००% सुरक्षित डिजिटल खातेवही पासबुक' : '100% Secure Digital Khata Passbook'}</span>
            </div>

            {/* Discreet Link to Store Owner & Staff Management Login */}
            <div>
              <button
                id="btn-switch-to-store-login"
                type="button"
                onClick={onOpenStoreLogin}
                className="text-xs font-semibold text-[#000666] hover:text-[#1a237e] hover:underline inline-flex items-center gap-1.5 py-1.5 px-3 rounded-xl hover:bg-[#eef1f6] transition-all cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{t.storeStaffLoginLink}</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full text-center py-3 text-[11px] text-[#767683] border-t border-[#c6c5d4]/40 bg-white/50">
        <span>{store.name} • {store.address || 'Local Market'} • +91 {store.phone}</span>
      </footer>
    </div>
  );
};
