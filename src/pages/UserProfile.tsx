import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { MapPin, MessageCircle, Phone } from 'lucide-react';
import { fetchPublicUserProfile, PublicUserProfile } from '../services/userService';
import { getApiErrorMessage } from '../lib/api';
import ProfileAvatar from '../components/ProfileAvatar';

const UserProfile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const [profile, setProfile] = useState<PublicUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      if (!userId) return;
      setLoading(true);
      setError('');
      try {
        const data = await fetchPublicUserProfile(userId);
        setProfile(data);
      } catch (err) {
        setError(getApiErrorMessage(err, 'Unable to load user profile.'));
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [userId]);

  if (loading) {
    return (
      <section className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="h-64 animate-pulse rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
      </section>
    );
  }

  if (error || !profile) {
    return (
      <section className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/50 dark:bg-rose-500/10 dark:text-rose-300">
          {error || 'User profile not found.'}
        </div>
      </section>
    );
  }

  const { user, products, recentPosts } = profile;
  const whatsapp = (user.whatsappNumber || '').replace(/[^\d]/g, '');

  return (
    <section className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
        <div className="flex items-center gap-4">
          <ProfileAvatar
            profileImage={user.profileImage}
            avatar={user.avatar}
            alt={user.name}
            className="h-16 w-16 flex-shrink-0 rounded-full border border-zinc-200 object-cover dark:border-zinc-700 sm:h-20 sm:w-20"
          />
          <div>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{user.name}</h1>
            <p className="text-sm capitalize text-zinc-600 dark:text-zinc-300">{user.role}</p>
            {user.location ? (
              <p className="inline-flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
                <MapPin size={12} /> {user.location}
              </p>
            ) : null}
          </div>
        </div>

        {user.role === 'seller' && user.shopName ? (
          <p className="mt-3 text-sm font-medium text-zinc-700 dark:text-zinc-200">Shop: {user.shopName}</p>
        ) : null}

        {whatsapp ? (
          <a
            href={`https://wa.me/${whatsapp}`}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
          >
            <Phone size={14} /> Contact on WhatsApp
          </a>
        ) : null}
      </div>

      {user.role === 'seller' ? (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Seller products</h2>
          {products.length === 0 ? (
            <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
              No products uploaded yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <Link
                  key={product._id}
                  to={`/products/${product._id}`}
                  className="rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm dark:border-zinc-700 dark:bg-zinc-900"
                >
                  <img src={product.image} alt={product.title} className="h-32 w-full rounded-xl object-cover" />
                  <p className="mt-2 line-clamp-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100">{product.title}</p>
                  <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Rs {product.price.toLocaleString()}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      ) : null}

      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Recent community posts</h2>
        {recentPosts.length === 0 ? (
          <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
            No community posts yet.
          </div>
        ) : (
          <div className="space-y-3">
            {recentPosts.map((post) => (
              <article
                key={post._id}
                className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900"
              >
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{post.title || 'Community post'}</h3>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">{post.content}</p>
                <p className="mt-2 inline-flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
                  <MessageCircle size={12} /> {post.comments} comments
                </p>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default UserProfile;
