import React, { useEffect, useMemo, useState } from 'react';
import { MapPin, Trash2 } from 'lucide-react';
import { getApiErrorMessage } from '../lib/api';
import { fetchCart, removeFromCart } from '../services/cartService';
import { CartItem } from '../types/marketplace';

const Cart: React.FC = () => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadCart = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await fetchCart();
        setItems(data.filter((item) => item.product));
      } catch (err) {
        setError(getApiErrorMessage(err, 'Unable to load cart items.'));
      } finally {
        setLoading(false);
      }
    };
    loadCart();
  }, []);

  const totalAmount = useMemo(
    () => items.reduce((sum, item) => sum + (item.product?.price || 0) * (item.quantity || 1), 0),
    [items]
  );

  const handleRemove = async (productId: string) => {
    try {
      await removeFromCart(productId);
      setItems((prev) => prev.filter((item) => item.product?._id !== productId));
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to remove item from cart.'));
    }
  };

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Cart</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">Review your selected items before checkout.</p>
      </div>

      {error ? (
        <div className="mb-4 rounded-xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/50 dark:bg-rose-500/10 dark:text-rose-300">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-28 animate-pulse rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
          ))}
        </div>
      ) : null}

      {!loading && items.length === 0 ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
          Your cart is empty. Add products from marketplace or product details.
        </div>
      ) : null}

      {!loading && items.length > 0 ? (
        <div className="space-y-3">
          {items.map((item) => (
            <article
              key={item._id}
              className="flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-900 sm:flex-row"
            >
              <img src={item.product.image} alt={item.product.title} className="h-28 w-full rounded-xl object-cover sm:w-36" />
              <div className="flex-1 space-y-1">
                <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{item.product.title}</h2>
                <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Rs {item.product.price.toLocaleString()}</p>
                <p className="text-xs text-zinc-600 dark:text-zinc-300">Qty: {item.quantity}</p>
                <p className="text-xs text-zinc-600 dark:text-zinc-300">Seller: {item.product.sellerName}</p>
                <p className="inline-flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
                  <MapPin size={12} /> {item.product.location}
                </p>
              </div>
              <button
                onClick={() => handleRemove(item.product._id)}
                className="inline-flex items-center justify-center gap-1 self-start rounded-lg border border-rose-300 px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:border-rose-500/40 dark:text-rose-300 dark:hover:bg-rose-500/10"
              >
                <Trash2 size={12} /> Remove
              </button>
            </article>
          ))}

          <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Total amount: Rs {totalAmount.toLocaleString()}
            </p>
          </div>
        </div>
      ) : null}
    </section>
  );
};

export default Cart;
