import assert from 'node:assert/strict';
import test from 'node:test';
import { PRODUCTS, STORES } from '../data/mockData.ts';
import type { CartItem, Product } from '../types/index.ts';
import {
  buildRamiLevyQuickBuyText,
  buildSelfPointProbeUrl,
  buildSelfPointUrl,
  buildStoreSearchUrl,
  computeStoreBasketCost,
  findOptimalSplitBasket,
  isHandoffBarcode,
  planSelfPointHandoff,
  rankStoreBasketQuotes,
} from './cartHandoff.ts';

function item(id: string, quantity: number, patch: Partial<Product> = {}): CartItem {
  const product = PRODUCTS.find((entry) => entry.id === id);
  if (!product) throw new Error(`missing fixture product ${id}`);
  return { product: { ...product, ...patch }, quantity };
}

test('Self-Point URL keeps literal commas and semicolons', () => {
  const url = buildSelfPointUrl(
    'www.carrefour.co.il',
    [item('p-milk-tnuva', 2), item('p-eggs-l', 1)],
    'SalKal',
    true,
    false
  );

  assert.equal(
    url,
    'https://www.carrefour.co.il/?externalCart=7290004131074,2;7290001201589,1&externalName=SalKal'
  );
  assert.equal(url.includes('%2C'), false);
  assert.equal(url.includes('%3B'), false);
});

test('app name is encoded and the cart separators are not', () => {
  const url = buildSelfPointUrl('www.victoryonline.co.il', [item('p-milk-tnuva', 1)], 'סל קל', true, false);
  assert.match(url, /^https:\/\/www\.victoryonline\.co\.il\/\?externalCart=7290004131074,1&externalName=/);
  assert.equal(url.includes('externalName=%D7%A1%D7%9C%20%D7%A7%D7%9C'), true);
  assert.equal(url.includes('externalCart=7290004131074,1'), true);
});

test('safe mode drops weighed items, unverified barcodes, and non-kosher lines', () => {
  const plan = planSelfPointHandoff(
    'www.carrefour.co.il',
    [
      item('p-milk-tnuva', 2),
      item('p-tomatoes', 1),
      item('p-bacon-tivtaam', 1),
      item('p-parmesan-reggiano', 1),
    ],
    { safeMode: true, isNonKosherSpecialist: false }
  );

  assert.deepEqual(Object.keys(plan.quantitiesByBarcode), ['7290004131074']);
  assert.equal(plan.manual.some((entry) => entry.product.id === 'p-tomatoes'), true);
  assert.equal(plan.excludedNonKosher.some((entry) => entry.product.id === 'p-bacon-tivtaam'), true);
  assert.equal(plan.excludedNonKosher.some((entry) => entry.product.id === 'p-parmesan-reggiano'), true);
  assert.equal(plan.url.includes('8819015'), false);
});

test('Tiv Taam safe mode can include a verified non-kosher packaged item', () => {
  const url = buildSelfPointUrl('www.tivtaam.co.il', [item('p-parmesan-reggiano', 1)], 'SalKal', true, true);
  assert.equal(url.includes('externalCart=7290008819046,1'), true);
});

test('unsafe mode still refuses a barcode that could break the query string', () => {
  const plan = planSelfPointHandoff(
    'www.mck.co.il',
    [item('p-tomatoes', 2, { barcode: '12345678;evil=1', isWeighedOrButcher: true, isCarrefourVerifiedPackaged: false })],
    { safeMode: false }
  );
  assert.equal(plan.url, '');
  assert.equal(plan.included.length, 0);
  assert.equal(isHandoffBarcode('12345678;evil=1'), false);
});

test('duplicate barcodes merge and quantities cap at 99', () => {
  const plan = planSelfPointHandoff(
    'www.keshet-teamim.co.il',
    [item('p-milk-tnuva', 60), item('p-milk-tnuva', 50)],
    { safeMode: true }
  );
  assert.equal(plan.quantitiesByBarcode['7290004131074'], 99);
  assert.equal(plan.included.length, 1);
});

test('unknown hosts and injected probe barcodes are rejected', () => {
  assert.equal(buildSelfPointUrl('evil.example', [item('p-milk-tnuva', 1)]), '');
  assert.equal(buildSelfPointUrl('www.carrefour.co.il.evil.com', [item('p-milk-tnuva', 1)]), '');
  assert.equal(buildSelfPointProbeUrl('www.carrefour.co.il', '7290004131074&externalCart=1', 2), null);
  assert.equal(
    buildSelfPointProbeUrl('www.mck.co.il', '7290004131074', 2),
    'https://www.mck.co.il/?externalCart=7290004131074,2&externalName=SalKal'
  );
});

test('Carrefour falls back to the catalog barcode when the chain field is not numeric', () => {
  const url = buildSelfPointUrl(
    'www.carrefour.co.il',
    [item('p-milk-tnuva', 1, { barcode: '7290004131074', carrefourBarcode: 'not-a-code' })],
    'SalKal',
    true,
    false
  );
  assert.equal(url.includes('externalCart=7290004131074,1'), true);
});

test('Carrefour prefers the chain barcode field when it is numeric', () => {
  const url = buildSelfPointUrl(
    'www.carrefour.co.il',
    [item('p-milk-tnuva', 1, { barcode: '11111111', carrefourBarcode: '7290004131074' })],
    'SalKal',
    true,
    false
  );
  assert.equal(url.includes('externalCart=7290004131074,1'), true);
  assert.equal(url.includes('11111111'), false);
});

test('Machsanei HaShuk search stays on the tested mck host', () => {
  const store = STORES.find((entry) => entry.id === 'machsaneihashuk');
  assert.ok(store);
  assert.equal(buildStoreSearchUrl(store, 'חלב'), 'https://www.mck.co.il/search?q=%D7%97%D7%9C%D7%91');
});

test('Rami Levy paste text skips empty quantities and keeps fractions', () => {
  const text = buildRamiLevyQuickBuyText([
    item('p-milk-tnuva', 2),
    item('p-tomatoes', 0.5),
    item('p-eggs-l', Number.NaN),
  ]);
  assert.equal(text.includes('2 חלב תנובה 3% בקרטון 1 ליטר'), true);
  assert.equal(text.includes('0.5 עגבניות חממה טריות מובחרות (1 ק״ג)'), true);
  assert.equal(text.includes('NaN'), false);
  assert.equal(text.includes('ביצים'), false);
});

test('partial baskets do not outrank a complete basket with a higher total', () => {
  const ranked = rankStoreBasketQuotes([
    { id: 'partial', total: 5, isComplete: false, availableItemsCount: 1 },
    { id: 'full-dear', total: 40, isComplete: true, availableItemsCount: 3 },
    { id: 'full-cheap', total: 30, isComplete: true, availableItemsCount: 3 },
  ]);
  assert.deepEqual(
    ranked.map((entry) => entry.id),
    ['full-cheap', 'full-dear', 'partial']
  );
});

test('split savings stay finite when the reference basket is free', () => {
  const freeMilk = item('p-milk-tnuva', 1, {
    prices: { carrefour: 0, victory: 0 },
  });
  const paidEggs = item('p-eggs-l', 1, {
    prices: { carrefour: 10, victory: 4 },
  });
  const split = findOptimalSplitBasket([freeMilk, paidEggs], [
    STORES.find((store) => store.id === 'carrefour')!,
    STORES.find((store) => store.id === 'victory')!,
  ]);
  if (split) {
    assert.equal(Number.isFinite(split.savingsPercentage), true);
  }
});

test('a missing price is not treated as zero in the basket total', () => {
  const quote = computeStoreBasketCost('shufersal', [item('p-bacon-tivtaam', 2)]);
  assert.equal(quote.total, 0);
  assert.equal(quote.availableItemsCount, 0);
  assert.equal(quote.missingItems.length, 1);
});
