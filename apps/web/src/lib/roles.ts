export type UserRole = 'DOCENTE' | 'ADMINISTRATIVO' | 'TI' | 'DIRECTOR' | 'LIDER_TI';

const ALLOWED_ROLES = new Set<UserRole>([
  'DOCENTE',
  'ADMINISTRATIVO',
  'TI',
  'DIRECTOR',
  'LIDER_TI',
]);

export const normalizeRole = (role?: string | null): UserRole | null => {
  if (!role) {
    return null;
  }

  const rawValue = `${role}`
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  const normalized = rawValue
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, '_')
    .replace(/_+/g, '_');

  return ALLOWED_ROLES.has(normalized as UserRole) ? (normalized as UserRole) : null;
};
