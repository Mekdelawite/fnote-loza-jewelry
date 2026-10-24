import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Database file storage
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface DatabaseSchema {
  brand_settings: any;
  products: any[];
  sales: any[];
  movements: any[];
}

function loadDB(): DatabaseSchema {
  if (fs.existsSync(DB_FILE)) {
    try {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(raw);
    } catch {
      // Fall through to initial
    }
  }

  // Initial seed
  const initialData: DatabaseSchema = {
    brand_settings: {
      brand_name_en: "Fnote Loza",
      brand_name_am: "ፍኖተ ሎዛ",
      tagline_en: "Crafted with Meaning. Made to Last.",
      tagline_am: "በጥበብ የተሠራ፣ ለዘላለም የሚቆይ።",
      founder_name_en: "Haile Meskel Aysheshem",
      founder_name_am: "ኃይለ መስቀል አይሸሸም",
      founder_title_en: "Founder of Fnote Loza",
      founder_title_am: "የፍኖተ ሎዛ መስራችና ባለቤት",
      founder_bio_en: "Under Haile Meskel Aysheshem's discerning vision, Fnote Loza bridges time-honored Ethiopian goldsmithing with contemporary luxury. Each piece is forged with genuine 21K gold and certified silver, shaped by human touch and crafted to be cherished across generations.",
      founder_bio_am: "በኃይለ መስቀል አይሸሸም ጥበባዊ አመራር፣ ፍኖተ ሎዛ የኢትዮጵያን የጥንት የወርቅ አንጥረኝነት ጥበብ ከዘመናዊ ውበት ጋር ያዋህዳል። እያንዳንዱ ጌጣጌጥ በ21 ካራት ወርቅ እና በተረጋገጠ ንጹህ ብር በእጅ ተሰርቶ ከትውልድ ወደ ትውልድ የሚተላለፍ ቅርስ ነው።",
      founder_photo_url: "",
      whatsapp_number: "+251911234567",
      phone_number: "+251 91 123 4567",
      address_en: "Bole District, Behind Edna Mall, Addis Ababa, Ethiopia",
      address_am: "ቦሌ ክፍለ ከተማ፣ ከኤድና ሞል ጀርባ፣ አዲስ አበባ፣ ኢትዮጵያ",
      gold_rate_21k_etb: 11200
    },
    products: [
      {
        id: "prod-1",
        sku: "FNL-GD-001",
        name_en: "Lalibela 21K Gold Filigree Cross",
        name_am: "የላሊበላ 21 ካራት የወርቅ ጥልፍ መስቀል",
        description_en: "A magnificent handcrafted 21K yellow gold pendant featuring intricate geometric Ethiopian filigree motifs, polished edges, and balanced celestial symmetry.",
        description_am: "በ21 ካራት ንጹህ ቢጫ ወርቅ በእጅ የተሰራ ድንቅ የላሊበላ መስቀል ሀብል። የጥንታዊ ጥልፍ ጥበብና ዘመናዊ ንጽህና የተዋሃደበት።",
        category: "necklaces",
        material: "gold",
        purity: "21K",
        weight_grams: 14.8,
        dimensions: "48mm x 38mm with 50cm chain",
        purchase_cost: 135000,
        selling_price: 165000,
        price_on_request: false,
        stock_quantity: 3,
        low_stock_threshold: 2,
        status: "available",
        images: [
          {
            id: "img-1-1",
            url: "/src/assets/images/product_gold_necklace_1792823131025.jpg",
            alt_en: "Lalibela 21K Gold Cross Pendant on raw linen",
            alt_am: "የላሊበላ 21 ካራት የወርቅ መስቀል",
            is_primary: true
          }
        ],
        is_featured: true,
        created_at: "2026-10-10T10:00:00Z",
        updated_at: "2026-10-23T14:30:00Z"
      },
      {
        id: "prod-2",
        sku: "FNL-SV-002",
        name_en: "Axumite Hammered 925 Silver Cuff",
        name_am: "የአክሱም ቅርጽ 925 ንጹህ የብር አምባር",
        description_en: "Substantial 925 solid sterling silver cuff bracelet with hand-hammered texture and geometric chevron engraving inspired by ancient Axumite stele geometry.",
        description_am: "በጠንካራ 925 ንጹህ ብር የተሰራ፣ በአክሱም ሐውልት ቅርጽ የተዋበና በመዶሻ ተቀርጾ የተዘጋጀ የክብር አምባር።",
        category: "bracelets",
        material: "silver",
        purity: "925_sterling",
        weight_grams: 38.2,
        dimensions: "64mm inner diameter (adjustable)",
        purchase_cost: 16000,
        selling_price: 24500,
        price_on_request: false,
        stock_quantity: 6,
        low_stock_threshold: 2,
        status: "available",
        images: [
          {
            id: "img-2-1",
            url: "/src/assets/images/product_silver_cuff_1792823130893.jpg",
            alt_en: "Axumite 925 Sterling Silver Cuff on obsidian slate",
            alt_am: "የአክሱም ቅርጽ የብር አምባር",
            is_primary: true
          }
        ],
        is_featured: true,
        created_at: "2026-10-12T11:00:00Z",
        updated_at: "2026-10-22T09:15:00Z"
      },
      {
        id: "prod-3",
        sku: "FNL-WD-003",
        name_en: "Eternal Harmony 21K Wedding Bands",
        name_am: "የዘላለም ቃልኪዳን 21 ካራት የሠርግ ቀለበቶች",
        description_en: "Pair of masterfully forged 21K gold bridal rings. The groom's band features a subtle brushed silk texture while the bride's is accented with channel-set brilliant stones.",
        description_am: "የተጣመሩ የሙሽራና ሙሽሪት የ21 ካራት ወርቅ የቃልኪዳን ቀለበቶች። የሙሽራው በልዩ የሐር ስሪት የተሰራ፣ የሙሽሪቷ በደመቁ እንቁዎች ያሸበረቀ።",
        category: "wedding",
        material: "gold",
        purity: "21K",
        weight_grams: 12.4,
        dimensions: "Sizes 7 & 10 (Custom sizing available)",
        purchase_cost: 115000,
        selling_price: 142000,
        price_on_request: false,
        stock_quantity: 4,
        low_stock_threshold: 2,
        status: "available",
        images: [
          {
            id: "img-3-1",
            url: "/src/assets/images/product_wedding_rings_1792823132120.jpg",
            alt_en: "Pair of 21K gold and stone wedding rings on raw silk",
            alt_am: "የ21 ካራት ወርቅ የሠርግ ቀለበቶች",
            is_primary: true
          }
        ],
        is_featured: true,
        created_at: "2026-10-14T14:20:00Z",
        updated_at: "2026-10-23T11:00:00Z"
      },
      {
        id: "prod-4",
        sku: "FNL-GD-004",
        name_en: "Gondar Royal Filigree Statement Choker",
        name_am: "የጎንደር ንጉሣዊ የጥልፍ አንገት ጌጥ",
        description_en: "A museum-grade heirloom statement collar necklace, intricately woven from pure 21K gold filigree beads and tiered medallions, evoking royal court majesty.",
        description_am: "የጎንደር ቤተ-መንግሥት ታላቅነትን የሚያስታውስ፣ በ21 ካራት ንጹህ ወርቅ በጥልፍ ዶቃዎችና በማህተም ቅርጾች በልዩ ጥበብ የተሰራ ባለግርማ አንገት ጌጥ።",
        category: "gold",
        material: "gold",
        purity: "21K",
        weight_grams: 28.5,
        dimensions: "42cm circumference with safety box clasp",
        purchase_cost: 255000,
        selling_price: 310000,
        price_on_request: false,
        stock_quantity: 2,
        low_stock_threshold: 1,
        status: "available",
        images: [
          {
            id: "img-4-1",
            url: "/src/assets/images/hero_luxury_gold_jewelry_1792823129847.jpg",
            alt_en: "Royal gold choker and ensemble on limestone",
            alt_am: "የጎንደር ንጉሣዊ የወርቅ አንገት ጌጥ",
            is_primary: true
          }
        ],
        is_featured: true,
        created_at: "2026-10-15T09:00:00Z",
        updated_at: "2026-10-23T16:00:00Z"
      },
      {
        id: "prod-5",
        sku: "FNL-SV-005",
        name_en: "Solomonic Engraved Silver Signet Ring",
        name_am: "የሰለሞን ማኅተም 925 ንጹህ የብር ቀለበት",
        description_en: "Solid 925 sterling silver signet ring with hand-chiseled Ethiopian seal engraving and oxidized contrast recesses, comfortable tapered shank.",
        description_am: "በ925 ንጹህ ብር የተሰራ፣ ጥንታዊ የሰለሞን ማኅተም ተቀርጾበት በጥቁር ንጽጽር የተዋበ ግርማ ሞገስ ያለው ቀለበት።",
        category: "rings",
        material: "silver",
        purity: "925_sterling",
        weight_grams: 11.5,
        dimensions: "Size 9.5 (Adjustable on order)",
        purchase_cost: 8200,
        selling_price: 12800,
        price_on_request: false,
        stock_quantity: 5,
        low_stock_threshold: 2,
        status: "available",
        images: [
          {
            id: "img-5-1",
            url: "/src/assets/images/product_silver_cuff_1792823130893.jpg",
            alt_en: "Solomonic 925 silver signet ring",
            alt_am: "የብር ቀለበት",
            is_primary: true
          }
        ],
        is_featured: false,
        created_at: "2026-10-16T12:00:00Z",
        updated_at: "2026-10-20T10:00:00Z"
      },
      {
        id: "prod-6",
        sku: "FNL-GD-006",
        name_en: "Queen of Sheba 18K Gold Drop Earrings",
        name_am: "የንግሥተ ሳባ 18 ካራት የወርቅ የጆሮ ጌጦች",
        description_en: "Delicate cascading drops in 18K warm yellow gold, featuring articulating filigree petals that catch and reflect ambient light with gentle movement.",
        description_am: "በ18 ካራት ሞቃት ቢጫ ወርቅ የተሰሩ፣ በብርሃን ቅንጣት የሚብለጨለጩና በእንቅስቃሴ ውበት የሚጨምሩ የጆሮ ጌጦች።",
        category: "earrings",
        material: "gold",
        purity: "18K",
        weight_grams: 7.2,
        dimensions: "42mm length, secure French earwire",
        purchase_cost: 58000,
        selling_price: 76000,
        price_on_request: false,
        stock_quantity: 1,
        low_stock_threshold: 2,
        status: "low_stock",
        images: [
          {
            id: "img-6-1",
            url: "/src/assets/images/product_gold_necklace_1792823131025.jpg",
            alt_en: "Queen of Sheba gold earrings",
            alt_am: "የንግሥተ ሳባ የወርቅ የጆሮ ጌጦች",
            is_primary: true
          }
        ],
        is_featured: true,
        created_at: "2026-10-18T15:00:00Z",
        updated_at: "2026-10-23T12:00:00Z"
      },
      {
        id: "prod-7",
        sku: "FNL-CS-007",
        name_en: "Bespoke Ethiopian Heirloom Ring Commission",
        name_am: "በትእዛዝ የሚሰራ የቤተሰብ መታሰቢያ የወርቅ ቀለበት",
        description_en: "Tailor-made custom commission forged in 21K gold or 925 silver with custom crest engraving, personalized sizing, and certified master artisan hallmark.",
        description_am: "በደንበኛው ፍላጎት መሰረት በ21 ካራት ወርቅ ወይም በብር የሚዘጋጅ፣ የቤተሰብ ማኅተም ወይም ስም የተቀረጸበት ልዩ ጌጣጌጥ።",
        category: "custom",
        material: "gold",
        purity: "21K",
        weight_grams: 16.0,
        dimensions: "Customized to client specification",
        purchase_cost: 145000,
        selling_price: 180000,
        price_on_request: true,
        stock_quantity: 2,
        low_stock_threshold: 1,
        status: "available",
        images: [
          {
            id: "img-7-1",
            url: "/src/assets/images/craftsmanship_artisan_workbench_1792823131791.jpg",
            alt_en: "Bespoke jewelry benchcraft",
            alt_am: "በትእዛዝ የሚሰራ የጌጣጌጥ ስራ",
            is_primary: true
          }
        ],
        is_featured: false,
        created_at: "2026-10-19T08:30:00Z",
        updated_at: "2026-10-23T08:30:00Z"
      }
    ],
    sales: [
      {
        id: "sale-101",
        sale_reference: "FNL-2026-0041",
        items: [
          {
            id: "item-1",
            product_id: "prod-1",
            sku: "FNL-GD-001",
            product_name_en: "Lalibela 21K Gold Filigree Cross",
            product_name_am: "የላሊበላ 21 ካራት የወርቅ ጥልፍ መስቀል",
            unit_price: 165000,
            unit_cost: 135000,
            quantity: 1,
            subtotal: 165000
          }
        ],
        total_amount: 165000,
        total_cost: 135000,
        discount: 0,
        payment_method: "bank_transfer",
        payment_status: "completed",
        customer_name: "Alemayehu T.",
        customer_phone: "+251911445566",
        notes: "Gift for daughter's graduation. Packed in luxury wooden case.",
        responsible_admin: "Haile Meskel Aysheshem",
        created_at: "2026-10-23T11:15:00Z"
      },
      {
        id: "sale-102",
        sale_reference: "FNL-2026-0042",
        items: [
          {
            id: "item-2",
            product_id: "prod-2",
            sku: "FNL-SV-002",
            product_name_en: "Axumite Hammered 925 Silver Cuff",
            product_name_am: "የአክሱም ቅርጽ 925 ንጹህ የብር አምባር",
            unit_price: 24500,
            unit_cost: 16000,
            quantity: 1,
            subtotal: 24500
          }
        ],
        total_amount: 24500,
        total_cost: 16000,
        discount: 0,
        payment_method: "telebirr",
        payment_status: "completed",
        customer_name: "Sara B.",
        customer_phone: "+251922334455",
        notes: "Walk-in boutique client. Confirmed via Telebirr.",
        responsible_admin: "Haile Meskel Aysheshem",
        created_at: "2026-10-23T14:40:00Z"
      }
    ],
    movements: [
      {
        id: "mov-1",
        product_id: "prod-1",
        product_sku: "FNL-GD-001",
        product_name: "Lalibela 21K Gold Filigree Cross",
        change_quantity: 4,
        previous_quantity: 0,
        new_quantity: 4,
        movement_type: "initial_stock",
        created_at: "2026-10-10T10:00:00Z",
        admin_name: "Haile Meskel Aysheshem"
      },
      {
        id: "mov-2",
        product_id: "prod-1",
        product_sku: "FNL-GD-001",
        product_name: "Lalibela 21K Gold Filigree Cross",
        change_quantity: -1,
        previous_quantity: 4,
        new_quantity: 3,
        movement_type: "sale",
        reference_id: "sale-101",
        reason: "Boutique Sale FNL-2026-0041",
        created_at: "2026-10-23T11:15:00Z",
        admin_name: "Haile Meskel Aysheshem"
      },
      {
        id: "mov-3",
        product_id: "prod-2",
        product_sku: "FNL-SV-002",
        product_name: "Axumite Hammered 925 Silver Cuff",
        change_quantity: -1,
        previous_quantity: 7,
        new_quantity: 6,
        movement_type: "sale",
        reference_id: "sale-102",
        reason: "Boutique Sale FNL-2026-0042",
        created_at: "2026-10-23T14:40:00Z",
        admin_name: "Haile Meskel Aysheshem"
      }
    ]
  };

  saveDB(initialData);
  return initialData;
}

function saveDB(data: DatabaseSchema): void {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save DB file', err);
  }
}

// REST API Endpoints
// Products
app.get('/api/products', (_req, res) => {
  const db = loadDB();
  res.json(db.products);
});

app.get('/api/products/:id', (req, res) => {
  const db = loadDB();
  const prod = db.products.find(p => p.id === req.params.id);
  if (!prod) return res.status(404).json({ error: 'Product not found' });
  res.json(prod);
});

app.post('/api/products', (req, res) => {
  const db = loadDB();
  const newProduct = {
    ...req.body,
    id: req.body.id || `prod-${Date.now()}`,
    created_at: req.body.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  db.products.unshift(newProduct);

  // Log movement
  db.movements.unshift({
    id: `mov-${Date.now()}`,
    product_id: newProduct.id,
    product_sku: newProduct.sku,
    product_name: newProduct.name_en,
    change_quantity: newProduct.stock_quantity,
    previous_quantity: 0,
    new_quantity: newProduct.stock_quantity,
    movement_type: 'initial_stock',
    reason: 'Product created',
    created_at: new Date().toISOString(),
    admin_name: 'Haile Meskel Aysheshem'
  });

  saveDB(db);
  res.status(201).json(newProduct);
});

app.put('/api/products/:id', (req, res) => {
  const db = loadDB();
  const idx = db.products.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Product not found' });

  db.products[idx] = {
    ...db.products[idx],
    ...req.body,
    updated_at: new Date().toISOString()
  };
  saveDB(db);
  res.json(db.products[idx]);
});

app.delete('/api/products/:id', (req, res) => {
  const db = loadDB();
  db.products = db.products.filter(p => p.id !== req.params.id);
  saveDB(db);
  res.json({ success: true });
});

// Stock Adjustment
app.post('/api/products/:id/stock', (req, res) => {
  const db = loadDB();
  const prod = db.products.find(p => p.id === req.params.id);
  if (!prod) return res.status(404).json({ error: 'Product not found' });

  const { change, movement_type, reason } = req.body;
  const prevQty = prod.stock_quantity;
  const newQty = Math.max(0, prevQty + change);
  prod.stock_quantity = newQty;
  if (newQty === 0) prod.status = 'out_of_stock';
  else if (newQty <= prod.low_stock_threshold) prod.status = 'low_stock';
  else prod.status = 'available';
  prod.updated_at = new Date().toISOString();

  db.movements.unshift({
    id: `mov-${Date.now()}`,
    product_id: prod.id,
    product_sku: prod.sku,
    product_name: prod.name_en,
    change_quantity: change,
    previous_quantity: prevQty,
    new_quantity: newQty,
    movement_type: movement_type || 'restock',
    reason: reason || 'Stock adjusted via admin',
    created_at: new Date().toISOString(),
    admin_name: 'Haile Meskel Aysheshem'
  });

  saveDB(db);
  res.json(prod);
});

// Sales
app.get('/api/sales', (_req, res) => {
  const db = loadDB();
  res.json(db.sales);
});

app.post('/api/sales', (req, res) => {
  const db = loadDB();
  const { items, payment_method, discount, customer_name, customer_phone, notes } = req.body;

  // Check stock
  for (const it of items) {
    const prod = db.products.find(p => p.id === it.product_id);
    if (!prod || prod.stock_quantity < it.quantity) {
      return res.status(400).json({ error: `Insufficient stock for ${prod?.name_en || 'item'}` });
    }
  }

  const saleReference = `FNL-${new Date().getFullYear()}-${String(db.sales.length + 43).padStart(4, '0')}`;
  let totalAmount = 0;
  let totalCost = 0;

  const saleItems = items.map((it: any) => {
    const prod = db.products.find(p => p.id === it.product_id);
    const sub = it.quantity * it.unit_price;
    const costSub = it.quantity * prod.purchase_cost;
    totalAmount += sub;
    totalCost += costSub;

    // Deduct
    const prevQty = prod.stock_quantity;
    prod.stock_quantity -= it.quantity;
    if (prod.stock_quantity === 0) prod.status = 'out_of_stock';
    else if (prod.stock_quantity <= prod.low_stock_threshold) prod.status = 'low_stock';
    prod.updated_at = new Date().toISOString();

    db.movements.unshift({
      id: `mov-${Date.now()}-${prod.id}`,
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
      id: `item-${Date.now()}-${prod.id}`,
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

  const newSale = {
    id: `sale-${Date.now()}`,
    sale_reference: saleReference,
    items: saleItems,
    total_amount: Math.max(0, totalAmount - (discount || 0)),
    total_cost: totalCost,
    discount: discount || 0,
    payment_method: payment_method || 'cash',
    payment_status: 'completed',
    customer_name,
    customer_phone,
    notes,
    responsible_admin: 'Haile Meskel Aysheshem',
    created_at: new Date().toISOString()
  };

  db.sales.unshift(newSale);
  saveDB(db);
  res.status(201).json(newSale);
});

// Sale Reversal
app.post('/api/sales/:id/reverse', (req, res) => {
  const db = loadDB();
  const sale = db.sales.find(s => s.id === req.params.id);
  if (!sale) return res.status(404).json({ error: 'Sale not found' });
  if (sale.payment_status === 'reversed') return res.status(400).json({ error: 'Sale already reversed' });

  const { reason } = req.body;

  // Restore inventory
  for (const it of sale.items) {
    const prod = db.products.find(p => p.id === it.product_id);
    if (prod) {
      const prevQty = prod.stock_quantity;
      prod.stock_quantity += it.quantity;
      if (prod.stock_quantity > prod.low_stock_threshold) prod.status = 'available';
      else if (prod.stock_quantity > 0) prod.status = 'low_stock';
      prod.updated_at = new Date().toISOString();

      db.movements.unshift({
        id: `mov-rev-${Date.now()}-${prod.id}`,
        product_id: prod.id,
        product_sku: prod.sku,
        product_name: prod.name_en,
        change_quantity: it.quantity,
        previous_quantity: prevQty,
        new_quantity: prod.stock_quantity,
        movement_type: 'sale_reversal',
        reference_id: sale.sale_reference,
        reason: `Reversal: ${reason || 'Customer Return'}`,
        created_at: new Date().toISOString(),
        admin_name: 'Haile Meskel Aysheshem'
      });
    }
  }

  sale.payment_status = 'reversed';
  sale.reversed_at = new Date().toISOString();
  sale.reversal_reason = reason || 'Admin reversal';

  saveDB(db);
  res.json(sale);
});

// Inventory Movements
app.get('/api/inventory/movements', (_req, res) => {
  const db = loadDB();
  res.json(db.movements);
});

// Brand Settings
app.get('/api/brand/settings', (_req, res) => {
  const db = loadDB();
  res.json(db.brand_settings);
});

app.post('/api/brand/settings', (req, res) => {
  const db = loadDB();
  db.brand_settings = {
    ...db.brand_settings,
    ...req.body
  };
  saveDB(db);
  res.json(db.brand_settings);
});

// Dashboard summary
app.get('/api/dashboard/summary', (_req, res) => {
  const db = loadDB();
  const activeProducts = db.products.filter(p => p.status !== 'archived');
  const lowStockProducts = activeProducts.filter(p => p.stock_quantity <= p.low_stock_threshold && p.stock_quantity > 0);
  const outOfStockProducts = activeProducts.filter(p => p.stock_quantity === 0);

  const completedSales = db.sales.filter(s => s.payment_status === 'completed');
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const monthStr = now.toISOString().slice(0, 7);

  const todaySales = completedSales.filter(s => s.created_at.startsWith(todayStr));
  const todayRevenue = todaySales.reduce((a, s) => a + s.total_amount, 0);
  const monthlyRevenue = completedSales.filter(s => s.created_at.startsWith(monthStr)).reduce((a, s) => a + s.total_amount, 0);
  const totalRevenue = completedSales.reduce((a, s) => a + s.total_amount, 0);
  const totalCost = completedSales.reduce((a, s) => a + s.total_cost, 0);
  const estimatedGrossProfit = Math.max(0, totalRevenue - totalCost);
  const totalInventoryValue = activeProducts.reduce((a, p) => a + (p.stock_quantity * p.selling_price), 0);

  const productSalesMap = new Map<string, {
    quantity: number;
    revenue: number;
    name_en: string;
    name_am: string;
    sku: string;
  }>();
  for (const sale of completedSales) {
    for (const item of sale.items) {
      const product = productSalesMap.get(item.product_id) || {
        quantity: 0,
        revenue: 0,
        name_en: item.product_name_en,
        name_am: item.product_name_am,
        sku: item.sku
      };
      product.quantity += item.quantity;
      product.revenue += item.subtotal;
      productSalesMap.set(item.product_id, product);
    }
  }
  const bestSellingProducts = Array.from(productSalesMap.entries())
    .map(([productId, product]) => ({
      product_id: productId,
      product_name_en: product.name_en,
      product_name_am: product.name_am,
      sku: product.sku,
      total_quantity_sold: product.quantity,
      total_revenue: product.revenue
    }))
    .sort((a, b) => b.total_quantity_sold - a.total_quantity_sold)
    .slice(0, 5);

  res.json({
    today_sales_count: todaySales.length,
    today_revenue: todayRevenue,
    monthly_revenue: monthlyRevenue,
    total_completed_sales: completedSales.length,
    estimated_gross_profit: estimatedGrossProfit,
    total_inventory_value: totalInventoryValue,
    low_stock_count: lowStockProducts.length,
    out_of_stock_count: outOfStockProducts.length,
    active_product_count: activeProducts.length,
    recent_sales: db.sales.slice(0, 10),
    low_stock_products: lowStockProducts,
    best_selling_products: bestSellingProducts
  });
});

// Setup Vite dev server or static serve
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Fnote Loza luxury server listening on port ${PORT}`);
  });
}

startServer();
