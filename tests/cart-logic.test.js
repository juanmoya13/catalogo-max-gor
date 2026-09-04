import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildWhatsAppMessage,
  calculateCartTotals,
  createCartItemFromProduct,
  createCartItemKey,
} from '../lib/cart.ts';

test('createCartItemKey genera identidad estable por producto y filtros', () => {
  const base = createCartItemKey('producto-1', [{ id: 'filtro-1', value: 'M' }]);
  const same = createCartItemKey('producto-1', [{ id: 'filtro-1', value: 'M' }]);
  const other = createCartItemKey('producto-1', [{ id: 'filtro-1', value: 'L' }]);

  assert.equal(base, same);
  assert.notEqual(base, other);
});

test('calculateCartTotals ignora productos sin precio', () => {
  const totals = calculateCartTotals([
    { id: 'a', productId: 'p1', productName: 'Remera', imageUrl: '', price: 1500, selectedFilters: [], quantity: 2 },
    { id: 'b', productId: 'p2', productName: 'Buzo', imageUrl: '', price: null, selectedFilters: [], quantity: 1 },
  ]);

  assert.equal(totals.itemCount, 3);
  assert.equal(totals.total, 3000);
});

test('buildWhatsAppMessage incluye productos, cantidades y total', () => {
  const message = buildWhatsAppMessage([
    createCartItemFromProduct({ id: 'p1', nombre: 'Remera', precio: 1200, fotografias: [{ url_imagen: 'https://example.com/a.jpg' }], filtros: [{ valor_filtro_id: 'f1', valor: 'M' }] }, 2),
    createCartItemFromProduct({ id: 'p2', nombre: 'Buzo', precio: null, fotografias: [{ url_imagen: 'https://example.com/b.jpg' }] }, 1),
  ]);

  assert.match(message, /Remera/);
  assert.match(message, /x2/);
  assert.match(message, /Buzo/);
  assert.match(message, /Total estimado: .*2\.400/);
});
