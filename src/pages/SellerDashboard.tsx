import React, { useMemo, useState } from 'react';
import { BarChart3, Loader2, MapPin, Pencil, Plus, Trash2 } from 'lucide-react';
import { getApiErrorMessage } from '../lib/api';
import {
  createMyProduct,
  deleteMyProduct,
  fetchMyProducts,
  ProductPayload,
  updateMyProduct,
} from '../services/sellerProductService';
import { uploadImageFile } from '../services/uploadService';
import { Product } from '../types/marketplace';
import { PRODUCT_CATEGORIES } from '../constants/categories';

const defaultForm: ProductPayload = {
  title: '',
  description: '',
  category: '',
  price: 0,
  stock: 0,
  image: '',
  location: '',
};

export default function SellerDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductPayload>(defaultForm);
  const [imagePreview, setImagePreview] = useState('');
  const selectableCategories = useMemo(() => {
    const categoryList = PRODUCT_CATEGORIES as readonly string[];
    if (form.category && !categoryList.includes(form.category)) {
      return [form.category, ...PRODUCT_CATEGORIES];
    }
    return [...PRODUCT_CATEGORIES];
  }, [form.category]);

  React.useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await fetchMyProducts();
        setProducts(data);
      } catch (err) {
        setError(getApiErrorMessage(err, 'Unable to load seller products.'));
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const analytics = useMemo(() => {
    return products.reduce(
      (acc, product) => {
        acc.totalProducts += 1;
        acc.totalLikes += product.likes || 0;
        acc.totalViews += product.views || 0;
        return acc;
      },
      { totalProducts: 0, totalLikes: 0, totalViews: 0 }
    );
  }, [products]);

  const handleChange =
    (field: keyof ProductPayload) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const value = event.target.value;
      if (field === 'price' || field === 'stock') {
        setForm((prev) => ({ ...prev, [field]: Number(value) }));
        return;
      }

      setForm((prev) => ({ ...prev, [field]: value }));
    };

  const resetForm = () => {
    setForm(defaultForm);
    setImagePreview('');
    setEditingId(null);
    setSubmitError('');
  };

  const handleEdit = (product: Product) => {
    setEditingId(product._id);
    setSubmitError('');
    setForm({
      title: product.title,
      description: product.description,
      category: product.category,
      price: product.price,
      stock: product.stock || 0,
      image: product.image,
      location: product.location,
    });
    setImagePreview(product.image);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setSubmitError('Only image files are allowed.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setSubmitError('Image must be 5MB or smaller.');
      return;
    }

    setSubmitError('');
    setIsUploadingImage(true);
    try {
      const uploadedUrl = await uploadImageFile(file);
      setForm((prev) => ({ ...prev, image: uploadedUrl }));
      setImagePreview(uploadedUrl);
    } catch (err) {
      setSubmitError(getApiErrorMessage(err, 'Image upload failed. You can still use image URL.'));
    } finally {
      setIsUploadingImage(false);
      event.target.value = '';
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitError('');
    setIsSubmitting(true);

    try {
      if (editingId) {
        const updated = await updateMyProduct(editingId, form);
        setProducts((prev) => prev.map((item) => (item._id === editingId ? updated : item)));
      } else {
        const created = await createMyProduct(form);
        setProducts((prev) => [created, ...prev]);
      }

      resetForm();
    } catch (err) {
      setSubmitError(getApiErrorMessage(err, 'Failed to save product.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    const shouldDelete = window.confirm('Delete this product? This action cannot be undone.');
    if (!shouldDelete) return;

    try {
      await deleteMyProduct(id);
      setProducts((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to delete product.'));
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-6 dark:bg-zinc-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-3xl">
            Seller Dashboard
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Manage listings, monitor engagement, and keep your storefront fresh.
          </p>
        </header>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Total products</p>
            <p className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">{analytics.totalProducts}</p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Total likes</p>
            <p className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">{analytics.totalLikes}</p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Total views</p>
            <p className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">{analytics.totalViews}</p>
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900 sm:p-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            <Plus size={18} /> {editingId ? 'Edit product' : 'Add product'}
          </h2>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <input
              value={form.title}
              onChange={handleChange('title')}
              placeholder="Product title"
              required
              className="rounded-xl border border-zinc-300 bg-white p-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
            />
            <select
              value={form.category}
              onChange={handleChange('category')}
              required
              className="rounded-xl border border-zinc-300 bg-white p-2.5 text-sm text-zinc-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            >
              <option value="" disabled>
                Select category
              </option>
              {selectableCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <input
              value={form.price || ''}
              onChange={handleChange('price')}
              type="number"
              min="0"
              step="0.01"
              placeholder="Price"
              required
              className="rounded-xl border border-zinc-300 bg-white p-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
            />
            <input
              value={form.stock || ''}
              onChange={handleChange('stock')}
              type="number"
              min="0"
              placeholder="Stock"
              required
              className="rounded-xl border border-zinc-300 bg-white p-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
            />
            <input
              value={form.image}
              onChange={(event) => {
                handleChange('image')(event);
                setImagePreview(event.target.value);
              }}
              placeholder="Image URL (fallback)"
              className="sm:col-span-2 rounded-xl border border-zinc-300 bg-white p-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
            />
            <div className="sm:col-span-2 space-y-2">
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
              <img src={imagePreview} alt="Product preview" className="sm:col-span-2 h-44 w-full rounded-xl object-cover" />
            ) : null}
            <input
              value={form.location}
              onChange={handleChange('location')}
              placeholder="Location"
              required
              className="sm:col-span-2 rounded-xl border border-zinc-300 bg-white p-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
            />
            <textarea
              value={form.description}
              onChange={handleChange('description')}
              placeholder="Description"
              rows={4}
              required
              className="sm:col-span-2 rounded-xl border border-zinc-300 bg-white p-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
            />

            {submitError ? (
              <p className="sm:col-span-2 rounded-xl border border-rose-300 bg-rose-50 p-2 text-sm text-rose-700 dark:border-rose-400/40 dark:bg-rose-500/10 dark:text-rose-300">
                {submitError}
              </p>
            ) : null}

            <div className="sm:col-span-2 flex flex-wrap gap-2">
              <button
                type="submit"
                disabled={isSubmitting || isUploadingImage}
                className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-700 disabled:opacity-70 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
              >
                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                {isUploadingImage ? 'Uploading image...' : editingId ? 'Update product' : 'Add product'}
              </button>
              {editingId ? (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-xl border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                  Cancel edit
                </button>
              ) : null}
            </div>
          </form>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Your uploaded products</h2>

          {error ? (
            <p className="rounded-xl border border-rose-300 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-400/40 dark:bg-rose-500/10 dark:text-rose-300">
              {error}
            </p>
          ) : null}

          {loading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-56 animate-pulse rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
              No products yet. Add your first listing to start selling.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <article
                  key={product._id}
                  className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900"
                >
                  <img src={product.image} alt={product.title} className="h-36 w-full rounded-xl object-cover" />
                  <h3 className="mt-3 line-clamp-1 font-semibold text-zinc-900 dark:text-zinc-100">{product.title}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-300">{product.description}</p>
                  <div className="mt-3 grid grid-cols-2 gap-y-2 text-xs text-zinc-500 dark:text-zinc-400">
                    <p>Category: {product.category}</p>
                    <p>Stock: {product.stock}</p>
                    <p>Likes: {product.likes}</p>
                    <p>Views: {product.views || 0}</p>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Rs {product.price}</p>
                    <p className="inline-flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
                      <MapPin size={12} /> {product.location}
                    </p>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(product)}
                      className="inline-flex items-center gap-1 rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                    >
                      <Pencil size={12} /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product._id)}
                      className="inline-flex items-center gap-1 rounded-lg border border-rose-300 px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:border-rose-500/40 dark:text-rose-300 dark:hover:bg-rose-500/10"
                    >
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <footer className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
          <BarChart3 size={14} /> Analytics are calculated from your live product data.
        </footer>
      </div>
    </div>
  );
}
