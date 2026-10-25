import assert from 'node:assert/strict';
import test from 'node:test';
import { PRODUCTS } from '../data/mockData.ts';
import { buildCatalogMappings } from './productMappingDb.ts';

test('catalog mappings repeat the real barcode and never invent a chain SKU', () => {
  const first = buildCatalogMappings(PRODUCTS);
  const second = buildCatalogMappings(PRODUCTS);
  assert.deepEqual(first, second);

  const cottage = PRODUCTS.find((product) => product.id === 'p-cottage-tnuva');
  assert.ok(cottage);
  const cottageRows = first.filter((row) => row.productId === 'p-cottage-tnuva');
  assert.ok(cottageRows.length >= 4);
  for (const row of cottageRows) {
    assert.equal(row.barcode, cottage.barcode);
    assert.equal(row.storeInternalId, cottage.barcode);
    assert.equal(row.isDirectInjectSupported, false);
    assert.equal(row.syncSource, 'inferred');
  }
});

test('every mapped barcode matches the product the handoff URL will send', () => {
  const byId = new Map(PRODUCTS.map((product) => [product.id, product.barcode]));
  for (const row of buildCatalogMappings(PRODUCTS)) {
    assert.equal(row.barcode, byId.get(row.productId));
    assert.equal(/^[0-9]{8,14}$/.test(row.barcode), true);
  }
});
