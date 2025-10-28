import { normalizeRole } from '../roles';

export const PRIVILEGED_INVENTORY_EMAILS = ['sistemas@colgemelli.edu.co'];

type ProfileLike = {
  email?: string | null;
  role?: string | null;
  rol?: string | null;
  [key: string]: unknown;
};

const extractCandidateEmails = (profile: ProfileLike | null | undefined): string[] => {
  if (!profile) {
    return [];
  }

  const candidates = new Set<string>();

  const rawValues = [
    profile.email,
    // Campos alternativos que podrían existir según la respuesta del API
    (profile as Record<string, unknown>).email_institucional,
    (profile as Record<string, unknown>).correo,
    (profile as Record<string, unknown>).correo_institucional,
    (profile as Record<string, unknown>).correoInstitucional,
    (profile as Record<string, unknown>).usuario_email,
  ];

  rawValues.forEach((value) => {
    if (typeof value === 'string' && value.trim()) {
      candidates.add(value.trim().toLowerCase());
    }
  });

  return Array.from(candidates);
};

export const canManageInventory = (profile: ProfileLike | null | undefined): boolean => {
  const normalizedRole = normalizeRole((profile?.rol ?? profile?.role ?? null) as string | null);

  if (normalizedRole === 'TI' || normalizedRole === 'LIDER_TI') {
    return true;
  }

  const emails = extractCandidateEmails(profile);
  return emails.some((email) => PRIVILEGED_INVENTORY_EMAILS.includes(email));
};

export const hasPrivilegedInventoryEmail = (
  profile: ProfileLike | null | undefined
): boolean => {
  const emails = extractCandidateEmails(profile);
  return emails.some((email) => PRIVILEGED_INVENTORY_EMAILS.includes(email));
};
