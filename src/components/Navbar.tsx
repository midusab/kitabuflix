import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  X, 
  ShoppingCart, 
  Heart, 
  LogIn, 
  LogOut, 
  Clock, 
  ChevronDown, 
  Zap, 
  BookOpen, 
  User as UserIcon,
  Sparkles,
  Flame,
  Tag,
  Laptop,
  Globe,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';

interface NavbarProps {
  onOpenWishlist: () => void;
  onOpenOrders: () => void;
  onOpenProfile: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  onOpenWishlist, 
  onOpenOrders, 
  onOpenProfile 
}) => {
  const { user, signInWithGoogle, signOutUser } = useAuth();
  const { 
    books,
    searchQuery,
    setSearchQuery,
    cart, 
    wishlist, 
    setIsCartOpen, 
    setIsCheckoutOpen,
    currency, 
    toggleCurrency,
    cartTotalKes,
    formatPrice,
    setSelectedBook,
    setSelectedCategory,
    setSelectedSubcategory,
    setOnlyDiscounts
  } = useStore();

  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Quick matches for dominating search dropdown preview
  const liveResults = searchQuery.trim()
    ? books.filter((b) => {
        const q = searchQuery.toLowerCase();
        return (
          b.title.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q) ||
          b.subcategory.toLowerCase().includes(q) ||
          b.tags.some((t) => t.toLowerCase().includes(q))
        );
      }).slice(0, 5)
    : [];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 transition-all select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 h-16 sm:h-18 flex items-center justify-between gap-4">
        {/* Left: Brand Monogram & Name */}
        <div 
          onClick={() => {
            setSelectedBook(null);
            setSearchQuery('');
            setSelectedCategory(null);
            setSelectedSubcategory(null);
            setOnlyDiscounts(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center gap-2.5 cursor-pointer group flex-none"
          role="button"
          tabIndex={0}
          aria-label="Midusa eLibrary Home"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              setSelectedBook(null);
              setSearchQuery('');
              setSelectedCategory(null);
              setSelectedSubcategory(null);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
        >
          {/* Netflix Red 'M' Monogram */}
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-md bg-[#e50914] flex items-center justify-center text-white font-black text-lg sm:text-xl tracking-tighter shadow-sm group-hover:bg-[#f40612] transition-colors">
            M
          </div>

          <div className="flex flex-col">
            <span className="font-extrabold text-base tracking-tight text-slate-900 group-hover:text-[#1e90ff] transition-colors flex items-center gap-1">
              Midusa <span className="font-normal text-slate-500">eLibrary</span>
            </span>
            <span className="text-[10px] text-slate-400 font-bold tracking-wider uppercase hidden sm:block">
              Digital Bookstore
            </span>
          </div>
        </div>

        {/* Center: Dominating Centered Search Bar */}
        <div 
          ref={searchContainerRef}
          className="flex-1 max-w-xl lg:max-w-2xl mx-2 sm:mx-4 relative"
        >
          <div className={`relative flex items-center w-full rounded-md border transition-all ${
            isSearchFocused
              ? 'bg-white border-[#1e90ff] ring-2 ring-[#1e90ff]/20 shadow-md'
              : 'bg-slate-100/80 hover:bg-slate-100 border-slate-200 hover:border-slate-300'
          }`}>
            <Search className={`w-4 h-4 sm:w-5 sm:h-5 ml-3 flex-none transition-colors ${
              isSearchFocused ? 'text-[#1e90ff]' : 'text-slate-400'
            }`} />

            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              placeholder="Search books, authors, topics, M-Pesa deals, ISBN..."
              aria-label="Dominating search input across all books"
              className="w-full pl-2.5 pr-9 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-slate-900 placeholder-slate-500 focus:outline-none bg-transparent"
            />

            {/* Clear Button */}
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery('')}
                aria-label="Clear search input"
                className="p-1 mr-2 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            ) : (
              <span className="hidden lg:flex items-center gap-0.5 mr-3 px-1.5 py-0.5 rounded-xs bg-white border border-slate-200 text-[10px] font-bold text-slate-600">
                ⌘K
              </span>
            )}
          </div>

          {/* Instant Search Results Dropdown Preview */}
          {isSearchFocused && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-md border border-slate-200 shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100">
              {searchQuery.trim() ? (
                <div>
                  <div className="px-4 py-2 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between text-xs text-slate-700 font-bold">
                    <span>Quick Matching Titles</span>
                    <span className="text-slate-500 font-medium">Press Enter for full results</span>
                  </div>

                  {liveResults.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-600 font-medium">
                      No matching books found for "{searchQuery}".
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                      {liveResults.map((book) => (
                        <div
                          key={book.id}
                          onClick={() => {
                            setSelectedBook(book);
                            setIsSearchFocused(false);
                          }}
                          className="p-3 hover:bg-slate-50 flex items-center justify-between gap-3 cursor-pointer transition-colors group"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={book.coverUrl}
                              alt={book.title}
                              className="w-10 h-14 object-cover rounded-xs flex-none shadow-xs border border-slate-200"
                            />
                            <div className="min-w-0">
                              <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-[#1e90ff] truncate transition-colors">
                                {book.title}
                              </h4>
                              <p className="text-xs text-slate-600 truncate font-medium">
                                By {book.author} • {book.subcategory}
                              </p>
                            </div>
                          </div>

                          <div className="text-right flex-none">
                            <span className="text-xs font-bold text-slate-900 block">
                              {formatPrice(book.priceKes)}
                            </span>
                            {book.discountPercent && (
                              <span className="text-[10px] font-bold text-[#e50914]">
                                -{book.discountPercent}%
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                /* Quick Categories shortcut when focused with empty query */
                <div className="p-4 space-y-2.5">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                    Popular Categories
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { label: 'Top 10 Today', icon: Flame, action: () => { document.getElementById('top10-section')?.scrollIntoView({ behavior: 'smooth' }); setIsSearchFocused(false); } },
                      { label: '50% Off Discounts', icon: Tag, action: () => { setOnlyDiscounts(true); setIsSearchFocused(false); } },
                      { label: 'Software & AI', icon: Laptop, action: () => { setSelectedCategory('Non-Fiction & Tech'); setIsSearchFocused(false); } },
                      { label: 'African Literature', icon: Globe, action: () => { setSelectedCategory('Fiction'); setIsSearchFocused(false); } },
                      { label: 'M-Pesa Revolution', icon: TrendingUp, action: () => { setSearchQuery('M-Pesa'); setIsSearchFocused(false); } },
                    ].map((item, idx) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={idx}
                          onClick={item.action}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 hover:bg-[#1e90ff] hover:text-white text-xs font-semibold text-slate-700 transition-colors cursor-pointer group"
                        >
                          <Icon className="w-3.5 h-3.5 text-slate-500 group-hover:text-white transition-colors" />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Actions (Currency, Wishlist, Cart, Profile Modal Trigger) */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-none">
          {/* Currency Switcher */}
          <button
            onClick={toggleCurrency}
            aria-label="Toggle currency between KES and USD"
            className="px-2.5 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-bold text-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
            title="Switch currency"
          >
            <span className={currency === 'KES' ? 'text-[#1e90ff]' : 'text-slate-400'}>KES</span>
            <span className="text-slate-300">/</span>
            <span className={currency === 'USD' ? 'text-[#1e90ff]' : 'text-slate-400'}>USD</span>
          </button>

          {/* Wishlist Button with Red Badge */}
          <button
            onClick={onOpenWishlist}
            aria-label={`View wishlist (${wishlist.length} saved books)`}
            className="relative p-2 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-all cursor-pointer"
            title="Wishlist"
          >
            <Heart className={`w-4 h-4 ${wishlist.length > 0 ? 'text-[#e50914] fill-current' : ''}`} />
            {wishlist.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-xs bg-[#e50914] text-white text-[10px] font-black flex items-center justify-center shadow-xs">
                {wishlist.length}
              </span>
            )}
          </button>

          {/* Dedicated Shopping Cart Button (Always with Modern ShoppingCart Icon) */}
          <button
            onClick={() => setIsCartOpen(true)}
            aria-label={`Shopping Cart with ${cartItemsCount} items`}
            className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#1e90ff]/10 hover:bg-[#1e90ff] text-[#1e90ff] hover:text-white border border-[#1e90ff]/30 hover:border-[#1e90ff] transition-all cursor-pointer group shadow-xs"
            title="Shopping Cart"
          >
            <div className="relative flex items-center justify-center">
              <ShoppingCart className="w-4 h-4 transition-transform group-hover:scale-110" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-2.5 -right-2.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#e50914] text-white text-[10px] font-black flex items-center justify-center shadow-xs">
                  {cartItemsCount}
                </span>
              )}
            </div>
            <span className="text-xs font-bold pl-0.5">
              Cart
            </span>
          </button>

          {/* Quick Checkout Button when Cart has items */}
          {cartItemsCount > 0 && (
            <button
              onClick={() => setIsCheckoutOpen(true)}
              aria-label={`Proceed to Checkout for ${formatPrice(cartTotalKes)} via M-Pesa`}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#00a859] hover:bg-[#00924d] text-white font-extrabold text-xs shadow-xs transition-transform active:scale-95 cursor-pointer"
              title="Proceed to M-Pesa Checkout"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Checkout</span>
            </button>
          )}

          {/* User Profile Trigger Button (Directly Opens UserProfileModal) */}
          <button
            onClick={onOpenProfile}
            aria-label="Open User Profile Page"
            className="flex items-center gap-1.5 p-1 rounded-md bg-slate-100 border border-slate-200 hover:border-[#1e90ff] hover:bg-slate-200 transition-all cursor-pointer group"
            title="User Profile & Settings"
          >
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || 'Achieng'}
                className="w-7 h-7 rounded-xs object-cover border border-[#1e90ff]"
              />
            ) : (
              <div className="w-7 h-7 rounded-xs bg-[#1e90ff] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                {user?.displayName?.[0] || 'A'}
              </div>
            )}
            <span className="hidden sm:inline text-xs font-bold text-slate-800 pr-1 group-hover:text-[#1e90ff] transition-colors">
              {user ? (user.displayName?.split(' ')[0] || 'Achieng') : 'Achieng'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
