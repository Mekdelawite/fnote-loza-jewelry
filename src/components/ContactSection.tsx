import React, { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { MapPin, Phone, MessageSquare, Clock, Send, Check } from 'lucide-react';

export const ContactSection: React.FC = () => {
  const { language, t } = useLanguage();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !message) return;
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFullName('');
      setPhone('');
      setMessage('');
    }, 4000);
  };

  return (
    <section id="contact" data-reveal className="py-24 bg-[#141414] border-t border-[#C8A96E]/15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-xs font-semibold tracking-[0.2em] text-[#C8A96E] uppercase mb-3">
            {language === 'am' ? 'አድራሻና ግንኙነት' : 'Atelier & Direct Inquiries'}
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-medium text-[#F7F3EB] mb-4">
            {t('contactTitle')}
          </h2>
          <p className="text-sm sm:text-base text-[#D5CCC0]">
            {t('contactSubtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Boutique Information */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 bg-[#181818] border border-[#C8A96E]/20 rounded-xs space-y-5">
              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-[#1C1C1C] text-[#C8A96E] border border-[#C8A96E]/20 shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#F7F3EB] uppercase tracking-wider mb-1">
                    {t('location')}
                  </h3>
                  <p className="text-xs text-[#D5CCC0] leading-relaxed">
                    {t('boutiqueAddress')}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-[#1C1C1C] text-[#C8A96E] border border-[#C8A96E]/20 shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#F7F3EB] uppercase tracking-wider mb-1">
                    {t('telephone')}
                  </h3>
                  <p className="text-xs text-[#D5CCC0] font-mono">
                    +251 977779238
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-[#1C1C1C] text-[#C8A96E] border border-[#C8A96E]/20 shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#F7F3EB] uppercase tracking-wider mb-1">
                    {t('hours')}
                  </h3>
                  <p className="text-xs text-[#D5CCC0]">
                    {t('hoursVal')}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick WhatsApp Card */}
            <div className="p-6 bg-[#161616] border border-[#C8A96E]/20 text-center rounded-xs">
              <p className="text-xs text-[#9E9689] mb-3">
                {language === 'am'
                  ? 'ከኃይለ መስቀል ጋር በቀጥታ በዋትስአፕ ይነጋገሩ'
                  : 'Connect directly with master jeweler Haile Meskel on WhatsApp'}
              </p>
              <a
                href="https://wa.me/251911234567?text=Hello%20Fnote%20Loza%2C%20I%20would%20like%20to%20inquire%20about%20your%20jewelry%20collections."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#C8A96E] hover:bg-[#D7B97E] text-[#111111] text-xs font-semibold tracking-wider uppercase transition-colors rounded-xs w-full"
              >
                <MessageSquare className="w-4 h-4" />
                <span>{t('inquireWhatsApp')}</span>
              </a>
            </div>
          </div>

          {/* Right Column: Inquiries Form */}
          <div className="lg:col-span-7 p-6 sm:p-8 bg-[#181818] border border-[#C8A96E]/20 rounded-xs">
            <h3 className="text-xl font-serif font-medium text-[#F7F3EB] mb-2">
              {t('sendInquiry')}
            </h3>
            <p className="text-xs text-[#9E9689] mb-6">
              {language === 'am'
                ? 'ስለ ጌጣጌጥ ግዢ ወይም ልዩ ትእዛዝ ጥያቄዎን ያስገቡ።'
                : 'Inquire about available gold/silver pieces or request a bespoke commission.'}
            </p>

            {submitted ? (
              <div className="p-6 bg-[#152418] border border-emerald-500/30 text-center rounded-xs">
                <Check className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-emerald-300">
                  {t('inquirySuccess')}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#C8A96E] uppercase tracking-wider mb-1.5">
                    {t('fullName')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={language === 'am' ? 'ሙሉ ስምዎን ያስገቡ' : 'e.g. Solomon Desta'}
                    className="w-full px-3.5 py-2.5 bg-[#141414] border border-[#C8A96E]/20 focus:border-[#C8A96E] text-xs text-[#F7F3EB] outline-hidden rounded-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#C8A96E] uppercase tracking-wider mb-1.5">
                    {t('phoneNumber')}
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+251 9..."
                    className="w-full px-3.5 py-2.5 bg-[#141414] border border-[#C8A96E]/20 focus:border-[#C8A96E] text-xs text-[#F7F3EB] outline-hidden rounded-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#C8A96E] uppercase tracking-wider mb-1.5">
                    {t('messageText')} *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={language === 'am' ? 'ስለ ጌጣጌጡ ጥያቄዎን ወይም የሚፈልጉትን ቅርጽ ይግለጹ...' : 'Describe the jewelry piece you are inquiring about or custom sizing requirements...'}
                    className="w-full px-3.5 py-2.5 bg-[#141414] border border-[#C8A96E]/20 focus:border-[#C8A96E] text-xs text-[#F7F3EB] outline-hidden rounded-xs"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#C8A96E] hover:bg-[#D7B97E] text-[#111111] text-xs font-semibold tracking-wider uppercase transition-colors rounded-xs shadow-md"
                >
                  <Send className="w-4 h-4" />
                  <span>{t('submitInquiry')}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
