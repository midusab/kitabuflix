import React, { useEffect } from 'react';
import { X, Heart, ShoppingCart, Trash2, ArrowRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface WishlistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WishlistModal: React.FC<WishlistModalProps> = ({ isOpen, onClose }) => {
  const { 
    wishlist, 
    toggleWishlist, 
    addToCart, 
    formatPrice, 
    setSelectedBook, 
    books 
  } = useStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleMoveAllToCart = async () => {
    for (const item of wishlist) {
      const fullBook = books.find((b) => b.id === item.bookId);
      if (fullBook) {
        await addToCart(fullBook, 'eBook', 1);
      }
    }
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/70 backdrop-blur-sm overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Wishlist modal"
    >
      <div 
        className="relative w-full max-w-2xl my-auto rounded-xl bg-white border border-slate-200 overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-rose-50 text-rose-600">
              <Heart className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Your Wishlist</h3>
              <p className="text-xs text-slate-500 font-medium">
                {wishlist.length} {wishlist.length === 1 ? 'saved book' : 'saved books'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close wishlist"
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 border border-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Wishlist Items List */}
        <div className="p-5 max-h-[440px] overflow-y-auto space-y-3 bg-slate-50/50">
          {wishlist.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <div className="w-14 h-14 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                <Heart className="w-7 h-7" />
              </div>
              <h4 className="text-base font-bold text-slate-900">Your Wishlist is Empty</h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                Tap the heart button on any book card to save it for later or track discount notifications.
              </p>
            </div>
          ) : (
            wishlist.map((item) => {
              const fullBook = books.find((b) => b.id === item.bookId);
              return (
                <div
                  key={item.bookId}
                  className="p-3.5 rounded-lg bg-white border border-slate-200 shadow-xs flex items-center justify-between gap-4 hover:border-slate-300 transition-all"
                >
                  <div 
                    onClick={() => {
                      if (fullBook) {
                        onClose();
                        setSelectedBook(fullBook);
                      }
                    }}
                    className="flex items-center gap-3.5 flex-1 min-w-0 cursor-pointer group"
                  >
                    <img
                      src={item.coverUrl}
                      alt={item.title}
                      className="w-12 h-18 object-cover rounded-md border border-slate-200 shadow-xs flex-none group-hover:scale-105 transition-transform"
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-bold text-slate-900 truncate group-hover:text-[#1e90ff] transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-xs text-slate-500 truncate mt-0.5 font-medium">{item.author}</p>
                      <div className="text-sm font-extrabold text-slate-900 mt-1">
                        {formatPrice(item.priceKes)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-none">
                    <button
                      onClick={() => {
                        if (fullBook) {
                          addToCart(fullBook, 'eBook', 1);
                        }
                      }}
                      className="px-3.5 py-2 rounded-lg bg-[#00a859] hover:bg-[#00924d] text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Add to Cart</span>
                    </button>

                    <button
                      onClick={() => {
                        if (fullBook) {
                          toggleWishlist(fullBook);
                        }
                      }}
                      aria-label="Remove from wishlist"
                      className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {wishlist.length > 0 && (
          <div className="p-4 border-t border-slate-200 bg-white flex items-center justify-between">
            <span className="text-xs text-slate-600 font-medium">
              Move all titles to cart for instant checkout
            </span>
            <button
              onClick={handleMoveAllToCart}
              className="px-4 py-2 rounded-lg bg-[#1e90ff] hover:bg-[#1a7cdb] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm transition-colors"
            >
              <span>Move All to Cart</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
