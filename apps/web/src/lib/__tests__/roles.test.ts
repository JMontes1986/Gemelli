import { strict as assert } from 'node:assert';

import { normalizeRole } from '../roles';
import { canManageInventory } from '../access';

assert.equal(normalizeRole('ti'), 'TI');
assert.equal(normalizeRole('docente'), 'DOCENTE');
assert.equal(normalizeRole('lider ti'), 'LIDER_TI');
assert.equal(normalizeRole('lider-ti'), 'LIDER_TI');
assert.equal(normalizeRole('Líder TI'), 'LIDER_TI');
assert.equal(normalizeRole('líder   ti'), 'LIDER_TI');
assert.equal(normalizeRole('Líder de TI'), 'LIDER_TI');
assert.equal(normalizeRole('Jefe TI'), 'LIDER_TI');
assert.equal(normalizeRole(' DIRECTOR '), 'DIRECTOR');
assert.equal(normalizeRole('ADMINISTRATIVO'), 'ADMINISTRATIVO');

assert.equal(normalizeRole('estudiante'), null);
assert.equal(normalizeRole(''), null);
assert.equal(normalizeRole(null), null);
assert.equal(normalizeRole(undefined), null);

console.log('normalizeRole tests passed');

// canManageInventory tests
assert.equal(
  canManageInventory({ rol: 'LIDER_TI', email: 'lider@example.com' }),
  true,
);

assert.equal(
  canManageInventory({ data: { rol: 'Lider_TI', email: 'lider@example.com' } }),
  true,
);

assert.equal(
  canManageInventory({ profile: { role: 'líder ti', correo: 'lider@example.com' } }),
  true,
);

assert.equal(
  canManageInventory({ rol: 'DOCENTE', email: 'docente@example.com' }),
  false,
);

console.log('canManageInventory tests passed');
