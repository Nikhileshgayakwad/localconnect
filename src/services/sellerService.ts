import { Seller } from '../types/marketplace';
import { apiClient } from '../lib/api';

export async function fetchSellers(limit = 6): Promise<Seller[]> {
  const res = await apiClient.get('/api/sellers', { params: { limit } });
  return res.data?.data ?? [];
}

export async function fetchSellerProfile(name: string): Promise<Seller> {
  const res = await apiClient.get(`/api/sellers/profile/${encodeURIComponent(name)}`);
  return res.data?.data;
}
