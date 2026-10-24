import React, { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { BrandSettings } from '../types';
import { Camera, Edit3, Check, ArrowRight, UserCheck, ShieldCheck, Image as ImageIcon } from 'lucide-react';

interface FounderSectionProps {
  settings: BrandSettings;
  onUpdateSettings: (newSettings: Partial<BrandSettings>) => Promise<void>;
  isAdminLoggedIn: boolean;
  onOpenAdmin: () => void;
}

export const FounderSection: React.FC<FounderSectionProps> = ({
  settings,
  onUpdateSettings,
  isAdminLoggedIn,
  onOpenAdmin
}) => {
  const { language, t } = useLanguage();

  const [isEditingPhoto, setIsEditingPhoto] = useState(false);
  const [photoInputUrl, setPhotoInputUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Available real uploaded portraits of Haile Meskel Aysheshem
  const realFounderPhotos = [
    {
      url: '/assets/aistudio/photo_2026-08-12_19-27-38_eb6e601c.jpg',
      labelEn: 'Seated Atelier Portrait',
      labelAm: 'የተቀመጠበት የቁም ፎቶ'
    },
    {
      url: '/assets/aistudio/photo_2026-05-19_10-42-26_5b8ef9ec.jpg',
      labelEn: 'Editorial Contemplation',
      labelAm: 'የጥበብ ትኩረት'
    },
    {
      url: '/assets/aistudio/photo_2025-06-08_08-49-06_b120c934.jpg',
      labelEn: 'Artisan Silhouette',
      labelAm: 'የጥበብ መንፈስ'
    }
  ];

  // Active portrait displayed
  const currentPhotoUrl = settings.founder_photo_url || realFounderPhotos[0].url;

  // File upload reader
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setPhotoInputUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSavePhoto = async () => {
    if (!photoInputUrl.trim()) return;
    setIsSaving(true);
    try {
      await onUpdateSettings({ founder_photo_url: photoInputUrl.trim() });
      setIsEditingPhoto(false);
      setPhotoInputUrl('');
    } finally {
      setIsSaving(false);
    }
  };

  const handleQuickSwitchPhoto = async (url: string) => {
    await onUpdateSettings({ founder_photo_url: url });
  };

  const founderName = language === 'am' ? settings.founder_name_am : settings.founder_name_en;
  const founderTitle = language === 'am' ? settings.founder_title_am : settings.founder_title_en;
  const founderBio = language === 'am' ? settings.founder_bio_am : settings.founder_bio_en;

  return (
    <section id="founder" className="py-28 bg-[#141414] border-t border-b border-[#C8A96E]/20 relative overflow-hidden">
      {/* Background Subtle Geometry Accent */}
      <div className="absolute -right-20 -bottom-20 w-96 h-96 rounded-full bg-[#C8A96E]/5 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-xs font-semibold tracking-[0.25em] text-[#C8A96E] uppercase mb-3">
            {language === 'am' ? 'የብራንዱ መስራች' : 'Founder & Stewardship'}
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-medium text-[#F7F3EB]">
            {t('founderSectionTitle')}
          </h2>
        </div>

        {/* 2-Column Balanced Editorial Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Portrait Column (5 Columns) */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="relative w-full max-w-md aspect-[3/4] bg-[#181818] border-2 border-[#C8A96E]/40 p-3 shadow-2xl rounded-xs">
              {/* Outer Thin Framing */}
              <div className="w-full h-full relative overflow-hidden bg-[#111111] flex flex-col items-center justify-center">
                {/* Real Photograph of Founder Haile Meskel Aysheshem */}
                <img
                  src={currentPhotoUrl}
                  alt={`${founderName} — ${founderTitle}`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center filter contrast-[1.04] transition-all duration-500"
                />

                {/* Subtle Inner Border Line */}
                <div className="absolute inset-2 border border-[#C8A96E]/20 pointer-events-none" />

                {/* Quiet Badge on Bottom */}
                <div className="absolute bottom-3 left-3 right-3 py-2 px-3 bg-[#111111]/85 backdrop-blur-xs border border-[#C8A96E]/25 text-center">
                  <span className="block text-xs font-serif font-medium text-[#F7F3EB]">
                    {founderName}
                  </span>
                  <span className="text-[10px] text-[#C8A96E] uppercase tracking-wider">
                    {founderTitle}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Portrait Gallery Switcher for Haile's 3 Photos */}
            {isAdminLoggedIn && (
              <div className="mt-4 w-full max-w-md">
                <p className="text-[11px] text-[#9E9689] text-center mb-2 uppercase tracking-wider">
                  {language === 'am' ? 'የኃይለ መስቀል ፎቶዎች ምርጫ' : "Haile's Official Portraits"}
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {realFounderPhotos.map((photo, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleQuickSwitchPhoto(photo.url)}
                      className={`group p-1 bg-[#181818] border rounded-xs transition-all text-left flex flex-col items-center cursor-pointer ${
                        currentPhotoUrl === photo.url
                          ? 'border-[#C8A96E] ring-1 ring-[#C8A96E]/50'
                          : 'border-[#C8A96E]/20 hover:border-[#C8A96E]/60 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <div className="w-full aspect-square overflow-hidden mb-1 bg-[#111111]">
                        <img src={photo.url} alt="" className="w-full h-full object-cover object-top" />
                      </div>
                      <span className="text-[10px] text-[#D5CCC0] truncate w-full text-center">
                        {language === 'am' ? photo.labelAm : photo.labelEn}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-4 flex items-center gap-3">
              {isAdminLoggedIn && (
                <button
                  onClick={() => {
                    setPhotoInputUrl(currentPhotoUrl);
                    setIsEditingPhoto(true);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#1C1C1C] hover:bg-[#252525] border border-[#C8A96E]/30 text-xs font-medium text-[#C8A96E] transition-colors rounded-xs cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>{language === 'am' ? 'ፎቶ ቀይር / ስቀል' : 'Upload Another Photo'}</span>
                </button>
              )}

              <button
                onClick={onOpenAdmin}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#C8A96E]/15 hover:bg-[#C8A96E] text-[#C8A96E] hover:text-[#111111] border border-[#C8A96E] text-xs font-semibold rounded-xs transition-colors cursor-pointer"
                title="Open Administrator Portal"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{language === 'am' ? 'የአስተዳዳሪ ክፍል' : 'Admin Portal'}</span>
              </button>
            </div>
          </div>

          {/* Editorial Text Column (7 Columns) */}
          <div className="lg:col-span-7 space-y-8">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] text-[#C8A96E] uppercase mb-2">
                <UserCheck className="w-4 h-4" />
                <span>{founderTitle}</span>
              </div>
              <h3 className="text-3xl sm:text-4xl md:text-5xl font-display font-medium text-[#F7F3EB] tracking-tight">
                {founderName}
              </h3>
            </div>

            {/* Pull Quote */}
            <blockquote className="p-6 bg-[#181818] border-l-2 border-[#C8A96E] text-base sm:text-lg font-serif italic text-[#E4CF9F] leading-relaxed">
              {t('founderQuote')}
            </blockquote>

            {/* Intro and Story */}
            <div className="space-y-4 text-sm sm:text-base text-[#D5CCC0] leading-relaxed font-light">
              <p className="font-normal text-[#F7F3EB]">
                {t('founderIntro')}
              </p>
              <p>
                {founderBio}
              </p>
            </div>

            {/* Second Editorial Image Showcase (B&W Contemplative Portrait) */}
            <div className="p-4 bg-[#181818] border border-[#C8A96E]/20 rounded-xs flex flex-col sm:flex-row items-center gap-5">
              <div className="w-full sm:w-36 aspect-[3/4] shrink-0 overflow-hidden bg-[#111111] border border-[#C8A96E]/30">
                <img
                  src="/assets/aistudio/photo_2026-05-19_10-42-26_5b8ef9ec.jpg"
                  alt="Haile Meskel Aysheshem in contemplation"
                  className="w-full h-full object-cover object-center filter contrast-[1.08]"
                />
              </div>
              <div className="space-y-2 text-xs">
                <span className="text-[11px] font-semibold text-[#C8A96E] uppercase tracking-wider block">
                  {language === 'am' ? 'የጥበብ ፍቅርና ቁርጠኝነት' : 'Artisanal Devotion'}
                </span>
                <p className="text-[#D5CCC0] leading-relaxed">
                  {language === 'am'
                    ? '“ለእኛ እያንዳንዱ የወርቅ እና የብር ጌጣጌጥ የቀራጩን እጅ ሙቀት፣ የባህሉን ጥልቀት እና የደንበኛውን የህይወት ታሪክ ይዞ የሚያልፍ ህያው ቅርስ ነው።”'
                    : '"For us, every gold and silver piece carries the warmth of the maker\'s hand, the depth of our heritage, and the customer\'s lasting life story."'}
                </p>
                <p className="text-[11px] text-[#8C6D46] font-mono">
                  — Haile Meskel Aysheshem
                </p>
              </div>
            </div>

            {/* Values Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-[#C8A96E]/15 text-xs">
              <div className="p-3 bg-[#171717] border border-[#C8A96E]/15">
                <span className="block font-semibold text-[#C8A96E] uppercase mb-1">
                  {language === 'am' ? 'የጥራት ቁርጠኝነት' : 'Integrity'}
                </span>
                <span className="text-[#9E9689]">
                  {language === 'am' ? 'የተፈተሸ 21K ወርቅ' : 'Pure 21K Assayed'}
                </span>
              </div>
              <div className="p-3 bg-[#171717] border border-[#C8A96E]/15">
                <span className="block font-semibold text-[#C8A96E] uppercase mb-1">
                  {language === 'am' ? 'የእጅ ጥበብ' : 'Artisanship'}
                </span>
                <span className="text-[#9E9689]">
                  {language === 'am' ? 'በአንጥረኛ እጅ የተሰራ' : 'Forged by Hand'}
                </span>
              </div>
              <div className="p-3 bg-[#171717] border border-[#C8A96E]/15 col-span-2 sm:col-span-1">
                <span className="block font-semibold text-[#C8A96E] uppercase mb-1">
                  {language === 'am' ? 'ቅርስ' : 'Legacy'}
                </span>
                <span className="text-[#9E9689]">
                  {language === 'am' ? 'ለትውልድ የሚቆይ' : 'Generational Value'}
                </span>
              </div>
            </div>

            {/* Direct CTAs */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <a
                href="#shop"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#C8A96E] hover:bg-[#D7B97E] text-[#111111] text-xs font-semibold tracking-wider uppercase transition-colors rounded-xs shadow-md"
              >
                <span>{t('exploreCollection')}</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <button
                onClick={onOpenAdmin}
                className="inline-flex items-center gap-2 px-6 py-3 border border-[#C8A96E]/40 hover:border-[#C8A96E] bg-[#181818] text-[#F7F3EB] text-xs font-medium tracking-wider uppercase transition-colors rounded-xs cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-[#C8A96E]" />
                <span>{language === 'am' ? 'የአስተዳደር ዳሽቦርድ ክፈት' : 'Open Admin Dashboard'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Photo Upload / Replace Modal */}
      {isAdminLoggedIn && isEditingPhoto && (
        <div className="fixed inset-0 z-50 bg-[#111111]/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative bg-[#1A1A1A] border border-[#C8A96E]/40 w-full max-w-lg p-6 sm:p-8 rounded-xs shadow-2xl">
            <h3 className="text-xl font-serif font-medium text-[#F7F3EB] mb-2">
              {t('uploadPortraitFile')}
            </h3>
            <p className="text-xs text-[#9E9689] mb-6">
              {t('uploadHelp')}
            </p>

            {/* Quick Pick From Real Photos */}
            <div className="mb-6">
              <label className="block text-xs font-medium text-[#C8A96E] uppercase tracking-wider mb-2">
                {language === 'am' ? 'ከተዘጋጁት የኃይለ መስቀል ፎቶዎች ይምረጡ' : "Choose from Haile's Uploaded Photos"}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {realFounderPhotos.map((photo, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setPhotoInputUrl(photo.url)}
                    className="p-1 border border-[#C8A96E]/30 bg-[#111111] hover:border-[#C8A96E] rounded-xs text-left"
                  >
                    <img src={photo.url} alt="" className="w-full aspect-square object-cover mb-1" />
                    <span className="text-[10px] text-[#D5CCC0] block truncate">
                      {language === 'am' ? photo.labelAm : photo.labelEn}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* File Upload Zone */}
            <div className="mb-6">
              <label className="block text-xs font-medium text-[#C8A96E] uppercase tracking-wider mb-2">
                {language === 'am' ? 'አዲስ ፎቶ ይስቀሉ' : 'Upload New Image File'}
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="w-full text-xs text-[#D5CCC0] file:mr-4 file:py-2.5 file:px-4 file:rounded-xs file:border-0 file:text-xs file:font-semibold file:bg-[#C8A96E] file:text-[#111111] hover:file:bg-[#D7B97E] cursor-pointer"
              />
            </div>

            {/* URL Input Fallback */}
            <div className="mb-6">
              <label className="block text-xs font-medium text-[#C8A96E] uppercase tracking-wider mb-2">
                {t('founderPhotoUrl')}
              </label>
              <input
                type="text"
                value={photoInputUrl}
                onChange={(e) => setPhotoInputUrl(e.target.value)}
                placeholder="/assets/aistudio/... or URL"
                className="w-full px-3.5 py-2.5 bg-[#141414] border border-[#C8A96E]/20 focus:border-[#C8A96E] text-xs text-[#F7F3EB] outline-hidden rounded-xs"
              />
            </div>

            {/* Live Preview if url exists */}
            {photoInputUrl && (
              <div className="mb-6 flex items-center gap-4 p-3 bg-[#141414] border border-[#C8A96E]/20">
                <img
                  src={photoInputUrl}
                  alt="Preview"
                  className="w-16 h-20 object-cover object-top border border-[#C8A96E]/40"
                />
                <span className="text-xs text-[#D5CCC0]">
                  {language === 'am' ? 'የፎቶው እይታ ዝግጁ ነው' : 'Image preview loaded successfully'}
                </span>
              </div>
            )}

            {/* Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#C8A96E]/15">
              <button
                type="button"
                onClick={() => {
                  setIsEditingPhoto(false);
                  setPhotoInputUrl('');
                }}
                className="px-4 py-2 text-xs text-[#9E9689] hover:text-[#F7F3EB] cursor-pointer"
              >
                {t('cancelBtn')}
              </button>
              <button
                type="button"
                onClick={handleSavePhoto}
                disabled={isSaving || !photoInputUrl}
                className="inline-flex items-center gap-1.5 px-5 py-2 bg-[#C8A96E] hover:bg-[#D7B97E] text-[#111111] text-xs font-semibold tracking-wider uppercase transition-colors rounded-xs disabled:opacity-50 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>{isSaving ? '...' : t('saveChanges')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
