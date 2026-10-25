import { StoreProductMapping, StoreId, Product } from '../types';
import { PRODUCTS } from '../data/mockData';

const STORAGE_KEY = 'salkal_store_product_mappings_v2';

/**
 * Chains we can name a barcode for. Internal SKUs (Shufersal P_, Rami Levy REST ids,
 * Stor.ai short codes) are not published in a form this app has verified, so they
 * are not invented here. direct injection stays off until a real catalog sync exists.
 */
export const MAPPED_STORE_IDS: StoreId[] = [
  'shufersal',
  'ramilevy',
  'carrefour',
  'tivtaam',
  'victory',
  'machsaneihashuk',
  'keshet',
];

export function buildCatalogMappings(products: Product[]): StoreProductMapping[] {
  const verifiedOn = '2026-10-25';
  const result: StoreProductMapping[] = [];

  for (const product of products) {
    for (const storeId of MAPPED_STORE_IDS) {
      result.push({
        productId: product.id,
        barcode: product.barcode,
        storeId,
        storeInternalId: product.barcode,
        storeProductNameHe: product.nameHe,
        isDirectInjectSupported: false,
        unitType: product.isWeighedOrButcher ? 'kg' : 'unit',
        lastVerified: verifiedOn,
        syncSource: 'inferred',
      });
    }
  }

  return result;
}

function hasLocalStorage(): boolean {
  try {
    return typeof globalThis.localStorage !== 'undefined' && typeof globalThis.localStorage.getItem === 'function';
  } catch {
    return false;
  }
}

/**
 * Product Mapping Database Manager
 * Persists barcode cross-references. It does not claim chain-internal ids it has not verified.
 */
class ProductMappingDatabase {
  private mappings: Map<string, StoreProductMapping> = new Map();

  constructor() {
    this.init();
  }

  private init(): void {
    if (hasLocalStorage()) {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed: StoreProductMapping[] = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            for (const m of parsed) {
              if (!m || !m.productId || !m.storeId) continue;
              this.mappings.set(`${m.productId}-${m.storeId}`, m);
            }
            if (this.mappings.size > 0) return;
          }
        }
      } catch (e) {
        console.warn('Could not read product mappings from localStorage, seeding default:', e);
      }
    }

    this.seedDefaults();
  }

  private seedDefaults(): void {
    this.mappings.clear();
    for (const m of buildCatalogMappings(PRODUCTS)) {
      this.mappings.set(`${m.productId}-${m.storeId}`, m);
    }
    this.saveToStorage();
  }

  private saveToStorage(): void {
    if (!hasLocalStorage()) return;
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

  /**
   * Returns a store code only when one was explicitly stored.
   * Does not prefix barcodes with P_ or invent a Rami Levy id.
   */
  public resolveStoreCode(productId: string, storeId: StoreId, fallbackBarcode?: string): string {
    const entry = this.getMapping(productId, storeId);
    if (entry && entry.storeInternalId) {
      return entry.storeInternalId;
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
    this.seedDefaults();
  }
}

export const productMappingDb = new ProductMappingDatabase();
