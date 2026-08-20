import React from 'react';
import { Globe } from 'lucide-react';
import { useLanguage, Language } from '../context/LanguageContext';

interface LanguageToggleProps {
  variant?: 'header' | 'settings' | 'compact';
  className?: string;
}

export const LanguageToggle: React.FC<LanguageToggleProps> = ({
  variant = 'header',
  className = '',
}) => {
  const { language, setLanguage } = useLanguage();

  if (variant === 'settings') {
    return (
      <div className={`flex flex-col gap-2 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#000666]" />
            <span className="text-xs font-bold text-[#191c1e]">App Language / भाषा</span>
          </div>
          <span className="text-[11px] font-semibold text-[#006b5f]">
            {language === 'mr' ? 'मराठी सक्रिय' : 'English Active'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 bg-[#f2f4f7] p-1.5 rounded-xl border border-[#c6c5d4]/40">
          <button
            type="button"
            id="btn-lang-en-settings"
            onClick={() => setLanguage('en')}
            className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              language === 'en'
                ? 'bg-white text-[#000666] shadow-sm border border-[#c6c5d4]/50'
                : 'text-[#454652] hover:text-[#191c1e]'
            }`}
          >
            <span>🇬🇧</span>
            <span>English</span>
          </button>
          <button
            type="button"
            id="btn-lang-mr-settings"
            onClick={() => setLanguage('mr')}
            className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              language === 'mr'
                ? 'bg-[#000666] text-white shadow-sm'
                : 'text-[#454652] hover:text-[#191c1e]'
            }`}
          >
            <span>🇮🇳</span>
            <span>मराठी (Marathi)</span>
          </button>
        </div>
      </div>
    );
  }

  // Header 2-Language Toggle Button (English | मराठी)
  return (
    <div
      className={`inline-flex items-center bg-[#e8eaf6] p-0.5 rounded-full border border-[#c6c5d4]/60 shadow-xs ${className}`}
      role="group"
      aria-label="Language selection"
    >
      <button
        type="button"
        id="btn-lang-en-header"
        onClick={() => setLanguage('en')}
        className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
          language === 'en'
            ? 'bg-[#000666] text-white shadow-sm'
            : 'text-[#454652] hover:text-[#191c1e]'
        }`}
        title="Switch to English"
      >
        <span>English</span>
      </button>

      <button
        type="button"
        id="btn-lang-mr-header"
        onClick={() => setLanguage('mr')}
        className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
          language === 'mr'
            ? 'bg-[#000666] text-white shadow-sm'
            : 'text-[#454652] hover:text-[#191c1e]'
        }`}
        title="मराठी मध्ये बदला"
      >
        <span>मराठी</span>
      </button>
    </div>
  );
};
