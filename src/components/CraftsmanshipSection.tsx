import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { Hammer, Flame, Gem, Sparkles } from 'lucide-react';

export const CraftsmanshipSection: React.FC = () => {
  const { language, t } = useLanguage();

  return (
    <section id="craftsmanship" data-reveal className="py-24 bg-[#111111] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-xs font-semibold tracking-[0.25em] text-[#C8A96E] uppercase mb-3">
            {language === 'am' ? 'የአንጥረኝነት ጥበብ' : 'Master Metallurgic Art'}
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-medium text-[#F7F3EB] mb-4">
            {t('craftTitle')}
          </h2>
          <p className="text-sm sm:text-base text-[#D5CCC0]">
            {t('craftSubtitle')}
          </p>
        </div>

        {/* Dual Visual Showcase: Workbench + Haile Meskel Artisan Silhouette */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16 items-center">
          {/* Main Workbench Visual (7 Columns) */}
          <div className="lg:col-span-7">
            <div className="relative aspect-[16/10] bg-[#181818] border border-[#C8A96E]/20 overflow-hidden shadow-2xl rounded-xs">
              <img
                src="/src/assets/images/craftsmanship_artisan_workbench_1792823131791.jpg"
                alt="Master jeweler goldsmithing workbench"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center filter contrast-[1.06] hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-transparent to-transparent opacity-60" />
              <div className="absolute bottom-4 left-4 right-4 p-4 bg-[#111111]/85 backdrop-blur-xs border border-[#C8A96E]/20 text-xs text-[#D5CCC0]">
                <span className="block font-serif font-medium text-[#C8A96E] mb-1">
                  {language === 'am' ? 'የእጅ ስራ ጥበብ በኃይለ መስቀል' : 'Artisanal Hand-Forging by Haile Meskel'}
                </span>
                <span className="text-[#9E9689]">
                  {language === 'am'
                    ? 'እያንዳንዱ የሽቦ ጥልፍና ማኅተም በጥንቃቄ በእጅ ይተነተናል።'
                    : 'Intricate filigree wirework shaped patiently using time-tested Ethiopian tools.'}
                </span>
              </div>
            </div>
          </div>

          {/* Real Founder Silhouette Portrait Visual (5 Columns) */}
          <div className="lg:col-span-5">
            <div className="relative aspect-[4/5] bg-[#181818] border border-[#C8A96E]/30 overflow-hidden shadow-2xl rounded-xs">
              <img
                src="/assets/aistudio/photo_2025-06-08_08-49-06_b120c934.jpg"
                alt="Haile Meskel Aysheshem Silhouette — Master Artisan"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center filter contrast-[1.12] hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-[#111111]/30 to-transparent opacity-70" />
              <div className="absolute bottom-4 left-4 right-4 p-4 bg-[#111111]/90 backdrop-blur-xs border border-[#C8A96E]/20 text-center">
                <span className="block font-serif text-sm font-medium text-[#F7F3EB] mb-0.5">
                  Haile Meskel Aysheshem
                </span>
                <span className="text-[11px] text-[#C8A96E] uppercase tracking-wider block">
                  {language === 'am' ? 'የጥበቡ ራዕይና መስራች' : 'The Visionary Master Jeweler'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Pillars of Craft */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pillar 1 */}
          <div data-reveal className="p-6 bg-[#161616] border border-[#C8A96E]/15 rounded-xs flex flex-col justify-between">
            <div className="w-10 h-10 mb-4 bg-[#1C1C1C] text-[#C8A96E] border border-[#C8A96E]/20 flex items-center justify-center shrink-0">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-serif font-medium text-[#F7F3EB] mb-2">
                {t('craftPurityTitle')}
              </h3>
              <p className="text-xs text-[#9E9689] leading-relaxed">
                {t('craftPurityDesc')}
              </p>
            </div>
          </div>

          {/* Pillar 2 */}
          <div data-reveal className="p-6 bg-[#161616] border border-[#C8A96E]/15 rounded-xs flex flex-col justify-between">
            <div className="w-10 h-10 mb-4 bg-[#1C1C1C] text-[#C8A96E] border border-[#C8A96E]/20 flex items-center justify-center shrink-0">
              <Hammer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-serif font-medium text-[#F7F3EB] mb-2">
                {t('craftFiligreeTitle')}
              </h3>
              <p className="text-xs text-[#9E9689] leading-relaxed">
                {t('craftFiligreeDesc')}
              </p>
            </div>
          </div>

          {/* Pillar 3 */}
          <div data-reveal className="p-6 bg-[#161616] border border-[#C8A96E]/15 rounded-xs flex flex-col justify-between">
            <div className="w-10 h-10 mb-4 bg-[#1C1C1C] text-[#C8A96E] border border-[#C8A96E]/20 flex items-center justify-center shrink-0">
              <Gem className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-serif font-medium text-[#F7F3EB] mb-2">
                {t('craftBespokeTitle')}
              </h3>
              <p className="text-xs text-[#9E9689] leading-relaxed">
                {t('craftBespokeDesc')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
