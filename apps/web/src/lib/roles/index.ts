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

  const normalized = role
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '_')
    .replace(/-+/g, '_');

  return ALLOWED_ROLES.has(normalized as UserRole) ? (normalized as UserRole) : null;
};
