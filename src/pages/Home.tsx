import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { PackageSearch, Search, Store, Users } from 'lucide-react';
import HeroSection from '../components/home/HeroSection';
import ProductCard from '../components/home/ProductCard';
import SellerCard from '../components/home/SellerCard';
import FeedPreviewCard from '../components/home/FeedPreviewCard';
import { Product, Seller, FeedPost } from '../types/marketplace';
import { fetchProducts } from '../services/productService';
import { fetchSellers } from '../services/sellerService';
import { fetchFeedPosts } from '../services/feedService';

const Home: React.FC = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [feedPosts, setFeedPosts] = useState<FeedPost[]>([]);
  const [loadingSidebar, setLoadingSidebar] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [sidebarError, setSidebarError] = useState('');
  const [productsError, setProductsError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [location, setLocation] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const categoryOptions = ['Vegetables', 'Fruits', 'Dairy', 'Bakery', 'Handmade', 'Other'];

  useEffect(() => {
    const loadSidebarData = async () => {
      setLoadingSidebar(true);
      setSidebarError('');

      try {
        const [sellerData, feedData] = await Promise.all([fetchSellers(6), fetchFeedPosts(4)]);
        setSellers(sellerData);
        setFeedPosts(feedData);
      } catch {
        setSidebarError('Unable to load seller and feed previews right now.');
      } finally {
        setLoadingSidebar(false);
      }
    };

    loadSidebarData();
  }, []);

  useEffect(() => {
    const loadProducts = async () => {
      setLoadingProducts(true);
      setProductsError('');
      try {
        const productData = await fetchProducts({
          limit: 24,
          search: searchTerm.trim() || undefined,
          category: selectedCategories.length ? selectedCategories : undefined,
          location: location.trim() || undefined,
          minPrice: minPrice ? Number(minPrice) : undefined,
          maxPrice: maxPrice ? Number(maxPrice) : undefined,
        });
        setProducts(productData);
      } catch {
        setProductsError('Unable to load products. Please try changing your filters.');
      } finally {
        setLoadingProducts(false);
      }
    };

    loadProducts();
  }, [searchTerm, selectedCategories, location, minPrice, maxPrice]);

  const showEmptyState =
    !loadingProducts &&
    !loadingSidebar &&
    !productsError &&
    !sidebarError &&
    products.length === 0 &&
    sellers.length === 0 &&
    feedPosts.length === 0;

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((item) => item !== category) : [...prev, category]
    );
  };

  return (
    <div className="min-h-screen bg-zinc-50 pb-10 dark:bg-zinc-950">
      <HeroSection isLoggedIn={Boolean(user)} />

      <section className="mt-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-8">
          {productsError ? (
            <div className="rounded-2xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/50 dark:bg-rose-500/10 dark:text-rose-300">
              {productsError}
            </div>
          ) : null}

          {sidebarError ? (
            <div className="rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-500/50 dark:bg-amber-500/10 dark:text-amber-300">
              {sidebarError}
            </div>
          ) : null}

          {loadingProducts ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-64 animate-pulse rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
              ))}
            </div>
          ) : null}

          {showEmptyState ? (
            <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center dark:border-zinc-700 dark:bg-zinc-900">
              <p className="text-sm text-zinc-600 dark:text-zinc-300">
                Marketplace data is ready but currently empty. Add products, sellers, and feed posts to see previews here.
              </p>
            </div>
          ) : null}

          <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
            <div className="space-y-4">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search products..."
                  className="w-full rounded-xl border border-zinc-300 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-900"
                />
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Categories</p>
                <div className="flex flex-wrap gap-2">
                  {categoryOptions.map((category) => {
                    const isActive = selectedCategories.includes(category);
                    return (
                      <button
                        key={category}
                        type="button"
                        onClick={() => toggleCategory(category)}
                        className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                          isActive
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:border-indigo-400 dark:bg-indigo-500/20 dark:text-indigo-300'
                            : 'border-zinc-300 text-zinc-600 hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-zinc-500'
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
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  type="number"
                  min="0"
                  placeholder="Min price"
                  className="rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-900"
                />
                <input
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  type="number"
                  min="0"
                  placeholder="Max price"
                  className="rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-900"
                />
              </div>
            </div>
          </div>

          {!loadingProducts && products.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Trending products</h2>
                <span className="inline-flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
                  <PackageSearch size={14} /> Updated live
                </span>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            </div>
          ) : null}

          {!loadingSidebar && sellers.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Popular sellers</h2>
                <span className="inline-flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
                  <Store size={14} /> Top rated
                </span>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {sellers.map((seller) => (
                  <SellerCard key={seller._id} seller={seller} />
                ))}
              </div>
            </div>
          ) : null}

          {!loadingSidebar && feedPosts.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Community feed</h2>
                <span className="inline-flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
                  <Users size={14} /> Local stories
                </span>
              </div>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {feedPosts.map((post) => (
                  <FeedPreviewCard key={post._id} post={post} />
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
};

export default Home;
