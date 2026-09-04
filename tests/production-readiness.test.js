import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

import {
  buildWhatsAppLink,
  buildWhatsAppMessage,
  reconcileCartItemsWithCatalog,
} from '../lib/cart.ts';

test('reconcileCartItemsWithCatalog elimina productos inexistentes y actualiza precios vigentes', () => {
  const items = [
    {
      productId: 'p-1',
      productName: 'Remera',
      imageUrl: 'https://example.com/remera.jpg',
      price: 2000,
      selectedFilters: [{ id: 'filtro-1', value: 'L' }],
      quantity: 2,
    },
    {
      productId: 'missing-product',
      productName: 'Buzo no disponible',
      imageUrl: 'https://example.com/missing.jpg',
      price: 3000,
      selectedFilters: [],
      quantity: 1,
    },
  ];

  const nextItems = reconcileCartItemsWithCatalog(items, [
    { id: 'p-1', nombre: 'Remera', precio: 1500 },
  ]);

  assert.equal(nextItems.length, 1);
  assert.equal(nextItems[0].productId, 'p-1');
  assert.equal(nextItems[0].price, 1500);
  assert.equal(nextItems[0].quantity, 2);
});

test('buildWhatsAppMessage mantiene productos sin precio y genera mensaje legible', () => {
  const message = buildWhatsAppMessage([
    createCartItem('p-1', 'Remera', 1200, [{ id: 'talle', value: 'L' }], 2),
    createCartItem('p-2', 'Buzo', null, [], 1),
  ]);

  assert.match(message, /Remera/);
  assert.match(message, /Buzo/);
  assert.match(message, /precio a consultar/i);
  assert.match(message, /Total estimado: .*2\.400/);
});

test('buildWhatsAppLink resuelve a wa.me sin numero en caso de ausencia', () => {
  const url = buildWhatsAppLink('', 'Hola');

  assert.equal(url, 'https://wa.me/?text=Hola');
});

test('la migración incluye políticas de RLS para evitar escrituras anónimas', () => {
  const migrationPath = new URL('../supabase/migrations/20260903_000001_catalog_schema.sql', import.meta.url);
  const migration = fs.readFileSync(migrationPath, 'utf8');

  assert.match(migration, /ALTER TABLE productos ENABLE ROW LEVEL SECURITY/);
  assert.match(migration, /CREATE POLICY "Authenticated admin can manage products"/);
  assert.match(migration, /auth.role\(\) = 'authenticated'/);
  assert.match(migration, /CREATE POLICY "Public can read products"/);
});

function createCartItem(productId, productName, price, selectedFilters, quantity) {
  return {
    id: `${productId}|${selectedFilters.map((filter) => `${filter.id}:${filter.value}`).join('|') || 'default'}`,
    productId,
    productName,
    imageUrl: '',
    price,
    selectedFilters,
    quantity,
  };
}
