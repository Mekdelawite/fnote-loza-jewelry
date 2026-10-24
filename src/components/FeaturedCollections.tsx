import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { JewelryCategory } from '../types';
import { ArrowUpRight } from 'lucide-react';

interface FeaturedCollectionsProps {
  onSelectCategory: (category: JewelryCategory) => void;
}

export const FeaturedCollections: React.FC<FeaturedCollectionsProps> = ({ onSelectCategory }) => {
  const { language, t } = useLanguage();

  const collections = [
    {
      id: 'gold' as JewelryCategory,
      title: t('collectionGold'),
      desc: t('collectionGoldDesc'),
      image: '/src/assets/images/product_gold_necklace_1792823131025.jpg',
      purity: '21K & 18K Gold',
      amPurity: '21 እና 18 ካራት ወርቅ'
    },
    {
      id: 'silver' as JewelryCategory,
      title: t('collectionSilver'),
      desc: t('collectionSilverDesc'),
      image: '/src/assets/images/product_silver_cuff_1792823130893.jpg',
      purity: '925 Sterling Silver',
      amPurity: '925 ንጹህ ብር'
    },
    {
      id: 'wedding' as JewelryCategory,
      title: t('collectionWedding'),
      desc: t('collectionWeddingDesc'),
      image: '/src/assets/images/product_wedding_rings_1792823132120.jpg',
      purity: 'Bridal Heirloom',
      amPurity: 'የሠርግ ቃልኪዳን'
    },
    {
      id: 'custom' as JewelryCategory,
      title: t('collectionBespoke'),
      desc: t('collectionBespokeDesc'),
      image: '/src/assets/images/craftsmanship_artisan_workbench_1792823131791.jpg',
      purity: 'Made-to-Order',
      amPurity: 'ልዩ የትእዛዝ ስራ'
    }
  ];

  return (
    <section id="collections" data-reveal className="py-24 bg-[#141414] border-t border-b border-[#C8A96E]/15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-xs font-semibold tracking-[0.2em] text-[#C8A96E] uppercase mb-3">
            {language === 'am' ? 'የተመረጡ ስብስቦች' : 'Curated Masterpieces'}
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-medium text-[#F7F3EB] mb-4">
            {t('collectionsTitle')}
          </h2>
          <p className="text-sm sm:text-base text-[#D5CCC0]">
            {t('collectionsSubtitle')}
          </p>
        </div>

        {/* 4-Card Luxury Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {collections.map((col) => (
            <div
              key={col.id}
              data-reveal
              onClick={() => {
                onSelectCategory(col.id);
                const el = document.getElementById('shop');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="group cursor-pointer bg-[#1C1C1C] border border-[#C8A96E]/20 hover:border-[#C8A96E]/60 transition-all duration-300 flex flex-col overflow-hidden"
            >
              {/* Image Frame */}
              <div className="relative aspect-[4/3] overflow-hidden bg-[#111111]">
                <img
                  src={col.image}
                  alt={col.title}
                  referrerPolicy="no-referrer"
                  className="luxury-card-image w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1C1C1C] via-transparent to-transparent opacity-80" />
                
                {/* Clean unboxed metadata tag */}
                <span className="absolute top-3 left-3 text-[11px] tracking-wider uppercase text-[#C8A96E] bg-[#111111]/80 backdrop-blur-xs px-2.5 py-1 border border-[#C8A96E]/30">
                  {language === 'am' ? col.amPurity : col.purity}
                </span>
              </div>

              {/* Text Body */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-serif font-medium text-[#F7F3EB] group-hover:text-[#C8A96E] transition-colors mb-2">
                    {col.title}
                  </h3>
                  <p className="text-xs text-[#9E9689] leading-relaxed line-clamp-2">
                    {col.desc}
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t border-[#C8A96E]/10 flex items-center justify-between text-xs text-[#C8A96E] font-medium tracking-wide">
                  <span>{t('viewCollection')}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
