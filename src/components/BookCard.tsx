import React from 'react';
import { 
  Heart, 
  ShoppingCart, 
  BookOpen, 
  Star, 
  Headphones, 
  Zap, 
  Percent 
} from 'lucide-react';
import { Book } from '../types/book';
import { useStore } from '../context/StoreContext';

interface BookCardProps {
  book: Book;
  rank?: number;
  isGrid?: boolean;
  className?: string;
}

export const BookCard: React.FC<BookCardProps> = ({ 
  book, 
  rank,
  isGrid = false,
  className = ''
}) => {
  const { 
    setSelectedBook, 
    setReadingBook, 
    toggleWishlist, 
    isInWishlist, 
    addToCart, 
    setIsCheckoutOpen,
    formatPrice 
  } = useStore();

  const isFavorited = isInWishlist(book.id);

  const handleInstantMpesaBuy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await addToCart(book, 'eBook', 1);
    setIsCheckoutOpen(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setSelectedBook(book);
    }
  };

  return (
    <div 
      className={`group relative select-none transition-all duration-200 ${
        isGrid 
          ? 'w-full' 
          : 'flex-none w-[160px] sm:w-[180px] md:w-[200px]'
      } ${className}`}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      role="article"
      aria-label={`${book.title} by ${book.author}, ${formatPrice(book.priceKes)}`}
    >
      {/* Neutral Radius Compact Glass Card Body */}
      <div 
        onClick={() => setSelectedBook(book)}
        className="cursor-pointer bg-white rounded-md border border-slate-200 hover:border-[#1e90ff] shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden relative flex flex-col h-full group-hover:-translate-y-0.5 focus-within:ring-2 focus-within:ring-[#1e90ff]"
      >
        {/* Cover Image Container */}
        <div className="relative aspect-[2/3] w-full overflow-hidden bg-slate-100">
          <img 
            src={book.coverUrl} 
            alt={`Cover of ${book.title}`}
            className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
            loading="lazy"
          />

          {/* Top Badges (Red for Discount, Dodgerblue for Category badge) */}
          <div className="absolute top-1.5 left-1.5 flex flex-col gap-1 z-10">
            {book.discountPercent && book.discountPercent > 0 && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-xs text-[10px] font-black bg-[#e50914] text-white shadow-xs">
                <Percent className="w-2.5 h-2.5" />
                {book.discountPercent}% OFF
              </span>
            )}
            {book.badge && (
              <span className="px-1.5 py-0.5 rounded-xs text-[9px] font-bold bg-[#1e90ff] text-white shadow-xs">
                {book.badge}
              </span>
            )}
          </div>

          {/* Quick Format Badges */}
          <div className="absolute bottom-1.5 left-1.5 flex items-center gap-1 z-10">
            {book.formats.includes('eBook') && (
              <span className="px-1.5 py-0.5 rounded-xs bg-black/80 backdrop-blur-md text-[9px] font-semibold text-white border border-white/10 flex items-center gap-0.5">
                <BookOpen className="w-2.5 h-2.5 text-[#1e90ff]" />
                <span>eBook</span>
              </span>
            )}
            {book.formats.includes('Audiobook') && (
              <span className="p-0.5 px-1 rounded-xs bg-black/80 backdrop-blur-md text-[#1e90ff] border border-white/10" title="Audiobook format">
                <Headphones className="w-2.5 h-2.5" />
              </span>
            )}
          </div>

          {/* Top Right Quick Actions */}
          <div className="absolute top-1.5 right-1.5 flex flex-col gap-1 z-20 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleWishlist(book);
              }}
              aria-label={isFavorited ? `Remove ${book.title} from wishlist` : `Add ${book.title} to wishlist`}
              className={`p-1.5 rounded-xs backdrop-blur-md transition-all cursor-pointer ${
                isFavorited 
                  ? 'bg-[#e50914] text-white shadow-xs' 
                  : 'bg-black/70 hover:bg-black text-white hover:text-[#e50914] border border-white/15'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${isFavorited ? 'fill-current' : ''}`} />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setReadingBook(book);
              }}
              aria-label={`Read sample of ${book.title}`}
              className="p-1.5 rounded-xs bg-black/70 hover:bg-white hover:text-black text-white backdrop-blur-md transition-all cursor-pointer border border-white/15"
              title="Preview sample"
            >
              <BookOpen className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-2.5 flex flex-col flex-1 justify-between gap-2 bg-white">
          <div>
            <div className="text-[10px] font-bold text-[#1e90ff] uppercase tracking-wider line-clamp-1">
              {book.subcategory}
            </div>
            <h3 className="font-bold text-xs text-slate-900 line-clamp-1 group-hover:text-[#1e90ff] transition-colors mt-0.5">
              {book.title}
            </h3>
            <p className="text-[11px] text-slate-600 line-clamp-1 mt-0.5 font-medium">
              {book.author}
            </p>
          </div>

          {/* Rating & Price */}
          <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-1 text-[11px]">
              <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
              <span className="font-extrabold text-slate-900">{book.rating}</span>
              <span className="text-[10px] text-slate-500 font-medium">({book.reviewsCount})</span>
            </div>

            <div className="text-right">
              {book.originalPriceKes && (
                <div className="text-[10px] text-slate-500 line-through leading-tight font-medium">
                  {formatPrice(book.originalPriceKes)}
                </div>
              )}
              <div className="text-xs font-black text-slate-900">
                {formatPrice(book.priceKes)}
              </div>
            </div>
          </div>

          {/* Purchase Buttons */}
          <div className="flex items-center gap-1.5 pt-0.5">
            <button
              onClick={handleInstantMpesaBuy}
              aria-label={`Buy ${book.title}`}
              className="flex-1 py-1.5 px-2.5 rounded-md bg-[#e50914] hover:bg-[#f40612] text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-sm shadow-[#e50914]/25 transition-transform active:scale-95 cursor-pointer"
            >
              <Zap className="w-3 h-3 fill-current" />
              <span>Buy</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                addToCart(book, 'eBook', 1);
              }}
              aria-label={`Add ${book.title} to cart`}
              className="p-1.5 rounded-md bg-slate-100 hover:bg-[#1e90ff] text-slate-700 hover:text-white transition-colors cursor-pointer border border-slate-200"
              title="Add to cart"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
