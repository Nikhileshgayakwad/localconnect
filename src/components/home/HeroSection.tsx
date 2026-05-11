import { Link } from 'react-router-dom';
import { ShoppingBag, Sparkles, Users } from 'lucide-react';
import { motion } from 'motion/react';

interface HeroSectionProps {
  isLoggedIn: boolean;
}

export default function HeroSection({ isLoggedIn }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden px-4 pt-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-3xl border border-zinc-200/70 bg-white/90 p-6 shadow-lg shadow-zinc-900/5 backdrop-blur-sm dark:border-zinc-700/70 dark:bg-zinc-900/80 sm:p-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
            className="space-y-6"
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300">
              <Sparkles size={14} /> Social commerce for your city
            </span>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl">
              Shop local deals, follow trusted sellers, and discover what your community loves.
            </h1>
            <p className="max-w-3xl text-sm leading-6 text-zinc-600 dark:text-zinc-300 sm:text-base">
              LocalConnect combines marketplace browsing with a social feed so buyers and sellers can connect
              quickly. Explore fresh products, top-rated shops, and real neighborhood conversations in one place.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to={isLoggedIn ? '/dashboard' : '/register'}
                className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
              >
                <ShoppingBag size={16} />
                {isLoggedIn ? 'Open dashboard' : 'Start shopping'}
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 px-4 py-2.5 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                <Users size={16} />
                Join community
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
