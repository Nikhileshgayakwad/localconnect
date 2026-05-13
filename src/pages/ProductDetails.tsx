import React, { useEffect, useState } from 'react';
import { Heart, MapPin, MessageCircle, ShoppingCart, Store } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { fetchProductById } from '../services/productService';
import { Product, Seller } from '../types/marketplace';
import { getApiErrorMessage } from '../lib/api';
import { fetchSellerProfile } from '../services/sellerService';
import { useAuth } from '../context/AuthContext';
import { addToCart } from '../services/cartService';
import { addToWishlist } from '../services/wishlistService';
import { buildProductPageUrl, buildWaMeUrl, sanitizeWhatsAppDigits } from '../lib/whatsapp';
import ProfileAvatar from '../components/ProfileAvatar';

const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [seller, setSeller] = useState<Seller | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [cartLoading, setCartLoading] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  useEffect(() => {
    const loadProduct = async () => {
      if (!id) {
        setError('Product id is missing.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');

      try {
        const data = await fetchProductById(id);
        setProduct(data);
        if (data.owner?._id) {
          setSeller({
            _id: data.owner?._id || '',
            name: data.owner?.name || data.sellerName,
            shopName: data.owner?.shopName || data.owner?.name || data.sellerName,
            whatsappNumber: data.owner?.whatsappNumber || '',
            profileImage: data.owner?.profileImage || data.owner?.avatar || '',
            avatar: data.owner?.avatar || '',
            location: data.owner?.location || data.location,
            followers: 0,
            rating: 0,
            specialties: [],
            verified: false,
          });
        } else {
          try {
            const sellerData = await fetchSellerProfile(data.sellerName);
            setSeller(sellerData);
          } catch {
            setSeller(null);
          }
        }
      } catch (err) {
        setError(getApiErrorMessage(err, 'Unable to load this product right now.'));
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  const whatsappDigits = sanitizeWhatsAppDigits(seller?.whatsappNumber || '');
  const productPageUrl = product ? buildProductPageUrl(product._id) : '';
  const whatsappMessage = product
    ? [
        'Hello!',
        `I am interested in your product: ${product.title}`,
        `Price: Rs ${product.price.toLocaleString()}`,
        `Category: ${product.category}`,
        `Location: ${product.location}`,
        `Seller/Shop: ${seller?.shopName || seller?.name || product.sellerName}`,
        `Product Link: ${productPageUrl}`,
        'Is this product available?',
      ].join('\n')
    : '';
  const whatsappUrl = buildWaMeUrl(whatsappDigits, whatsappMessage) || '';
  const isOwner = Boolean(user && product?.owner?._id && user._id === product.owner._id);

  const handleAddToCart = async () => {
    if (!user || !product?._id) {
      setActionMessage('Please login to add items to cart.');
      return;
    }
    setActionMessage('');
    setCartLoading(true);
    try {
      await addToCart(product._id);
      setActionMessage('Added to cart.');
    } catch (err) {
      setActionMessage(getApiErrorMessage(err, 'Unable to add to cart.'));
    } finally {
      setCartLoading(false);
    }
  };

  const handleAddToWishlist = async () => {
    if (!user || !product?._id) {
      setActionMessage('Please login to save wishlist items.');
      return;
    }
    setActionMessage('');
    setWishlistLoading(true);
    try {
      await addToWishlist(product._id);
      setActionMessage('Added to wishlist.');
    } catch (err) {
      setActionMessage(getApiErrorMessage(err, 'Unable to add to wishlist.'));
    } finally {
      setWishlistLoading(false);
    }
  };

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="h-72 animate-pulse rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
          <div className="space-y-3">
            <div className="h-7 w-2/3 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-5 w-1/3 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-24 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
          </div>
        </div>
      ) : null}

      {!loading && error ? (
        <div className="rounded-2xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/50 dark:bg-rose-500/10 dark:text-rose-300">
          {error}
        </div>
      ) : null}

      {!loading && !error && !product ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
          Product was not found.
        </div>
      ) : null}

      {!loading && !error && product ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900">
            <img src={product.image} alt={product.title} className="h-full max-h-[420px] w-full object-cover" />
          </div>

          <div className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900 sm:p-6">
            <div className="space-y-2">
              <span className="inline-flex rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300">
                {product.category}
              </span>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{product.title}</h1>
              <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Rs {product.price.toLocaleString()}</p>
            </div>

            <div className="space-y-2 text-sm text-zinc-600 dark:text-zinc-300">
              <p className="inline-flex items-center gap-2">
                <Store size={16} />
                {product.sellerName}
              </p>
              <p className="inline-flex items-center gap-2">
                <MapPin size={16} />
                {product.location}
              </p>
              <p>Stock available: {product.stock}</p>
            </div>

            <div>
              <h2 className="mb-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100">Description</h2>
              <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-300">{product.description}</p>
            </div>

            {seller ? (
              <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-800/40">
                <div className="flex items-center gap-3">
                  <ProfileAvatar
                    profileImage={seller.profileImage}
                    avatar={seller.avatar}
                    alt={seller.shopName || seller.name}
                    className="h-12 w-12 flex-shrink-0 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{seller.shopName || seller.name}</p>
                    <p className="text-xs text-zinc-600 dark:text-zinc-300">{seller.location}</p>
                  </div>
                </div>
                {whatsappUrl ? (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
                  >
                    <MessageCircle size={15} />
                    Contact Seller on WhatsApp
                  </a>
                ) : (
                  <div className="mt-3 space-y-2">
                    <p className="text-xs text-zinc-600 dark:text-zinc-300">Seller has not added WhatsApp number</p>
                    {isOwner ? (
                      <Link
                        to="/dashboard"
                        className="inline-flex w-full items-center justify-center rounded-lg border border-zinc-300 px-3 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                      >
                        Edit profile
                      </Link>
                    ) : null}
                  </div>
                )}
              </div>
            ) : null}

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={handleAddToWishlist}
                disabled={wishlistLoading}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                <Heart size={16} />
                {wishlistLoading ? 'Saving...' : 'Add to wishlist'}
              </button>
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={cartLoading}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500"
              >
                <ShoppingCart size={16} />
                {cartLoading ? 'Adding...' : 'Add to cart'}
              </button>
            </div>
            {actionMessage ? <p className="text-xs text-zinc-600 dark:text-zinc-300">{actionMessage}</p> : null}
          </div>
        </div>
      ) : null}

      <div className="mt-6">
        <Link to="/" className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-300">
          Back to marketplace
        </Link>
      </div>
    </section>
  );
};

export default ProductDetails;
