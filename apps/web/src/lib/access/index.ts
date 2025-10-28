import { normalizeRole } from '../roles';

export const PRIVILEGED_INVENTORY_EMAILS = ['sistemas@colgemelli.edu.co'];

type ProfileLike = {
  email?: string | null;
  role?: string | null;
  rol?: string | null;
  [key: string]: unknown;
};

type PossiblyWrappedProfile = ProfileLike & {
  data?: unknown;
  profile?: unknown;
  user?: unknown;
};

const unwrapProfile = (profile: PossiblyWrappedProfile | null | undefined): ProfileLike | null => {
  if (!profile || typeof profile !== 'object') {
    return null;
  }

  const candidate = profile as Record<string, unknown>;
  const hasProfileIndicators = ['rol', 'role', 'email', 'correo', 'correo_institucional', 'correoInstitucional']
    .some((key) => typeof candidate[key] === 'string' && `${candidate[key]}`.trim());

  if (hasProfileIndicators) {
    return profile;
  }

  const nestedKeys: Array<keyof PossiblyWrappedProfile> = ['data', 'profile', 'user'];
  for (const key of nestedKeys) {
    const value = candidate[key as string];
    if (value && typeof value === 'object') {
      const unwrapped = unwrapProfile(value as PossiblyWrappedProfile);
      if (unwrapped) {
        return unwrapped;
      }
    }
  }

  return profile;
};

const extractCandidateEmails = (
  rawProfile: PossiblyWrappedProfile | null | undefined
): string[] => {
  const profile = unwrapProfile(rawProfile);
  
  if (!profile) {
    return [];
  }

  const candidates = new Set<string>();
  const data = profile as Record<string, unknown>;

  const rawValues = [
    profile.email,
    // Campos alternativos que podrían existir según la respuesta del API
    data.email_institucional,
    data.correo,
    data.correo_institucional,
    data.correoInstitucional,
    data.usuario_email,
  ];

  rawValues.forEach((value) => {
    if (typeof value === 'string' && value.trim()) {
      candidates.add(value.trim().toLowerCase());
    }
  });

  return Array.from(candidates);
};

export const canManageInventory = (
  rawProfile: PossiblyWrappedProfile | null | undefined
): boolean => {
  const profile = unwrapProfile(rawProfile);
  const normalizedRole = normalizeRole((profile?.rol ?? profile?.role ?? null) as string | null);

  if (normalizedRole === 'TI' || normalizedRole === 'LIDER_TI') {
    return true;
  }

  const emails = extractCandidateEmails(profile);
  return emails.some((email) => PRIVILEGED_INVENTORY_EMAILS.includes(email));
};

export const hasPrivilegedInventoryEmail = (
  rawProfile: PossiblyWrappedProfile | null | undefined
): boolean => {
  const emails = extractCandidateEmails(rawProfile);
  return emails.some((email) => PRIVILEGED_INVENTORY_EMAILS.includes(email));
};
