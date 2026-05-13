import { BadgeCheck, MapPin, Star } from 'lucide-react';
import { motion } from 'motion/react';
import { Seller } from '../../types/marketplace';
import ProfileAvatar from '../ProfileAvatar';

interface SellerCardProps {
  seller: Seller;
}

export default function SellerCard({ seller }: SellerCardProps) {
  return (
    <motion.article
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900"
    >
      <div className="flex items-center gap-3">
        <ProfileAvatar
          profileImage={seller.profileImage}
          avatar={seller.avatar}
          alt={seller.name}
          className="h-12 w-12 flex-shrink-0 rounded-full object-cover"
        />
        <div className="min-w-0 flex-1">
          <p className="line-clamp-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100">{seller.name}</p>
          <p className="inline-flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
            <MapPin size={12} /> {seller.location}
          </p>
        </div>
        {seller.verified ? <BadgeCheck className="text-emerald-500" size={18} /> : null}
      </div>
      <div className="mt-3 flex items-center justify-between text-xs">
        <span className="text-zinc-600 dark:text-zinc-300">{seller.followers.toLocaleString()} followers</span>
        <span className="inline-flex items-center gap-1 font-semibold text-amber-500">
          <Star size={12} fill="currentColor" /> {seller.rating.toFixed(1)}
        </span>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {seller.specialties.slice(0, 2).map((specialty) => (
          <span
            key={specialty}
            className="rounded-full bg-zinc-100 px-2 py-1 text-[11px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
          >
            {specialty}
          </span>
        ))}
      </div>
    </motion.article>
  );
}
