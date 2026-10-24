import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { ShieldCheck } from 'lucide-react';

interface FooterProps {
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAdmin }) => {
  const { language, setLanguage, t } = useLanguage();

  return (
    <footer data-reveal className="bg-[#0D0D0D] border-t border-[#C8A96E]/15 text-[#9E9689] text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <span className="text-xl font-brand font-semibold text-[#F7F3EB] tracking-widest block">
              {language === 'am' ? 'ፍኖተ ሎዛ' : 'FNOTE LOZA'}
            </span>
            <p className="text-sm font-serif italic text-[#C8A96E]">
              {t('tagline')}
            </p>
            <p className="text-xs text-[#9E9689] max-w-sm leading-relaxed">
              {language === 'am'
                ? 'በኃይለ መስቀል አይሸሸም የተመሰረተ፣ የኢትዮጵያን የ21 ካራት ወርቅና ንጹህ ብር አንጥረኝነት ጥበብ የሚወክል የቅንጦት ጌጣጌጥ መደብር።'
                : 'Fine jewelry atelier founded by Haile Meskel Aysheshem, honoring authentic Ethiopian goldsmithing and modern heirloom craft.'}
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <span className="block text-xs font-semibold uppercase tracking-wider text-[#C8A96E]">
              {language === 'am' ? 'አሰሳ' : 'Navigation'}
            </span>
            <ul className="space-y-2">
              <li>
                <a href="#hero" className="hover:text-[#F7F3EB] transition-colors">{t('navHome')}</a>
              </li>
              <li>
                <a href="#shop" className="hover:text-[#F7F3EB] transition-colors">{t('navShop')}</a>
              </li>
              <li>
                <a href="#collections" className="hover:text-[#F7F3EB] transition-colors">{t('navCollections')}</a>
              </li>
              <li>
                <a href="#founder" className="hover:text-[#F7F3EB] transition-colors">{t('navFounder')}</a>
              </li>
              <li>
                <a href="#craftsmanship" className="hover:text-[#F7F3EB] transition-colors">{t('navCraft')}</a>
              </li>
              <li>
                <a href="#contact" className="hover:text-[#F7F3EB] transition-colors">{t('navContact')}</a>
              </li>
            </ul>
          </div>

          {/* Boutique Details & Admin */}
          <div className="space-y-3">
            <span className="block text-xs font-semibold uppercase tracking-wider text-[#C8A96E]">
              {language === 'am' ? 'መረጃ' : 'Atelier & Portal'}
            </span>
            <p className="text-xs text-[#D5CCC0]">
              {t('boutiqueAddress')}
            </p>
            <p className="font-mono text-xs text-[#D5CCC0]">
              +251 91 123 4567
            </p>

            <div className="pt-2">
              <button
                onClick={onOpenAdmin}
                className="inline-flex items-center gap-1.5 text-xs text-[#C8A96E] hover:text-[#E4CF9F] transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{t('adminPortal')}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[#C8A96E]/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#6E685E]">
          <p>{t('copyright')}</p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setLanguage('en')}
              className={`hover:text-[#F7F3EB] transition-colors ${language === 'en' ? 'text-[#C8A96E] font-semibold' : ''}`}
            >
              English
            </button>
            <span>·</span>
            <button
              onClick={() => setLanguage('am')}
              className={`font-amharic hover:text-[#F7F3EB] transition-colors ${language === 'am' ? 'text-[#C8A96E] font-semibold' : ''}`}
            >
              አማርኛ
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
