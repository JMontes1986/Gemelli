export type UserRole = 'DOCENTE' | 'ADMINISTRATIVO' | 'TI' | 'DIRECTOR' | 'LIDER_TI';

const ALLOWED_ROLES = new Set<UserRole>([
  'DOCENTE',
  'ADMINISTRATIVO',
  'TI',
  'DIRECTOR',
  'LIDER_TI',
]);

const ROLE_ALIASES: Record<string, UserRole> = {
  LIDER: 'LIDER_TI',
  LIDER_TI: 'LIDER_TI',
  LIDER_DE_TI: 'LIDER_TI',
  LIDER_TI_COLGEMELLI: 'LIDER_TI',
  LIDER_DE_TECNOLOGIA: 'LIDER_TI',
  JEFE_TI: 'LIDER_TI',
  JEFE_DE_TI: 'LIDER_TI',
};

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

  if (ALLOWED_ROLES.has(normalized as UserRole)) {
    return normalized as UserRole;
  }

  if (ROLE_ALIASES[normalized]) {
    return ROLE_ALIASES[normalized];
  }

  if (normalized.includes('LIDER') && normalized.includes('TI')) {
    return 'LIDER_TI';
  }

  return null;
};
