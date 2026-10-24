import React, { useState } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { api } from '../../services/api';
import { ShieldCheck, X, KeyRound } from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { language, t } = useLanguage();

  const [email, setEmail] = useState('hailemeskel@fnoteloza.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await api.login(email, password);
      setPassword('');
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign-in failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#111111]/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative bg-[#1A1A1A] border border-[#C8A96E]/40 w-full max-w-md p-6 sm:p-8 rounded-xs shadow-2xl z-10">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#9E9689] hover:text-[#F7F3EB]"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-full bg-[#C8A96E]/20 border border-[#C8A96E] flex items-center justify-center text-[#C8A96E] mx-auto mb-3">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-serif font-medium text-[#F7F3EB]">
            {t('adminLogin')}
          </h2>
          <p className="text-xs text-[#9E9689] mt-1">
            Fnote Loza Jewelry & Inventory Platform
          </p>
        </div>

        {error && (
          <div className="p-3 mb-4 bg-red-500/10 border border-red-500/30 text-red-300 text-xs rounded-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#C8A96E] uppercase tracking-wider mb-1">
              {t('adminEmail')}
            </label>
            <input
              type="email"
              required
              autoComplete="username"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#141414] border border-[#C8A96E]/20 text-xs text-[#F7F3EB] outline-hidden rounded-xs font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#C8A96E] uppercase tracking-wider mb-1">
              {t('adminPassword')}
            </label>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#141414] border border-[#C8A96E]/20 text-xs text-[#F7F3EB] outline-hidden rounded-xs"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#C8A96E] hover:bg-[#D7B97E] text-[#111111] text-xs font-semibold uppercase tracking-wider transition-colors rounded-xs shadow-md disabled:opacity-50"
          >
            <KeyRound className="w-4 h-4" />
            <span>{isLoading ? '...' : t('signInBtn')}</span>
          </button>
        </form>

      </div>
    </div>
  );
};
