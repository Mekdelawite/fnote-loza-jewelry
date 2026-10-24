import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { Product } from '../types';
import { X, Trash2, MessageSquare, ShoppingBag } from 'lucide-react';

interface InquiryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: Product[];
  onRemoveItem: (id: string) => void;
  onClearAll: () => void;
}

export const InquiryDrawer: React.FC<InquiryDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onRemoveItem,
  onClearAll
}) => {
  const { language, t, formatCurrency } = useLanguage();

  if (!isOpen) return null;

  const totalAmount = items.reduce((sum, item) => sum + (item.price_on_request ? 0 : item.selling_price), 0);
  const totalWeight = items.reduce((sum, item) => sum + (item.weight_grams || 0), 0);

  const generateWhatsAppMessage = () => {
    let msg = language === 'am'
      ? `ሰላም ፍኖተ ሎዛ፣ የሚከተሉትን ጌጣጌጦች በተመለከተ ማዘዝ እና ዋጋ ማረጋገጥ እፈልጋለሁ፡\n`
      : `Hello Fnote Loza, I would like to inquire about ordering the following jewelry pieces:\n`;

    items.forEach((it, idx) => {
      const name = language === 'am' ? it.name_am : it.name_en;
      msg += `\n${idx + 1}. ${name} (SKU: ${it.sku}) - ${it.purity.replace('_', ' ')} ${it.weight_grams ? `(${it.weight_grams}g)` : ''}`;
    });

    if (totalAmount > 0) {
      msg += `\n\nTotal: ${formatCurrency(totalAmount)}`;
    }
    return encodeURIComponent(msg);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-[#111111]/80 backdrop-blur-xs flex justify-end">
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Slide-in Drawer */}
      <div className="relative w-full max-w-md bg-[#161616] border-l border-[#C8A96E]/20 h-full flex flex-col justify-between shadow-2xl z-10">
        {/* Header */}
        <div className="p-6 border-b border-[#C8A96E]/15 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#C8A96E]" />
            <h2 className="text-lg font-serif font-medium text-[#F7F3EB]">
              {t('inquiryDrawerTitle')}
            </h2>
            <span className="text-xs text-[#9E9689] font-mono">({items.length})</span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#9E9689] hover:text-[#F7F3EB] rounded-xs"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-16 text-[#9E9689] space-y-3">
              <ShoppingBag className="w-12 h-12 mx-auto text-[#333333]" />
              <p className="text-sm">{t('inquiryDrawerEmpty')}</p>
            </div>
          ) : (
            items.map((it) => {
              const displayName = language === 'am' ? it.name_am : it.name_en;
              const img = it.images[0]?.url;

              return (
                <div
                  key={it.id}
                  className="flex items-center gap-4 p-3 bg-[#1C1C1C] border border-[#C8A96E]/15 rounded-xs"
                >
                  <div className="w-16 h-16 bg-[#121212] overflow-hidden shrink-0 border border-[#C8A96E]/20">
                    {img && (
                      <img src={img} alt={displayName} className="w-full h-full object-cover" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs font-serif font-medium text-[#F7F3EB] truncate">
                      {displayName}
                    </h3>
                    <p className="text-[11px] text-[#9E9689]">
                      {it.purity.replace('_', ' ')} · {it.weight_grams ? `${it.weight_grams}g` : it.material}
                    </p>
                    <p className="text-xs font-mono tabular-nums text-[#C8A96E] mt-1">
                      {it.price_on_request ? t('priceOnRequest') : formatCurrency(it.selling_price)}
                    </p>
                  </div>

                  <button
                    onClick={() => onRemoveItem(it.id)}
                    className="p-2 text-[#9E9689] hover:text-red-400 transition-colors"
                    title={t('remove')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-6 border-t border-[#C8A96E]/15 bg-[#141414] space-y-4">
            <div className="space-y-1.5 text-xs text-[#D5CCC0]">
              {totalWeight > 0 && (
                <div className="flex justify-between">
                  <span className="text-[#9E9689]">{language === 'am' ? 'ጠቅላላ ክብደት' : 'Total Weight'}:</span>
                  <span className="font-mono tabular-nums">{totalWeight.toFixed(1)} {t('grams')}</span>
                </div>
              )}
              {totalAmount > 0 && (
                <div className="flex justify-between text-sm font-medium text-[#F7F3EB] pt-1 border-t border-[#C8A96E]/10">
                  <span>{language === 'am' ? 'ግምታዊ ድምር' : 'Subtotal'}:</span>
                  <span className="font-mono tabular-nums text-[#C8A96E]">{formatCurrency(totalAmount)}</span>
                </div>
              )}
            </div>

            <a
              href={`https://wa.me/251911234567?text=${generateWhatsAppMessage()}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#C8A96E] hover:bg-[#D7B97E] text-[#111111] text-xs font-semibold tracking-wider uppercase transition-colors rounded-xs shadow-md"
            >
              <MessageSquare className="w-4 h-4" />
              <span>{t('proceedWhatsApp')}</span>
            </a>

            <button
              onClick={onClearAll}
              className="w-full text-center text-[11px] text-[#9E9689] hover:text-[#D5CCC0] pt-1"
            >
              {t('clearAll')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
