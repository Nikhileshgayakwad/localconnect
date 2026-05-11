import { apiClient } from '../lib/api';

export async function uploadImageFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('image', file);

  const res = await apiClient.post('/api/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return res.data?.data?.imageUrl;
}
