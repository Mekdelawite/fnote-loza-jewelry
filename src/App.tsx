/**
 * Fnote Loza — Luxury Bilingual Jewelry Brand & Inventory Platform
 * Founded by Haile Meskel Aysheshem
 */

import React, { useState, useEffect } from 'react';
import { LanguageProvider } from './i18n/LanguageContext';
import { Product, BrandSettings, JewelryCategory } from './types';
import { api } from './services/api';
import { INITIAL_BRAND_SETTINGS } from './data/seedData';

import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { FeaturedCollections } from './components/FeaturedCollections';
import { ProductCatalog } from './components/ProductCatalog';
import { ProductDetailModal } from './components/ProductDetailModal';
import { FounderSection } from './components/FounderSection';
import { CraftsmanshipSection } from './components/CraftsmanshipSection';
import { ContactSection } from './components/ContactSection';
import { InquiryDrawer } from './components/InquiryDrawer';
import { AdminLoginModal } from './components/Admin/AdminLoginModal';
import { AdminDashboard } from './components/Admin/AdminDashboard';
import { Footer } from './components/Footer';

function MainApp() {
  const [products, setProducts] = useState<Product[]>([]);
  const [brandSettings, setBrandSettings] = useState<BrandSettings>(INITIAL_BRAND_SETTINGS);
  const [selectedCategory, setSelectedCategory] = useState<JewelryCategory>('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Inquiry / Wishlist state
  const [inquiryItems, setInquiryItems] = useState<Product[]>([]);
  const [isInquiryDrawerOpen, setIsInquiryDrawerOpen] = useState(false);

  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);

  // Load catalog and settings on mount
  const loadInitialData = async () => {
    try {
      const [prods, settings] = await Promise.all([
        api.getProducts(),
        api.getBrandSettings()
      ]);
      setProducts(prods);
      setBrandSettings(settings);
    } catch (err) {
      console.error('Failed to load initial data', err);
    }
  };

  useEffect(() => {
    loadInitialData();

    const checkHash = async () => {
      if (window.location.hash === '#admin') {
        try {
          const currentUser = await api.getCurrentUser();
          const isAuthenticated = Boolean(currentUser);
          setIsAdminLoggedIn(isAuthenticated);
          setIsAdminDashboardOpen(isAuthenticated);
          setIsAdminLoginOpen(!isAuthenticated);
        } catch (err) {
          console.error('Failed to validate the admin session', err);
          setIsAdminLoggedIn(false);
          setIsAdminDashboardOpen(false);
          setIsAdminLoginOpen(true);
        }
      }
    };
    const handleUnauthorized = () => {
      setIsAdminLoggedIn(false);
      setIsAdminDashboardOpen(false);
      setIsAdminLoginOpen(true);
    };
    void checkHash();
    window.addEventListener('hashchange', checkHash);
    window.addEventListener('fnote-admin-unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('hashchange', checkHash);
      window.removeEventListener('fnote-admin-unauthorized', handleUnauthorized);
    };
  }, []);

  const handleAddToInquiry = (product: Product) => {
    setInquiryItems(prev => {
      const exists = prev.some(p => p.id === product.id);
      if (exists) {
        return prev.filter(p => p.id !== product.id);
      }
      return [...prev, product];
    });
  };

  const handleRemoveFromInquiry = (productId: string) => {
    setInquiryItems(prev => prev.filter(p => p.id !== productId));
  };

  const handleClearInquiry = () => {
    setInquiryItems([]);
  };

  const handleUpdateBrandSettings = async (updates: Partial<BrandSettings>) => {
    const updated = await api.updateBrandSettings(updates);
    setBrandSettings(updated);
  };

  const handleAdminTrigger = () => {
    if (isAdminLoggedIn) {
      setIsAdminDashboardOpen(true);
    } else {
      setIsAdminLoginOpen(true);
    }
  };

  const handleCloseAdmin = () => {
    setIsAdminDashboardOpen(false);
    if (window.location.hash === '#admin') {
      window.history.replaceState(null, '', window.location.pathname);
    }
  };

  const handleAdminLoginSuccess = () => {
    setIsAdminLoggedIn(true);
    setIsAdminLoginOpen(false);
    setIsAdminDashboardOpen(true);
  };

  const handleAdminLogout = async () => {
    await api.logout();
    setIsAdminLoggedIn(false);
    setIsAdminDashboardOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#111111] text-[#F7F3EB] flex flex-col font-sans-body">
      {/* Header with Top Bar Contract compliance */}
      <Header
        inquiryCount={inquiryItems.length}
        onOpenInquiryDrawer={() => setIsInquiryDrawerOpen(true)}
        onOpenAdmin={handleAdminTrigger}
        isAdminLoggedIn={isAdminLoggedIn}
      />

      {/* Main Content Sections */}
      <main className="flex-1">
        {/* 1. Cinematic Hero */}
        <Hero />

        {/* 2. Featured Collections */}
        <FeaturedCollections
          onSelectCategory={(cat) => setSelectedCategory(cat)}
        />

        {/* 3. Product Catalog with Filters and Search */}
        <ProductCatalog
          products={products}
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => setSelectedCategory(cat)}
          onSelectProduct={(prod) => setSelectedProduct(prod)}
          onAddToInquiry={handleAddToInquiry}
          inquiryListIds={inquiryItems.map(p => p.id)}
        />

        {/* 4. Founder Profile — Haile Meskel Aysheshem */}
        <FounderSection
          settings={brandSettings}
          onUpdateSettings={handleUpdateBrandSettings}
          isAdminLoggedIn={isAdminLoggedIn}
          onOpenAdmin={handleAdminTrigger}
        />

        {/* 5. Craftsmanship & Metallurgic Heritage */}
        <CraftsmanshipSection />

        {/* 6. Contact & Direct WhatsApp Inquiries */}
        <ContactSection />
      </main>

      {/* Footer */}
      <Footer onOpenAdmin={handleAdminTrigger} />

      {/* Modals & Slide-overs */}
      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToInquiry={handleAddToInquiry}
        isInInquiry={selectedProduct ? inquiryItems.some(p => p.id === selectedProduct.id) : false}
      />

      {/* Inquiry Drawer */}
      <InquiryDrawer
        isOpen={isInquiryDrawerOpen}
        onClose={() => setIsInquiryDrawerOpen(false)}
        items={inquiryItems}
        onRemoveItem={handleRemoveFromInquiry}
        onClearAll={handleClearInquiry}
      />

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onSuccess={handleAdminLoginSuccess}
      />

      {/* Admin Executive Console */}
      <AdminDashboard
        isOpen={isAdminDashboardOpen}
        onClose={handleCloseAdmin}
        onLogout={handleAdminLogout}
        brandSettings={brandSettings}
        onUpdateBrandSettings={handleUpdateBrandSettings}
        onRefreshCatalog={loadInitialData}
      />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <MainApp />
    </LanguageProvider>
  );
}
