import React, { useEffect, useState } from 'react';
import { Heart, Image, MapPin, MessageCircle, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  addCommunityComment,
  createCommunityPost,
  fetchCommunityComments,
  fetchFeedPosts,
  likeCommunityPost,
  unlikeCommunityPost,
} from '../services/feedService';
import { uploadImageFile } from '../services/uploadService';
import { getApiErrorMessage } from '../lib/api';
import { FeedPost } from '../types/marketplace';
import { PRODUCT_CATEGORIES } from '../constants/categories';
import { Link } from 'react-router-dom';
import ProfileAvatar from '../components/ProfileAvatar';

const Community: React.FC = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [formError, setFormError] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [commentSubmitting, setCommentSubmitting] = useState<Record<string, boolean>>({});
  const [commentErrors, setCommentErrors] = useState<Record<string, string>>({});
  const [likeLoading, setLikeLoading] = useState<Record<string, boolean>>({});
  const [form, setForm] = useState({
    postType: 'Seller Update' as 'Seller Update' | 'Buyer Requirement',
    title: '',
    content: '',
    category: '',
    location: '',
    image: '',
  });

  const loadPosts = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchFeedPosts(50);
      setPosts(data);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to load community posts.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const submitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!form.title.trim() || !form.content.trim() || !form.category.trim() || !form.location.trim()) {
      setFormError('Please fill post type, title, content, category, and location.');
      return;
    }

    setSubmitting(true);
    try {
      const created = await createCommunityPost({
        postType: form.postType,
        title: form.title.trim(),
        content: form.content.trim(),
        category: form.category.trim(),
        location: form.location.trim(),
        image: form.image.trim() || undefined,
      });
      setPosts((prev) => [created, ...prev]);
      setForm({
        postType: form.postType,
        title: '',
        content: '',
        category: '',
        location: '',
        image: '',
      });
      setImagePreview('');
    } catch (err) {
      setFormError(getApiErrorMessage(err, 'Unable to create post right now.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFormError('Only image files are allowed.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFormError('Image must be 5MB or smaller.');
      return;
    }

    setFormError('');
    setIsUploadingImage(true);
    try {
      const uploadedUrl = await uploadImageFile(file);
      setForm((prev) => ({ ...prev, image: uploadedUrl }));
      setImagePreview(uploadedUrl);
    } catch (err) {
      setFormError(getApiErrorMessage(err, 'Image upload failed. You can still use an image URL.'));
    } finally {
      setIsUploadingImage(false);
      event.target.value = '';
    }
  };

  const handleCommentSubmit = async (postId: string) => {
    const content = (commentDrafts[postId] || '').trim();
    if (!content) {
      setCommentErrors((prev) => ({ ...prev, [postId]: 'Comment cannot be empty.' }));
      return;
    }

    setCommentErrors((prev) => ({ ...prev, [postId]: '' }));
    setCommentSubmitting((prev) => ({ ...prev, [postId]: true }));

    try {
      await addCommunityComment(postId, content);
      const refreshedComments = await fetchCommunityComments(postId);
      setPosts((prev) =>
        prev.map((post) =>
          post._id === postId ? { ...post, commentItems: refreshedComments, comments: refreshedComments.length } : post
        )
      );
      setCommentDrafts((prev) => ({ ...prev, [postId]: '' }));
    } catch (err) {
      setCommentErrors((prev) => ({
        ...prev,
        [postId]: getApiErrorMessage(err, 'Unable to add comment.'),
      }));
    } finally {
      setCommentSubmitting((prev) => ({ ...prev, [postId]: false }));
    }
  };

  const handleLikeToggle = async (postId: string) => {
    if (!user) {
      setError('Please login to like community posts.');
      return;
    }

    setLikeLoading((prev) => ({ ...prev, [postId]: true }));
    try {
      const targetPost = posts.find((post) => post._id === postId);
      const hasLiked = (targetPost?.likedBy || []).some((id) => id === user._id);
      const updatedPost = hasLiked ? await unlikeCommunityPost(postId) : await likeCommunityPost(postId);
      setPosts((prev) => prev.map((post) => (post._id === postId ? updatedPost : post)));
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to update like status.'));
    } finally {
      setLikeLoading((prev) => ({ ...prev, [postId]: false }));
    }
  };

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Community</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
          Share updates, discover local demand, and connect buyers with sellers.
        </p>
      </div>

      {user ? (
        <form
          onSubmit={submitPost}
          className="mb-6 space-y-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900 sm:p-5"
        >
          <div className="flex items-center gap-3 border-b border-zinc-100 pb-3 dark:border-zinc-800">
            <ProfileAvatar
              profileImage={user.profileImage}
              avatar={user.avatar}
              alt={user.name}
              className="h-11 w-11 flex-shrink-0 rounded-full object-cover ring-1 ring-zinc-200 dark:ring-zinc-600"
            />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Posting as {user.name}</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 capitalize">{user.role}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <select
              value={form.postType}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  postType: e.target.value as 'Seller Update' | 'Buyer Requirement',
                }))
              }
              className="rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            >
              <option>Seller Update</option>
              <option>Buyer Requirement</option>
            </select>
            <input
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Post title"
              className="rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
            />
          </div>

          <textarea
            value={form.content}
            onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))}
            placeholder="Write your update or requirement..."
            rows={4}
            className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
          />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <select
              value={form.category}
              onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
              className="rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            >
              <option value="">Category</option>
              {PRODUCT_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <input
              value={form.location}
              onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))}
              placeholder="Location"
              className="rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
            />
            <div className="relative">
              <Image className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-zinc-400" />
              <input
                value={form.image}
                onChange={(e) => {
                  const nextValue = e.target.value;
                  setForm((prev) => ({ ...prev, image: nextValue }));
                  setImagePreview(nextValue);
                }}
                placeholder="Optional image URL (fallback)"
                className="w-full rounded-xl border border-zinc-300 bg-white py-2.5 pl-9 pr-3 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Upload image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="block w-full text-sm text-zinc-600 file:mr-3 file:rounded-lg file:border-0 file:bg-zinc-900 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white dark:text-zinc-300 dark:file:bg-zinc-100 dark:file:text-zinc-900"
            />
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Only image files up to 5MB are allowed.</p>
          </div>

          {imagePreview ? (
            <img src={imagePreview} alt="Post preview" className="h-40 w-full rounded-xl object-cover sm:h-56" />
          ) : null}

          {formError ? (
            <p className="rounded-xl border border-rose-300 bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:border-rose-500/50 dark:bg-rose-500/10 dark:text-rose-300">
              {formError}
            </p>
          ) : null}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting || isUploadingImage}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Send size={15} />
              {isUploadingImage ? 'Uploading image...' : submitting ? 'Posting...' : 'Create post'}
            </button>
          </div>
        </form>
      ) : (
        <div className="mb-6 rounded-2xl border border-zinc-200 bg-white p-4 text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
          Log in to create community posts. You can still browse all updates below.
        </div>
      )}

      {error ? (
        <div className="mb-4 rounded-2xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/50 dark:bg-rose-500/10 dark:text-rose-300">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="grid grid-cols-1 gap-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-52 animate-pulse rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
          ))}
        </div>
      ) : null}

      {!loading && !error && posts.length === 0 ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-center text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
          No community posts yet. Be the first to share an update.
        </div>
      ) : null}

      {!loading && posts.length > 0 ? (
        <div className="space-y-4">
          {posts.map((post) => {
            const isSellerUpdate = post.postType === 'Seller Update';
            const likedByCurrentUser = Boolean(user && (post.likedBy || []).some((id) => id === user._id));
            return (
              <article
                key={post._id}
                className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900"
              >
                <div className="flex items-start justify-between gap-3">
                  {post.userId ? (
                    <Link to={`/users/${post.userId}`} className="flex items-center gap-3">
                      <ProfileAvatar
                        profileImage={post.authorAvatar}
                        alt={post.authorName}
                        className="h-10 w-10 flex-shrink-0 rounded-full object-cover"
                      />
                      <div>
                        <p className="text-sm font-semibold text-zinc-900 hover:text-indigo-600 dark:text-zinc-100 dark:hover:text-indigo-300">
                          {post.authorName}
                        </p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          {new Date(post.createdAt).toLocaleDateString()} - {post.userRole || 'member'}
                        </p>
                      </div>
                    </Link>
                  ) : (
                    <div className="flex items-center gap-3">
                      <ProfileAvatar
                        profileImage={post.authorAvatar}
                        alt={post.authorName}
                        className="h-10 w-10 flex-shrink-0 rounded-full object-cover"
                      />
                      <div>
                        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{post.authorName}</p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          {new Date(post.createdAt).toLocaleDateString()} - {post.userRole || 'member'}
                        </p>
                      </div>
                    </div>
                  )}
                  {post.postType ? (
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        isSellerUpdate
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300'
                          : 'bg-blue-50 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300'
                      }`}
                    >
                      {post.postType}
                    </span>
                  ) : null}
                </div>

                {post.title ? <h2 className="mt-3 text-base font-semibold text-zinc-900 dark:text-zinc-100">{post.title}</h2> : null}
                <p className="mt-2 text-sm leading-6 text-zinc-700 dark:text-zinc-200">{post.content}</p>

                {post.image ? (
                  <img
                    src={post.image}
                    alt={post.title}
                    className="mt-3 h-48 w-full rounded-xl object-cover sm:h-64"
                    loading="lazy"
                  />
                ) : null}

                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                  {post.category ? <span className="rounded-full bg-zinc-100 px-2.5 py-1 dark:bg-zinc-800">{post.category}</span> : null}
                  {post.location ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2.5 py-1 dark:bg-zinc-800">
                      <MapPin size={12} />
                      {post.location}
                    </span>
                  ) : null}
                </div>

                <div className="mt-3 flex items-center gap-5 text-xs text-zinc-500 dark:text-zinc-400">
                  <button
                    type="button"
                    onClick={() => handleLikeToggle(post._id)}
                    disabled={Boolean(likeLoading[post._id])}
                    className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 transition ${
                      likedByCurrentUser
                        ? 'border-rose-300 text-rose-600 hover:bg-rose-50 dark:border-rose-500/40 dark:text-rose-300 dark:hover:bg-rose-500/10'
                        : 'border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <Heart size={14} /> {likeLoading[post._id] ? 'Updating...' : likedByCurrentUser ? 'Unlike' : 'Like'} ({post.likes})
                  </button>
                  <span className="inline-flex items-center gap-1">
                    <MessageCircle size={14} /> {post.comments} comments
                  </span>
                </div>

                {post.commentItems && post.commentItems.length > 0 ? (
                  <div className="mt-3 space-y-2 rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800/40">
                    {post.commentItems.map((comment) => (
                      <div key={comment._id} className="flex items-start gap-3">
                        <ProfileAvatar
                          profileImage={comment.userAvatar}
                          alt={comment.userName}
                          className="mt-0.5 h-8 w-8 flex-shrink-0 rounded-full object-cover"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-100">{comment.userName}</p>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            {new Date(comment.createdAt).toLocaleString()}
                          </p>
                          <p className="text-xs text-zinc-600 dark:text-zinc-300">
                            {comment.text || (comment as any).content}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}

                {user ? (
                  <div className="mt-3 space-y-2">
                    <div className="flex gap-2">
                      <ProfileAvatar
                        profileImage={user.profileImage}
                        avatar={user.avatar}
                        alt={user.name}
                        className="mt-1 h-8 w-8 flex-shrink-0 rounded-full object-cover sm:h-9 sm:w-9"
                      />
                      <input
                        value={commentDrafts[post._id] || ''}
                        onChange={(e) => setCommentDrafts((prev) => ({ ...prev, [post._id]: e.target.value }))}
                        placeholder="Add a comment..."
                        className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                      />
                      <button
                        type="button"
                        onClick={() => handleCommentSubmit(post._id)}
                        disabled={Boolean(commentSubmitting[post._id])}
                        className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-500 disabled:opacity-60"
                      >
                        {commentSubmitting[post._id] ? 'Sending...' : 'Comment'}
                      </button>
                    </div>
                    {commentErrors[post._id] ? (
                      <p className="text-xs text-rose-600 dark:text-rose-300">{commentErrors[post._id]}</p>
                    ) : null}
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      ) : null}
    </section>
  );
};

export default Community;
