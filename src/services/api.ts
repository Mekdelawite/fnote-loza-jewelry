import { 
  Product, 
  Sale, 
  InventoryMovement, 
  DashboardSummary, 
  BrandSettings, 
  AdminUser,
  JewelryCategory,
  JewelryMaterial
} from '../types';
import { 
  INITIAL_PRODUCTS, 
  INITIAL_SALES, 
  INITIAL_MOVEMENTS, 
  INITIAL_BRAND_SETTINGS
} from '../data/seedData';

// Storage keys for resilient browser persistence matching backend state
const STORAGE_PREFIX = 'fnote_loza_';
const PRODUCTS_KEY = `${STORAGE_PREFIX}products`;
const SALES_KEY = `${STORAGE_PREFIX}sales`;
const MOVEMENTS_KEY = `${STORAGE_PREFIX}movements`;
const SETTINGS_KEY = `${STORAGE_PREFIX}settings`;
const AUTH_KEY = `${STORAGE_PREFIX}auth_user`;
const ACCESS_TOKEN_KEY = `${STORAGE_PREFIX}access_token`;
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000').replace(/\/+$/, '');

class AuthenticationError extends Error {}

function clearAuthentication(): void {
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(AUTH_KEY);
  window.dispatchEvent(new Event('fnote-admin-unauthorized'));
}

async function requestApi<T>(
  path: string,
  init: RequestInit = {},
  requiresAuthentication = false
): Promise<T> {
  const token = sessionStorage.getItem(ACCESS_TOKEN_KEY);
  if (requiresAuthentication && !token) {
    clearAuthentication();
    throw new AuthenticationError('Please sign in again to continue.');
  }

  const headers = new Headers(init.headers);
  if (requiresAuthentication && token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers });
  if (!response.ok) {
    const payload = await response.json().catch(() => null) as { detail?: string } | null;
    const message = payload?.detail || `Request failed (${response.status})`;
    if (requiresAuthentication && (response.status === 401 || response.status === 403)) {
      clearAuthentication();
      throw new AuthenticationError(message);
    }
    throw new Error(message);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

// Memory/Local persistence helpers
function getStored<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

// Initialize local stores if not present
if (!localStorage.getItem(PRODUCTS_KEY)) {
  setStored(PRODUCTS_KEY, INITIAL_PRODUCTS);
}
if (!localStorage.getItem(SALES_KEY)) {
  setStored(SALES_KEY, INITIAL_SALES);
}
if (!localStorage.getItem(MOVEMENTS_KEY)) {
  setStored(MOVEMENTS_KEY, INITIAL_MOVEMENTS);
}
if (!localStorage.getItem(SETTINGS_KEY)) {
  setStored(SETTINGS_KEY, INITIAL_BRAND_SETTINGS);
} else {
  // If settings already stored without photo, inject new photo
  const current = getStored<any>(SETTINGS_KEY, INITIAL_BRAND_SETTINGS);
  if (!current.founder_photo_url || current.founder_photo_url === '') {
    current.founder_photo_url = INITIAL_BRAND_SETTINGS.founder_photo_url;
    current.founder_gallery_photos = INITIAL_BRAND_SETTINGS.founder_gallery_photos;
    setStored(SETTINGS_KEY, current);
  }
}

// Remove authentication state written by the old demo-only sign-in flow.
localStorage.removeItem(AUTH_KEY);

// API Service Implementation
export const api = {
  // Products
  async getProducts(filter?: {
    category?: JewelryCategory;
    material?: JewelryMaterial;
    search?: string;
    availableOnly?: boolean;
  }): Promise<Product[]> {
    try {
      const products = await requestApi<Product[]>('/api/products');
      return applyProductFilters(products, filter);
    } catch {
      // Backend fallback
    }

    let products = getStored<Product[]>(PRODUCTS_KEY, INITIAL_PRODUCTS);
    return applyProductFilters(products, filter);
  },

  async getProductById(id: string): Promise<Product | null> {
    try {
      return await requestApi<Product>(`/api/products/${id}`);
    } catch {
      // Fallback
    }
    const products = getStored<Product[]>(PRODUCTS_KEY, INITIAL_PRODUCTS);
    return products.find(p => p.id === id) || null;
  },

  async createProduct(productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> {
    const created = await requestApi<Product>('/api/products', {
      method: 'POST',
      body: JSON.stringify(productData)
    }, true);
    const products = getStored<Product[]>(PRODUCTS_KEY, INITIAL_PRODUCTS);
    setStored(PRODUCTS_KEY, [created, ...products]);
    return created;
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    const updated = await requestApi<Product>(`/api/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    }, true);
    const products = getStored<Product[]>(PRODUCTS_KEY, INITIAL_PRODUCTS);
    setStored(PRODUCTS_KEY, products.map(p => p.id === id ? updated : p));
    return updated;
  },

  async deleteProduct(id: string): Promise<boolean> {
    try {
      await requestApi<{ message: string }>(`/api/products/${id}`, { method: 'DELETE' }, true);
      const products = getStored<Product[]>(PRODUCTS_KEY, INITIAL_PRODUCTS);
      setStored(PRODUCTS_KEY, products.filter(p => p.id !== id));
      return true;
    } catch (error) {
      if (error instanceof AuthenticationError) throw error;
      // Fallback
    }
    const products = getStored<Product[]>(PRODUCTS_KEY, INITIAL_PRODUCTS);
    setStored(PRODUCTS_KEY, products.filter(p => p.id !== id));
    return true;
  },

  // Inventory Stock Adjustment
  async adjustStock(
    productId: string, 
    change: number, 
    movementType: InventoryMovement['movement_type'], 
    reason: string
  ): Promise<Product> {
    try {
      const updated = await requestApi<Product>(`/api/products/${productId}/stock`, {
        method: 'POST',
        body: JSON.stringify({ change, movement_type: movementType, reason })
      }, true);
      return updated;
    } catch (error) {
      if (error instanceof AuthenticationError) throw error;
      // Fallback
    }

    const products = getStored<Product[]>(PRODUCTS_KEY, INITIAL_PRODUCTS);
    const p = products.find(x => x.id === productId);
    if (!p) throw new Error('Product not found');

    const prevQty = p.stock_quantity;
    const newQty = Math.max(0, prevQty + change);
    p.stock_quantity = newQty;
    if (newQty === 0) p.status = 'out_of_stock';
    else if (newQty <= p.low_stock_threshold) p.status = 'low_stock';
    else p.status = 'available';
    p.updated_at = new Date().toISOString();

    setStored(PRODUCTS_KEY, products);

    // Record movement
    const movement: InventoryMovement = {
      id: `mov-${Date.now()}`,
      product_id: p.id,
      product_sku: p.sku,
      product_name: p.name_en,
      change_quantity: change,
      previous_quantity: prevQty,
      new_quantity: newQty,
      movement_type: movementType,
      reason,
      created_at: new Date().toISOString(),
      admin_name: 'Haile Meskel Aysheshem'
    };
    const movements = getStored<InventoryMovement[]>(MOVEMENTS_KEY, INITIAL_MOVEMENTS);
    setStored(MOVEMENTS_KEY, [movement, ...movements]);

    return p;
  },

  // Sales
  async getSales(): Promise<Sale[]> {
    try {
      return await requestApi<Sale[]>('/api/sales', {}, true);
    } catch (error) {
      if (error instanceof AuthenticationError) throw error;
      // Fallback
    }
    return getStored<Sale[]>(SALES_KEY, INITIAL_SALES);
  },

  async recordSale(payload: {
    items: { product_id: string; quantity: number; unit_price: number }[];
    payment_method: Sale['payment_method'];
    discount?: number;
    customer_name?: string;
    customer_phone?: string;
    notes?: string;
  }): Promise<Sale> {
    try {
      return await requestApi<Sale>('/api/sales', {
        method: 'POST',
        body: JSON.stringify(payload)
      }, true);
    } catch (error) {
      if (error instanceof AuthenticationError) throw error;
      // Fallback to transactional local process
    }

    const products = getStored<Product[]>(PRODUCTS_KEY, INITIAL_PRODUCTS);
    const sales = getStored<Sale[]>(SALES_KEY, INITIAL_SALES);
    const movements = getStored<InventoryMovement[]>(MOVEMENTS_KEY, INITIAL_MOVEMENTS);

    // Verify stock
    for (const item of payload.items) {
      const prod = products.find(p => p.id === item.product_id);
      if (!prod || prod.stock_quantity < item.quantity) {
        throw new Error(`Insufficient stock for ${prod?.name_en || 'item'}`);
      }
    }

    // Build sale record
    const saleReference = `FNL-${new Date().getFullYear()}-${String(sales.length + 43).padStart(4, '0')}`;
    let totalAmount = 0;
    let totalCost = 0;

    const saleItems = payload.items.map(it => {
      const prod = products.find(p => p.id === it.product_id)!;
      const sub = it.quantity * it.unit_price;
      const costSub = it.quantity * prod.purchase_cost;
      totalAmount += sub;
      totalCost += costSub;

      // Deduct stock
      const prevQty = prod.stock_quantity;
      prod.stock_quantity -= it.quantity;
      if (prod.stock_quantity === 0) prod.status = 'out_of_stock';
      else if (prod.stock_quantity <= prod.low_stock_threshold) prod.status = 'low_stock';
      prod.updated_at = new Date().toISOString();

      // Log movement
      movements.unshift({
        id: `mov-${Date.now()}-${it.product_id}`,
        product_id: prod.id,
        product_sku: prod.sku,
        product_name: prod.name_en,
        change_quantity: -it.quantity,
        previous_quantity: prevQty,
        new_quantity: prod.stock_quantity,
        movement_type: 'sale',
        reference_id: saleReference,
        reason: `Boutique Sale ${saleReference}`,
        created_at: new Date().toISOString(),
        admin_name: 'Haile Meskel Aysheshem'
      });

      return {
        id: `item-${Date.now()}-${it.product_id}`,
        product_id: prod.id,
        sku: prod.sku,
        product_name_en: prod.name_en,
        product_name_am: prod.name_am,
        unit_price: it.unit_price,
        unit_cost: prod.purchase_cost,
        quantity: it.quantity,
        subtotal: sub
      };
    });

    const newSale: Sale = {
      id: `sale-${Date.now()}`,
      sale_reference: saleReference,
      items: saleItems,
      total_amount: Math.max(0, totalAmount - (payload.discount || 0)),
      total_cost: totalCost,
      discount: payload.discount || 0,
      payment_method: payload.payment_method,
      payment_status: 'completed',
      customer_name: payload.customer_name,
      customer_phone: payload.customer_phone,
      notes: payload.notes,
      responsible_admin: 'Haile Meskel Aysheshem',
      created_at: new Date().toISOString()
    };

    setStored(PRODUCTS_KEY, products);
    setStored(MOVEMENTS_KEY, movements);
    setStored(SALES_KEY, [newSale, ...sales]);

    return newSale;
  },

  async reverseSale(saleId: string, reason: string): Promise<Sale> {
    try {
      return await requestApi<Sale>(`/api/sales/${saleId}/reverse`, {
        method: 'POST',
        body: JSON.stringify({ reason })
      }, true);
    } catch (error) {
      if (error instanceof AuthenticationError) throw error;
      // Fallback
    }

    const sales = getStored<Sale[]>(SALES_KEY, INITIAL_SALES);
    const sale = sales.find(s => s.id === saleId);
    if (!sale) throw new Error('Sale not found');
    if (sale.payment_status === 'reversed') throw new Error('Sale is already reversed');

    const products = getStored<Product[]>(PRODUCTS_KEY, INITIAL_PRODUCTS);
    const movements = getStored<InventoryMovement[]>(MOVEMENTS_KEY, INITIAL_MOVEMENTS);

    // Restore stock
    for (const item of sale.items) {
      const prod = products.find(p => p.id === item.product_id);
      if (prod) {
        const prevQty = prod.stock_quantity;
        prod.stock_quantity += item.quantity;
        if (prod.stock_quantity > prod.low_stock_threshold) prod.status = 'available';
        else if (prod.stock_quantity > 0) prod.status = 'low_stock';
        prod.updated_at = new Date().toISOString();

        movements.unshift({
          id: `mov-rev-${Date.now()}-${item.product_id}`,
          product_id: prod.id,
          product_sku: prod.sku,
          product_name: prod.name_en,
          change_quantity: item.quantity,
          previous_quantity: prevQty,
          new_quantity: prod.stock_quantity,
          movement_type: 'sale_reversal',
          reference_id: sale.sale_reference,
          reason: `Reversal: ${reason}`,
          created_at: new Date().toISOString(),
          admin_name: 'Haile Meskel Aysheshem'
        });
      }
    }

    sale.payment_status = 'reversed';
    sale.reversed_at = new Date().toISOString();
    sale.reversal_reason = reason;

    setStored(PRODUCTS_KEY, products);
    setStored(MOVEMENTS_KEY, movements);
    setStored(SALES_KEY, sales);

    return sale;
  },

  // Movements
  async getInventoryMovements(): Promise<InventoryMovement[]> {
    try {
      return await requestApi<InventoryMovement[]>('/api/inventory/movements', {}, true);
    } catch (error) {
      if (error instanceof AuthenticationError) throw error;
      // Fallback
    }
    return getStored<InventoryMovement[]>(MOVEMENTS_KEY, INITIAL_MOVEMENTS);
  },

  // Dashboard calculations
  async getDashboardSummary(): Promise<DashboardSummary> {
    try {
      return await requestApi<DashboardSummary>('/api/dashboard/summary', {}, true);
    } catch (error) {
      if (error instanceof AuthenticationError) throw error;
      // Fallback
    }

    const products = getStored<Product[]>(PRODUCTS_KEY, INITIAL_PRODUCTS);
    const sales = getStored<Sale[]>(SALES_KEY, INITIAL_SALES);

    const activeProducts = products.filter(p => p.status !== 'archived');
    const lowStockProducts = activeProducts.filter(p => p.stock_quantity <= p.low_stock_threshold && p.stock_quantity > 0);
    const outOfStockProducts = activeProducts.filter(p => p.stock_quantity === 0);

    const completedSales = sales.filter(s => s.payment_status === 'completed');
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);

    const todaySales = completedSales.filter(s => s.created_at.startsWith(todayStr));
    const todayRevenue = todaySales.reduce((acc, s) => acc + s.total_amount, 0);

    // Monthly revenue (current calendar month)
    const currentMonthPrefix = now.toISOString().slice(0, 7);
    const monthSales = completedSales.filter(s => s.created_at.startsWith(currentMonthPrefix));
    const monthlyRevenue = monthSales.reduce((acc, s) => acc + s.total_amount, 0);

    const totalRevenue = completedSales.reduce((acc, s) => acc + s.total_amount, 0);
    const totalCost = completedSales.reduce((acc, s) => acc + s.total_cost, 0);
    const estimatedGrossProfit = Math.max(0, totalRevenue - totalCost);

    const totalInventoryValue = activeProducts.reduce((acc, p) => acc + (p.stock_quantity * p.selling_price), 0);

    // Best sellers
    const productSalesMap = new Map<string, { qty: number; rev: number; name_en: string; name_am: string; sku: string }>();
    for (const s of completedSales) {
      for (const it of s.items) {
        const cur = productSalesMap.get(it.product_id) || {
          qty: 0,
          rev: 0,
          name_en: it.product_name_en,
          name_am: it.product_name_am,
          sku: it.sku
        };
        cur.qty += it.quantity;
        cur.rev += it.subtotal;
        productSalesMap.set(it.product_id, cur);
      }
    }

    const bestSellers = Array.from(productSalesMap.entries())
      .map(([id, info]) => ({
        product_id: id,
        product_name_en: info.name_en,
        product_name_am: info.name_am,
        sku: info.sku,
        total_quantity_sold: info.qty,
        total_revenue: info.rev
      }))
      .sort((a, b) => b.total_quantity_sold - a.total_quantity_sold)
      .slice(0, 5);

    return {
      today_sales_count: todaySales.length,
      today_revenue: todayRevenue,
      monthly_revenue: monthlyRevenue,
      total_completed_sales: completedSales.length,
      estimated_gross_profit: estimatedGrossProfit,
      total_inventory_value: totalInventoryValue,
      low_stock_count: lowStockProducts.length,
      out_of_stock_count: outOfStockProducts.length,
      active_product_count: activeProducts.length,
      recent_sales: sales.slice(0, 10),
      low_stock_products: lowStockProducts,
      best_selling_products: bestSellers
    };
  },

  // Brand and Founder Settings
  async getBrandSettings(): Promise<BrandSettings> {
    try {
      return await requestApi<BrandSettings>('/api/brand/settings');
    } catch {
      // Fallback
    }
    return getStored<BrandSettings>(SETTINGS_KEY, INITIAL_BRAND_SETTINGS);
  },

  async updateBrandSettings(updates: Partial<BrandSettings>): Promise<BrandSettings> {
    try {
      const updated = await requestApi<BrandSettings>('/api/brand/settings', {
        method: 'POST',
        body: JSON.stringify(updates)
      }, true);
      setStored(SETTINGS_KEY, updated);
      return updated;
    } catch (error) {
      if (error instanceof AuthenticationError) throw error;
      // Fallback
    }

    const current = getStored<BrandSettings>(SETTINGS_KEY, INITIAL_BRAND_SETTINGS);
    const updated = { ...current, ...updates };
    setStored(SETTINGS_KEY, updated);
    return updated;
  },

  // Auth
  async getCurrentUser(): Promise<AdminUser | null> {
    if (!sessionStorage.getItem(ACCESS_TOKEN_KEY)) return null;
    try {
      const user = await requestApi<AdminUser>('/api/auth/me', {}, true);
      setStored(AUTH_KEY, user);
      return user;
    } catch (error) {
      if (error instanceof AuthenticationError) return null;
      throw error;
    }
  },

  async login(email: string, password: string): Promise<AdminUser> {
    const result = await requestApi<{
      access_token: string;
      token_type: string;
      email: string;
      full_name: string;
      role: AdminUser['role'];
    }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    const { access_token, token_type } = result;
    if (token_type.toLowerCase() !== 'bearer' || !access_token) {
      throw new Error('The sign-in service returned an invalid session.');
    }
    sessionStorage.setItem(ACCESS_TOKEN_KEY, access_token);
    try {
      const authenticatedUser = await requestApi<AdminUser>('/api/auth/me', {}, true);
      setStored(AUTH_KEY, authenticatedUser);
      return authenticatedUser;
    } catch (error) {
      sessionStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(AUTH_KEY);
      throw error;
    }
  },

  async logout(): Promise<void> {
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(AUTH_KEY);
  }
};

function applyProductFilters(
  products: Product[],
  filter?: {
    category?: JewelryCategory;
    material?: JewelryMaterial;
    search?: string;
    availableOnly?: boolean;
  }
): Product[] {
  if (!filter) return products;

  return products.filter(p => {
    if (filter.availableOnly && p.status !== 'available' && p.status !== 'low_stock') {
      return false;
    }
    if (filter.category && filter.category !== 'all' && p.category !== filter.category) {
      return false;
    }
    if (filter.material && p.material !== filter.material) {
      return false;
    }
    if (filter.search && filter.search.trim()) {
      const q = filter.search.toLowerCase().trim();
      const matchNameEn = p.name_en.toLowerCase().includes(q);
      const matchNameAm = p.name_am.toLowerCase().includes(q);
      const matchSku = p.sku.toLowerCase().includes(q);
      const matchDesc = p.description_en.toLowerCase().includes(q) || p.description_am.toLowerCase().includes(q);
      if (!matchNameEn && !matchNameAm && !matchSku && !matchDesc) {
        return false;
      }
    }
    return true;
  });
}
