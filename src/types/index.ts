/**
 * Fnote Loza — Type Definitions
 * Bilingual Luxury Jewelry Brand and Inventory Platform
 */

export type Language = 'en' | 'am';

export type JewelryCategory = 
  | 'all'
  | 'gold'
  | 'silver'
  | 'rings'
  | 'bracelets'
  | 'necklaces'
  | 'earrings'
  | 'wedding'
  | 'custom';

export type JewelryMaterial = 'gold' | 'silver' | 'mixed' | 'gemstone';

export type GoldPurity = '18K' | '21K' | '24K' | '925_sterling' | 'unspecified';

export type ProductStatus = 'available' | 'low_stock' | 'out_of_stock' | 'sold' | 'archived';

export interface ProductImage {
  id: string;
  url: string;
  alt_en: string;
  alt_am: string;
  is_primary: boolean;
}

export interface Product {
  id: string;
  sku: string;
  name_en: string;
  name_am: string;
  description_en: string;
  description_am: string;
  category: JewelryCategory;
  material: JewelryMaterial;
  purity: GoldPurity;
  weight_grams?: number;
  dimensions?: string;
  purchase_cost: number;
  selling_price: number;
  price_on_request?: boolean;
  stock_quantity: number;
  low_stock_threshold: number;
  status: ProductStatus;
  images: ProductImage[];
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export type PaymentMethod = 'cash' | 'bank_transfer' | 'cbe_birr' | 'telebirr' | 'card';

export interface SaleItem {
  id: string;
  product_id: string;
  sku: string;
  product_name_en: string;
  product_name_am: string;
  unit_price: number;
  unit_cost: number;
  quantity: number;
  subtotal: number;
}

export interface Sale {
  id: string;
  sale_reference: string;
  items: SaleItem[];
  total_amount: number;
  total_cost: number;
  discount: number;
  payment_method: PaymentMethod;
  payment_status: 'completed' | 'reversed' | 'pending';
  customer_name?: string;
  customer_phone?: string;
  notes?: string;
  responsible_admin: string;
  created_at: string;
  reversed_at?: string;
  reversal_reason?: string;
}

export type InventoryMovementType = 
  | 'initial_stock' 
  | 'sale' 
  | 'restock' 
  | 'correction' 
  | 'damage' 
  | 'sale_reversal';

export interface InventoryMovement {
  id: string;
  product_id: string;
  product_sku: string;
  product_name: string;
  change_quantity: number;
  previous_quantity: number;
  new_quantity: number;
  movement_type: InventoryMovementType;
  reference_id?: string;
  reason?: string;
  created_at: string;
  admin_name: string;
}

export interface DashboardSummary {
  today_sales_count: number;
  today_revenue: number;
  monthly_revenue: number;
  total_completed_sales: number;
  estimated_gross_profit: number;
  total_inventory_value: number;
  low_stock_count: number;
  out_of_stock_count: number;
  active_product_count: number;
  recent_sales: Sale[];
  low_stock_products: Product[];
  best_selling_products: {
    product_id: string;
    product_name_en: string;
    product_name_am: string;
    sku: string;
    total_quantity_sold: number;
    total_revenue: number;
  }[];
}

export interface BrandSettings {
  brand_name_en: string;
  brand_name_am: string;
  tagline_en: string;
  tagline_am: string;
  founder_name_en: string;
  founder_name_am: string;
  founder_title_en: string;
  founder_title_am: string;
  founder_bio_en: string;
  founder_bio_am: string;
  founder_photo_url: string;
  founder_gallery_photos?: string[];
  whatsapp_number: string;
  phone_number: string;
  address_en: string;
  address_am: string;
  gold_rate_21k_etb?: number;
}

export interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  role: 'owner' | 'manager';
}
