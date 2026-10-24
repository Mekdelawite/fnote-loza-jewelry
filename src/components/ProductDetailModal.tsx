import React, { useEffect, useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { Product } from '../types';
import { X, MessageSquare, Plus, Check, ShieldCheck, Scale, Ruler, Sparkles } from 'lucide-react';
import { resolveBundledImageUrl } from '../assets/imageUrls';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToInquiry: (product: Product) => void;
  isInInquiry: boolean;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToInquiry,
  isInInquiry
}) => {
  const { language, t, formatCurrency, formatNumber } = useLanguage();
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    setActiveImageIndex(0);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [product, onClose]);

  if (!product) return null;

  const displayName = language === 'am' ? product.name_am : product.name_en;
  const displayDesc = language === 'am' ? product.description_am : product.description_en;
  const currentImage = product.images[activeImageIndex] || product.images[0];

  const whatsappMessage = encodeURIComponent(
    language === 'am'
      ? `ሰላም ፍኖተ ሎዛ፣ ስለ "${product.name_am}" (SKU: ${product.sku}፣ ጥራት: ${product.purity}፣ ዋጋ: ${product.price_on_request ? 'በዕለቱ ተመን' : formatCurrency(product.selling_price)}) ተጨማሪ መረጃና ግዢ ማግኘት እፈልጋለሁ።`
      : `Hello Fnote Loza, I would like to inquire about purchasing the "${product.name_en}" (SKU: ${product.sku}, Purity: ${product.purity}, Price: ${product.price_on_request ? 'Price on Request' : formatCurrency(product.selling_price)}).`
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#111111]/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Click outside backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Card */}
      <div className="luxury-dialog relative bg-[#171717] border border-[#C8A96E]/30 w-full max-w-4xl overflow-hidden shadow-2xl z-10 flex flex-col md:flex-row">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 text-[#9E9689] hover:text-[#F7F3EB] bg-[#111111]/80 hover:bg-[#111111] transition-colors rounded-xs"
          aria-label={t('closeModal')}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Column: Gallery */}
        <div className="md:w-1/2 p-6 flex flex-col justify-between bg-[#121212] border-b md:border-b-0 md:border-r border-[#C8A96E]/15">
          <div className="relative aspect-square overflow-hidden bg-[#181818] rounded-xs mb-4">
            {currentImage ? (
              <img
                src={resolveBundledImageUrl(currentImage.url)}
                alt={displayName}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[#8C6D46]">
                <span className="font-brand text-xl">FNOTE LOZA</span>
              </div>
            )}
          </div>

          {/* Thumbnails if multiple images exist */}
          {product.images.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {product.images.map((img, idx) => (
                <button
                  key={img.id || idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-14 h-14 shrink-0 rounded-xs overflow-hidden border transition-colors ${
                    activeImageIndex === idx ? 'border-[#C8A96E]' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={resolveBundledImageUrl(img.url)} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Artisanal Authenticity Tag */}
          <div className="mt-4 pt-3 border-t border-[#C8A96E]/10 flex items-center justify-between text-[11px] text-[#9E9689]">
            <span className="flex items-center gap-1.5 text-[#C8A96E]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{language === 'am' ? 'የተረጋገጠ የወርቅ/ብር ማዕድን' : 'Assayed Precious Metal'}</span>
            </span>
            <span className="font-mono text-[#6E685E]">SKU: {product.sku}</span>
          </div>
        </div>

        {/* Right Column: Contiguous Purchase / Inquiry Details */}
        <div className="md:w-1/2 p-6 sm:p-8 flex flex-col justify-between">
          <div>
            {/* Category / Material Unboxed Metadata */}
            <div className="flex items-center gap-2 text-xs text-[#C8A96E] uppercase tracking-wider mb-2 font-medium">
              <span>{product.category}</span>
              <span>·</span>
              <span>{product.material}</span>
              <span>·</span>
              <span>{product.purity.replace('_', ' ')}</span>
            </div>

            {/* Title */}
            <h2 className="text-2xl sm:text-3xl font-display font-medium text-[#F7F3EB] mb-3">
              {displayName}
            </h2>

            {/* Price Module */}
            <div className="mb-6 pb-4 border-b border-[#C8A96E]/15">
              {product.price_on_request ? (
                <div>
                  <span className="text-lg font-serif italic text-[#C8A96E]">
                    {t('priceOnRequest')}
                  </span>
                  <p className="text-xs text-[#9E9689] mt-1">
                    {t('priceDailyNote')}
                  </p>
                </div>
              ) : (
                <div className="flex items-baseline gap-3">
                  <span className="text-2xl sm:text-3xl font-mono tabular-nums text-[#F7F3EB] font-semibold">
                    {formatCurrency(product.selling_price)}
                  </span>
                  <span className="text-xs text-[#9E9689]">
                    {language === 'am' ? '(ግብርና አገልግሎት ጨምሮ)' : '(Including VAT & certificate)'}
                  </span>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="mb-6">
              <h3 className="text-xs font-semibold tracking-wider uppercase text-[#C8A96E] mb-2">
                {t('productStory')}
              </h3>
              <p className="text-sm text-[#D5CCC0] leading-relaxed">
                {displayDesc}
              </p>
            </div>

            {/* Technical Specifications Grid */}
            <div className="mb-6 p-4 bg-[#141414] border border-[#C8A96E]/15 grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="block text-[#9E9689] mb-0.5">{t('purity')}:</span>
                <span className="font-medium text-[#F7F3EB]">{product.purity.replace('_', ' ')}</span>
              </div>
              {product.weight_grams && (
                <div>
                  <span className="block text-[#9E9689] mb-0.5">{t('weight')}:</span>
                  <span className="font-medium text-[#F7F3EB] font-mono tabular-nums">
                    {product.weight_grams} {t('grams')}
                  </span>
                </div>
              )}
              {product.dimensions && (
                <div className="col-span-2">
                  <span className="block text-[#9E9689] mb-0.5">{t('dimensions')}:</span>
                  <span className="font-medium text-[#F7F3EB]">{product.dimensions}</span>
                </div>
              )}
              <div>
                <span className="block text-[#9E9689] mb-0.5">{t('availability')}:</span>
                <span className={`font-medium ${product.stock_quantity > 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {product.stock_quantity > 0 ? `${t('inStock')} (${product.stock_quantity})` : t('outOfStock')}
                </span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="space-y-3 pt-4 border-t border-[#C8A96E]/15">
            {/* Primary Action: WhatsApp Inquiry */}
            <a
              href={`https://wa.me/251911234567?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-3.5 bg-[#C8A96E] hover:bg-[#D7B97E] text-[#111111] text-xs font-semibold tracking-wider uppercase transition-colors rounded-sm"
            >
              <MessageSquare className="w-4 h-4" />
              <span>{t('inquireViaWhatsApp')}</span>
            </a>

            {/* Secondary Action: Add to Inquiry List */}
            <button
              onClick={() => onAddToInquiry(product)}
              className={`w-full inline-flex items-center justify-center gap-2 px-6 py-3 text-xs font-medium tracking-wider uppercase border transition-colors rounded-sm ${
                isInInquiry
                  ? 'border-[#C8A96E] bg-[#C8A96E]/10 text-[#C8A96E]'
                  : 'border-[#C8A96E]/30 hover:border-[#C8A96E] text-[#F7F3EB] hover:bg-[#1A1A1A]'
              }`}
            >
              {isInInquiry ? (
                <>
                  <Check className="w-4 h-4 text-[#C8A96E]" />
                  <span>{t('addedToInquiry')}</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 text-[#C8A96E]" />
                  <span>{t('addToInquiryList')}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
