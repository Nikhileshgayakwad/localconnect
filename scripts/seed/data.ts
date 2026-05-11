export interface SeedProduct {
  title: string;
  description: string;
  price: number;
  image: string;
  location: string;
  category: string;
  likes: number;
  sellerName: string;
}

export interface SeedSeller {
  name: string;
  avatar: string;
  location: string;
  followers: number;
  rating: number;
  specialties: string[];
  verified: boolean;
}

export interface SeedFeedPost {
  authorName: string;
  authorAvatar: string;
  content: string;
  image: string;
  likes: number;
  comments: number;
  tags: string[];
}

export const sellers: SeedSeller[] = [
  {
    name: 'Ananya Crafts Jaipur',
    avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=600&q=80',
    location: 'Jaipur, Rajasthan',
    followers: 3820,
    rating: 4.8,
    specialties: ['Handmade', 'Home Decor'],
    verified: true,
  },
  {
    name: 'Ravi Tech Hub',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
    location: 'Bengaluru, Karnataka',
    followers: 5240,
    rating: 4.7,
    specialties: ['Electronics', 'Accessories'],
    verified: true,
  },
  {
    name: 'Meera Kitchen Studio',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80',
    location: 'Pune, Maharashtra',
    followers: 2910,
    rating: 4.6,
    specialties: ['Kitchen', 'Essentials'],
    verified: false,
  },
  {
    name: 'Delhi Street Styles',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
    location: 'New Delhi',
    followers: 4680,
    rating: 4.5,
    specialties: ['Fashion', 'Footwear'],
    verified: true,
  },
  {
    name: 'Kochi Green Basket',
    avatar: 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=600&q=80',
    location: 'Kochi, Kerala',
    followers: 2150,
    rating: 4.7,
    specialties: ['Organic', 'Local Foods'],
    verified: false,
  },
];

export const products: SeedProduct[] = [
  {
    title: 'Jaipuri Handblock Cotton Bedsheet',
    description: 'Premium king-size bedsheet with traditional Sanganeri handblock print. Soft, breathable and perfect for summer.',
    price: 1299,
    image: 'https://images.unsplash.com/photo-1616627981455-9299f2f0d8f2?auto=format&fit=crop&w=1000&q=80',
    location: 'Jaipur, Rajasthan',
    category: 'Home Decor',
    likes: 214,
    sellerName: 'Ananya Crafts Jaipur',
  },
  {
    title: 'Wireless Neckband Pro 40H',
    description: 'Bluetooth 5.3 neckband with deep bass, ENC calling, and 40-hour battery backup.',
    price: 1899,
    image: 'https://images.unsplash.com/photo-1606741965429-8c8b7bb4ec9c?auto=format&fit=crop&w=1000&q=80',
    location: 'Bengaluru, Karnataka',
    category: 'Electronics',
    likes: 342,
    sellerName: 'Ravi Tech Hub',
  },
  {
    title: 'Stainless Steel Masala Dabba Set',
    description: '7-container masala box with transparent lid and spoon set. Food-grade steel, rust-proof finish.',
    price: 799,
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=1000&q=80',
    location: 'Pune, Maharashtra',
    category: 'Kitchen',
    likes: 176,
    sellerName: 'Meera Kitchen Studio',
  },
  {
    title: 'Women Cotton Kurti Combo (Pack of 2)',
    description: 'Everyday wear straight-fit kurtis in soft cotton fabric. Sizes S to XXL available.',
    price: 999,
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80',
    location: 'New Delhi',
    category: 'Fashion',
    likes: 401,
    sellerName: 'Delhi Street Styles',
  },
  {
    title: 'Organic Kerala Banana Chips 500g',
    description: 'Coconut-oil fried banana chips made in small batches with authentic Kerala spices.',
    price: 349,
    image: 'https://images.unsplash.com/photo-1585238342024-78d387f4a707?auto=format&fit=crop&w=1000&q=80',
    location: 'Kochi, Kerala',
    category: 'Local Foods',
    likes: 189,
    sellerName: 'Kochi Green Basket',
  },
  {
    title: 'Handmade Blue Pottery Serving Bowl',
    description: 'Jaipur blue pottery handcrafted bowl for serving snacks and desserts. Lead-free glaze.',
    price: 699,
    image: 'https://images.unsplash.com/photo-1523419409543-04f4f6ad4e6d?auto=format&fit=crop&w=1000&q=80',
    location: 'Jaipur, Rajasthan',
    category: 'Home Decor',
    likes: 132,
    sellerName: 'Ananya Crafts Jaipur',
  },
  {
    title: 'Fast Charge 20000mAh Power Bank',
    description: '22.5W fast charging power bank with USB-C and dual USB outputs. Ideal for travel.',
    price: 1499,
    image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=1000&q=80',
    location: 'Bengaluru, Karnataka',
    category: 'Electronics',
    likes: 267,
    sellerName: 'Ravi Tech Hub',
  },
  {
    title: 'Non-Stick Appam Pan 12 Cavity',
    description: 'Heavy-gauge induction-friendly appam pan for paniyaram and mini snacks.',
    price: 899,
    image: 'https://images.unsplash.com/photo-1514511547117-f5f3f3e73e3e?auto=format&fit=crop&w=1000&q=80',
    location: 'Pune, Maharashtra',
    category: 'Kitchen',
    likes: 158,
    sellerName: 'Meera Kitchen Studio',
  },
  {
    title: 'Men Casual Sneakers White/Grey',
    description: 'Lightweight lace-up sneakers with cushioned sole for daily wear and college use.',
    price: 1199,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=80',
    location: 'New Delhi',
    category: 'Footwear',
    likes: 309,
    sellerName: 'Delhi Street Styles',
  },
  {
    title: 'Cold Pressed Coconut Oil 1L',
    description: 'Wood-pressed pure coconut oil from Kerala farms. Great for cooking and hair care.',
    price: 499,
    image: 'https://images.unsplash.com/photo-1620921578853-4ef3e4c64099?auto=format&fit=crop&w=1000&q=80',
    location: 'Kochi, Kerala',
    category: 'Organic',
    likes: 141,
    sellerName: 'Kochi Green Basket',
  },
];

export const feedPosts: SeedFeedPost[] = [
  {
    authorName: 'Ananya Crafts Jaipur',
    authorAvatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=600&q=80',
    content: 'Just uploaded new handblock bedsheets in indigo and maroon. Jaipur delivery in 24 hours, PAN India shipping available.',
    image: 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?auto=format&fit=crop&w=1000&q=80',
    likes: 184,
    comments: 27,
    tags: ['#Jaipur', '#Handmade', '#HomeDecor'],
  },
  {
    authorName: 'Ravi Tech Hub',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
    content: 'Weekend tech deal: neckband + power bank combo at special local seller price. DM for bulk office orders.',
    image: 'https://images.unsplash.com/photo-1517336714739-489689fd1ca8?auto=format&fit=crop&w=1000&q=80',
    likes: 231,
    comments: 33,
    tags: ['#Electronics', '#Bengaluru', '#Deals'],
  },
  {
    authorName: 'Meera Kitchen Studio',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80',
    content: 'Our appam pan is back in stock. Sharing a quick recipe reel tonight for crispy paniyaram.',
    image: 'https://images.unsplash.com/photo-1516684732162-798a0062be99?auto=format&fit=crop&w=1000&q=80',
    likes: 153,
    comments: 19,
    tags: ['#KitchenEssentials', '#Pune', '#HomeChef'],
  },
  {
    authorName: 'Delhi Street Styles',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
    content: 'Fresh kurti arrivals for office wear under Rs 1000. Try-and-buy available in selected Delhi areas.',
    image: 'https://images.unsplash.com/photo-1583744946564-b52d01a7b321?auto=format&fit=crop&w=1000&q=80',
    likes: 268,
    comments: 41,
    tags: ['#DelhiFashion', '#Kurti', '#AffordableStyle'],
  },
  {
    authorName: 'Kochi Green Basket',
    authorAvatar: 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=600&q=80',
    content: 'Today’s farm pickup includes fresh banana, spices and coconut oil. Limited slots for same-day dispatch.',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1000&q=80',
    likes: 139,
    comments: 18,
    tags: ['#Organic', '#Kochi', '#LocalFoods'],
  },
  {
    authorName: 'Ananya Crafts Jaipur',
    authorAvatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=600&q=80',
    content: 'Customer home setup using our blue pottery bowl set. Thank you for supporting local artisans!',
    image: 'https://images.unsplash.com/photo-1578070181910-f1e514afdd08?auto=format&fit=crop&w=1000&q=80',
    likes: 121,
    comments: 14,
    tags: ['#BluePottery', '#SupportLocal', '#JaipurArt'],
  },
  {
    authorName: 'Ravi Tech Hub',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
    content: 'Customers asked for budget earbuds and we listened. New collection goes live tomorrow morning.',
    image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1000&q=80',
    likes: 197,
    comments: 25,
    tags: ['#TechDrop', '#Marketplace', '#AudioGear'],
  },
  {
    authorName: 'Meera Kitchen Studio',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80',
    content: 'Sharing top 5 monsoon kitchen must-haves this week. Which one should we discount first?',
    image: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=1000&q=80',
    likes: 112,
    comments: 29,
    tags: ['#KitchenTips', '#Monsoon', '#LocalSeller'],
  },
];
