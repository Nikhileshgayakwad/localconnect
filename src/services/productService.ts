import { Product } from '../types/marketplace';
import { apiClient } from '../lib/api';

export interface ProductFilters {
  search?: string;
  category?: string | string[];
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  limit?: number;
  /** Filter by seller user id (Mongo ObjectId string) */
  seller?: string;
}

export async function fetchProducts(filters: ProductFilters = {}): Promise<Product[]> {
  const res = await apiClient.get('/api/products', {
    params: {
      limit: filters.limit ?? 12,
      search: filters.search || undefined,
      category: Array.isArray(filters.category)
        ? filters.category.length > 0
          ? filters.category.join(',')
          : undefined
        : filters.category || undefined,
      location: filters.location || undefined,
      minPrice: filters.minPrice ?? undefined,
      maxPrice: filters.maxPrice ?? undefined,
      seller: filters.seller?.trim() || undefined,
    },
  });
  return res.data?.data ?? [];
}

export async function fetchProductById(id: string): Promise<Product> {
  const res = await apiClient.get(`/api/products/${id}`);
  return res.data?.data;
}
