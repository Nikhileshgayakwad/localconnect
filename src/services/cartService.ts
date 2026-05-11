import { apiClient } from '../lib/api';
import { CartItem } from '../types/marketplace';

export async function fetchCart(): Promise<CartItem[]> {
  const res = await apiClient.get('/api/cart');
  return res.data?.data ?? [];
}

export async function addToCart(productId: string): Promise<CartItem> {
  const res = await apiClient.post(`/api/cart/${productId}`);
  return res.data?.data;
}

export async function removeFromCart(productId: string): Promise<void> {
  await apiClient.delete(`/api/cart/${productId}`);
}
