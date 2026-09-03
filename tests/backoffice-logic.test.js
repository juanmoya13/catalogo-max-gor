import test from 'node:test';
import assert from 'node:assert/strict';

import {
  validateProductPayload,
  validateFilterPayload,
  normalizeFilterAssignments,
} from '../lib/catalog/validation.js';

test('validateProductPayload exige nombre y al menos una fotografía', () => {
  assert.throws(() => validateProductPayload({ nombre: '', images: [] }), /nombre del producto/i);
  assert.throws(() => validateProductPayload({ nombre: 'Remera', images: [] }), /al menos una fotografía/i);
});

test('validateProductPayload rechaza más de un valor por filtro', () => {
  assert.throws(
    () =>
      validateProductPayload({
        nombre: 'Remera',
        images: ['x'],
        filters: [
          { filtro_id: 'f1', valor_filtro_id: 'v1' },
          { filtro_id: 'f1', valor_filtro_id: 'v2' },
        ],
      }),
    /más de un valor por filtro/i,
  );
});

test('validateFilterPayload acepta y normaliza valores del filtro', () => {
  const value = validateFilterPayload({ nombre: ' Talle ', valoresIniciales: 'M, S\nL' });

  assert.equal(value.nombre, 'Talle');
  assert.deepEqual(value.valoresIniciales, ['M', 'S', 'L']);
});

test('normalizeFilterAssignments elimina la ambigüedad de asociaciones duplicadas', () => {
  const normalized = normalizeFilterAssignments([
    { filtro_id: 'filtro-1', valor_filtro_id: 'valor-1' },
    { filtro_id: 'filtro-2', valor_filtro_id: 'valor-2' },
  ]);

  assert.equal(normalized.length, 2);
  assert.equal(normalized[0].filtro_id, 'filtro-1');
  assert.equal(normalized[1].filtro_id, 'filtro-2');
});
