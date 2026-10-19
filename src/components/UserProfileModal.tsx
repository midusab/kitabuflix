import React, { useEffect } from 'react';
import { 
  X, 
  User, 
  Mail, 
  Smartphone, 
  ShoppingBag, 
  Heart, 
  Clock, 
  ShieldCheck, 
  LogOut, 
  LogIn, 
  Sparkles, 
  BookOpen, 
  DollarSign,
  Award,
  Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenWishlist: () => void;
  onOpenOrders: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  onOpenWishlist,
  onOpenOrders,
}) => {
  const { user, signInWithGoogle, signOutUser } = useAuth();
  const { wishlist, cart, orders, currency, toggleCurrency, formatPrice } = useStore();

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

  const displayName = user?.displayName || 'Achieng (Curator & Reader)';
  const displayEmail = user?.email || 'bochieng228@gmail.com';

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="user-profile-heading"
    >
      {/* Liquid Glass Modal Container */}
      <div 
        className="relative w-full max-w-lg my-auto rounded-lg bg-[#0e1626] border border-white/20 text-white shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Specular Liquid Glass Top Sheen */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#e50914] via-[#1e90ff] to-[#00a859]" />

        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-start justify-between bg-gradient-to-b from-white/5 to-transparent">
          <div className="flex items-center gap-4">
            {/* Avatar with Achieng Liquid Glass Ring */}
            <div className="relative">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={displayName}
                  className="w-16 h-16 rounded-md object-cover border-2 border-[#1e90ff] shadow-lg"
                />
              ) : (
                <div className="w-16 h-16 rounded-md bg-gradient-to-br from-[#1e90ff] to-[#00a859] flex items-center justify-center text-white font-black text-2xl shadow-lg border border-white/20">
                  A
                </div>
              )}
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-xs bg-[#00a859] border-2 border-[#0e1626] flex items-center justify-center text-white" title="Active Verified">
                <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 id="user-profile-heading" className="text-lg font-extrabold text-white">
                  {displayName}
                </h3>
                <span className="px-2 py-0.5 rounded-xs text-[10px] font-bold bg-[#1e90ff]/20 text-[#1e90ff] border border-[#1e90ff]/30">
                  PRO
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                <span>{displayEmail}</span>
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  M-Pesa Express Verified
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close profile modal"
            className="p-1.5 rounded-md bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer border border-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Stats & Account Details */}
        <div className="p-6 space-y-5">
          {/* Achieng Liquid Glass Stats Grid */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div 
              onClick={() => { onClose(); onOpenOrders(); }}
              className="p-3 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 cursor-pointer transition-all group"
            >
              <div className="w-7 h-7 mx-auto rounded-xs bg-[#00a859]/20 text-[#00a859] flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                <Clock className="w-4 h-4" />
              </div>
              <div className="text-lg font-black text-white">{orders.length}</div>
              <div className="text-[11px] text-slate-400 font-medium">Orders</div>
            </div>

            <div 
              onClick={() => { onClose(); onOpenWishlist(); }}
              className="p-3 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 cursor-pointer transition-all group"
            >
              <div className="w-7 h-7 mx-auto rounded-xs bg-[#e50914]/20 text-[#e50914] flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                <Heart className="w-4 h-4 fill-current" />
              </div>
              <div className="text-lg font-black text-white">{wishlist.length}</div>
              <div className="text-[11px] text-slate-400 font-medium">Wishlist</div>
            </div>

            <div className="p-3 rounded-md bg-white/5 border border-white/10">
              <div className="w-7 h-7 mx-auto rounded-xs bg-[#1e90ff]/20 text-[#1e90ff] flex items-center justify-center mb-1">
                <BookOpen className="w-4 h-4" />
              </div>
              <div className="text-lg font-black text-white">
                {orders.reduce((sum, o) => sum + (o.items?.length || 1), 0)}
              </div>
              <div className="text-[11px] text-slate-400 font-medium">Library</div>
            </div>
          </div>

          {/* Account Actions */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Quick Shortcuts
            </h4>

            <button
              onClick={() => { onClose(); onOpenOrders(); }}
              className="w-full p-3 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-between text-xs font-semibold text-white transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-[#1e90ff]" />
                <span>View M-Pesa Transaction History & Receipts</span>
              </span>
              <span className="text-slate-400">→</span>
            </button>

            <button
              onClick={() => { onClose(); onOpenWishlist(); }}
              className="w-full p-3 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-between text-xs font-semibold text-white transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2.5">
                <Heart className="w-4 h-4 text-[#e50914]" />
                <span>Saved Wishlist ({wishlist.length} titles)</span>
              </span>
              <span className="text-slate-400">→</span>
            </button>

            {/* Currency Preference */}
            <div className="p-3 rounded-md bg-white/5 border border-white/10 flex items-center justify-between text-xs">
              <span className="text-slate-300 font-semibold flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span>Display Currency</span>
              </span>
              <button
                onClick={toggleCurrency}
                className="px-3 py-1 rounded-md bg-white/10 hover:bg-white/20 text-white font-bold cursor-pointer"
              >
                {currency} (Click to switch)
              </button>
            </div>
          </div>

          {/* Achieng Liquid Glass Signature */}
          <div className="p-3.5 rounded-md bg-gradient-to-r from-blue-900/30 to-emerald-900/30 border border-white/10 flex items-center gap-3">
            <div className="p-2 rounded-xs bg-[#1e90ff]/20 text-[#1e90ff]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Achieng Liquid Glass Architecture</div>
              <div className="text-[11px] text-slate-400">
                Specular depth, Safaricom M-Pesa integration & Firebase Auth active.
              </div>
            </div>
          </div>

          {/* Auth Action */}
          <div className="pt-2 border-t border-white/10 flex items-center justify-between">
            {user ? (
              <button
                onClick={() => { signOutUser(); onClose(); }}
                className="px-4 py-2 rounded-md bg-rose-500/20 hover:bg-rose-500/30 text-[#ef4444] text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer border border-rose-500/30"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out of Google Account</span>
              </button>
            ) : (
              <button
                onClick={() => { signInWithGoogle(); }}
                className="w-full py-2.5 rounded-md bg-[#1e90ff] hover:bg-[#1a7cdb] text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In with Google Account</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="text-xs text-slate-400 hover:text-white px-3 py-2 cursor-pointer font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
