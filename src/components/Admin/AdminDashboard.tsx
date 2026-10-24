import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { 
  Product, 
  Sale, 
  InventoryMovement, 
  DashboardSummary, 
  BrandSettings, 
  JewelryCategory, 
  JewelryMaterial, 
  GoldPurity,
  PaymentMethod
} from '../../types';
import { api } from '../../services/api';
import { 
  LayoutDashboard, 
  Package, 
  PlusCircle, 
  ShoppingBag, 
  Receipt, 
  History, 
  Settings, 
  LogOut, 
  X, 
  Check, 
  AlertTriangle, 
  Edit2, 
  Sliders, 
  TrendingUp, 
  DollarSign, 
  RefreshCcw,
  Search,
  Camera,
  Trash2
} from 'lucide-react';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  brandSettings: BrandSettings;
  onUpdateBrandSettings: (newSettings: Partial<BrandSettings>) => Promise<void>;
  onRefreshCatalog: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isOpen,
  onClose,
  onLogout,
  brandSettings,
  onUpdateBrandSettings,
  onRefreshCatalog
}) => {
  const { language, t, formatCurrency, formatNumber, formatDate } = useLanguage();

  type AdminTab = 'overview' | 'inventory' | 'sales' | 'movements' | 'settings';
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals inside Admin
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [productError, setProductError] = useState('');
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [stockAdjustProduct, setStockAdjustProduct] = useState<Product | null>(null);
  const [stockAdjustQty, setStockAdjustQty] = useState<number>(1);
  const [stockAdjustType, setStockAdjustType] = useState<InventoryMovement['movement_type']>('restock');
  const [stockAdjustReason, setStockAdjustReason] = useState<string>('');

  // Record Sale state
  const [isRecordSaleOpen, setIsRecordSaleOpen] = useState(false);
  const [saleProductId, setSaleProductId] = useState<string>('');
  const [saleQuantity, setSaleQuantity] = useState<number>(1);
  const [salePrice, setSalePrice] = useState<number>(0);
  const [saleDiscount, setSaleDiscount] = useState<number>(0);
  const [salePaymentMethod, setSalePaymentMethod] = useState<PaymentMethod>('cash');
  const [saleCustomerName, setSaleCustomerName] = useState('');
  const [saleCustomerPhone, setSaleCustomerPhone] = useState('');
  const [saleNotes, setSaleNotes] = useState('');
  const [saleError, setSaleError] = useState('');
  const [saleSuccess, setSaleSuccess] = useState('');

  // Reversal state
  const [reversalSaleId, setReversalSaleId] = useState<string | null>(null);
  const [reversalReason, setReversalReason] = useState('');

  // Brand Settings form state
  const [settingsForm, setSettingsForm] = useState<BrandSettings>(brandSettings);
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Search in inventory
  const [inventorySearch, setInventorySearch] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [sumData, prodsData, salesData, movsData] = await Promise.all([
        api.getDashboardSummary(),
        api.getProducts(),
        api.getSales(),
        api.getInventoryMovements()
      ]);
      setSummary(sumData);
      setProducts(prodsData);
      setSales(salesData);
      setMovements(movsData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
      setSettingsForm(brandSettings);
    }
  }, [isOpen, brandSettings]);

  if (!isOpen) return null;

  // Filter products for inventory table
  const displayedProducts = products.filter(p => {
    if (!inventorySearch.trim()) return true;
    const q = inventorySearch.toLowerCase();
    return p.name_en.toLowerCase().includes(q) || 
           p.name_am.toLowerCase().includes(q) || 
           p.sku.toLowerCase().includes(q) ||
           p.category.toLowerCase().includes(q);
  });

  // Handle Save Product (Add or Edit)
  const handleSaveProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setProductError('');
    setIsSavingProduct(true);
    const formData = new FormData(e.currentTarget);

    const productPayload = {
      sku: (formData.get('sku') as string).trim(),
      name_en: (formData.get('name_en') as string).trim(),
      name_am: (formData.get('name_am') as string).trim(),
      description_en: (formData.get('description_en') as string).trim(),
      description_am: (formData.get('description_am') as string).trim(),
      category: formData.get('category') as JewelryCategory,
      material: formData.get('material') as JewelryMaterial,
      purity: formData.get('purity') as GoldPurity,
      weight_grams: parseFloat(formData.get('weight_grams') as string) || undefined,
      dimensions: (formData.get('dimensions') as string).trim() || undefined,
      purchase_cost: parseFloat(formData.get('purchase_cost') as string) || 0,
      selling_price: parseFloat(formData.get('selling_price') as string) || 0,
      stock_quantity: parseInt(formData.get('stock_quantity') as string, 10) || 0,
      low_stock_threshold: parseInt(formData.get('low_stock_threshold') as string, 10) || 2,
      status: (parseInt(formData.get('stock_quantity') as string, 10) || 0) === 0 ? 'out_of_stock' as const : 'available' as const,
      price_on_request: formData.get('price_on_request') === 'on',
      is_featured: formData.get('is_featured') === 'on',
      images: [
        {
          id: `img-${Date.now()}`,
          url: (formData.get('image_url') as string).trim() || '/src/assets/images/product_gold_necklace_1792823131025.jpg',
          alt_en: (formData.get('name_en') as string).trim(),
          alt_am: (formData.get('name_am') as string).trim(),
          is_primary: true
        }
      ]
    };

    try {
      if (editingProduct) {
        await api.updateProduct(editingProduct.id, productPayload);
        setEditingProduct(null);
      } else {
        await api.createProduct(productPayload);
        setIsAddProductOpen(false);
      }
    } catch (error) {
      setProductError(error instanceof Error ? error.message : 'Unable to save product. Please try again.');
      setIsSavingProduct(false);
      return;
    } finally {
      setIsSavingProduct(false);
    }

    try {
      await loadData();
    } catch (error) {
      console.error('Product was saved, but the admin inventory could not be refreshed', error);
    }
    onRefreshCatalog();
  };

  // Handle Stock Adjustment
  const handleStockAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockAdjustProduct) return;

    await api.adjustStock(
      stockAdjustProduct.id,
      stockAdjustQty,
      stockAdjustType,
      stockAdjustReason || 'Manual Admin Stock Adjustment'
    );
    setStockAdjustProduct(null);
    setStockAdjustReason('');
    await loadData();
    onRefreshCatalog();
  };

  // Handle Complete Sale
  const handleRecordSale = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaleError('');
    setSaleSuccess('');

    const targetProd = products.find(p => p.id === saleProductId);
    if (!targetProd) {
      setSaleError('Please select a valid jewelry item.');
      return;
    }
    if (targetProd.stock_quantity < saleQuantity) {
      setSaleError(`${t('errorInsufficientStock')} (Available: ${targetProd.stock_quantity})`);
      return;
    }

    try {
      await api.recordSale({
        items: [
          {
            product_id: targetProd.id,
            quantity: saleQuantity,
            unit_price: salePrice || targetProd.selling_price
          }
        ],
        payment_method: salePaymentMethod,
        discount: saleDiscount,
        customer_name: saleCustomerName,
        customer_phone: saleCustomerPhone,
        notes: saleNotes
      });

      setSaleSuccess(t('saleSuccessMsg'));
      setTimeout(() => {
        setIsRecordSaleOpen(false);
        setSaleProductId('');
        setSaleQuantity(1);
        setSalePrice(0);
        setSaleDiscount(0);
        setSaleCustomerName('');
        setSaleCustomerPhone('');
        setSaleNotes('');
        setSaleSuccess('');
      }, 1500);

      await loadData();
      onRefreshCatalog();
    } catch (err: any) {
      setSaleError(err.message || 'Failed to record sale');
    }
  };

  // Handle Sale Reversal
  const handleConfirmReversal = async () => {
    if (!reversalSaleId) return;
    try {
      await api.reverseSale(reversalSaleId, reversalReason || 'Customer exchange/return');
      setReversalSaleId(null);
      setReversalReason('');
      await loadData();
      onRefreshCatalog();
    } catch (err: any) {
      alert(err.message || 'Failed to reverse sale');
    }
  };

  // Handle Brand Settings Update
  const handleSaveBrandSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdateBrandSettings(settingsForm);
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-[#111111]/95 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 lg:p-6">
      <div className="relative bg-[#171717] border border-[#C8A96E]/40 w-full max-w-7xl h-[94vh] flex flex-col rounded-xs shadow-2xl overflow-hidden">
        {/* Top Header Bar */}
        <div className="p-4 sm:p-6 bg-[#141414] border-b border-[#C8A96E]/20 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xs bg-[#C8A96E]/20 border border-[#C8A96E] flex items-center justify-center text-[#C8A96E]">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-serif font-medium text-[#F7F3EB]">
                {t('adminPortal')}
              </h2>
              <p className="text-[11px] text-[#9E9689]">
                {language === 'am' ? 'የአስተዳዳሪ ማዕከል · ባለቤት፡ ኃይለ መስቀል አይሸሸም' : 'Executive Console · Haile Meskel Aysheshem'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#C8A96E] hover:bg-[#D7B97E] text-[#111111] text-xs font-semibold uppercase tracking-wider rounded-xs transition-colors shadow-sm cursor-pointer"
            >
              <span>{language === 'am' ? 'ወደ ሱቁ ተመለስ' : 'Return to Boutique'}</span>
            </button>
            <button
              onClick={onLogout}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#9E9689] hover:text-[#F7F3EB] border border-[#333333] hover:border-[#555555] rounded-xs transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{t('signOutBtn')}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-[#9E9689] hover:text-[#F7F3EB] rounded-xs cursor-pointer"
              aria-label="Close Admin Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 bg-[#161616] border-b border-[#C8A96E]/15 flex items-center gap-2 overflow-x-auto shrink-0 no-scrollbar">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-4 text-xs font-medium uppercase tracking-wider border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-[#C8A96E] text-[#C8A96E]'
                : 'border-transparent text-[#9E9689] hover:text-[#D5CCC0]'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5 inline mr-1.5" />
            {t('tabOverview')}
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`py-3 px-4 text-xs font-medium uppercase tracking-wider border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'inventory'
                ? 'border-[#C8A96E] text-[#C8A96E]'
                : 'border-transparent text-[#9E9689] hover:text-[#D5CCC0]'
            }`}
          >
            <Package className="w-3.5 h-3.5 inline mr-1.5" />
            {t('tabInventory')}
          </button>
          <button
            onClick={() => setActiveTab('sales')}
            className={`py-3 px-4 text-xs font-medium uppercase tracking-wider border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'sales'
                ? 'border-[#C8A96E] text-[#C8A96E]'
                : 'border-transparent text-[#9E9689] hover:text-[#D5CCC0]'
            }`}
          >
            <Receipt className="w-3.5 h-3.5 inline mr-1.5" />
            {t('tabSalesHistory')}
          </button>
          <button
            onClick={() => setActiveTab('movements')}
            className={`py-3 px-4 text-xs font-medium uppercase tracking-wider border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'movements'
                ? 'border-[#C8A96E] text-[#C8A96E]'
                : 'border-transparent text-[#9E9689] hover:text-[#D5CCC0]'
            }`}
          >
            <History className="w-3.5 h-3.5 inline mr-1.5" />
            {t('tabAuditLog')}
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`py-3 px-4 text-xs font-medium uppercase tracking-wider border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'settings'
                ? 'border-[#C8A96E] text-[#C8A96E]'
                : 'border-transparent text-[#9E9689] hover:text-[#D5CCC0]'
            }`}
          >
            <Settings className="w-3.5 h-3.5 inline mr-1.5" />
            {t('tabSettings')}
          </button>
        </div>

        {/* Tab Body Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#141414]">
          {loading ? (
            <div className="h-full flex items-center justify-center text-xs text-[#9E9689]">
              Loading data...
            </div>
          ) : (
            <>
              {/* TAB 1: OVERVIEW & REPORTS */}
              {activeTab === 'overview' && summary && (
                <div className="space-y-8">
                  {/* KPI Cards Row */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <div className="p-4 bg-[#1A1A1A] border border-[#C8A96E]/20 rounded-xs">
                      <span className="block text-[11px] text-[#9E9689] uppercase tracking-wider mb-1">
                        {t('todaySales')}
                      </span>
                      <span className="text-xl font-bold font-mono tabular-nums text-[#F7F3EB]">
                        {summary.today_sales_count}
                      </span>
                    </div>

                    <div className="p-4 bg-[#1A1A1A] border border-[#C8A96E]/20 rounded-xs">
                      <span className="block text-[11px] text-[#9E9689] uppercase tracking-wider mb-1">
                        {t('todayRevenue')}
                      </span>
                      <span className="text-lg font-bold font-mono tabular-nums text-[#C8A96E]">
                        {formatCurrency(summary.today_revenue)}
                      </span>
                    </div>

                    <div className="p-4 bg-[#1A1A1A] border border-[#C8A96E]/20 rounded-xs">
                      <span className="block text-[11px] text-[#9E9689] uppercase tracking-wider mb-1">
                        {t('monthlyRevenue')}
                      </span>
                      <span className="text-lg font-bold font-mono tabular-nums text-[#C8A96E]">
                        {formatCurrency(summary.monthly_revenue)}
                      </span>
                    </div>

                    <div className="p-4 bg-[#1A1A1A] border border-[#C8A96E]/20 rounded-xs">
                      <span className="block text-[11px] text-[#9E9689] uppercase tracking-wider mb-1">
                        {t('estimatedGrossProfit')}
                      </span>
                      <span className="text-lg font-bold font-mono tabular-nums text-emerald-400">
                        {formatCurrency(summary.estimated_gross_profit)}
                      </span>
                    </div>

                    <div className="p-4 bg-[#1A1A1A] border border-[#C8A96E]/20 rounded-xs">
                      <span className="block text-[11px] text-[#9E9689] uppercase tracking-wider mb-1">
                        {t('totalInventoryValue')}
                      </span>
                      <span className="text-lg font-bold font-mono tabular-nums text-[#F7F3EB]">
                        {formatCurrency(summary.total_inventory_value)}
                      </span>
                    </div>

                    <div className="p-4 bg-[#1A1A1A] border border-[#C8A96E]/20 rounded-xs">
                      <span className="block text-[11px] text-[#9E9689] uppercase tracking-wider mb-1">
                        {t('lowStockAlerts')}
                      </span>
                      <span className={`text-xl font-bold font-mono tabular-nums ${summary.low_stock_count > 0 ? 'text-amber-400' : 'text-[#9E9689]'}`}>
                        {summary.low_stock_count}
                      </span>
                    </div>
                  </div>

                  {/* 2-Column Split: Low Stock Alerts + Best Selling Products */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Low Stock Alerts */}
                    <div className="p-6 bg-[#181818] border border-[#C8A96E]/20 rounded-xs">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-[#C8A96E] flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-400" />
                          <span>{t('lowStockAlerts')}</span>
                        </h3>
                        <span className="text-xs text-[#9E9689] font-mono">
                          {summary.low_stock_products.length} {language === 'am' ? 'ዕቃዎች' : 'items'}
                        </span>
                      </div>

                      {summary.low_stock_products.length === 0 ? (
                        <p className="text-xs text-[#9E9689] italic">
                          {language === 'am' ? 'ሁሉም ጌጣጌጦች በበቂ ክምችት ላይ ናቸው።' : 'All jewelry pieces are adequately stocked.'}
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {summary.low_stock_products.map(p => (
                            <div key={p.id} className="p-3 bg-[#1D1D1D] border border-amber-500/20 flex items-center justify-between text-xs">
                              <div>
                                <span className="font-serif font-medium text-[#F7F3EB] block">
                                  {language === 'am' ? p.name_am : p.name_en}
                                </span>
                                <span className="text-[11px] text-[#8C6D46] font-mono">SKU: {p.sku}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-amber-400 font-mono font-bold tabular-nums">
                                  {p.stock_quantity} left
                                </span>
                                <button
                                  onClick={() => {
                                    setStockAdjustProduct(p);
                                    setStockAdjustQty(5);
                                    setStockAdjustType('restock');
                                  }}
                                  className="px-2.5 py-1 bg-[#C8A96E] text-[#111111] font-semibold text-[10px] uppercase rounded-xs"
                                >
                                  {t('typeRestock')}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Best Selling Products */}
                    <div className="p-6 bg-[#181818] border border-[#C8A96E]/20 rounded-xs">
                      <h3 className="text-sm font-semibold uppercase tracking-wider text-[#C8A96E] mb-4 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        <span>{t('bestSellers')}</span>
                      </h3>

                      {summary.best_selling_products.length === 0 ? (
                        <p className="text-xs text-[#9E9689] italic">
                          {language === 'am' ? 'እስካሁን የተመዘገበ ሽያጭ የለም።' : 'No completed sales recorded yet.'}
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {summary.best_selling_products.map((item, idx) => (
                            <div key={item.product_id} className="p-3 bg-[#1D1D1D] border border-[#C8A96E]/15 flex items-center justify-between text-xs">
                              <div className="flex items-center gap-3">
                                <span className="w-5 h-5 rounded-full bg-[#111111] text-[#C8A96E] border border-[#C8A96E]/30 flex items-center justify-center font-mono text-[10px] font-bold">
                                  {idx + 1}
                                </span>
                                <div>
                                  <span className="font-serif font-medium text-[#F7F3EB] block">
                                    {language === 'am' ? item.product_name_am : item.product_name_en}
                                  </span>
                                  <span className="text-[11px] text-[#6E685E] font-mono">SKU: {item.sku}</span>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="font-mono text-emerald-400 font-bold block">
                                  {item.total_quantity_sold} {language === 'am' ? 'ተሸጠ' : 'sold'}
                                </span>
                                <span className="text-[11px] text-[#9E9689] font-mono">
                                  {formatCurrency(item.total_revenue)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: INVENTORY CATALOG */}
              {activeTab === 'inventory' && (
                <div className="space-y-6">
                  {/* Toolbar */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C6D46]" />
                      <input
                        type="text"
                        value={inventorySearch}
                        onChange={(e) => setInventorySearch(e.target.value)}
                        placeholder="Search inventory by title, SKU, category..."
                        className="w-full pl-10 pr-4 py-2 bg-[#181818] border border-[#C8A96E]/20 text-xs text-[#F7F3EB] outline-hidden rounded-xs"
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          setSaleProductId(products[0]?.id || '');
                          setSalePrice(products[0]?.selling_price || 0);
                          setIsRecordSaleOpen(true);
                        }}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1C1C1C] border border-[#C8A96E]/40 text-[#C8A96E] hover:bg-[#C8A96E] hover:text-[#111111] text-xs font-semibold uppercase tracking-wider transition-colors rounded-xs"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>{t('recordSaleBtn')}</span>
                      </button>

                      <button
                        onClick={() => {
                          setEditingProduct(null);
                          setProductError('');
                          setIsAddProductOpen(true);
                        }}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#C8A96E] hover:bg-[#D7B97E] text-[#111111] text-xs font-semibold uppercase tracking-wider transition-colors rounded-xs shadow-md"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>{t('tabAddProduct')}</span>
                      </button>
                    </div>
                  </div>

                  {/* Inventory Table */}
                  <div className="overflow-x-auto border border-[#C8A96E]/20 rounded-xs">
                    <table className="w-full text-left text-xs text-[#D5CCC0]">
                      <thead className="bg-[#181818] text-[#9E9689] uppercase tracking-wider border-b border-[#C8A96E]/15 text-[11px]">
                        <tr>
                          <th className="py-3 px-4">{t('tblProduct')}</th>
                          <th className="py-3 px-3">{t('tblSku')}</th>
                          <th className="py-3 px-3">{t('tblCategory')}</th>
                          <th className="py-3 px-3">{t('tblMaterial')}</th>
                          <th className="py-3 px-3 text-right">{t('tblWeight')}</th>
                          <th className="py-3 px-3 text-right">{t('tblCost')}</th>
                          <th className="py-3 px-3 text-right">{t('tblPrice')}</th>
                          <th className="py-3 px-3 text-center">{t('tblStock')}</th>
                          <th className="py-3 px-3 text-center">{t('tblStatus')}</th>
                          <th className="py-3 px-4 text-right">{t('tblActions')}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#C8A96E]/10">
                        {displayedProducts.map(prod => (
                          <tr key={prod.id} className="hover:bg-[#1B1B1B] transition-colors">
                            <td className="py-3 px-4 font-serif font-medium text-[#F7F3EB]">
                              <div className="flex items-center gap-3">
                                {prod.images[0]?.url && (
                                  <img
                                    src={prod.images[0].url}
                                    alt=""
                                    className="w-9 h-9 object-cover rounded-xs border border-[#C8A96E]/20 shrink-0"
                                  />
                                )}
                                <div>
                                  <span className="block">{language === 'am' ? prod.name_am : prod.name_en}</span>
                                  <span className="text-[10px] text-[#8C6D46]">
                                    {language === 'am' ? prod.name_en : prod.name_am}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-3 font-mono text-[11px] text-[#8C6D46]">{prod.sku}</td>
                            <td className="py-3 px-3 capitalize">{prod.category}</td>
                            <td className="py-3 px-3 uppercase text-[11px] text-[#C8A96E]">
                              {prod.purity.replace('_', ' ')}
                            </td>
                            <td className="py-3 px-3 text-right font-mono tabular-nums">
                              {prod.weight_grams ? `${prod.weight_grams}g` : '—'}
                            </td>
                            <td className="py-3 px-3 text-right font-mono tabular-nums text-[#9E9689]">
                              {formatCurrency(prod.purchase_cost)}
                            </td>
                            <td className="py-3 px-3 text-right font-mono tabular-nums text-[#F7F3EB] font-medium">
                              {prod.price_on_request ? t('priceOnRequest') : formatCurrency(prod.selling_price)}
                            </td>
                            <td className="py-3 px-3 text-center font-mono font-bold tabular-nums">
                              <span className={prod.stock_quantity <= prod.low_stock_threshold ? 'text-amber-400' : 'text-emerald-400'}>
                                {prod.stock_quantity}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-center">
                              {prod.status === 'available' && <span className="text-emerald-400 text-[10px] uppercase font-semibold">Available</span>}
                              {prod.status === 'low_stock' && <span className="text-amber-400 text-[10px] uppercase font-semibold">Low Stock</span>}
                              {prod.status === 'out_of_stock' && <span className="text-red-400 text-[10px] uppercase font-semibold">Out of Stock</span>}
                              {prod.status === 'archived' && <span className="text-slate-500 text-[10px] uppercase font-semibold">Archived</span>}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {/* Adjust Stock */}
                                <button
                                  onClick={() => {
                                    setStockAdjustProduct(prod);
                                    setStockAdjustQty(1);
                                    setStockAdjustType('restock');
                                  }}
                                  className="p-1.5 text-[#9E9689] hover:text-[#C8A96E] transition-colors"
                                  title={t('adjustStock')}
                                >
                                  <Sliders className="w-4 h-4" />
                                </button>

                                {/* Edit */}
                                <button
                                  onClick={() => {
                                    setEditingProduct(prod);
                                    setIsAddProductOpen(true);
                                  }}
                                  className="p-1.5 text-[#9E9689] hover:text-[#F7F3EB] transition-colors"
                                  title={t('editProduct')}
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>

                                {/* Sell */}
                                <button
                                  onClick={() => {
                                    setSaleProductId(prod.id);
                                    setSalePrice(prod.selling_price);
                                    setIsRecordSaleOpen(true);
                                  }}
                                  disabled={prod.stock_quantity === 0}
                                  className="px-2 py-1 bg-[#C8A96E]/20 text-[#C8A96E] hover:bg-[#C8A96E] hover:text-[#111111] text-[10px] font-semibold uppercase rounded-xs transition-colors disabled:opacity-30"
                                  title="Record Sale"
                                >
                                  {t('recordSaleBtn')}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 3: SALES & RECEIPTS */}
              {activeTab === 'sales' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-[#C8A96E]">
                      {t('tabSalesHistory')} ({sales.length})
                    </h3>

                    <button
                      onClick={() => {
                        setSaleProductId(products[0]?.id || '');
                        setSalePrice(products[0]?.selling_price || 0);
                        setIsRecordSaleOpen(true);
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#C8A96E] text-[#111111] text-xs font-semibold uppercase tracking-wider rounded-xs"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>{t('tabRecordSale')}</span>
                    </button>
                  </div>

                  <div className="space-y-4">
                    {sales.map(sale => (
                      <div
                        key={sale.id}
                        className={`p-4 bg-[#181818] border rounded-xs transition-all ${
                          sale.payment_status === 'reversed'
                            ? 'border-red-500/30 opacity-75'
                            : 'border-[#C8A96E]/20'
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-[#C8A96E]/10">
                          <div>
                            <span className="font-mono text-xs font-bold text-[#C8A96E]">
                              {sale.sale_reference}
                            </span>
                            <span className="text-[11px] text-[#9E9689] ml-3">
                              {formatDate(sale.created_at)}
                            </span>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 border ${
                              sale.payment_status === 'completed'
                                ? 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10'
                                : 'text-red-400 border-red-500/40 bg-red-500/10'
                            }`}>
                              {sale.payment_status === 'completed' ? t('statusCompleted') : t('statusReversed')}
                            </span>

                            {sale.payment_status === 'completed' && (
                              <button
                                onClick={() => {
                                  setReversalSaleId(sale.id);
                                  setReversalReason('');
                                }}
                                className="px-2.5 py-1 text-[10px] text-red-400 hover:text-red-300 border border-red-500/30 hover:border-red-500 rounded-xs uppercase tracking-wider transition-colors"
                              >
                                {t('reverseSaleBtn')}
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Items Sold */}
                        <div className="py-3 space-y-2">
                          {sale.items.map(it => (
                            <div key={it.id} className="flex justify-between text-xs">
                              <div>
                                <span className="font-serif text-[#F7F3EB]">
                                  {language === 'am' ? it.product_name_am : it.product_name_en}
                                </span>
                                <span className="text-[#8C6D46] font-mono text-[11px] ml-2">x{it.quantity}</span>
                              </div>
                              <span className="font-mono tabular-nums text-[#F7F3EB]">
                                {formatCurrency(it.subtotal)}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Customer & Payment Info */}
                        <div className="pt-3 border-t border-[#C8A96E]/10 flex flex-wrap items-center justify-between text-xs text-[#9E9689]">
                          <div className="space-x-4">
                            <span>{t('paymentMethod')}: <strong className="text-[#D5CCC0] uppercase">{sale.payment_method.replace('_', ' ')}</strong></span>
                            {sale.customer_name && <span>{t('customer')}: <strong className="text-[#D5CCC0]">{sale.customer_name}</strong></span>}
                          </div>

                          <div className="text-right">
                            <span className="text-sm font-bold font-mono tabular-nums text-[#C8A96E]">
                              {formatCurrency(sale.total_amount)}
                            </span>
                          </div>
                        </div>

                        {sale.reversal_reason && (
                          <div className="mt-3 p-2 bg-red-500/10 border border-red-500/20 text-[11px] text-red-300">
                            <strong>Reversal Reason:</strong> {sale.reversal_reason}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: STOCK MOVEMENTS AUDIT LOG */}
              {activeTab === 'movements' && (
                <div className="space-y-6">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-[#C8A96E]">
                    {t('tabAuditLog')}
                  </h3>

                  <div className="overflow-x-auto border border-[#C8A96E]/20 rounded-xs">
                    <table className="w-full text-left text-xs text-[#D5CCC0]">
                      <thead className="bg-[#181818] text-[#9E9689] uppercase tracking-wider border-b border-[#C8A96E]/15 text-[11px]">
                        <tr>
                          <th className="py-3 px-4">{t('date')}</th>
                          <th className="py-3 px-3">{t('tblProduct')}</th>
                          <th className="py-3 px-3">{t('movementType')}</th>
                          <th className="py-3 px-3 text-center">{t('prevQty')}</th>
                          <th className="py-3 px-3 text-center">{t('change')}</th>
                          <th className="py-3 px-3 text-center">{t('newQty')}</th>
                          <th className="py-3 px-4">{t('adjustReason')}</th>
                          <th className="py-3 px-4">{t('responsibleAdmin')}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#C8A96E]/10">
                        {movements.map(mov => (
                          <tr key={mov.id} className="hover:bg-[#1B1B1B]">
                            <td className="py-3 px-4 font-mono text-[11px] text-[#9E9689]">
                              {formatDate(mov.created_at)}
                            </td>
                            <td className="py-3 px-3 font-serif font-medium text-[#F7F3EB]">
                              {mov.product_name}
                              <span className="text-[10px] text-[#8C6D46] block font-mono">SKU: {mov.product_sku}</span>
                            </td>
                            <td className="py-3 px-3 uppercase text-[10px] font-semibold tracking-wider text-[#C8A96E]">
                              {mov.movement_type.replace('_', ' ')}
                            </td>
                            <td className="py-3 px-3 text-center font-mono tabular-nums">{mov.previous_quantity}</td>
                            <td className="py-3 px-3 text-center font-mono font-bold tabular-nums">
                              <span className={mov.change_quantity > 0 ? 'text-emerald-400' : 'text-red-400'}>
                                {mov.change_quantity > 0 ? `+${mov.change_quantity}` : mov.change_quantity}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-center font-mono tabular-nums font-semibold text-[#F7F3EB]">
                              {mov.new_quantity}
                            </td>
                            <td className="py-3 px-4 text-[#9E9689] text-[11px]">{mov.reason || '—'}</td>
                            <td className="py-3 px-4 text-[11px] text-[#D5CCC0]">{mov.admin_name}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 5: BRAND & FOUNDER SETTINGS */}
              {activeTab === 'settings' && (
                <div className="max-w-3xl space-y-6">
                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-[#C8A96E] mb-1">
                      {t('manageFounderTitle')}
                    </h3>
                    <p className="text-xs text-[#9E9689]">
                      Edit brand taglines, founder portrait, and boutique details in English and Amharic.
                    </p>
                  </div>

                  {settingsSaved && (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 rounded-xs">
                      <Check className="w-4 h-4" />
                      <span>{t('settingsSaved')}</span>
                    </div>
                  )}

                  <form onSubmit={handleSaveBrandSettings} className="space-y-5">
                    {/* Founder Name */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-[#C8A96E] uppercase tracking-wider mb-1">
                          {t('founderNameEn')}
                        </label>
                        <input
                          type="text"
                          value={settingsForm.founder_name_en}
                          onChange={(e) => setSettingsForm({ ...settingsForm, founder_name_en: e.target.value })}
                          className="w-full px-3 py-2 bg-[#181818] border border-[#C8A96E]/20 text-xs text-[#F7F3EB] rounded-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[#C8A96E] uppercase tracking-wider mb-1 font-amharic">
                          {t('founderNameAm')}
                        </label>
                        <input
                          type="text"
                          value={settingsForm.founder_name_am}
                          onChange={(e) => setSettingsForm({ ...settingsForm, founder_name_am: e.target.value })}
                          className="w-full px-3 py-2 bg-[#181818] border border-[#C8A96E]/20 text-xs text-[#F7F3EB] font-amharic rounded-xs"
                        />
                      </div>
                    </div>

                    {/* Founder Title */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-[#C8A96E] uppercase tracking-wider mb-1">
                          {t('founderTitleEn')}
                        </label>
                        <input
                          type="text"
                          value={settingsForm.founder_title_en}
                          onChange={(e) => setSettingsForm({ ...settingsForm, founder_title_en: e.target.value })}
                          className="w-full px-3 py-2 bg-[#181818] border border-[#C8A96E]/20 text-xs text-[#F7F3EB] rounded-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[#C8A96E] uppercase tracking-wider mb-1 font-amharic">
                          {t('founderTitleAm')}
                        </label>
                        <input
                          type="text"
                          value={settingsForm.founder_title_am}
                          onChange={(e) => setSettingsForm({ ...settingsForm, founder_title_am: e.target.value })}
                          className="w-full px-3 py-2 bg-[#181818] border border-[#C8A96E]/20 text-xs text-[#F7F3EB] font-amharic rounded-xs"
                        />
                      </div>
                    </div>

                    {/* Taglines */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-[#C8A96E] uppercase tracking-wider mb-1">
                          Brand Tagline (English)
                        </label>
                        <input
                          type="text"
                          value={settingsForm.tagline_en}
                          onChange={(e) => setSettingsForm({ ...settingsForm, tagline_en: e.target.value })}
                          className="w-full px-3 py-2 bg-[#181818] border border-[#C8A96E]/20 text-xs text-[#F7F3EB] rounded-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[#C8A96E] uppercase tracking-wider mb-1 font-amharic">
                          Brand Tagline (Amharic)
                        </label>
                        <input
                          type="text"
                          value={settingsForm.tagline_am}
                          onChange={(e) => setSettingsForm({ ...settingsForm, tagline_am: e.target.value })}
                          className="w-full px-3 py-2 bg-[#181818] border border-[#C8A96E]/20 text-xs text-[#F7F3EB] font-amharic rounded-xs"
                        />
                      </div>
                    </div>

                    {/* Founder Bio */}
                    <div>
                      <label className="block text-xs font-medium text-[#C8A96E] uppercase tracking-wider mb-1">
                        {t('founderBioEn')}
                      </label>
                      <textarea
                        rows={3}
                        value={settingsForm.founder_bio_en}
                        onChange={(e) => setSettingsForm({ ...settingsForm, founder_bio_en: e.target.value })}
                        className="w-full px-3 py-2 bg-[#181818] border border-[#C8A96E]/20 text-xs text-[#F7F3EB] rounded-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#C8A96E] uppercase tracking-wider mb-1 font-amharic">
                        {t('founderBioAm')}
                      </label>
                      <textarea
                        rows={3}
                        value={settingsForm.founder_bio_am}
                        onChange={(e) => setSettingsForm({ ...settingsForm, founder_bio_am: e.target.value })}
                        className="w-full px-3 py-2 bg-[#181818] border border-[#C8A96E]/20 text-xs text-[#F7F3EB] font-amharic rounded-xs"
                      />
                    </div>

                    {/* Founder Photo Selection */}
                    <div>
                      <label className="block text-xs font-medium text-[#C8A96E] uppercase tracking-wider mb-2">
                        {language === 'am' ? 'የመስራቹ ፎቶ (የቀረቡት የኃይለ መስቀል ፎቶዎች)' : "Founder Portrait (Haile's Official Photos)"}
                      </label>
                      <div className="grid grid-cols-3 gap-3 mb-3">
                        {[
                          {
                            url: '/assets/aistudio/photo_2026-08-12_19-27-38_eb6e601c.jpg',
                            title: 'Seated Atelier'
                          },
                          {
                            url: '/assets/aistudio/photo_2026-05-19_10-42-26_5b8ef9ec.jpg',
                            title: 'Editorial B&W'
                          },
                          {
                            url: '/assets/aistudio/photo_2025-06-08_08-49-06_b120c934.jpg',
                            title: 'Silhouette'
                          }
                        ].map((photo, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setSettingsForm({ ...settingsForm, founder_photo_url: photo.url })}
                            className={`p-1.5 border rounded-xs text-left transition-all cursor-pointer ${
                              settingsForm.founder_photo_url === photo.url
                                ? 'border-[#C8A96E] bg-[#C8A96E]/15 ring-1 ring-[#C8A96E]'
                                : 'border-[#C8A96E]/20 bg-[#141414] hover:border-[#C8A96E]/60'
                            }`}
                          >
                            <img src={photo.url} alt="" className="w-full aspect-square object-cover mb-1 rounded-xs" />
                            <span className="text-[10px] text-[#D5CCC0] block text-center font-medium truncate">
                              {photo.title}
                            </span>
                          </button>
                        ))}
                      </div>

                      <input
                        type="text"
                        value={settingsForm.founder_photo_url}
                        onChange={(e) => setSettingsForm({ ...settingsForm, founder_photo_url: e.target.value })}
                        placeholder="/assets/aistudio/... or URL"
                        className="w-full px-3 py-2 bg-[#181818] border border-[#C8A96E]/20 text-xs text-[#F7F3EB] rounded-xs font-mono"
                      />
                    </div>

                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-[#C8A96E] hover:bg-[#D7B97E] text-[#111111] text-xs font-semibold uppercase tracking-wider rounded-xs shadow-md"
                    >
                      <Check className="w-4 h-4" />
                      <span>{t('saveBrandSettings')}</span>
                    </button>
                  </form>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* MODAL 1: ADD / EDIT PRODUCT */}
      {isAddProductOpen && (
        <div className="fixed inset-0 z-60 bg-[#111111]/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative bg-[#1A1A1A] border border-[#C8A96E]/30 w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 rounded-xs shadow-2xl">
            <button
              onClick={() => setIsAddProductOpen(false)}
              className="absolute top-4 right-4 text-[#9E9689] hover:text-[#F7F3EB]"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-serif font-medium text-[#F7F3EB] mb-4">
              {editingProduct ? t('formEditTitle') : t('formAddTitle')}
            </h3>

            {productError && (
              <div role="alert" className="p-3 mb-4 bg-red-500/10 border border-red-500/30 text-red-300 text-xs rounded-xs">
                {productError}
              </div>
            )}

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#C8A96E] uppercase tracking-wider mb-1">
                    {t('sku')} *
                  </label>
                  <input
                    name="sku"
                    type="text"
                    required
                    defaultValue={editingProduct?.sku || `FNL-${Date.now()}`}
                    className="w-full px-3 py-2 bg-[#141414] border border-[#C8A96E]/20 text-xs text-[#F7F3EB] rounded-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#C8A96E] uppercase tracking-wider mb-1">
                    {t('categoryLabel')} *
                  </label>
                  <select
                    name="category"
                    defaultValue={editingProduct?.category || 'necklaces'}
                    className="w-full px-3 py-2 bg-[#141414] border border-[#C8A96E]/20 text-xs text-[#F7F3EB] rounded-xs"
                  >
                    <option value="gold">{t('categoryGold')}</option>
                    <option value="silver">{t('categorySilver')}</option>
                    <option value="rings">{t('categoryRings')}</option>
                    <option value="bracelets">{t('categoryBracelets')}</option>
                    <option value="necklaces">{t('categoryNecklaces')}</option>
                    <option value="earrings">{t('categoryEarrings')}</option>
                    <option value="wedding">{t('categoryWedding')}</option>
                    <option value="custom">{t('categoryCustom')}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#C8A96E] uppercase tracking-wider mb-1">
                    {t('nameEn')} *
                  </label>
                  <input
                    name="name_en"
                    type="text"
                    required
                    defaultValue={editingProduct?.name_en || ''}
                    className="w-full px-3 py-2 bg-[#141414] border border-[#C8A96E]/20 text-xs text-[#F7F3EB] rounded-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#C8A96E] uppercase tracking-wider mb-1 font-amharic">
                    {t('nameAm')} *
                  </label>
                  <input
                    name="name_am"
                    type="text"
                    required
                    defaultValue={editingProduct?.name_am || ''}
                    className="w-full px-3 py-2 bg-[#141414] border border-[#C8A96E]/20 text-xs text-[#F7F3EB] font-amharic rounded-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#C8A96E] uppercase tracking-wider mb-1">
                    {t('materialLabel')} *
                  </label>
                  <select
                    name="material"
                    defaultValue={editingProduct?.material || 'gold'}
                    className="w-full px-3 py-2 bg-[#141414] border border-[#C8A96E]/20 text-xs text-[#F7F3EB] rounded-xs"
                  >
                    <option value="gold">Gold</option>
                    <option value="silver">Silver</option>
                    <option value="mixed">Mixed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#C8A96E] uppercase tracking-wider mb-1">
                    {t('purityLabel')} *
                  </label>
                  <select
                    name="purity"
                    defaultValue={editingProduct?.purity || '21K'}
                    className="w-full px-3 py-2 bg-[#141414] border border-[#C8A96E]/20 text-xs text-[#F7F3EB] rounded-xs"
                  >
                    <option value="21K">21K (Gold)</option>
                    <option value="18K">18K (Gold)</option>
                    <option value="24K">24K (Pure Gold)</option>
                    <option value="925_sterling">925 Sterling Silver</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#C8A96E] uppercase tracking-wider mb-1">
                    {t('weightGrams')}
                  </label>
                  <input
                    name="weight_grams"
                    type="number"
                    step="0.1"
                    defaultValue={editingProduct?.weight_grams || 10.0}
                    className="w-full px-3 py-2 bg-[#141414] border border-[#C8A96E]/20 text-xs text-[#F7F3EB] rounded-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#C8A96E] uppercase tracking-wider mb-1">
                    {t('purchaseCostLabel')} *
                  </label>
                  <input
                    name="purchase_cost"
                    type="number"
                    required
                    defaultValue={editingProduct?.purchase_cost || 50000}
                    className="w-full px-3 py-2 bg-[#141414] border border-[#C8A96E]/20 text-xs text-[#F7F3EB] rounded-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#C8A96E] uppercase tracking-wider mb-1">
                    {t('sellingPriceLabel')} *
                  </label>
                  <input
                    name="selling_price"
                    type="number"
                    required
                    defaultValue={editingProduct?.selling_price || 65000}
                    className="w-full px-3 py-2 bg-[#141414] border border-[#C8A96E]/20 text-xs text-[#F7F3EB] rounded-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#C8A96E] uppercase tracking-wider mb-1">
                    {t('initialStock')} *
                  </label>
                  <input
                    name="stock_quantity"
                    type="number"
                    required
                    defaultValue={editingProduct?.stock_quantity ?? 3}
                    className="w-full px-3 py-2 bg-[#141414] border border-[#C8A96E]/20 text-xs text-[#F7F3EB] rounded-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#C8A96E] uppercase tracking-wider mb-1">
                    {t('lowStockThreshold')} *
                  </label>
                  <input
                    name="low_stock_threshold"
                    type="number"
                    required
                    defaultValue={editingProduct?.low_stock_threshold ?? 2}
                    className="w-full px-3 py-2 bg-[#141414] border border-[#C8A96E]/20 text-xs text-[#F7F3EB] rounded-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#C8A96E] uppercase tracking-wider mb-1">
                  {t('imageUrlLabel')}
                </label>
                <input
                  name="image_url"
                  type="text"
                  defaultValue={editingProduct?.images[0]?.url || '/src/assets/images/product_gold_necklace_1792823131025.jpg'}
                  className="w-full px-3 py-2 bg-[#141414] border border-[#C8A96E]/20 text-xs text-[#F7F3EB] rounded-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#C8A96E] uppercase tracking-wider mb-1">
                  {t('descEn')} *
                </label>
                <textarea
                  name="description_en"
                  rows={2}
                  required
                  defaultValue={editingProduct?.description_en || ''}
                  className="w-full px-3 py-2 bg-[#141414] border border-[#C8A96E]/20 text-xs text-[#F7F3EB] rounded-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#C8A96E] uppercase tracking-wider mb-1 font-amharic">
                  {t('descAm')} *
                </label>
                <textarea
                  name="description_am"
                  rows={2}
                  required
                  defaultValue={editingProduct?.description_am || ''}
                  className="w-full px-3 py-2 bg-[#141414] border border-[#C8A96E]/20 text-xs text-[#F7F3EB] font-amharic rounded-xs"
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[#C8A96E]/15">
                <button
                  type="button"
                  onClick={() => setIsAddProductOpen(false)}
                  className="text-xs text-[#9E9689] hover:text-[#F7F3EB]"
                >
                  {t('cancelBtn')}
                </button>
                <button
                  type="submit"
                  disabled={isSavingProduct}
                  className="px-6 py-2.5 bg-[#C8A96E] hover:bg-[#D7B97E] text-[#111111] text-xs font-semibold uppercase tracking-wider rounded-xs shadow-md"
                >
                  {isSavingProduct ? '...' : t('saveProductBtn')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADJUST STOCK */}
      {stockAdjustProduct && (
        <div className="fixed inset-0 z-60 bg-[#111111]/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative bg-[#1A1A1A] border border-[#C8A96E]/30 w-full max-w-md p-6 rounded-xs shadow-2xl">
            <button
              onClick={() => setStockAdjustProduct(null)}
              className="absolute top-4 right-4 text-[#9E9689] hover:text-[#F7F3EB]"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-serif font-medium text-[#F7F3EB] mb-2">
              {t('stockAdjustTitle')}
            </h3>
            <p className="text-xs text-[#C8A96E] font-medium mb-4">
              {stockAdjustProduct.name_en} ({stockAdjustProduct.sku})
            </p>

            <form onSubmit={handleStockAdjustment} className="space-y-4">
              <div className="p-3 bg-[#141414] border border-[#C8A96E]/15 flex justify-between text-xs">
                <span className="text-[#9E9689]">{t('currentStock')}:</span>
                <span className="font-mono font-bold text-[#F7F3EB]">{stockAdjustProduct.stock_quantity}</span>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#C8A96E] uppercase tracking-wider mb-1">
                  {t('adjustType')}
                </label>
                <select
                  value={stockAdjustType}
                  onChange={(e) => setStockAdjustType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-[#141414] border border-[#C8A96E]/20 text-xs text-[#F7F3EB] rounded-xs"
                >
                  <option value="restock">{t('typeRestock')}</option>
                  <option value="correction">{t('typeCorrection')}</option>
                  <option value="damage">{t('typeDamage')}</option>
                  <option value="return">{t('typeReturn')}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#C8A96E] uppercase tracking-wider mb-1">
                  {t('quantityChange')}
                </label>
                <input
                  type="number"
                  required
                  value={stockAdjustQty}
                  onChange={(e) => setStockAdjustQty(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3 py-2 bg-[#141414] border border-[#C8A96E]/20 text-xs text-[#F7F3EB] rounded-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#C8A96E] uppercase tracking-wider mb-1">
                  {t('adjustReason')}
                </label>
                <input
                  type="text"
                  required
                  value={stockAdjustReason}
                  onChange={(e) => setStockAdjustReason(e.target.value)}
                  placeholder="e.g. Workshop production batch, inventory count..."
                  className="w-full px-3 py-2 bg-[#141414] border border-[#C8A96E]/20 text-xs text-[#F7F3EB] rounded-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setStockAdjustProduct(null)}
                  className="text-xs text-[#9E9689] hover:text-[#F7F3EB]"
                >
                  {t('cancelBtn')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#C8A96E] hover:bg-[#D7B97E] text-[#111111] text-xs font-semibold uppercase tracking-wider rounded-xs"
                >
                  {t('submitAdjustment')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: RECORD SALE */}
      {isRecordSaleOpen && (
        <div className="fixed inset-0 z-60 bg-[#111111]/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative bg-[#1A1A1A] border border-[#C8A96E]/30 w-full max-w-lg p-6 rounded-xs shadow-2xl">
            <button
              onClick={() => setIsRecordSaleOpen(false)}
              className="absolute top-4 right-4 text-[#9E9689] hover:text-[#F7F3EB]"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-serif font-medium text-[#F7F3EB] mb-1">
              {t('saleTitle')}
            </h3>
            <p className="text-xs text-[#9E9689] mb-4">
              Deduct inventory in real-time, generate receipt reference, and record customer details.
            </p>

            {saleError && (
              <div className="p-3 mb-4 bg-red-500/10 border border-red-500/30 text-red-300 text-xs rounded-xs">
                {saleError}
              </div>
            )}
            {saleSuccess && (
              <div className="p-3 mb-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs rounded-xs">
                {saleSuccess}
              </div>
            )}

            <form onSubmit={handleRecordSale} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#C8A96E] uppercase tracking-wider mb-1">
                  {t('selectProduct')} *
                </label>
                <select
                  value={saleProductId}
                  onChange={(e) => {
                    setSaleProductId(e.target.value);
                    const prod = products.find(p => p.id === e.target.value);
                    if (prod) setSalePrice(prod.selling_price);
                  }}
                  className="w-full px-3 py-2 bg-[#141414] border border-[#C8A96E]/20 text-xs text-[#F7F3EB] rounded-xs"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id} disabled={p.stock_quantity === 0}>
                      {language === 'am' ? p.name_am : p.name_en} ({p.sku}) — Stock: {p.stock_quantity}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#C8A96E] uppercase tracking-wider mb-1">
                    {t('saleQuantity')} *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={saleQuantity}
                    onChange={(e) => setSaleQuantity(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-3 py-2 bg-[#141414] border border-[#C8A96E]/20 text-xs text-[#F7F3EB] rounded-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#C8A96E] uppercase tracking-wider mb-1">
                    {t('actualSellingPrice')} *
                  </label>
                  <input
                    type="number"
                    required
                    value={salePrice}
                    onChange={(e) => setSalePrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-[#141414] border border-[#C8A96E]/20 text-xs text-[#F7F3EB] rounded-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#C8A96E] uppercase tracking-wider mb-1">
                    {t('paymentMethod')} *
                  </label>
                  <select
                    value={salePaymentMethod}
                    onChange={(e) => setSalePaymentMethod(e.target.value as any)}
                    className="w-full px-3 py-2 bg-[#141414] border border-[#C8A96E]/20 text-xs text-[#F7F3EB] rounded-xs"
                  >
                    <option value="cash">{t('methodCash')}</option>
                    <option value="bank_transfer">{t('methodBank')}</option>
                    <option value="telebirr">{t('methodTelebirr')}</option>
                    <option value="cbe_birr">{t('methodCbeBirr')}</option>
                    <option value="card">{t('methodCard')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#C8A96E] uppercase tracking-wider mb-1">
                    {t('discountApplied')}
                  </label>
                  <input
                    type="number"
                    value={saleDiscount}
                    onChange={(e) => setSaleDiscount(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-[#141414] border border-[#C8A96E]/20 text-xs text-[#F7F3EB] rounded-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#C8A96E] uppercase tracking-wider mb-1">
                    {t('customerName')}
                  </label>
                  <input
                    type="text"
                    value={saleCustomerName}
                    onChange={(e) => setSaleCustomerName(e.target.value)}
                    placeholder="e.g. Almaz Kebede"
                    className="w-full px-3 py-2 bg-[#141414] border border-[#C8A96E]/20 text-xs text-[#F7F3EB] rounded-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#C8A96E] uppercase tracking-wider mb-1">
                    {t('customerPhone')}
                  </label>
                  <input
                    type="tel"
                    value={saleCustomerPhone}
                    onChange={(e) => setSaleCustomerPhone(e.target.value)}
                    placeholder="+251 9..."
                    className="w-full px-3 py-2 bg-[#141414] border border-[#C8A96E]/20 text-xs text-[#F7F3EB] rounded-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#C8A96E] uppercase tracking-wider mb-1">
                  {t('saleNotes')}
                </label>
                <input
                  type="text"
                  value={saleNotes}
                  onChange={(e) => setSaleNotes(e.target.value)}
                  placeholder="e.g. Ring sized to 7.5, complimentary velvet box included"
                  className="w-full px-3 py-2 bg-[#141414] border border-[#C8A96E]/20 text-xs text-[#F7F3EB] rounded-xs"
                />
              </div>

              {/* Total Calculation */}
              <div className="p-3 bg-[#141414] border border-[#C8A96E]/20 flex justify-between text-xs font-medium">
                <span className="text-[#9E9689]">Final Net Total:</span>
                <span className="font-mono text-sm text-[#C8A96E] font-bold">
                  {formatCurrency(Math.max(0, (saleQuantity * salePrice) - saleDiscount))}
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsRecordSaleOpen(false)}
                  className="text-xs text-[#9E9689] hover:text-[#F7F3EB]"
                >
                  {t('cancelBtn')}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#C8A96E] hover:bg-[#D7B97E] text-[#111111] text-xs font-semibold uppercase tracking-wider rounded-xs shadow-md"
                >
                  {t('completeSaleBtn')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: SALE REVERSAL CONFIRMATION */}
      {reversalSaleId && (
        <div className="fixed inset-0 z-60 bg-[#111111]/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative bg-[#1A1A1A] border border-red-500/30 w-full max-w-md p-6 rounded-xs shadow-2xl">
            <h3 className="text-lg font-serif font-medium text-red-400 mb-2">
              {t('reversalConfirmTitle')}
            </h3>
            <p className="text-xs text-[#D5CCC0] mb-4">
              {t('reversalConfirmMsg')}
            </p>

            <div className="mb-4">
              <label className="block text-xs font-medium text-[#C8A96E] uppercase tracking-wider mb-1">
                {t('reversalReasonLabel')} *
              </label>
              <textarea
                rows={3}
                required
                value={reversalReason}
                onChange={(e) => setReversalReason(e.target.value)}
                placeholder="e.g. Customer returned unworn item within 7 days, full refund issued."
                className="w-full px-3 py-2 bg-[#141414] border border-[#C8A96E]/20 text-xs text-[#F7F3EB] rounded-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setReversalSaleId(null)}
                className="text-xs text-[#9E9689] hover:text-[#F7F3EB]"
              >
                {t('cancelBtn')}
              </button>
              <button
                onClick={handleConfirmReversal}
                disabled={!reversalReason.trim()}
                className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold uppercase tracking-wider rounded-xs disabled:opacity-50"
              >
                {t('confirmReversalBtn')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
