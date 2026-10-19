import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  getDocs 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from './AuthContext';
import { Book, BookFormat, CartItem, Order, Review, WishlistItem } from '../types/book';
import { BOOKS_DATA, INITIAL_REVIEWS } from '../data/books';

export interface PromoCode {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  description: string;
}

const AVAILABLE_PROMOS: Record<string, PromoCode> = {
  'MIDUSA20': { code: 'MIDUSA20', type: 'percentage', value: 20, description: '20% off entire order' },
  'WELCOME10': { code: 'WELCOME10', type: 'percentage', value: 10, description: '10% off new reader welcome bonus' },
  'SAFARICOM': { code: 'SAFARICOM', type: 'percentage', value: 15, description: '15% off M-Pesa exclusive discount' },
};

interface StoreContextType {
  // Books & Catalog
  books: Book[];
  selectedBook: Book | null;
  setSelectedBook: (book: Book | null) => void;
  readingBook: Book | null;
  setReadingBook: (book: Book | null) => void;

  // Filter & Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string | null;
  setSelectedCategory: (cat: string | null) => void;
  selectedSubcategory: string | null;
  setSelectedSubcategory: (sub: string | null) => void;
  onlyDiscounts: boolean;
  setOnlyDiscounts: (val: boolean) => void;
  formatFilter: BookFormat | null;
  setFormatFilter: (fmt: BookFormat | null) => void;
  minRating: number;
  setMinRating: (val: number) => void;
  sortBy: 'featured' | 'price-asc' | 'price-desc' | 'rating' | 'newest';
  setSortBy: (sort: 'featured' | 'price-asc' | 'price-desc' | 'rating' | 'newest') => void;
  filteredBooks: Book[];
  resetFilters: () => void;

  // Wishlist
  wishlist: WishlistItem[];
  toggleWishlist: (book: Book) => Promise<void>;
  isInWishlist: (bookId: string) => boolean;

  // Cart
  cart: CartItem[];
  addToCart: (book: Book, format?: BookFormat, quantity?: number) => Promise<void>;
  removeFromCart: (bookId: string) => Promise<void>;
  updateCartQuantity: (bookId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;

  // Pricing & Promos
  promoCode: string;
  setPromoCode: (code: string) => void;
  appliedPromo: PromoCode | null;
  applyPromoCode: (code: string) => boolean;
  removePromoCode: () => void;
  promoError: string | null;
  cartSubtotalKes: number;
  cartDiscountKes: number;
  cartTotalKes: number;
  currency: 'KES' | 'USD';
  toggleCurrency: () => void;
  formatPrice: (amountKes: number) => string;

  // M-Pesa & Orders
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  orders: Order[];
  placeOrder: (customerDetails: { name: string; phone: string; email: string }, mpesaReceipt: string) => Promise<Order>;

  // Reviews
  reviewsByBook: Record<string, Review[]>;
  loadBookReviews: (bookId: string) => Promise<void>;
  submitReview: (bookId: string, rating: number, comment: string, title?: string) => Promise<void>;

  // Toast notifications
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const StoreContext = createContext<StoreContextType | null>(null);

const WISHLIST_LOCAL_KEY = 'midusa_wishlist_local';
const CART_LOCAL_KEY = 'midusa_cart_local';
const ORDERS_LOCAL_KEY = 'midusa_orders_local';

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [books] = useState<Book[]>(BOOKS_DATA);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [readingBook, setReadingBook] = useState<Book | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [onlyDiscounts, setOnlyDiscounts] = useState(false);
  const [formatFilter, setFormatFilter] = useState<BookFormat | null>(null);
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating' | 'newest'>('featured');

  // Wishlist & Cart states
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Currency & Promo
  const [currency, setCurrency] = useState<'KES' | 'USD'>('KES');
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);

  // Reviews
  const [reviewsByBook, setReviewsByBook] = useState<Record<string, Review[]>>(INITIAL_REVIEWS);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Sync Wishlist with Firestore if user signed in, else localStorage
  useEffect(() => {
    if (user) {
      const path = `users/${user.uid}/wishlist`;
      const colRef = collection(db, 'users', user.uid, 'wishlist');
      const unsubscribe = onSnapshot(
        colRef,
        (snapshot) => {
          const items: WishlistItem[] = [];
          snapshot.forEach((d) => {
            items.push(d.data() as WishlistItem);
          });
          setWishlist(items);
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, path);
        }
      );
      return () => unsubscribe();
    } else {
      const stored = localStorage.getItem(WISHLIST_LOCAL_KEY);
      if (stored) {
        try {
          setWishlist(JSON.parse(stored));
        } catch {
          setWishlist([]);
        }
      }
    }
  }, [user]);

  // Sync Cart with Firestore if user signed in, else localStorage
  useEffect(() => {
    if (user) {
      const path = `users/${user.uid}/cart`;
      const colRef = collection(db, 'users', user.uid, 'cart');
      const unsubscribe = onSnapshot(
        colRef,
        (snapshot) => {
          const items: CartItem[] = [];
          snapshot.forEach((d) => {
            items.push(d.data() as CartItem);
          });
          setCart(items);
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, path);
        }
      );
      return () => unsubscribe();
    } else {
      const stored = localStorage.getItem(CART_LOCAL_KEY);
      if (stored) {
        try {
          setCart(JSON.parse(stored));
        } catch {
          setCart([]);
        }
      }
    }
  }, [user]);

  // Sync Orders with Firestore if user signed in, else localStorage
  useEffect(() => {
    if (user) {
      const path = `users/${user.uid}/orders`;
      const colRef = collection(db, 'users', user.uid, 'orders');
      const unsubscribe = onSnapshot(
        colRef,
        (snapshot) => {
          const items: Order[] = [];
          snapshot.forEach((d) => {
            items.push(d.data() as Order);
          });
          // Sort newest first
          items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setOrders(items);
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, path);
        }
      );
      return () => unsubscribe();
    } else {
      const stored = localStorage.getItem(ORDERS_LOCAL_KEY);
      if (stored) {
        try {
          setOrders(JSON.parse(stored));
        } catch {
          setOrders([]);
        }
      }
    }
  }, [user]);

  // Save guest cart / wishlist to localStorage
  const saveGuestWishlist = (items: WishlistItem[]) => {
    setWishlist(items);
    localStorage.setItem(WISHLIST_LOCAL_KEY, JSON.stringify(items));
  };

  const saveGuestCart = (items: CartItem[]) => {
    setCart(items);
    localStorage.setItem(CART_LOCAL_KEY, JSON.stringify(items));
  };

  const isInWishlist = (bookId: string) => {
    return wishlist.some((item) => item.bookId === bookId);
  };

  const toggleWishlist = async (book: Book) => {
    const exists = isInWishlist(book.id);

    if (user) {
      const path = `users/${user.uid}/wishlist/${book.id}`;
      const docRef = doc(db, 'users', user.uid, 'wishlist', book.id);
      try {
        if (exists) {
          await deleteDoc(docRef);
          showToast(`Removed "${book.title}" from Wishlist`);
        } else {
          const item: WishlistItem = {
            bookId: book.id,
            title: book.title,
            author: book.author,
            coverUrl: book.coverUrl,
            priceKes: book.priceKes,
            discountPercent: book.discountPercent || 0,
            userId: user.uid,
            addedAt: new Date().toISOString(),
          };
          await setDoc(docRef, item);
          showToast(`Added "${book.title}" to Wishlist`);
        }
      } catch (error) {
        handleFirestoreError(error, exists ? OperationType.DELETE : OperationType.WRITE, path);
      }
    } else {
      if (exists) {
        const next = wishlist.filter((item) => item.bookId !== book.id);
        saveGuestWishlist(next);
        showToast(`Removed "${book.title}" from Wishlist`);
      } else {
        const next: WishlistItem[] = [
          ...wishlist,
          {
            bookId: book.id,
            title: book.title,
            author: book.author,
            coverUrl: book.coverUrl,
            priceKes: book.priceKes,
            discountPercent: book.discountPercent || 0,
            addedAt: new Date().toISOString(),
          },
        ];
        saveGuestWishlist(next);
        showToast(`Added "${book.title}" to Wishlist`);
      }
    }
  };

  const addToCart = async (book: Book, format: BookFormat = 'eBook', quantity: number = 1) => {
    const existingIndex = cart.findIndex((item) => item.bookId === book.id && item.format === format);

    if (user) {
      const cartDocId = `${book.id}-${format}`.toLowerCase().replace(/[^a-z0-9_-]/g, '-');
      const path = `users/${user.uid}/cart/${cartDocId}`;
      const docRef = doc(db, 'users', user.uid, 'cart', cartDocId);
      try {
        const newQty = existingIndex > -1 ? cart[existingIndex].quantity + quantity : quantity;
        const item: CartItem = {
          bookId: cartDocId,
          title: book.title,
          author: book.author,
          coverUrl: book.coverUrl,
          priceKes: book.priceKes,
          quantity: newQty,
          format: format,
          userId: user.uid,
          updatedAt: new Date().toISOString(),
        };
        await setDoc(docRef, item);
        showToast(`Added "${book.title}" (${format}) to cart`);
        setIsCartOpen(true);
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, path);
      }
    } else {
      let nextCart: CartItem[];
      if (existingIndex > -1) {
        nextCart = cart.map((item, idx) =>
          idx === existingIndex ? { ...item, quantity: item.quantity + quantity } : item
        );
      } else {
        nextCart = [
          ...cart,
          {
            bookId: `${book.id}-${format}`,
            title: book.title,
            author: book.author,
            coverUrl: book.coverUrl,
            priceKes: book.priceKes,
            quantity: quantity,
            format: format,
            updatedAt: new Date().toISOString(),
          },
        ];
      }
      saveGuestCart(nextCart);
      showToast(`Added "${book.title}" (${format}) to cart`);
      setIsCartOpen(true);
    }
  };

  const removeFromCart = async (bookId: string) => {
    if (user) {
      const path = `users/${user.uid}/cart/${bookId}`;
      const docRef = doc(db, 'users', user.uid, 'cart', bookId);
      try {
        await deleteDoc(docRef);
        showToast('Item removed from cart');
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, path);
      }
    } else {
      const nextCart = cart.filter((item) => item.bookId !== bookId);
      saveGuestCart(nextCart);
      showToast('Item removed from cart');
    }
  };

  const updateCartQuantity = async (bookId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(bookId);
      return;
    }

    if (user) {
      const path = `users/${user.uid}/cart/${bookId}`;
      const docRef = doc(db, 'users', user.uid, 'cart', bookId);
      const existing = cart.find((i) => i.bookId === bookId);
      if (!existing) return;
      try {
        await setDoc(
          docRef,
          {
            ...existing,
            quantity,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, path);
      }
    } else {
      const nextCart = cart.map((item) =>
        item.bookId === bookId ? { ...item, quantity } : item
      );
      saveGuestCart(nextCart);
    }
  };

  const clearCart = async () => {
    if (user) {
      try {
        for (const item of cart) {
          const docRef = doc(db, 'users', user.uid, 'cart', item.bookId);
          await deleteDoc(docRef);
        }
      } catch (err) {
        console.warn('Error clearing cart:', err);
      }
    } else {
      saveGuestCart([]);
    }
  };

  // Promos
  const applyPromoCode = (code: string) => {
    const upper = code.trim().toUpperCase();
    if (AVAILABLE_PROMOS[upper]) {
      setAppliedPromo(AVAILABLE_PROMOS[upper]);
      setPromoError(null);
      showToast(`Promo "${upper}" applied successfully!`);
      return true;
    } else {
      setPromoError('Invalid promo code. Try "MIDUSA20" or "WELCOME10"');
      return false;
    }
  };

  const removePromoCode = () => {
    setAppliedPromo(null);
    setPromoCode('');
    setPromoError(null);
  };

  // Pricing calculations
  const cartSubtotalKes = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.priceKes * item.quantity, 0);
  }, [cart]);

  const cartDiscountKes = useMemo(() => {
    if (!appliedPromo || cartSubtotalKes === 0) return 0;
    if (appliedPromo.type === 'percentage') {
      return Math.round((cartSubtotalKes * appliedPromo.value) / 100);
    }
    return Math.min(cartSubtotalKes, appliedPromo.value);
  }, [cartSubtotalKes, appliedPromo]);

  const cartTotalKes = Math.max(0, cartSubtotalKes - cartDiscountKes);

  const toggleCurrency = () => {
    setCurrency((prev) => (prev === 'KES' ? 'USD' : 'KES'));
  };

  const formatPrice = (amountKes: number) => {
    if (currency === 'USD') {
      const inUsd = amountKes / 130;
      return `$${inUsd.toFixed(2)}`;
    }
    return `KES ${amountKes.toLocaleString()}`;
  };

  // Checkout and Order creation
  const placeOrder = async (
    customerDetails: { name: string; phone: string; email: string },
    mpesaReceipt: string
  ): Promise<Order> => {
    const orderId = `ORD-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
    const itemsSummary = cart.map((c) => `${c.title} (${c.format}) x${c.quantity}`).join(', ');

    const newOrder: Order = {
      orderId,
      userId: user ? user.uid : 'guest-user',
      customerName: customerDetails.name,
      customerPhone: customerDetails.phone,
      customerEmail: customerDetails.email,
      totalKes: cartTotalKes,
      mpesaReceiptNumber: mpesaReceipt,
      paymentStatus: 'completed',
      itemsSummary,
      items: [...cart],
      createdAt: new Date().toISOString(),
    };

    if (user) {
      const path = `users/${user.uid}/orders/${orderId}`;
      const orderRef = doc(db, 'users', user.uid, 'orders', orderId);
      try {
        await setDoc(orderRef, {
          orderId: newOrder.orderId,
          userId: user.uid,
          customerName: newOrder.customerName,
          customerPhone: newOrder.customerPhone,
          customerEmail: newOrder.customerEmail,
          totalKes: newOrder.totalKes,
          mpesaReceiptNumber: newOrder.mpesaReceiptNumber,
          paymentStatus: newOrder.paymentStatus,
          itemsSummary: newOrder.itemsSummary,
          createdAt: newOrder.createdAt,
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, path);
      }
    } else {
      const updated = [newOrder, ...orders];
      setOrders(updated);
      localStorage.setItem(ORDERS_LOCAL_KEY, JSON.stringify(updated));
    }

    await clearCart();
    return newOrder;
  };

  // Reviews
  const loadBookReviews = async (bookId: string) => {
    try {
      const path = `books/${bookId}/reviews`;
      const reviewsCol = collection(db, 'books', bookId, 'reviews');
      const snap = await getDocs(reviewsCol);
      const fetched: Review[] = [];
      snap.forEach((d) => {
        fetched.push(d.data() as Review);
      });

      setReviewsByBook((prev) => {
        const initial = INITIAL_REVIEWS[bookId] || [];
        // Combine initial and fetched reviews, removing duplicates by reviewId
        const map = new Map<string, Review>();
        initial.forEach((r) => map.set(r.reviewId, r));
        fetched.forEach((r) => map.set(r.reviewId, r));
        return {
          ...prev,
          [bookId]: Array.from(map.values()),
        };
      });
    } catch {
      // Fallback silently to initial reviews if offline or initializing
    }
  };

  const submitReview = async (bookId: string, rating: number, comment: string, title?: string) => {
    const reviewId = `rev-${Date.now().toString(36)}`;
    const newRev: Review = {
      reviewId,
      bookId,
      userId: user ? user.uid : 'guest-reviewer',
      userName: user ? user.displayName || 'Verified Reader' : 'Midusa Reader',
      userAvatar: user?.photoURL || undefined,
      rating,
      title: title || 'Reader Review',
      comment,
      verifiedPurchase: true,
      helpfulCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };

    if (user) {
      const path = `books/${bookId}/reviews/${reviewId}`;
      const reviewDoc = doc(db, 'books', bookId, 'reviews', reviewId);
      try {
        await setDoc(reviewDoc, newRev);
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, path);
      }
    }

    // Update local state
    setReviewsByBook((prev) => ({
      ...prev,
      [bookId]: [newRev, ...(prev[bookId] || [])],
    }));
    showToast('Your review has been published!');
  };

  // Filtered books
  const filteredBooks = useMemo(() => {
    return books.filter((b) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = b.title.toLowerCase().includes(q);
        const matchAuthor = b.author.toLowerCase().includes(q);
        const matchSubtitle = b.subtitle?.toLowerCase().includes(q);
        const matchTag = b.tags.some((t) => t.toLowerCase().includes(q));
        const matchSubcat = b.subcategory.toLowerCase().includes(q);
        if (!matchTitle && !matchAuthor && !matchSubtitle && !matchTag && !matchSubcat) {
          return false;
        }
      }

      // Category
      if (selectedCategory && b.category !== selectedCategory) {
        return false;
      }

      // Subcategory
      if (selectedSubcategory && b.subcategory !== selectedSubcategory) {
        return false;
      }

      // Discounts
      if (onlyDiscounts && (!b.discountPercent || b.discountPercent <= 0)) {
        return false;
      }

      // Format
      if (formatFilter && !b.formats.includes(formatFilter)) {
        return false;
      }

      // Min Rating
      if (minRating > 0 && b.rating < minRating) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.priceKes - b.priceKes;
      if (sortBy === 'price-desc') return b.priceKes - a.priceKes;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'newest') return b.publishedYear - a.publishedYear;
      // Default: featured first, then rank
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return (a.rank || 99) - (b.rank || 99);
    });
  }, [
    books,
    searchQuery,
    selectedCategory,
    selectedSubcategory,
    onlyDiscounts,
    formatFilter,
    minRating,
    sortBy,
  ]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory(null);
    setSelectedSubcategory(null);
    setOnlyDiscounts(false);
    setFormatFilter(null);
    setMinRating(0);
    setSortBy('featured');
  };

  return (
    <StoreContext.Provider
      value={{
        books,
        selectedBook,
        setSelectedBook,
        readingBook,
        setReadingBook,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        selectedSubcategory,
        setSelectedSubcategory,
        onlyDiscounts,
        setOnlyDiscounts,
        formatFilter,
        setFormatFilter,
        minRating,
        setMinRating,
        sortBy,
        setSortBy,
        filteredBooks,
        resetFilters,
        wishlist,
        toggleWishlist,
        isInWishlist,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        promoCode,
        setPromoCode,
        appliedPromo,
        applyPromoCode,
        removePromoCode,
        promoError,
        cartSubtotalKes,
        cartDiscountKes,
        cartTotalKes,
        currency,
        toggleCurrency,
        formatPrice,
        isCheckoutOpen,
        setIsCheckoutOpen,
        orders,
        placeOrder,
        reviewsByBook,
        loadBookReviews,
        submitReview,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within StoreProvider');
  return context;
};
