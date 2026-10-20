import { CartItem, Store, StoreId, SplitBasketOptimization } from '../types';
import { STORES } from '../data/mockData';

/**
 * Builds the exact Self-Point (Stor.ai) externalCart handoff URL
 * Format: https://<domain>/?externalCart=<barcode>,<qty>;<barcode2>,<qty2>&externalName=<appName>
 *
 * NOTE FOR CARREFOUR: If Stor.ai encounters unknown barcodes (such as loose produce weighed on scales
 * or unlisted butcher meats), Carrefour displays an error and in many sessions wipes the entire cart.
 * When carrefourSafeMode is true (default), we only inject 100% verified packaged barcodes, guaranteed
 * to be in the catalog, preventing any cart reset. Weighed produce/meat are added via 1-click quick-search.
 */
/**
 * Builds the exact Self-Point (Stor.ai) externalCart handoff URL
 * Format: https://<domain>/?externalCart=<barcode>,<qty>;<barcode2>,<qty2>&externalName=<appName>
 *
 * NOTE FOR STOR.AI PLATFORMS (Carrefour, Victory, Machsanei HaShuk, Keshet Teamim, Tiv Taam):
 * Stor.ai only matches items that have fixed EAN-13 barcodes in their online catalog.
 * Loose weighed produce (tomatoes, cucumbers, onions) and fresh butcher counter meats (chicken breast, beef)
 * are sold by weight at branches and DO NOT have universal barcodes in Stor.ai.
 * If unrecognized barcodes are sent, Stor.ai displays an annoying error ("לא הצלחנו לזהות X מוצרים מאתר SalKal")
 * and can wipe out the cart.
 * When safeMode is true (default), we ONLY inject verified packaged groceries (dairy, eggs, pasta, rice, oil, etc.).
 * Weighed items are conveniently presented with 1-click direct search buttons.
 */
export function buildSelfPointUrl(
  storeDomain: string,
  items: CartItem[],
  appName = 'SalKal',
  safeMode = true,
  isNonKosherSpecialist = false
): string {
  if (items.length === 0) return `https://${storeDomain}`;

  const isCarrefour = storeDomain.toLowerCase().includes('carrefour');

  // Filter items: In safe mode, exclude weighed produce/butcher and filter out non-kosher for kosher stores
  let targetItems = items;
  if (safeMode) {
    targetItems = items.filter((i) => {
      // Never send fresh produce or butcher counter items via Stor.ai externalCart
      if (i.product.isWeighedOrButcher) return false;
      // Filter out non-kosher items for kosher supermarkets
      if (!isNonKosherSpecialist && i.product.isKosher === false) return false;
      // Only include items with valid barcodes
      return !!i.product.barcode && i.product.barcode.length >= 8;
    });
  } else {
    if (!isNonKosherSpecialist) {
      targetItems = items.filter((i) => i.product.isKosher !== false);
    }
  }

  if (targetItems.length === 0) {
    return `https://${storeDomain}`;
  }

  const cartString = targetItems
    .map((item) => {
      const code = isCarrefour && item.product.carrefourBarcode
        ? item.product.carrefourBarcode
        : item.product.barcode;
      return `${code},${Math.max(1, Math.round(item.quantity))}`;
    })
    .join(';');

  const params = new URLSearchParams();
  params.set('externalCart', cartString);
  params.set('externalName', appName);

  return `https://${storeDomain}/?${params.toString()}`;
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
      return `https://www.mashuk.co.il/search?q=${enc}`;
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
  nonKosherItems: CartItem[];
  totalCount: number;
  safeCount: number;
  weighedCount: number;
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
  const safeVerifiedItems: CartItem[] = [];
  const weighedProduceAndButcherItems: CartItem[] = [];
  const nonKosherItems: CartItem[] = [];
  const isKosherStore = !store.isNonKosherSpecialist;

  for (const item of items) {
    if (isKosherStore && item.product.isKosher === false) {
      nonKosherItems.push(item);
    } else if (item.product.isWeighedOrButcher) {
      weighedProduceAndButcherItems.push(item);
    } else {
      safeVerifiedItems.push(item);
    }
  }

  const totalCount = items.length;
  const safeCount = safeVerifiedItems.length;
  const weighedCount = weighedProduceAndButcherItems.length;
  const nonKosherCount = nonKosherItems.length;
  const safePercentage = totalCount > 0 ? Math.round((safeCount / totalCount) * 100) : 100;

  return {
    safeVerifiedItems,
    weighedProduceAndButcherItems,
    nonKosherItems,
    totalCount,
    safeCount,
    weighedCount,
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
    .map((item) => `${item.quantity} ${item.product.nameHe}`)
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
          savingsPercentage: Math.round((savings / singleBest.total) * 100),
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

