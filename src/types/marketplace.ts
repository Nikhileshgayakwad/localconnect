export interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  stock: number;
  image: string;
  location: string;
  category: string;
  likes: number;
  views: number;
  sellerName: string;
  owner?: {
    _id: string;
    name?: string;
    shopName?: string;
    whatsappNumber?: string;
    location?: string;
    profileImage?: string;
    avatar?: string;
  };
  createdAt: string;
}

export interface Seller {
  _id: string;
  name: string;
  shopName?: string;
  whatsappNumber?: string;
  profileImage?: string;
  avatar: string;
  location: string;
  followers: number;
  rating: number;
  specialties: string[];
  verified: boolean;
}

export interface FeedComment {
  _id: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: string;
}

export interface FeedPost {
  _id: string;
  userId?: string;
  userRole?: string;
  postType?: 'Seller Update' | 'Buyer Requirement';
  title?: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  category?: string;
  location?: string;
  image: string;
  likes: number;
  likedBy?: string[];
  comments: number;
  commentItems?: FeedComment[];
  tags: string[];
  createdAt: string;
}

export interface CartItem {
  _id: string;
  product: Product;
  quantity: number;
  createdAt: string;
}

export interface WishlistItem {
  _id: string;
  product: Product;
  createdAt: string;
}
