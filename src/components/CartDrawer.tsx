import React, { useEffect } from 'react';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  Zap, 
  Tag, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    cartSubtotalKes,
    cartDiscountKes,
    cartTotalKes,
    formatPrice,
    promoCode,
    setPromoCode,
    appliedPromo,
    applyPromoCode,
    removePromoCode,
    promoError,
    setIsCheckoutOpen,
  } = useStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isCartOpen) {
        setIsCartOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCartOpen]);

  if (!isCartOpen) return null;

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoCode.trim()) {
      applyPromoCode(promoCode);
    }
  };

  const handleCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-label="Shopping Cart Drawer"
    >
      <div 
        className="absolute inset-y-0 right-0 max-w-full flex pl-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-screen max-w-md bg-white border-l border-slate-200 flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
          {/* Header */}
          <div className="p-5 border-b border-slate-200 bg-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-[#1e90ff]/10 text-[#1e90ff]">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Your Reading Cart</h3>
                <p className="text-xs text-slate-500 font-medium">
                  {cart.length} {cart.length === 1 ? 'title' : 'titles'} in order
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsCartOpen(false)}
              aria-label="Close cart drawer"
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 border border-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-slate-50/50">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h4 className="text-base font-bold text-slate-900">Your Cart is Empty</h4>
                <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                  Discover bestselling titles in African tech, speculative cyberpunk, and high-performance philosophy.
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="mt-2 px-4 py-2 rounded-lg bg-[#1e90ff] hover:bg-[#1a7cdb] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  Explore Catalog
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between text-xs text-slate-500 pb-1 font-medium">
                  <span>Selected Books ({cart.length})</span>
                  <button
                    onClick={clearCart}
                    className="text-rose-600 hover:text-rose-700 font-semibold transition-colors cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>

                {cart.map((item) => (
                  <div
                    key={item.bookId}
                    className="p-3.5 rounded-lg bg-white border border-slate-200 shadow-xs flex gap-3.5 items-center hover:border-slate-300 transition-all"
                  >
                    <img
                      src={item.coverUrl}
                      alt={item.title}
                      className="w-14 h-20 object-cover rounded-md border border-slate-200 shadow-xs flex-none"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#1e90ff]/10 text-[#1e90ff] border border-[#1e90ff]/20">
                          {item.format}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 truncate">
                        {item.title}
                      </h4>
                      <p className="text-xs text-slate-500 truncate mt-0.5 font-medium">
                        {item.author}
                      </p>
                      <div className="text-sm font-extrabold text-slate-900 mt-1.5">
                        {formatPrice(item.priceKes * item.quantity)}
                      </div>
                    </div>

                    {/* Quantity & Delete Controls */}
                    <div className="flex flex-col items-end gap-2.5 flex-none">
                      <button
                        onClick={() => removeFromCart(item.bookId)}
                        aria-label={`Remove ${item.title} from cart`}
                        title="Remove item"
                        className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-1.5 rounded-md transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="flex items-center gap-1 bg-slate-100 border border-slate-200 rounded-md p-0.5">
                        <button
                          onClick={() => updateCartQuantity(item.bookId, item.quantity - 1)}
                          aria-label="Decrease quantity"
                          className="w-5 h-5 flex items-center justify-center rounded text-slate-600 hover:text-slate-900 hover:bg-white transition-colors cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold text-slate-900 px-1 font-mono min-w-[1.25rem] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQuantity(item.bookId, item.quantity + 1)}
                          aria-label="Increase quantity"
                          className="w-5 h-5 flex items-center justify-center rounded text-slate-600 hover:text-slate-900 hover:bg-white transition-colors cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Footer & Checkout Area */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-slate-200 bg-white space-y-4 shadow-lg">
              {/* Promo code box */}
              <div>
                {appliedPromo ? (
                  <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-emerald-800 font-semibold">
                      <Tag className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{appliedPromo.code} ({appliedPromo.description})</span>
                    </div>
                    <button
                      onClick={removePromoCode}
                      className="text-slate-500 hover:text-rose-600 text-xs font-medium cursor-pointer ml-2"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyPromo} className="flex gap-2">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="Promo code (e.g. MIDUSA20)"
                      aria-label="Promo code input"
                      className="flex-1 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#1e90ff] focus:bg-white uppercase font-medium"
                    />
                    <button
                      type="submit"
                      className="px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer"
                    >
                      Apply
                    </button>
                  </form>
                )}
                {promoError && (
                  <p className="text-[11px] text-rose-600 font-medium mt-1">{promoError}</p>
                )}
              </div>

              {/* Price Summary */}
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600 font-medium">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-900">{formatPrice(cartSubtotalKes)}</span>
                </div>
                {cartDiscountKes > 0 && (
                  <div className="flex justify-between text-rose-600 font-bold">
                    <span>Discount Savings</span>
                    <span>-{formatPrice(cartDiscountKes)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600 font-medium">
                  <span>Digital Delivery</span>
                  <span className="text-[#00a859] font-bold">Instant Access</span>
                </div>
                <div className="pt-2.5 border-t border-slate-200 flex justify-between items-baseline text-sm font-bold text-slate-900">
                  <span>Total Amount</span>
                  <span className="text-xl text-slate-900 font-black tracking-tight">{formatPrice(cartTotalKes)}</span>
                </div>
              </div>

              {/* Primary M-Pesa Checkout Button (Safaricom Green) */}
              <button
                onClick={handleCheckout}
                aria-label={`Proceed to M-Pesa Checkout for ${formatPrice(cartTotalKes)}`}
                className="w-full py-3 rounded-lg bg-[#00a859] hover:bg-[#00924d] text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#00a859]/25 transition-transform active:scale-[0.99] cursor-pointer"
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>Checkout with M-Pesa</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
                <ShieldCheck className="w-3.5 h-3.5 text-[#00a859]" />
                <span>Encrypted Safaricom Daraja 2.0 Integration</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
