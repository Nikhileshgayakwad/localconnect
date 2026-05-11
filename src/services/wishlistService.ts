import { apiClient } from '../lib/api';
import { WishlistItem } from '../types/marketplace';

export async function fetchWishlist(): Promise<WishlistItem[]> {
  const res = await apiClient.get('/api/wishlist');
  return res.data?.data ?? [];
}

export async function addToWishlist(productId: string): Promise<WishlistItem> {
  const res = await apiClient.post(`/api/wishlist/${productId}`);
  return res.data?.data;
}

export async function removeFromWishlist(productId: string): Promise<void> {
  await apiClient.delete(`/api/wishlist/${productId}`);
}
