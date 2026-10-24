import React, { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { ShoppingBag, ShieldCheck, Menu, X } from 'lucide-react';

interface HeaderProps {
  inquiryCount: number;
  onOpenInquiryDrawer: () => void;
  onOpenAdmin: () => void;
  isAdminLoggedIn: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  inquiryCount,
  onOpenInquiryDrawer,
  onOpenAdmin,
  isAdminLoggedIn
}) => {
  const { language, setLanguage, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#111111]/95 backdrop-blur-md border-b border-[#C8A96E]/20 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-6 sm:gap-8">
        {/* Zone 1: Brand Wordmark */}
        <a 
          href="#" 
          className="group flex items-center gap-3 text-xl sm:text-2xl font-brand font-semibold tracking-wider text-[#F7F3EB] hover:text-[#C8A96E] transition-colors whitespace-nowrap shrink-0"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-[#C8A96E] opacity-90 group-hover:scale-125 transition-transform" />
          <span className="tracking-[0.18em]">
            {language === 'am' ? 'ፍኖተ ሎዛ' : 'FNOTE LOZA'}
          </span>
        </a>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-8 text-sm font-medium tracking-wide text-[#D5CCC0]">
          <a href="#hero" className="hover:text-[#C8A96E] transition-colors whitespace-nowrap shrink-0">
            {t('navHome')}
          </a>
          <a href="#shop" className="hover:text-[#C8A96E] transition-colors whitespace-nowrap shrink-0">
            {t('navShop')}
          </a>
          <a href="#collections" className="hover:text-[#C8A96E] transition-colors whitespace-nowrap shrink-0">
            {t('navCollections')}
          </a>
          <a href="#founder" className="hover:text-[#C8A96E] transition-colors whitespace-nowrap shrink-0">
            {t('navFounder')}
          </a>
          <a href="#craftsmanship" className="hover:text-[#C8A96E] transition-colors whitespace-nowrap shrink-0">
            {t('navCraft')}
          </a>
          <a href="#contact" className="hover:text-[#C8A96E] transition-colors whitespace-nowrap shrink-0">
            {t('navContact')}
          </a>
          {/* Direct Admin link in navigation */}
          <button
            onClick={onOpenAdmin}
            className="hover:text-[#C8A96E] text-[#C8A96E]/90 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 font-medium cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#C8A96E]" />
            <span>{t('navAdmin')}</span>
          </button>
        </nav>

        {/* Zone 3: Language switcher + Inquiries + Admin Button */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          {/* Bilingual Switcher: EN | አማ */}
          <div className="flex items-center border border-[#C8A96E]/30 rounded-xs bg-[#181818] p-0.5 text-xs font-medium tracking-wider">
            <button
              onClick={() => setLanguage('en')}
              className={`px-2.5 py-1 transition-colors rounded-xs cursor-pointer ${
                language === 'en'
                  ? 'bg-[#C8A96E] text-[#111111] font-semibold'
                  : 'text-[#D5CCC0] hover:text-[#FFFFFF]'
              }`}
              title="English"
            >
              EN
            </button>
            <span className="text-[#8C6D46] px-0.5 select-none">|</span>
            <button
              onClick={() => setLanguage('am')}
              className={`px-2.5 py-1 transition-colors rounded-xs font-amharic cursor-pointer ${
                language === 'am'
                  ? 'bg-[#C8A96E] text-[#111111] font-semibold'
                  : 'text-[#D5CCC0] hover:text-[#FFFFFF]'
              }`}
              title="አማርኛ"
            >
              አማ
            </button>
          </div>

          {/* Inquiry List Bag Button */}
          <button
            onClick={onOpenInquiryDrawer}
            className="relative p-2 text-[#D5CCC0] hover:text-[#C8A96E] transition-colors rounded-xs hover:bg-[#1A1A1A] cursor-pointer"
            title={t('inquiryDrawerTitle')}
            aria-label="View Inquiry List"
          >
            <ShoppingBag className="w-5 h-5" />
            {inquiryCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#C8A96E] text-[#111111] text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {inquiryCount}
              </span>
            )}
          </button>

          {/* Admin Portal Button — ALWAYS VISIBLE on all screens */}
          <button
            onClick={onOpenAdmin}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xs border border-[#C8A96E] bg-[#C8A96E]/15 text-[#C8A96E] hover:bg-[#C8A96E] hover:text-[#111111] transition-all whitespace-nowrap shrink-0 shadow-sm cursor-pointer"
            title={t('navAdmin')}
            aria-label="Open Admin Dashboard"
          >
            <ShieldCheck className="w-4 h-4" />
            <span className="hidden sm:inline">{t('navAdmin')}</span>
            <span className="sm:hidden">{language === 'am' ? 'አስተዳዳሪ' : 'Admin'}</span>
          </button>

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-[#D5CCC0] hover:text-[#C8A96E] transition-colors cursor-pointer"
            aria-label="Toggle mobile navigation"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#C8A96E]/20 bg-[#141414] px-6 py-6 space-y-4">
          <nav className="flex flex-col space-y-3 text-base font-medium">
            <a 
              href="#hero" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-[#F7F3EB] hover:text-[#C8A96E] transition-colors"
            >
              {t('navHome')}
            </a>
            <a 
              href="#shop" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-[#F7F3EB] hover:text-[#C8A96E] transition-colors"
            >
              {t('navShop')}
            </a>
            <a 
              href="#collections" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-[#F7F3EB] hover:text-[#C8A96E] transition-colors"
            >
              {t('navCollections')}
            </a>
            <a 
              href="#founder" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-[#F7F3EB] hover:text-[#C8A96E] transition-colors"
            >
              {t('navFounder')}
            </a>
            <a 
              href="#craftsmanship" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-[#F7F3EB] hover:text-[#C8A96E] transition-colors"
            >
              {t('navCraft')}
            </a>
            <a 
              href="#contact" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-[#F7F3EB] hover:text-[#C8A96E] transition-colors"
            >
              {t('navContact')}
            </a>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAdmin();
              }}
              className="text-left font-semibold text-[#C8A96E] flex items-center gap-2 pt-2 border-t border-[#C8A96E]/20 cursor-pointer"
            >
              <ShieldCheck className="w-5 h-5 text-[#C8A96E]" />
              <span>{t('navAdmin')}</span>
            </button>
          </nav>
        </div>
      )}
    </header>
  );
};
