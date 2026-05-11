import { FeedComment, FeedPost } from '../types/marketplace';
import { apiClient } from '../lib/api';

export interface CommunityPostInput {
  postType: 'Seller Update' | 'Buyer Requirement';
  title: string;
  content: string;
  category: string;
  location: string;
  image?: string;
}

export async function fetchFeedPosts(limit = 5): Promise<FeedPost[]> {
  const res = await apiClient.get('/api/feed', { params: { limit } });
  return res.data?.data ?? [];
}

export async function createCommunityPost(payload: CommunityPostInput): Promise<FeedPost> {
  const res = await apiClient.post('/api/feed', payload);
  return res.data?.data;
}

export async function addCommunityComment(postId: string, content: string): Promise<FeedPost> {
  const res = await apiClient.post(`/api/feed/${postId}/comments`, { text: content });
  return res.data?.data;
}

export async function likeCommunityPost(postId: string): Promise<FeedPost> {
  const res = await apiClient.post(`/api/feed/${postId}/like`);
  return res.data?.data;
}

export async function unlikeCommunityPost(postId: string): Promise<FeedPost> {
  const res = await apiClient.delete(`/api/feed/${postId}/like`);
  return res.data?.data;
}

export async function fetchCommunityComments(postId: string): Promise<FeedComment[]> {
  const res = await apiClient.get(`/api/feed/${postId}/comments`);
  return res.data?.data ?? [];
}
