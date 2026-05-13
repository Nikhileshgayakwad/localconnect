import React from 'react';
import { DEFAULT_PROFILE_AVATAR, resolveAvatarUrl } from '../lib/avatar';

type ProfileAvatarProps = {
  profileImage?: string | null;
  avatar?: string | null;
  alt: string;
  className?: string;
};

/**
 * Rounded avatar with automatic default (modern neutral silhouette) when URLs are missing or legacy placeholders.
 */
const ProfileAvatar: React.FC<ProfileAvatarProps> = ({ profileImage, avatar, alt, className }) => {
  const src = resolveAvatarUrl(profileImage, avatar);

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      decoding="async"
      onError={(e) => {
        const el = e.currentTarget;
        el.onerror = null;
        el.src = DEFAULT_PROFILE_AVATAR;
      }}
    />
  );
};

export default ProfileAvatar;
