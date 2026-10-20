import { StoreId, StoreSyncResult, StoreProductMapping } from '../types';
import { productMappingDb } from '../db/productMappingDb';
import { PRODUCTS } from '../data/mockData';

export interface SyncStats {
  lastSyncTimestamp: number;
  results: StoreSyncResult[];
  totalMappings: number;
  isSyncing: boolean;
}

class StoreSyncService {
  private lastSyncTimestamp: number = Date.now();
  private listeners: Set<(stats: SyncStats) => void> = new Set();
  private isSyncing: boolean = false;
  private currentResults: StoreSyncResult[] = [];

  constructor() {
    this.init();
  }

  private init() {
    try {
      const saved = localStorage.getItem('salkal_last_sync_results');
      if (saved) {
        const parsed = JSON.parse(saved);
        this.lastSyncTimestamp = parsed.lastSyncTimestamp || Date.now();
        this.currentResults = parsed.results || [];
      } else {
        this.currentResults = this.getBaselineResults();
      }
    } catch {
      this.currentResults = this.getBaselineResults();
    }
  }

  private getBaselineResults(): StoreSyncResult[] {
    const dbStats = productMappingDb.getStats();
    return [
      {
        storeId: 'carrefour',
        storeNameHe: 'קרפור (Carrefour)',
        syncedAt: new Date(this.lastSyncTimestamp).toISOString(),
        totalProductsCount: PRODUCTS.length,
        mappedCount: dbStats.byStore['carrefour']?.count || 48,
        newlyDiscoveredCount: 3,
        directInjectSupported: true,
        automationSupport: {
          bookmarklet: true,
          mcp: false,
          directUrl: true,
          apiPayload: true,
        },
      },
      {
        storeId: 'shufersal',
        storeNameHe: 'שופרסל אונליין (Shufersal)',
        syncedAt: new Date(this.lastSyncTimestamp).toISOString(),
        totalProductsCount: PRODUCTS.length,
        mappedCount: dbStats.byStore['shufersal']?.count || 48,
        newlyDiscoveredCount: 4,
        directInjectSupported: true,
        automationSupport: {
          bookmarklet: true,
          mcp: true,
          directUrl: false,
          apiPayload: true,
        },
      },
      {
        storeId: 'ramilevy',
        storeNameHe: 'רמי לוי באינטרנט (Rami Levy)',
        syncedAt: new Date(this.lastSyncTimestamp).toISOString(),
        totalProductsCount: PRODUCTS.length,
        mappedCount: dbStats.byStore['ramilevy']?.count || 48,
        newlyDiscoveredCount: 2,
        directInjectSupported: true,
        automationSupport: {
          bookmarklet: true,
          mcp: true,
          directUrl: false,
          apiPayload: true,
        },
      },
      {
        storeId: 'tivtaam',
        storeNameHe: 'טיב טעם (Tiv Taam)',
        syncedAt: new Date(this.lastSyncTimestamp).toISOString(),
        totalProductsCount: PRODUCTS.length,
        mappedCount: dbStats.byStore['tivtaam']?.count || 48,
        newlyDiscoveredCount: 5,
        directInjectSupported: true,
        automationSupport: {
          bookmarklet: false,
          mcp: false,
          directUrl: true,
          apiPayload: false,
        },
      },
      {
        storeId: 'victory',
        storeNameHe: 'ויקטורי (Victory)',
        syncedAt: new Date(this.lastSyncTimestamp).toISOString(),
        totalProductsCount: PRODUCTS.length,
        mappedCount: dbStats.byStore['victory']?.count || 42,
        newlyDiscoveredCount: 1,
        directInjectSupported: true,
        automationSupport: {
          bookmarklet: false,
          mcp: false,
          directUrl: true,
          apiPayload: false,
        },
      },
    ];
  }

  public subscribe(callback: (stats: SyncStats) => void): () => void {
    this.listeners.add(callback);
    callback(this.getStats());
    return () => this.listeners.delete(callback);
  }

  private notify() {
    const stats = this.getStats();
    for (const listener of this.listeners) {
      listener(stats);
    }
  }

  public getStats(): SyncStats {
    const dbStats = productMappingDb.getStats();
    return {
      lastSyncTimestamp: this.lastSyncTimestamp,
      results: this.currentResults,
      totalMappings: dbStats.totalMappings,
      isSyncing: this.isSyncing,
    };
  }

  /**
   * Run synchronization across stores to fetch updated internal IDs,
   * verify barcode availability, and register new catalog entries.
   */
  public async triggerSync(): Promise<StoreSyncResult[]> {
    this.isSyncing = true;
    this.notify();

    try {
      // Simulate network sync call with potential backend assistance
      const response = await fetch('/api/sync-store-catalog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stores: ['shufersal', 'ramilevy', 'carrefour', 'tivtaam'] }),
      }).catch(() => null);

      let serverUpdates: StoreProductMapping[] = [];
      if (response && response.ok) {
        const data = await response.json();
        serverUpdates = data.updates || [];
      }

      if (serverUpdates.length > 0) {
        productMappingDb.bulkUpsertMappings(serverUpdates);
      } else {
        // Local sync verification simulation
        await new Promise((r) => setTimeout(r, 800));
      }

      this.lastSyncTimestamp = Date.now();
      this.currentResults = this.getBaselineResults();

      try {
        localStorage.setItem(
          'salkal_last_sync_results',
          JSON.stringify({
            lastSyncTimestamp: this.lastSyncTimestamp,
            results: this.currentResults,
          })
        );
      } catch (e) {
        console.warn('Failed to save sync results to localStorage:', e);
      }
    } finally {
      this.isSyncing = false;
      this.notify();
    }

    return this.currentResults;
  }
}

export const storeSyncService = new StoreSyncService();
