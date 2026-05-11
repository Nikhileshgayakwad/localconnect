import React, { useEffect, useState } from 'react';
import { ArrowRightLeft, Trash2 } from 'lucide-react';
import { getApiErrorMessage } from '../lib/api';
import { addToCart } from '../services/cartService';
import { fetchWishlist, removeFromWishlist } from '../services/wishlistService';
import { WishlistItem } from '../types/marketplace';

const Wishlist: React.FC = () => {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadWishlist = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await fetchWishlist();
        setItems(data.filter((item) => item.product));
      } catch (err) {
        setError(getApiErrorMessage(err, 'Unable to load wishlist.'));
      } finally {
        setLoading(false);
      }
    };
    loadWishlist();
  }, []);

  const removeItem = async (productId: string) => {
    try {
      await removeFromWishlist(productId);
      setItems((prev) => prev.filter((item) => item.product._id !== productId));
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to remove wishlist item.'));
    }
  };

  const moveToCart = async (productId: string) => {
    try {
      await addToCart(productId);
      await removeFromWishlist(productId);
      setItems((prev) => prev.filter((item) => item.product._id !== productId));
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to move item to cart.'));
    }
  };

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Wishlist</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">Products saved for later purchase.</p>
      </div>

      {error ? (
        <div className="mb-4 rounded-xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/50 dark:bg-rose-500/10 dark:text-rose-300">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-24 animate-pulse rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
          ))}
        </div>
      ) : null}

      {!loading && items.length === 0 ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
          Wishlist is empty. Save products from details pages.
        </div>
      ) : null}

      {!loading && items.length > 0 ? (
        <div className="space-y-3">
          {items.map((item) => (
            <article
              key={item._id}
              className="flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-900 sm:flex-row sm:items-center"
            >
              <img src={item.product.image} alt={item.product.title} className="h-20 w-full rounded-xl object-cover sm:w-28" />
              <div className="flex-1">
                <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{item.product.title}</h2>
                <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Rs {item.product.price.toLocaleString()}</p>
                <p className="text-xs text-zinc-600 dark:text-zinc-300">{item.product.sellerName}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => moveToCart(item.product._id)}
                  className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500"
                >
                  <ArrowRightLeft size={12} /> Move to cart
                </button>
                <button
                  onClick={() => removeItem(item.product._id)}
                  className="inline-flex items-center gap-1 rounded-lg border border-rose-300 px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:border-rose-500/40 dark:text-rose-300 dark:hover:bg-rose-500/10"
                >
                  <Trash2 size={12} /> Remove
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
};

export default Wishlist;
