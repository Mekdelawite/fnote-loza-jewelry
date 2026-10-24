import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { ArrowRight, Compass } from 'lucide-react';
import { heroJewelryImage } from '../assets/imageUrls';

export const Hero: React.FC = () => {
  const { language, t } = useLanguage();

  return (
    <section id="hero" className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-[#111111]">
      {/* Background Hero Jewelry Imagery with Scrim */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroJewelryImage}
          alt="Handcrafted 21K gold jewelry on travertine stone"
          referrerPolicy="no-referrer"
          className="hero-image-enter w-full h-full object-cover object-center filter brightness-[0.62] contrast-[1.08] scale-[1.02]"
        />
        {/* Measured Luxury Contrast Scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-[#111111]/60 to-transparent" />
        <div className="absolute inset-0 bg-radial-at-c from-transparent via-[#111111]/30 to-[#111111]/80" />
      </div>

      {/* Hero Foreground Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        {/* Quiet Brand Kicker */}
        <div className="hero-enter hero-enter-1 inline-flex items-center gap-3 mb-6 px-4 py-1.5 border border-[#C8A96E]/30 bg-[#111111]/70 backdrop-blur-md rounded-full text-xs tracking-[0.25em] text-[#C8A96E] uppercase">
          <span>{language === 'am' ? 'ፍኖተ ሎዛ' : 'Fnote Loza'}</span>
          <span className="w-1 h-1 rounded-full bg-[#C8A96E]" />
          <span>{language === 'am' ? '21 ካራት ወርቅና ብር' : '21K Gold & Fine Silver'}</span>
        </div>

        {/* Hero Display Headline (Balance wrapped, no orphan lines) */}
        <h1 className="hero-enter hero-enter-2 text-4xl sm:text-6xl md:text-7xl font-display font-medium tracking-tight text-[#F7F3EB] leading-[1.1] mb-6 max-w-4xl mx-auto">
          {t('heroTitle')}
        </h1>

        {/* Tagline */}
        <p className="hero-enter hero-enter-3 text-lg sm:text-xl md:text-2xl font-light text-[#C8A96E] tracking-wide mb-6">
          {t('tagline')}
        </p>

        {/* Editorial Subtitle */}
        <p className="hero-enter hero-enter-4 text-sm sm:text-base md:text-lg text-[#D5CCC0] max-w-2xl mx-auto leading-relaxed mb-10 font-normal">
          {t('heroSubtitle')}
        </p>

        {/* CTAs */}
        <div className="hero-enter hero-enter-5 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#shop"
            className="luxury-button w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-[#C8A96E] hover:bg-[#D7B97E] text-[#111111] text-sm font-semibold tracking-wider uppercase transition-all duration-200 rounded-sm shadow-lg shadow-[#C8A96E]/10"
          >
            <span>{t('exploreCollection')}</span>
            <ArrowRight className="w-4 h-4" />
          </a>

          <a
            href="#founder"
            className="luxury-button w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 border border-[#C8A96E]/40 hover:border-[#C8A96E] bg-[#111111]/60 hover:bg-[#111111] text-[#F7F3EB] text-sm font-medium tracking-wider uppercase transition-all duration-200 rounded-sm backdrop-blur-sm"
          >
            <Compass className="w-4 h-4 text-[#C8A96E]" />
            <span>{t('meetFounder')}</span>
          </a>
        </div>

        {/* Quiet Trust Bar */}
        <div className="hero-enter hero-enter-6 mt-16 pt-8 border-t border-[#C8A96E]/20 grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-xs tracking-wider text-[#9E9689]">
          <div>
            <span className="block font-serif text-[#C8A96E] text-sm font-medium mb-1">
              21K & 18K
            </span>
            <span>{language === 'am' ? 'የተረጋገጠ የወርቅ ጥራት' : 'Certified Gold Purity'}</span>
          </div>
          <div>
            <span className="block font-serif text-[#C8A96E] text-sm font-medium mb-1">
              925 Sterling
            </span>
            <span>{language === 'am' ? 'ንጹህ የብር ማዕድን' : 'Solid Fine Silver'}</span>
          </div>
          <div>
            <span className="block font-serif text-[#C8A96E] text-sm font-medium mb-1">
              Handcrafted
            </span>
            <span>{language === 'am' ? 'በባህላዊ የእጅ ጥበብ' : 'Master Artisanal Forging'}</span>
          </div>
          <div>
            <span className="block font-serif text-[#C8A96E] text-sm font-medium mb-1">
              Bespoke
            </span>
            <span>{language === 'am' ? 'ልዩ የትእዛዝ ስራዎች' : 'Custom Heirloom Service'}</span>
          </div>
        </div>
      </div>
    </section>
  );
};
