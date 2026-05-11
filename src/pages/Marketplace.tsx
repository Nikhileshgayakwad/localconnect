import React, { useEffect, useState } from 'react';
import { Heart, MapPin, Search, ShoppingCart, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getApiErrorMessage } from '../lib/api';
import { fetchProducts } from '../services/productService';
import { Product } from '../types/marketplace';
import { PRODUCT_CATEGORIES } from '../constants/categories';

const Marketplace: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [location, setLocation] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await fetchProducts({
          limit: 60,
          search: search.trim() || undefined,
          category: selectedCategories.length ? selectedCategories : undefined,
          location: location.trim() || undefined,
          minPrice: minPrice ? Number(minPrice) : undefined,
          maxPrice: maxPrice ? Number(maxPrice) : undefined,
        });
        setProducts(data);
      } catch (err) {
        setError(getApiErrorMessage(err, 'Unable to load marketplace products right now.'));
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [search, selectedCategories, location, minPrice, maxPrice]);

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((item) => item !== category) : [...prev, category]
    );
  };

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Marketplace</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">Discover local products from verified sellers near you.</p>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
        <div className="space-y-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-zinc-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full rounded-xl border border-zinc-300 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-900"
            />
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Categories</p>
            <div className="flex flex-wrap gap-2">
              {PRODUCT_CATEGORIES.map((category) => {
                const active = selectedCategories.includes(category);
                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => toggleCategory(category)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                      active
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:border-indigo-400 dark:bg-indigo-500/20 dark:text-indigo-300'
                        : 'border-zinc-300 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800'
                    }`}
                  >
                    {category}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Location"
              className="rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-900"
            />
            <input
              type="number"
              min="0"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder="Min price"
              className="rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-900"
            />
            <input
              type="number"
              min="0"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="Max price"
              className="rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-900"
            />
          </div>
        </div>
      </div>

      {error ? (
        <div className="mt-4 rounded-2xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/50 dark:bg-rose-500/10 dark:text-rose-300">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div key={idx} className="h-72 animate-pulse rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
          ))}
        </div>
      ) : null}

      {!loading && !error && products.length === 0 ? (
        <div className="mt-5 rounded-2xl border border-zinc-200 bg-white p-8 text-center text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
          No products found for the selected filters. Try changing search, category, location, or price range.
        </div>
      ) : null}

      {!loading && products.length > 0 ? (
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <article
              key={product._id}
              className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-900"
            >
              <Link to={`/products/${product._id}`} className="block">
                <img src={product.image} alt={product.title} className="h-40 w-full object-cover" loading="lazy" />
              </Link>
              <div className="space-y-2 p-4">
                <Link to={`/products/${product._id}`} className="line-clamp-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {product.title}
                </Link>
                <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                  <span className="rounded-lg bg-indigo-50 px-2 py-1 font-semibold text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300">
                    {product.category}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Star size={12} /> {product.likes || 0}
                  </span>
                </div>
                <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Rs {product.price.toLocaleString()}</p>
                <p className="text-xs text-zinc-600 dark:text-zinc-300">Seller: {product.sellerName}</p>
                <p className="inline-flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
                  <MapPin size={12} /> {product.location}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Stock: {product.stock}</p>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    className="inline-flex items-center justify-center gap-1 rounded-lg border border-zinc-300 px-2 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                  >
                    <Heart size={13} /> Wishlist
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center justify-center gap-1 rounded-lg bg-indigo-600 px-2 py-2 text-xs font-semibold text-white hover:bg-indigo-500"
                  >
                    <ShoppingCart size={13} /> Add to Cart
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
};

export default Marketplace;
