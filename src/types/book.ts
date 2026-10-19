export type BookCategory = 
  | 'Fiction'
  | 'Non-Fiction & Tech'
  | 'Academic & Professional'
  | 'Wellness & Personal Growth';

export type BookFormat = 'eBook' | 'Audiobook';

export interface Chapter {
  chapterNumber: number;
  title: string;
  previewExcerpt: string;
}

export interface Review {
  reviewId: string;
  bookId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  title?: string;
  comment: string;
  verifiedPurchase?: boolean;
  helpfulCount?: number;
  createdAt: string;
}

export interface Book {
  id: string;
  title: string;
  subtitle?: string;
  author: string;
  authorBio: string;
  authorAvatar?: string;
  coverUrl: string;
  heroBannerUrl?: string;
  description: string;
  category: BookCategory;
  subcategory: string;
  priceKes: number;
  originalPriceKes?: number;
  discountPercent?: number;
  rating: number;
  reviewsCount: number;
  formats: BookFormat[];
  pages: number;
  readTime: string;
  publisher: string;
  publishedYear: number;
  language: string;
  isbn: string;
  tableOfContents: Chapter[];
  sampleExcerpt: string;
  audioSampleDuration?: string;
  badge?: 'Midusa Choice' | 'Trending #1' | 'Top 10' | 'Best Seller' | '50% OFF' | 'Hot Deal';
  tags: string[];
  featured?: boolean;
  rank?: number; // Netflix Top 10 index (1 to 10)
}

export interface CartItem {
  bookId: string;
  title: string;
  author: string;
  coverUrl: string;
  priceKes: number;
  discountPercent?: number;
  quantity: number;
  format: BookFormat;
  userId?: string;
  updatedAt?: string;
}

export interface WishlistItem {
  bookId: string;
  title: string;
  author: string;
  coverUrl: string;
  priceKes: number;
  discountPercent?: number;
  userId?: string;
  addedAt?: string;
}

export interface Order {
  orderId: string;
  userId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  totalKes: number;
  mpesaReceiptNumber: string;
  paymentStatus: 'completed' | 'pending' | 'failed';
  itemsSummary: string;
  items: CartItem[];
  createdAt: string;
}
