import { normalizeRole } from '../roles';

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

export const canManageInventory = (
  rawProfile: PossiblyWrappedProfile | null | undefined
): boolean => {
  const profile = unwrapProfile(rawProfile);
  const normalizedRole = normalizeRole((profile?.rol ?? profile?.role ?? null) as string | null);

  return normalizedRole === 'TI' || normalizedRole === 'LIDER_TI';
};

export const hasPrivilegedInventoryEmail = (
  rawProfile: PossiblyWrappedProfile | null | undefined
): boolean => {
  const emails = extractCandidateEmails(rawProfile);
  return emails.some((email) => PRIVILEGED_INVENTORY_EMAILS.includes(email));
};
