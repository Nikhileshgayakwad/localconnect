import { NearbySeller, Seller } from '../types/marketplace';
import { apiClient } from '../lib/api';

export async function fetchNearbySellers(params: { lat?: number; lng?: number } = {}): Promise<NearbySeller[]> {
  const res = await apiClient.get('/api/sellers/nearby', {
    params: {
      lat: params.lat,
      lng: params.lng,
    },
  });
  return res.data?.data ?? [];
}

export async function fetchSellers(limit = 6): Promise<Seller[]> {
  const res = await apiClient.get('/api/sellers', { params: { limit } });
  return res.data?.data ?? [];
}

export async function fetchSellerProfile(name: string): Promise<Seller> {
  const res = await apiClient.get(`/api/sellers/profile/${encodeURIComponent(name)}`);
  return res.data?.data;
}
