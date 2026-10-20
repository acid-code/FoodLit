import { StoreProductMapping, StoreId } from '../types';
import { PRODUCTS } from '../data/mockData';

const STORAGE_KEY = 'salkal_store_product_mappings_v1';

/**
 * Default seeded mappings cross-referencing Israeli universal barcodes
 * with store-specific internal catalog IDs (Shufersal Hybris P_, Rami Levy ID, Carrefour/Stor.ai SKU).
 */
const INITIAL_STORE_MAPPINGS: StoreProductMapping[] = [
  // Milk Tnuva 3%
  {
    productId: 'p-milk-tnuva',
    barcode: '7290004131074',
    storeId: 'shufersal',
    storeInternalId: 'P_7290004131074',
    storeInternalSku: '10101',
    storeProductNameHe: 'חלב תנובה 3% בקרטון 1 ליטר',
    isDirectInjectSupported: true,
    lastVerified: '2026-10-20',
    syncSource: 'catalog-sync',
  },
  {
    productId: 'p-milk-tnuva',
    barcode: '7290004131074',
    storeId: 'ramilevy',
    storeInternalId: '24119',
    storeInternalSku: 'RL-MILK-3',
    storeProductNameHe: 'חלב תנובה 3% 1 ליטר',
    isDirectInjectSupported: true,
    lastVerified: '2026-10-20',
    syncSource: 'catalog-sync',
  },
  {
    productId: 'p-milk-tnuva',
    barcode: '7290004131074',
    storeId: 'carrefour',
    storeInternalId: '4131074',
    storeProductNameHe: 'חלב תנובה 3% קרטון',
    isDirectInjectSupported: true,
    lastVerified: '2026-10-20',
    syncSource: 'official-api',
  },
  {
    productId: 'p-milk-tnuva',
    barcode: '7290004131074',
    storeId: 'tivtaam',
    storeInternalId: '7290004131074',
    storeProductNameHe: 'חלב תנובה 3%',
    isDirectInjectSupported: true,
    lastVerified: '2026-10-20',
    syncSource: 'catalog-sync',
  },

  // Cottage Tnuva 5%
  {
    productId: 'p-cottage-tnuva',
    barcode: '7290000045191',
    storeId: 'shufersal',
    storeInternalId: 'P_7290000045191',
    storeInternalSku: '10204',
    storeProductNameHe: 'גבינת קוטג׳ תנובה 5% 250 גרם',
    isDirectInjectSupported: true,
    lastVerified: '2026-10-20',
    syncSource: 'catalog-sync',
  },
  {
    productId: 'p-cottage-tnuva',
    barcode: '7290000045191',
    storeId: 'ramilevy',
    storeInternalId: '24580',
    storeProductNameHe: 'קוטג׳ תנובה 5%',
    isDirectInjectSupported: true,
    lastVerified: '2026-10-20',
    syncSource: 'catalog-sync',
  },
  {
    productId: 'p-cottage-tnuva',
    barcode: '7290000045191',
    storeId: 'carrefour',
    storeInternalId: '45191',
    storeProductNameHe: 'קוטג׳ 5% תנובה 250 גרם',
    isDirectInjectSupported: true,
    lastVerified: '2026-10-20',
    syncSource: 'official-api',
  },

  // Fresh Eggs L
  {
    productId: 'p-eggs-l',
    barcode: '7290001201589',
    storeId: 'shufersal',
    storeInternalId: 'P_7290001201589',
    storeInternalSku: '10992',
    storeProductNameHe: 'ביצים טריות גודל L תריסר מ. לסר',
    isDirectInjectSupported: true,
    lastVerified: '2026-10-20',
    syncSource: 'catalog-sync',
  },
  {
    productId: 'p-eggs-l',
    barcode: '7290001201589',
    storeId: 'ramilevy',
    storeInternalId: '54201',
    storeProductNameHe: 'ביצים L תריסר',
    isDirectInjectSupported: true,
    lastVerified: '2026-10-20',
    syncSource: 'catalog-sync',
  },
  {
    productId: 'p-eggs-l',
    barcode: '7290001201589',
    storeId: 'carrefour',
    storeInternalId: '1201589',
    storeProductNameHe: 'ביצים טריות L 12 יחידות',
    isDirectInjectSupported: true,
    lastVerified: '2026-10-20',
    syncSource: 'official-api',
  },

  // Spaghetti Osem
  {
    productId: 'p-spaghetti-osem',
    barcode: '7290000066226',
    storeId: 'shufersal',
    storeInternalId: 'P_7290000066226',
    storeProductNameHe: 'ספגטי אסם מס׳ 8 500 גרם',
    isDirectInjectSupported: true,
    lastVerified: '2026-10-20',
    syncSource: 'catalog-sync',
  },
  {
    productId: 'p-spaghetti-osem',
    barcode: '7290000066226',
    storeId: 'ramilevy',
    storeInternalId: '88219',
    storeProductNameHe: 'ספagetti אסם 500 גרם',
    isDirectInjectSupported: true,
    lastVerified: '2026-10-20',
    syncSource: 'catalog-sync',
  },
  {
    productId: 'p-spaghetti-osem',
    barcode: '7290000066226',
    storeId: 'carrefour',
    storeInternalId: '66226',
    storeProductNameHe: 'ספגטי אסם 500 גרם',
    isDirectInjectSupported: true,
    lastVerified: '2026-10-20',
    syncSource: 'official-api',
  },

  // Sugat Persian Rice
  {
    productId: 'p-rice-sugat',
    barcode: '7290000211442',
    storeId: 'shufersal',
    storeInternalId: 'P_7290000211442',
    storeProductNameHe: 'אורז פרסי קלאסי סוגת 1 ק״ג',
    isDirectInjectSupported: true,
    lastVerified: '2026-10-20',
    syncSource: 'catalog-sync',
  },
  {
    productId: 'p-rice-sugat',
    barcode: '7290000211442',
    storeId: 'ramilevy',
    storeInternalId: '33410',
    storeProductNameHe: 'אורז פרסי סוגת 1 ק״ג',
    isDirectInjectSupported: true,
    lastVerified: '2026-10-20',
    syncSource: 'catalog-sync',
  },
  {
    productId: 'p-rice-sugat',
    barcode: '7290000211442',
    storeId: 'carrefour',
    storeInternalId: '211442',
    storeProductNameHe: 'אורז פרסי סוגת 1 ק״ג',
    isDirectInjectSupported: true,
    lastVerified: '2026-10-20',
    syncSource: 'official-api',
  },

  // Yad Mordechai Olive Oil 750ml
  {
    productId: 'p-olive-oil',
    barcode: '7290010429554',
    storeId: 'shufersal',
    storeInternalId: 'P_7290010429554',
    storeProductNameHe: 'שמן זית כתית מעולה יד מרדכי 750 מ״ל',
    isDirectInjectSupported: true,
    lastVerified: '2026-10-20',
    syncSource: 'catalog-sync',
  },
  {
    productId: 'p-olive-oil',
    barcode: '7290010429554',
    storeId: 'ramilevy',
    storeInternalId: '77412',
    storeProductNameHe: 'שמן זית יד מרדכי 750 מ״ל',
    isDirectInjectSupported: true,
    lastVerified: '2026-10-20',
    syncSource: 'catalog-sync',
  },
  {
    productId: 'p-olive-oil',
    barcode: '7290010429554',
    storeId: 'carrefour',
    storeInternalId: '10429554',
    storeProductNameHe: 'שמן זית יד מרדכי כתית מעולה',
    isDirectInjectSupported: true,
    lastVerified: '2026-10-20',
    syncSource: 'official-api',
  },

  // Mutti / Master Chef Crushed Tomatoes
  {
    productId: 'p-tomato-paste',
    barcode: '7290121162562',
    storeId: 'shufersal',
    storeInternalId: 'P_7290121162562',
    storeProductNameHe: 'עגבניות מרוסקות מאסטר שף 400 גרם',
    isDirectInjectSupported: true,
    lastVerified: '2026-10-20',
    syncSource: 'catalog-sync',
  },
  {
    productId: 'p-tomato-paste',
    barcode: '7290121162562',
    storeId: 'ramilevy',
    storeInternalId: '19044',
    storeProductNameHe: 'עגבניות מרוסקות 400 גרם',
    isDirectInjectSupported: true,
    lastVerified: '2026-10-20',
    syncSource: 'catalog-sync',
  },
  {
    productId: 'p-tomato-paste',
    barcode: '7290121162562',
    storeId: 'carrefour',
    storeInternalId: '121162562',
    storeProductNameHe: 'עגבניות מרוסקות מאסטר שף',
    isDirectInjectSupported: true,
    lastVerified: '2026-10-20',
    syncSource: 'official-api',
  },

  // Fresh Chicken Breast (Weighed / Butcher)
  {
    productId: 'p-chicken-breast',
    barcode: '7290001002011',
    storeId: 'shufersal',
    storeInternalId: 'P_1002011',
    storeInternalSku: 'PLU-0201',
    storeProductNameHe: 'חזה עוף טרי שלם קצביה',
    isDirectInjectSupported: false,
    unitType: 'kg',
    lastVerified: '2026-10-20',
    syncSource: 'catalog-sync',
  },
  {
    productId: 'p-chicken-breast',
    barcode: '7290001002011',
    storeId: 'ramilevy',
    storeInternalId: '90112',
    storeInternalSku: 'PLU-CHICKEN-1',
    storeProductNameHe: 'חזה עוף שלם טרי בקצבייה',
    isDirectInjectSupported: false,
    unitType: 'kg',
    lastVerified: '2026-10-20',
    syncSource: 'catalog-sync',
  },
  {
    productId: 'p-chicken-breast',
    barcode: '7290001002011',
    storeId: 'carrefour',
    storeInternalId: '1002011',
    storeProductNameHe: 'חזה עוף טרי קצביה',
    isDirectInjectSupported: false,
    unitType: 'kg',
    lastVerified: '2026-10-20',
    syncSource: 'inferred',
  },

  // Fresh Ground Beef
  {
    productId: 'p-ground-beef',
    barcode: '7290001003018',
    storeId: 'shufersal',
    storeInternalId: 'P_1003018',
    storeInternalSku: 'PLU-0301',
    storeProductNameHe: 'בשר בקר טרי טחון קצביה',
    isDirectInjectSupported: false,
    unitType: 'kg',
    lastVerified: '2026-10-20',
    syncSource: 'catalog-sync',
  },
  {
    productId: 'p-ground-beef',
    barcode: '7290001003018',
    storeId: 'ramilevy',
    storeInternalId: '90305',
    storeProductNameHe: 'בשר בקר טרי טחון לקילו',
    isDirectInjectSupported: false,
    unitType: 'kg',
    lastVerified: '2026-10-20',
    syncSource: 'catalog-sync',
  },

  // Fresh Greenhouse Tomatoes (Weighed)
  {
    productId: 'p-tomatoes',
    barcode: '7290000000015',
    storeId: 'shufersal',
    storeInternalId: 'P_1001',
    storeInternalSku: 'PLU-0015',
    storeProductNameHe: 'עגבניות חממה מובחרות לשקילה',
    isDirectInjectSupported: false,
    unitType: 'kg',
    lastVerified: '2026-10-20',
    syncSource: 'catalog-sync',
  },
  {
    productId: 'p-tomatoes',
    barcode: '7290000000015',
    storeId: 'ramilevy',
    storeInternalId: '10015',
    storeProductNameHe: 'עגבניות חממה',
    isDirectInjectSupported: false,
    unitType: 'kg',
    lastVerified: '2026-10-20',
    syncSource: 'catalog-sync',
  },

  // Smoked Bacon (Non-Kosher, Tiv Taam)
  {
    productId: 'p-bacon',
    barcode: '7290007890123',
    storeId: 'tivtaam',
    storeInternalId: 'TT-7890123',
    storeProductNameHe: 'בייקון מעושן פרימיום 200 גרם',
    isDirectInjectSupported: true,
    lastVerified: '2026-10-20',
    syncSource: 'catalog-sync',
  },
  {
    productId: 'p-bacon',
    barcode: '7290007890123',
    storeId: 'keshet',
    storeInternalId: 'KT-7890123',
    storeProductNameHe: 'בייקון פרוס מעושן',
    isDirectInjectSupported: true,
    lastVerified: '2026-10-20',
    syncSource: 'catalog-sync',
  },

  // Black Tiger Shrimp (Non-Kosher, Tiv Taam)
  {
    productId: 'p-shrimp',
    barcode: '7290007890451',
    storeId: 'tivtaam',
    storeInternalId: 'TT-7890451',
    storeProductNameHe: 'שרימפס בלאק טייגר קפוא מובחר 500 גרם',
    isDirectInjectSupported: true,
    lastVerified: '2026-10-20',
    syncSource: 'catalog-sync',
  },
];

/**
 * Auto-generate initial mappings for any remaining products in mockData
 */
function seedMissingProductsFromCatalog(): StoreProductMapping[] {
  const result: StoreProductMapping[] = [...INITIAL_STORE_MAPPINGS];
  const existingKeys = new Set(
    INITIAL_STORE_MAPPINGS.map((m) => `${m.productId}-${m.storeId}`)
  );

  for (const product of PRODUCTS) {
    const stores: StoreId[] = ['shufersal', 'ramilevy', 'carrefour', 'tivtaam'];
    for (const storeId of stores) {
      const key = `${product.id}-${storeId}`;
      if (!existingKeys.has(key)) {
        let internalId = product.barcode;
        if (storeId === 'shufersal') {
          internalId = product.isWeighedOrButcher ? `P_${product.barcode.slice(-6)}` : `P_${product.barcode}`;
        } else if (storeId === 'ramilevy') {
          internalId = `${Math.floor(10000 + Math.random() * 89999)}`;
        } else if (storeId === 'carrefour') {
          internalId = product.carrefourCode || product.barcode.slice(-7);
        }

        result.push({
          productId: product.id,
          barcode: product.barcode,
          storeId,
          storeInternalId: internalId,
          storeProductNameHe: product.nameHe,
          isDirectInjectSupported: !product.isWeighedOrButcher,
          unitType: product.isWeighedOrButcher ? 'kg' : 'unit',
          lastVerified: '2026-10-20',
          syncSource: 'inferred',
        });
      }
    }
  }

  return result;
}

/**
 * Product Mapping Database Manager
 * Persists and resolves store-specific internal product identifiers.
 */
class ProductMappingDatabase {
  private mappings: Map<string, StoreProductMapping> = new Map();

  constructor() {
    this.init();
  }

  private init(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: StoreProductMapping[] = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          for (const m of parsed) {
            this.mappings.set(`${m.productId}-${m.storeId}`, m);
          }
          return;
        }
      }
    } catch (e) {
      console.warn('Could not read product mappings from localStorage, seeding default:', e);
    }

    const seeded = seedMissingProductsFromCatalog();
    for (const m of seeded) {
      this.mappings.set(`${m.productId}-${m.storeId}`, m);
    }
    this.saveToStorage();
  }

  private saveToStorage(): void {
    try {
      const arr = Array.from(this.mappings.values());
      localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
    } catch (e) {
      console.warn('Could not persist product mappings to localStorage:', e);
    }
  }

  public getMapping(productId: string, storeId: StoreId): StoreProductMapping | undefined {
    return this.mappings.get(`${productId}-${storeId}`);
  }

  public resolveStoreCode(productId: string, storeId: StoreId, fallbackBarcode?: string): string {
    const entry = this.getMapping(productId, storeId);
    if (entry && entry.storeInternalId) {
      return entry.storeInternalId;
    }
    if (storeId === 'shufersal' && fallbackBarcode) {
      return `P_${fallbackBarcode}`;
    }
    return fallbackBarcode || productId;
  }

  public getAllMappings(): StoreProductMapping[] {
    return Array.from(this.mappings.values());
  }

  public getMappingsByStore(storeId: StoreId): StoreProductMapping[] {
    return Array.from(this.mappings.values()).filter((m) => m.storeId === storeId);
  }

  public upsertMapping(mapping: StoreProductMapping): void {
    this.mappings.set(`${mapping.productId}-${mapping.storeId}`, mapping);
    this.saveToStorage();
  }

  public bulkUpsertMappings(mappings: StoreProductMapping[]): void {
    for (const m of mappings) {
      this.mappings.set(`${m.productId}-${m.storeId}`, m);
    }
    this.saveToStorage();
  }

  public getStats() {
    const all = Array.from(this.mappings.values());
    const byStore: Record<string, { count: number; directInject: number }> = {};
    for (const m of all) {
      if (!byStore[m.storeId]) {
        byStore[m.storeId] = { count: 0, directInject: 0 };
      }
      byStore[m.storeId].count++;
      if (m.isDirectInjectSupported) {
        byStore[m.storeId].directInject++;
      }
    }
    return {
      totalMappings: all.length,
      byStore,
      lastUpdated: new Date().toISOString(),
    };
  }

  public resetToDefaults(): void {
    this.mappings.clear();
    const seeded = seedMissingProductsFromCatalog();
    for (const m of seeded) {
      this.mappings.set(`${m.productId}-${m.storeId}`, m);
    }
    this.saveToStorage();
  }
}

export const productMappingDb = new ProductMappingDatabase();
