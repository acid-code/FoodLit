import { CartItem, Store, StoreId, SplitBasketOptimization } from '../types';
import { STORES } from '../data/mockData';

/**
 * Hosts verified in October 2026 to open an add-to-cart dialog from:
 * https://<host>/?externalCart=<barcode>,<qty>;<barcode>,<qty>&externalName=<name>
 * Commas and semicolons are literal. Encoding them makes the chain miss the list.
 */
export const SELF_POINT_HOSTS = [
  'www.carrefour.co.il',
  'www.victoryonline.co.il',
  'www.mck.co.il',
  'www.keshet-teamim.co.il',
  'www.tivtaam.co.il',
] as const;

export const HANDOFF_APP_NAME = 'SalKal';

const HANDOFF_BARCODE = /^[0-9]{8,14}$/;
const MAX_HANDOFF_QTY = 99;

export function isSelfPointHost(host: string): boolean {
  return (SELF_POINT_HOSTS as readonly string[]).includes(host.trim().toLowerCase());
}

export function isHandoffBarcode(value: unknown): value is string {
  return typeof value === 'string' && HANDOFF_BARCODE.test(value);
}

/** Integer units for externalCart. Fractional or non-finite quantities are refused. */
export function toHandoffQuantity(quantity: number): number | null {
  if (!Number.isFinite(quantity) || quantity <= 0) return null;
  const rounded = Math.round(quantity);
  if (rounded < 1) return null;
  return Math.min(MAX_HANDOFF_QTY, rounded);
}

export interface SelfPointHandoffPlan {
  url: string;
  included: CartItem[];
  manual: CartItem[];
  excludedNonKosher: CartItem[];
  quantitiesByBarcode: Record<string, number>;
}

function barcodeForItem(item: CartItem, storeDomain: string): string | null {
  const preferCarrefourCode = storeDomain.toLowerCase().includes('carrefour');
  const candidates = preferCarrefourCode
    ? [item.product.carrefourBarcode, item.product.barcode]
    : [item.product.barcode];
  for (const candidate of candidates) {
    if (isHandoffBarcode(candidate)) return candidate;
  }
  return null;
}

function isKosherBlocked(item: CartItem, isNonKosherSpecialist: boolean): boolean {
  return !isNonKosherSpecialist && item.product.isKosher === false;
}

/**
 * Safe mode only sends packaged lines flagged as catalog-verified.
 * Weighed produce, butcher items, and unverified barcodes stay out of the URL:
 * an unrecognized code can make Stor.ai reject or clear the imported list.
 */
function isSafeToInject(item: CartItem): boolean {
  return item.product.isWeighedOrButcher !== true && item.product.isCarrefourVerifiedPackaged === true;
}

export function planSelfPointHandoff(
  storeDomain: string,
  items: CartItem[],
  options: {
    appName?: string;
    safeMode?: boolean;
    isNonKosherSpecialist?: boolean;
  } = {}
): SelfPointHandoffPlan {
  const safeMode = options.safeMode !== false;
  const isNonKosherSpecialist = options.isNonKosherSpecialist === true;
  const appName = (options.appName || HANDOFF_APP_NAME).trim() || HANDOFF_APP_NAME;
  const host = storeDomain.trim().toLowerCase();
  const included: CartItem[] = [];
  const manual: CartItem[] = [];
  const excludedNonKosher: CartItem[] = [];
  const quantitiesByBarcode: Record<string, number> = {};
  const order: string[] = [];

  for (const item of items) {
    if (isKosherBlocked(item, isNonKosherSpecialist)) {
      excludedNonKosher.push(item);
      continue;
    }
    if (safeMode && !isSafeToInject(item)) {
      manual.push(item);
      continue;
    }
    const code = barcodeForItem(item, host);
    const qty = toHandoffQuantity(item.quantity);
    if (!code || qty == null) {
      manual.push(item);
      continue;
    }
    if (quantitiesByBarcode[code] == null) {
      order.push(code);
      included.push(item);
      quantitiesByBarcode[code] = qty;
    } else {
      quantitiesByBarcode[code] = Math.min(MAX_HANDOFF_QTY, quantitiesByBarcode[code] + qty);
    }
  }

  if (!isSelfPointHost(host)) {
    return {
      url: '',
      included: [],
      manual: [...manual, ...included],
      excludedNonKosher,
      quantitiesByBarcode: {},
    };
  }

  if (order.length === 0) {
    return { url: '', included, manual, excludedNonKosher, quantitiesByBarcode };
  }

  const cartString = order.map((code) => `${code},${quantitiesByBarcode[code]}`).join(';');
  const url = `https://${host}/?externalCart=${cartString}&externalName=${encodeURIComponent(appName)}`;
  return { url, included, manual, excludedNonKosher, quantitiesByBarcode };
}

/**
 * One-barcode probe used by the research lab. Rejects anything that is not a
 * known Self-Point host plus a numeric barcode, so the tester cannot be turned
 * into an open redirect or a query-string injection.
 */
export function buildSelfPointProbeUrl(
  storeDomain: string,
  barcode: string,
  quantity: number,
  appName = HANDOFF_APP_NAME
): string | null {
  const host = storeDomain.trim().toLowerCase();
  const qty = toHandoffQuantity(quantity);
  if (!isSelfPointHost(host) || !isHandoffBarcode(barcode.trim()) || qty == null) return null;
  return `https://${host}/?externalCart=${barcode.trim()},${qty}&externalName=${encodeURIComponent(appName)}`;
}

/**
 * Builds the Self-Point externalCart URL verified in October 2026.
 * Returns an empty string when the host is not one of the five tested chains
 * or when no line is safe to send.
 */
export function buildSelfPointUrl(
  storeDomain: string,
  items: CartItem[],
  appName = HANDOFF_APP_NAME,
  safeMode = true,
  isNonKosherSpecialist = false
): string {
  return planSelfPointHandoff(storeDomain, items, {
    appName,
    safeMode,
    isNonKosherSpecialist,
  }).url;
}

/**
 * Builds a direct 1-click search link for any supermarket online store
 */
export function buildStoreSearchUrl(store: Store, query: string): string {
  const enc = encodeURIComponent(query);
  switch (store.id) {
    case 'carrefour':
      return `https://www.carrefour.co.il/search?q=${enc}`;
    case 'victory':
      return `https://www.victoryonline.co.il/search?q=${enc}`;
    case 'machsaneihashuk':
      return `https://www.mck.co.il/search?q=${enc}`;
    case 'keshet':
      return `https://www.keshet-teamim.co.il/search?q=${enc}`;
    case 'tivtaam':
      return `https://www.tivtaam.co.il/search?q=${enc}`;
    case 'shufersal':
      return `https://www.shufersal.co.il/online/he/search?text=${enc}`;
    case 'ramilevy':
      return `https://www.rami-levy.co.il/he/online-shopping?query=${enc}`;
    default:
      return `https://${store.domain}/search?q=${enc}`;
  }
}

export function buildCarrefourSearchUrl(query: string): string {
  return `https://www.carrefour.co.il/search?q=${encodeURIComponent(query)}`;
}

export interface SelfPointCompatibilityReport {
  safeVerifiedItems: CartItem[];
  weighedProduceAndButcherItems: CartItem[];
  unverifiedPackagedItems: CartItem[];
  nonKosherItems: CartItem[];
  totalCount: number;
  safeCount: number;
  weighedCount: number;
  unverifiedCount: number;
  nonKosherCount: number;
  safePercentage: number;
}

/**
 * Checks compatibility for any Stor.ai / Self-Point supermarket
 */
export function checkStoreCompatibility(
  items: CartItem[],
  store: Store
): SelfPointCompatibilityReport {
  const plan = planSelfPointHandoff(store.domain, items, {
    safeMode: true,
    isNonKosherSpecialist: store.isNonKosherSpecialist === true,
  });
  const weighedProduceAndButcherItems = plan.manual.filter((item) => item.product.isWeighedOrButcher === true);
  const unverifiedPackagedItems = plan.manual.filter((item) => item.product.isWeighedOrButcher !== true);
  const safeVerifiedItems = plan.included;
  const nonKosherItems = plan.excludedNonKosher;

  const totalCount = items.length;
  const safeCount = safeVerifiedItems.length;
  const weighedCount = weighedProduceAndButcherItems.length;
  const unverifiedCount = unverifiedPackagedItems.length;
  const nonKosherCount = nonKosherItems.length;
  const safePercentage = totalCount > 0 ? Math.round((safeCount / totalCount) * 100) : 100;

  return {
    safeVerifiedItems,
    weighedProduceAndButcherItems,
    unverifiedPackagedItems,
    nonKosherItems,
    totalCount,
    safeCount,
    weighedCount,
    unverifiedCount,
    nonKosherCount,
    safePercentage,
  };
}

export const checkCarrefourCompatibility = (items: CartItem[]) => {
  const carrefourStore = STORES.find((s) => s.id === 'carrefour') || STORES[0];
  return checkStoreCompatibility(items, carrefourStore);
};

/**
 * Formats shopping list for Carrefour Quick Buy or search clipboard
 */
export function buildCarrefourQuickList(items: CartItem[]): string {
  const comp = checkCarrefourCompatibility(items);
  let result = `🛒 רשימת קניות מסודרת לקרפור (SalKal):\n\n`;

  if (comp.safeVerifiedItems.length > 0) {
    result += `📦 מוצרי מכולת, חלב ואריזות שנכנסו אוטומטית לסל (${comp.safeVerifiedItems.length}):\n`;
    comp.safeVerifiedItems.forEach((i) => {
      result += `• ${i.quantity} יח׳ ${i.product.nameHe} [ברקוד: ${i.product.carrefourBarcode || i.product.barcode}]\n`;
    });
    result += `\n`;
  }

  if (comp.weighedProduceAndButcherItems.length > 0) {
    result += `🥩 פריטי שקילה וקצביה טריים (להוספה לפי משקל מקומי - ${comp.weighedProduceAndButcherItems.length}):\n`;
    comp.weighedProduceAndButcherItems.forEach((i) => {
      result += `• ${i.quantity} יח׳ ${i.product.nameHe} (חיפוש: ${i.product.carrefourSearchQuery || i.product.nameHe})\n`;
    });
    result += `\n`;
  }

  if (comp.unverifiedPackagedItems.length > 0) {
    result += `🔎 מוצרים ארוזים בלי ברקוד מאומת (חיפוש ידני, לא נכנסו לקישור - ${comp.unverifiedPackagedItems.length}):\n`;
    comp.unverifiedPackagedItems.forEach((i) => {
      result += `• ${i.quantity} יח׳ ${i.product.nameHe}\n`;
    });
    result += `\n`;
  }

  if (comp.nonKosherItems.length > 0) {
    result += `⚠️ מוצרים לא-כשרים (אינם נמכרים בקרפור - לרכישה בטיב טעם):\n`;
    comp.nonKosherItems.forEach((i) => {
      result += `• ${i.quantity} יח׳ ${i.product.nameHe}\n`;
    });
  }

  return result.trim();
}

/**
 * Formats shopping list for Rami Levy's "קנייה מהירה" (Quick Buy) paste tool
 */
export function buildRamiLevyQuickBuyText(items: CartItem[]): string {
  return items
    .filter((item) => Number.isFinite(item.quantity) && item.quantity > 0 && item.product.nameHe.trim().length > 0)
    .map((item) => {
      const qty = Number.isInteger(item.quantity)
        ? String(item.quantity)
        : String(Math.round(item.quantity * 10) / 10);
      return `${qty} ${item.product.nameHe.trim()}`;
    })
    .join('\n');
}

/**
 * Formats shopping list for Shufersal "שותפים לקנייה" or general sharing
 */
export function buildShufersalShareText(items: CartItem[]): string {
  const header = `🛒 רשימת קניות מרוכזת מאפליקציית SalKal:`;
  const lines = items.map(
    (item) => `• [${item.product.barcode}] ${item.product.nameHe} (${item.quantity} יח׳)`
  );
  return `${header}\n${lines.join('\n')}`;
}

/**
 * Formats in-store aisle walk list for Osher Ad or physical shopping
 */
export function buildInStoreAisleMap(items: CartItem[]): Record<string, CartItem[]> {
  const grouped: Record<string, CartItem[]> = {};

  items.forEach((item) => {
    const aisle = item.product.aisle || 'מעבר כללי';
    if (!grouped[aisle]) {
      grouped[aisle] = [];
    }
    grouped[aisle].push(item);
  });

  return grouped;
}

/**
 * Computes basket subtotal for a given store
 */
export function computeStoreBasketCost(
  storeId: StoreId,
  items: CartItem[]
): { total: number; availableItemsCount: number; missingItems: CartItem[] } {
  let total = 0;
  let availableItemsCount = 0;
  const missingItems: CartItem[] = [];

  for (const item of items) {
    const price = item.product.prices[storeId];
    if (typeof price === 'number') {
      total += price * item.quantity;
      availableItemsCount += 1;
    } else {
      missingItems.push(item);
    }
  }

  return {
    total: Number(total.toFixed(2)),
    availableItemsCount,
    missingItems,
  };
}

/**
 * Calculates optimal 2-chain split basket (סל מפוצל חכם)
 * Finds which 2 stores combined offer the maximum savings vs the single best store.
 */
export function findOptimalSplitBasket(
  items: CartItem[],
  candidateStores: Store[] = STORES.filter((s) => s.platform !== 'in-store')
): SplitBasketOptimization | null {
  if (items.length < 2 || candidateStores.length < 2) return null;

  // 1. Calculate each single store's total
  const storeTotals: { store: Store; total: number; isComplete: boolean }[] = [];

  for (const store of candidateStores) {
    const { total, availableItemsCount } = computeStoreBasketCost(store.id, items);
    storeTotals.push({
      store,
      total,
      isComplete: availableItemsCount === items.length,
    });
  }

  // Filter stores that have all items
  const validSingleStores = storeTotals.filter((st) => st.isComplete);
  if (validSingleStores.length === 0) return null;

  validSingleStores.sort((a, b) => a.total - b.total);
  const singleBest = validSingleStores[0];

  let bestSplit: SplitBasketOptimization | null = null;
  let maxSavings = 0;

  // 2. Evaluate all store pairs (A, B)
  for (let i = 0; i < candidateStores.length; i++) {
    for (let j = i + 1; j < candidateStores.length; j++) {
      const storeA = candidateStores[i];
      const storeB = candidateStores[j];

      const itemsA: CartItem[] = [];
      const itemsB: CartItem[] = [];
      let subtotalA = 0;
      let subtotalB = 0;
      let pairValid = true;

      for (const item of items) {
        const priceA = item.product.prices[storeA.id];
        const priceB = item.product.prices[storeB.id];

        if (priceA === undefined && priceB === undefined) {
          pairValid = false;
          break;
        }

        if (priceA !== undefined && priceB !== undefined) {
          if (priceA <= priceB) {
            itemsA.push(item);
            subtotalA += priceA * item.quantity;
          } else {
            itemsB.push(item);
            subtotalB += priceB * item.quantity;
          }
        } else if (priceA !== undefined) {
          itemsA.push(item);
          subtotalA += priceA * item.quantity;
        } else if (priceB !== undefined) {
          itemsB.push(item);
          subtotalB += priceB * item.quantity;
        }
      }

      if (!pairValid) continue;

      // Ensure both stores get at least 1 item to make it a genuine split
      if (itemsA.length === 0 || itemsB.length === 0) continue;

      const combinedTotal = Number((subtotalA + subtotalB).toFixed(2));
      const savings = Number((singleBest.total - combinedTotal).toFixed(2));

      if (savings > maxSavings) {
        maxSavings = savings;
        bestSplit = {
          store1: storeA,
          items1: itemsA,
          subtotal1: Number(subtotalA.toFixed(2)),
          store2: storeB,
          items2: itemsB,
          subtotal2: Number(subtotalB.toFixed(2)),
          combinedTotal,
          singleBestStore: singleBest.store,
          singleBestTotal: singleBest.total,
          savingsNis: savings,
          savingsPercentage:
            singleBest.total > 0 ? Math.round((savings / singleBest.total) * 100) : 0,
        };
      }
    }
  }

  return bestSplit;
}

/**
 * Builds a clean, human-readable shopping list for any supermarket
 */
export function buildStoreFormattedList(store: Store, items: CartItem[]): string {
  const header = `🛒 סל קניות - ${store.nameHe} (באמצעות SalKal):`;
  const itemsText = items
    .map((i, idx) => {
      const code = i.product.carrefourBarcode || i.product.barcode;
      return `${idx + 1}. ${i.product.nameHe} - כמות: ${i.quantity} [ברקוד: ${code}]`;
    })
    .join('\n');

  return `${header}\n\n${itemsText}\n\nסה"כ מוצרים: ${items.length}`;
}

export interface StoreBasketQuote {
  total: number;
  isComplete: boolean;
  availableItemsCount: number;
}

/**
 * Complete baskets rank ahead of partial ones, even when the partial total is lower.
 * A store missing the expensive lines must not look like the cheapest full shop.
 */
export function rankStoreBasketQuotes<T extends StoreBasketQuote>(quotes: T[]): T[] {
  return [...quotes].sort((a, b) => {
    if (a.isComplete !== b.isComplete) return a.isComplete ? -1 : 1;
    if (!a.isComplete && a.availableItemsCount !== b.availableItemsCount) {
      return b.availableItemsCount - a.availableItemsCount;
    }
    return a.total - b.total;
  });
}

