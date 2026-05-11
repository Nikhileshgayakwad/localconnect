import { apiClient } from '../lib/api';
import { Product } from '../types/marketplace';

export interface ProductPayload {
  title: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  image: string;
  location: string;
}

export async function fetchMyProducts(): Promise<Product[]> {
  const res = await apiClient.get('/api/products/mine');
  return res.data?.data ?? [];
}

export async function createMyProduct(payload: ProductPayload): Promise<Product> {
  const res = await apiClient.post('/api/products', payload);
  return res.data?.data;
}

export async function updateMyProduct(id: string, payload: ProductPayload): Promise<Product> {
  const res = await apiClient.put(`/api/products/${id}`, payload);
  return res.data?.data;
}

export async function deleteMyProduct(id: string): Promise<void> {
  await apiClient.delete(`/api/products/${id}`);
}
