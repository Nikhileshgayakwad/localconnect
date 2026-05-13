/** Origin-relative path — must match `public/default-avatar.svg` and server constant. */
export const DEFAULT_PROFILE_AVATAR = '/default-avatar.svg';

const LEGACY_PLACEHOLDERS = new Set(['', 'default-avatar.png']);

/** Resolved URL for display (`img` src). Uses Cloudinary/profile URL when set; otherwise default SVG. */
export function resolveAvatarUrl(profileImage?: string | null, avatar?: string | null): string {
  const primary = (profileImage ?? '').trim();
  if (primary && !LEGACY_PLACEHOLDERS.has(primary)) return primary;
  const secondary = (avatar ?? '').trim();
  if (secondary && !LEGACY_PLACEHOLDERS.has(secondary)) return secondary;
  return DEFAULT_PROFILE_AVATAR;
}
