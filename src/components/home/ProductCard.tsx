import { Heart, MapPin } from 'lucide-react';
import { motion } from 'motion/react';
import { Product } from '../../types/marketplace';
import { Link } from 'react-router-dom';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="group overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-900"
    >
      <Link to={`/products/${product._id}`} className="block">
        <img src={product.image} alt={product.title} className="h-40 w-full object-cover" loading="lazy" />
      </Link>
      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="line-clamp-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100">{product.title}</h3>
          <span className="rounded-lg bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300">
            {product.category}
          </span>
        </div>
        <p className="line-clamp-2 text-xs text-zinc-600 dark:text-zinc-300">{product.description}</p>
        <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
          <span className="inline-flex items-center gap-1">
            <MapPin size={13} /> {product.location}
          </span>
          <span className="inline-flex items-center gap-1">
            <Heart size={13} /> {product.likes}
          </span>
        </div>
        <div className="flex items-end justify-between">
          <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Rs {product.price.toLocaleString()}</span>
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{product.sellerName}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-zinc-500 dark:text-zinc-400">Stock: {product.stock}</span>
          <Link
            to={`/products/${product._id}`}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-300"
          >
            View details
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
