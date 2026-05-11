import { apiClient } from '../lib/api';
import { FeedPost, Product } from '../types/marketplace';

export interface PublicUserProfile {
  user: {
    _id: string;
    name: string;
    role: 'buyer' | 'seller';
    location?: string;
    shopName?: string;
    whatsappNumber?: string;
    profileImage?: string;
    avatar?: string;
  };
  products: Product[];
  recentPosts: FeedPost[];
}

export async function fetchPublicUserProfile(userId: string): Promise<PublicUserProfile> {
  const res = await apiClient.get(`/api/users/${userId}`);
  return res.data?.data;
}
