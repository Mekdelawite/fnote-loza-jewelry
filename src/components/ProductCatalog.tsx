import React, { useState, useMemo } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { Product, JewelryCategory, JewelryMaterial } from '../types';
import { Search, SlidersHorizontal, Eye, MessageSquare, Check, Plus } from 'lucide-react';

interface ProductCatalogProps {
  products: Product[];
  selectedCategory: JewelryCategory;
  onSelectCategory: (category: JewelryCategory) => void;
  onSelectProduct: (product: Product) => void;
  onAddToInquiry: (product: Product) => void;
  inquiryListIds: string[];
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({
  products,
  selectedCategory,
  onSelectCategory,
  onSelectProduct,
  onAddToInquiry,
  inquiryListIds
}) => {
  const { language, t, formatCurrency, formatNumber } = useLanguage();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState<string>('all');
  const [selectedPurity, setSelectedPurity] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc' | 'weight'>('newest');
  const [availableOnly, setAvailableOnly] = useState<boolean>(true);

  const categories: { id: JewelryCategory; label: string }[] = [
    { id: 'all', label: t('allCategories') },
    { id: 'gold', label: t('categoryGold') },
    { id: 'silver', label: t('categorySilver') },
    { id: 'rings', label: t('categoryRings') },
    { id: 'bracelets', label: t('categoryBracelets') },
    { id: 'necklaces', label: t('categoryNecklaces') },
    { id: 'earrings', label: t('categoryEarrings') },
    { id: 'wedding', label: t('categoryWedding') },
    { id: 'custom', label: t('categoryCustom') }
  ];

  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      // Stock availability (Default: only in-stock or low-stock items)
      if (availableOnly && prod.status !== 'available' && prod.status !== 'low_stock') {
        return false;
      }

      // Category
      if (selectedCategory !== 'all') {
        if (selectedCategory === 'gold' && prod.material !== 'gold') return false;
        if (selectedCategory === 'silver' && prod.material !== 'silver') return false;
        if (selectedCategory !== 'gold' && selectedCategory !== 'silver' && prod.category !== selectedCategory) {
          return false;
        }
      }

      // Material
      if (selectedMaterial !== 'all' && prod.material !== selectedMaterial) {
        return false;
      }

      // Purity
      if (selectedPurity !== 'all' && prod.purity !== selectedPurity) {
        return false;
      }

      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchNameEn = prod.name_en.toLowerCase().includes(q);
        const matchNameAm = prod.name_am.toLowerCase().includes(q);
        const matchSku = prod.sku.toLowerCase().includes(q);
        const matchDesc = prod.description_en.toLowerCase().includes(q) || prod.description_am.toLowerCase().includes(q);
        if (!matchNameEn && !matchNameAm && !matchSku && !matchDesc) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price_asc') return a.selling_price - b.selling_price;
      if (sortBy === 'price_desc') return b.selling_price - a.selling_price;
      if (sortBy === 'weight') return (b.weight_grams || 0) - (a.weight_grams || 0);
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [products, selectedCategory, selectedMaterial, selectedPurity, sortBy, availableOnly, searchQuery]);

  return (
    <section id="shop" data-reveal className="py-24 bg-[#111111]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-xs font-semibold tracking-[0.2em] text-[#C8A96E] uppercase mb-3">
            {language === 'am' ? 'የፍኖተ ሎዛ ካታሎግ' : 'Boutique Catalog'}
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-medium text-[#F7F3EB] mb-4">
            {t('catalogTitle')}
          </h2>
          <p className="text-sm sm:text-base text-[#D5CCC0]">
            {t('catalogSubtitle')}
          </p>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="mb-10 space-y-6">
          {/* Search Bar */}
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C6D46]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="w-full pl-11 pr-4 py-3 bg-[#171717] border border-[#C8A96E]/20 focus:border-[#C8A96E] text-sm text-[#F7F3EB] placeholder-[#9E9689] focus:outline-hidden transition-colors rounded-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[#9E9689] hover:text-[#F7F3EB]"
              >
                ✕
              </button>
            )}
          </div>

          {/* Interactive Category Tabs (Segmented Buttons) */}
          <div className="flex items-center justify-start sm:justify-center overflow-x-auto pb-2 gap-2 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`px-4 py-2 text-xs font-medium tracking-wide uppercase transition-all whitespace-nowrap shrink-0 rounded-sm border ${
                  selectedCategory === cat.id
                    ? 'bg-[#C8A96E] text-[#111111] border-[#C8A96E] font-semibold'
                    : 'bg-[#181818] text-[#D5CCC0] border-[#C8A96E]/15 hover:border-[#C8A96E]/50 hover:text-[#FFFFFF]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Secondary Filters Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-[#161616] border border-[#C8A96E]/15 text-xs text-[#D5CCC0] rounded-sm">
            <div className="flex flex-wrap items-center gap-4">
              {/* Material Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-[#9E9689]">{t('filterByMaterial')}:</span>
                <select
                  value={selectedMaterial}
                  onChange={(e) => setSelectedMaterial(e.target.value)}
                  className="bg-[#1C1C1C] border border-[#C8A96E]/20 text-[#F7F3EB] px-2.5 py-1.5 focus:border-[#C8A96E] outline-hidden rounded-xs"
                >
                  <option value="all">{t('allCategories')}</option>
                  <option value="gold">{t('categoryGold')}</option>
                  <option value="silver">{t('categorySilver')}</option>
                </select>
              </div>

              {/* Purity Filter */}
              <div className="flex items-center gap-2">
                <span className="text-[#9E9689]">{t('filterByPurity')}:</span>
                <select
                  value={selectedPurity}
                  onChange={(e) => setSelectedPurity(e.target.value)}
                  className="bg-[#1C1C1C] border border-[#C8A96E]/20 text-[#F7F3EB] px-2.5 py-1.5 focus:border-[#C8A96E] outline-hidden rounded-xs"
                >
                  <option value="all">{t('filterAllPurities')}</option>
                  <option value="21K">21K (Gold)</option>
                  <option value="18K">18K (Gold)</option>
                  <option value="24K">24K (Pure Gold)</option>
                  <option value="925_sterling">925 Sterling Silver</option>
                </select>
              </div>

              {/* In-Stock Toggle */}
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={availableOnly}
                  onChange={(e) => setAvailableOnly(e.target.checked)}
                  className="accent-[#C8A96E] w-3.5 h-3.5"
                />
                <span>{t('filterAvailableOnly')}</span>
              </label>
            </div>

            {/* Sort By */}
            <div className="flex items-center gap-2">
              <span className="text-[#9E9689]">{t('sortBy')}:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-[#1C1C1C] border border-[#C8A96E]/20 text-[#F7F3EB] px-2.5 py-1.5 focus:border-[#C8A96E] outline-hidden rounded-xs"
              >
                <option value="newest">{t('sortNewest')}</option>
                <option value="price_asc">{t('sortPriceLowHigh')}</option>
                <option value="price_desc">{t('sortPriceHighLow')}</option>
                <option value="weight">{t('sortWeight')}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-[#161616] border border-[#C8A96E]/15 rounded-sm">
            <p className="text-[#D5CCC0] text-sm mb-4">{t('noProductsFound')}</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedMaterial('all');
                setSelectedPurity('all');
                onSelectCategory('all');
                setAvailableOnly(false);
              }}
              className="px-4 py-2 text-xs font-medium text-[#111111] bg-[#C8A96E] hover:bg-[#D7B97E] uppercase tracking-wider rounded-sm transition-colors"
            >
              {t('clearFilters')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((prod) => {
              const primaryImage = prod.images.find((i) => i.is_primary) || prod.images[0];
              const isInInquiry = inquiryListIds.includes(prod.id);
              const displayName = language === 'am' ? prod.name_am : prod.name_en;

              return (
                <div
                  key={prod.id}
                  data-reveal
                  className="group bg-[#171717] border border-[#C8A96E]/15 hover:border-[#C8A96E]/50 transition-all duration-300 flex flex-col justify-between overflow-hidden rounded-sm hover:-translate-y-1"
                >
                  {/* Image Container (65-75% height) */}
                  <div
                    onClick={() => onSelectProduct(prod)}
                    className="relative aspect-[4/3] bg-[#121212] overflow-hidden cursor-pointer"
                  >
                    {primaryImage ? (
                      <img
                        src={primaryImage.url}
                        alt={displayName}
                        referrerPolicy="no-referrer"
                        className="luxury-card-image w-full h-full object-cover object-center"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1C1C1C] to-[#121212] text-[#8C6D46]">
                        <span className="font-brand tracking-widest text-lg">FNOTE LOZA</span>
                      </div>
                    )}

                    {/* Gradient scrim */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#171717] via-transparent to-transparent opacity-60" />

                    {/* Quick View Button overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-[#111111]/40 backdrop-blur-xs">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectProduct(prod);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#111111]/90 text-[#F7F3EB] border border-[#C8A96E]/50 text-xs font-medium tracking-wide hover:bg-[#C8A96E] hover:text-[#111111] transition-colors rounded-sm"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{language === 'am' ? 'ዝርዝር እይ' : 'Quick View'}</span>
                      </button>
                    </div>

                    {/* Status indicator (Unboxed text with border, no candy pill) */}
                    {prod.status === 'low_stock' && (
                      <span className="absolute top-3 left-3 text-[10px] tracking-widest uppercase font-semibold text-[#C8A96E] bg-[#111111]/90 border border-[#C8A96E]/40 px-2 py-0.5">
                        {t('lowStock')}
                      </span>
                    )}
                    {prod.status === 'sold' && (
                      <span className="absolute top-3 left-3 text-[10px] tracking-widest uppercase font-semibold text-[#D5CCC0] bg-[#111111]/90 border border-[#9E9689]/40 px-2 py-0.5">
                        {t('sold')}
                      </span>
                    )}
                  </div>

                  {/* Card Content Area */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Zero-Pill Metadata Discipline: unboxed text with subtle typographic separators */}
                      <div className="flex items-center gap-2 text-[11px] text-[#9E9689] uppercase tracking-wider mb-2">
                        <span>{prod.material}</span>
                        <span aria-hidden="true" className="text-[#8C6D46]">·</span>
                        <span>{prod.purity.replace('_', ' ')}</span>
                        {prod.weight_grams && (
                          <>
                            <span aria-hidden="true" className="text-[#8C6D46]">·</span>
                            <span className="tabular-nums">{prod.weight_grams}g</span>
                          </>
                        )}
                      </div>

                      {/* Product Title */}
                      <h3
                        onClick={() => onSelectProduct(prod)}
                        className="text-base font-serif font-medium text-[#F7F3EB] group-hover:text-[#C8A96E] transition-colors cursor-pointer mb-2 line-clamp-1"
                      >
                        {displayName}
                      </h3>

                      {/* Quiet SKU */}
                      <p className="text-[11px] text-[#6E685E] font-mono mb-4">
                        SKU: {prod.sku}
                      </p>
                    </div>

                    {/* Price and Actions */}
                    <div className="pt-4 border-t border-[#C8A96E]/10 flex items-center justify-between">
                      <div>
                        {prod.price_on_request ? (
                          <span className="text-xs text-[#C8A96E] italic tracking-wide">
                            {t('priceOnRequest')}
                          </span>
                        ) : (
                          <span className="text-base font-medium text-[#F7F3EB] tabular-nums font-mono">
                            {formatCurrency(prod.selling_price)}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        {/* WhatsApp Direct */}
                        <a
                          href={`https://wa.me/251911234567?text=${encodeURIComponent(
                            language === 'am'
                              ? `ሰላም ፍኖተ ሎዛ፣ ስለ ${prod.name_am} (SKU: ${prod.sku}) ዋጋና ክምችት መጠየቅ እፈልጋለሁ።`
                              : `Hello Fnote Loza, I am interested in inquiring about ${prod.name_en} (SKU: ${prod.sku}).`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-[#9E9689] hover:text-[#C8A96E] hover:bg-[#222222] transition-colors rounded-xs"
                          title="WhatsApp Direct Inquiry"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </a>

                        {/* Add to Inquiry List */}
                        <button
                          onClick={() => onAddToInquiry(prod)}
                          className={`p-2 transition-colors rounded-xs ${
                            isInInquiry
                              ? 'bg-[#C8A96E]/20 text-[#C8A96E]'
                              : 'text-[#9E9689] hover:text-[#F7F3EB] hover:bg-[#222222]'
                          }`}
                          title={isInInquiry ? t('addedToInquiry') : t('addToInquiryList')}
                        >
                          {isInInquiry ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
