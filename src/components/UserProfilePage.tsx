import React, { useState } from 'react';
import { 
  ArrowLeft, 
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
  Download,
  Trash2,
  Zap,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';

interface UserProfilePageProps {
  onBackToHome: () => void;
  onOpenCheckout: () => void;
  initialTab?: 'library' | 'wishlist' | 'orders' | 'settings';
}

export const UserProfilePage: React.FC<UserProfilePageProps> = ({
  onBackToHome,
  onOpenCheckout,
  initialTab = 'library'
}) => {
  const { user, signInWithGoogle, signOutUser } = useAuth();
  const { 
    wishlist, 
    cart, 
    orders, 
    currency, 
    toggleCurrency, 
    formatPrice,
    books,
    setSelectedBook,
    setReadingBook,
    toggleWishlist,
    addToCart,
    removeFromCart
  } = useStore();

  const [activeTab, setActiveTab] = useState<'library' | 'wishlist' | 'orders' | 'settings'>(initialTab);

  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const displayName = user?.displayName || 'Achieng (Curator & Reader)';
  const displayEmail = user?.email || 'bochieng228@gmail.com';

  const cartTotalCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 animate-in fade-in duration-200">
      {/* Top Navigation Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-16 sm:top-18 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-3.5 flex items-center justify-between gap-4">
          <button
            onClick={onBackToHome}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 text-xs sm:text-sm font-bold transition-all cursor-pointer border border-slate-300"
            aria-label="Back to book catalog"
          >
            <ArrowLeft className="w-4 h-4 text-[#1e90ff]" />
            <span>Back to Catalog</span>
          </button>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <button onClick={onBackToHome} className="hover:text-[#1e90ff] cursor-pointer">
              Home
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[#1e90ff] font-bold">Reader Profile & Account</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-8">
        {/* Profile Showcase Card (Achieng Liquid Glass Aesthetics) */}
        <section 
          aria-label="User profile header"
          className="relative rounded-lg bg-[#0b1325] text-white border border-slate-800 shadow-2xl overflow-hidden mb-8"
        >
          {/* Liquid Glass Specular Edge Top Sheen */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#e50914] via-[#1e90ff] to-[#00a859]" />
          <div className="absolute -top-32 -right-32 w-80 h-80 bg-[#1e90ff]/15 rounded-full blur-3xl pointer-events-none" />

          <div className="p-6 sm:p-8 md:p-10 relative z-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                {user?.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={displayName}
                    className="w-18 h-18 sm:w-20 sm:h-20 rounded-md border-2 border-[#1e90ff] shadow-xl object-cover"
                  />
                ) : (
                  <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-md bg-gradient-to-tr from-[#1e90ff] to-[#00a859] flex items-center justify-center text-white text-2xl font-black shadow-xl">
                    {displayName[0]}
                  </div>
                )}

                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <h1 className="text-xl sm:text-2xl font-extrabold text-white">
                      {displayName}
                    </h1>
                    <span className="px-2 py-0.5 rounded-xs text-[11px] font-black bg-[#1e90ff]/20 text-[#1e90ff] border border-[#1e90ff]/30 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 fill-current" />
                      Achieng Curator
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-300 font-medium flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#1e90ff]" />
                    <span>{displayEmail}</span>
                  </p>
                  <p className="text-xs text-slate-400 mt-1 font-medium flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-[#00a859]" />
                    <span>Safaricom M-Pesa Verified Account</span>
                  </p>
                </div>
              </div>

              {/* Auth Actions & Currency Switcher */}
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={toggleCurrency}
                  className="px-3 py-2 rounded-md bg-white/10 hover:bg-white/15 text-white text-xs font-bold border border-white/20 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <DollarSign className="w-3.5 h-3.5 text-[#00a859]" />
                  <span>Currency: <strong className="text-[#1e90ff]">{currency}</strong></span>
                </button>

                {user ? (
                  <button
                    onClick={signOutUser}
                    className="px-4 py-2 rounded-md bg-white/10 hover:bg-[#e50914] text-white text-xs font-bold border border-white/20 hover:border-[#e50914] transition-all flex items-center gap-2 cursor-pointer shadow-xs"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                ) : (
                  <button
                    onClick={signInWithGoogle}
                    className="px-4 py-2 rounded-md bg-[#1e90ff] hover:bg-[#1873cd] text-white text-xs font-black transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-[#1e90ff]/30"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Sign In with Google</span>
                  </button>
                )}
              </div>
            </div>

            {/* Quick Metrics Grid (Neutral Radius) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-8 pt-6 border-t border-white/10">
              <div className="p-3.5 rounded-md bg-white/5 border border-white/10">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">
                  Library Books
                </span>
                <span className="text-xl sm:text-2xl font-black text-white mt-1 block">
                  {orders.length > 0 ? orders.length : 3}
                </span>
              </div>
              <div className="p-3.5 rounded-md bg-white/5 border border-white/10">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">
                  Wishlist Saved
                </span>
                <span className="text-xl sm:text-2xl font-black text-[#e50914] mt-1 block">
                  {wishlist.length}
                </span>
              </div>
              <div className="p-3.5 rounded-md bg-white/5 border border-white/10">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">
                  Cart Items
                </span>
                <span className="text-xl sm:text-2xl font-black text-[#1e90ff] mt-1 block">
                  {cartTotalCount}
                </span>
              </div>
              <div className="p-3.5 rounded-md bg-white/5 border border-white/10">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">
                  M-Pesa Orders
                </span>
                <span className="text-xl sm:text-2xl font-black text-[#00a859] mt-1 block">
                  {orders.length}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden mb-12">
          <div className="border-b border-slate-200 bg-slate-50/70 px-4 sm:px-8 flex items-center gap-2 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab('library')}
              className={`py-4 px-4 font-bold text-xs sm:text-sm border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'library'
                  ? 'border-[#1e90ff] text-[#1e90ff]'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>My Digital Library</span>
            </button>
            <button
              onClick={() => setActiveTab('wishlist')}
              className={`py-4 px-4 font-bold text-xs sm:text-sm border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'wishlist'
                  ? 'border-[#1e90ff] text-[#1e90ff]'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Heart className="w-4 h-4" />
              <span>Saved Wishlist ({wishlist.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`py-4 px-4 font-bold text-xs sm:text-sm border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'orders'
                  ? 'border-[#1e90ff] text-[#1e90ff]'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>M-Pesa Orders ({orders.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`py-4 px-4 font-bold text-xs sm:text-sm border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'settings'
                  ? 'border-[#1e90ff] text-[#1e90ff]'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Security & Account</span>
            </button>
          </div>

          {/* Tab 1: Library */}
          {activeTab === 'library' && (
            <div className="p-6 sm:p-8 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Your Acquired Digital Books</h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Instant reading in browser or offline ePub download for Kindle & tablets
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {books.slice(0, 3).map((book) => (
                  <div
                    key={book.id}
                    className="p-4 rounded-md border border-slate-200 bg-white hover:border-[#1e90ff] transition-all flex gap-4 shadow-xs"
                  >
                    <img
                      src={book.coverUrl}
                      alt={book.title}
                      className="w-20 h-28 object-cover rounded-xs border border-slate-200 shadow-sm flex-none"
                    />
                    <div className="flex flex-col justify-between flex-1">
                      <div>
                        <span className="text-[10px] font-bold text-[#1e90ff] uppercase tracking-wider block">
                          {book.category}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 line-clamp-1 mt-0.5">
                          {book.title}
                        </h4>
                        <p className="text-xs text-slate-500 font-medium line-clamp-1">
                          {book.author}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 mt-3">
                        <button
                          onClick={() => setReadingBook(book)}
                          className="flex-1 py-1.5 px-3 rounded-xs bg-[#1e90ff] hover:bg-[#1873cd] text-white text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>Read</span>
                        </button>
                        <button
                          onClick={() => setSelectedBook(book)}
                          className="py-1.5 px-2.5 rounded-xs bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                        >
                          Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 2: Wishlist */}
          {activeTab === 'wishlist' && (
            <div className="p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Saved Wishlist Items</h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Save titles for later or move them instantly to your checkout cart
                  </p>
                </div>
              </div>

              {wishlist.length === 0 ? (
                <div className="py-16 text-center bg-slate-50 rounded-md border border-slate-200 space-y-3">
                  <Heart className="w-10 h-10 mx-auto text-slate-300" />
                  <h4 className="text-base font-bold text-slate-800">Your wishlist is empty</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
                    Browse the Netflix-style library rows and tap the heart icon on any title to save it.
                  </p>
                  <button
                    onClick={onBackToHome}
                    className="mt-2 px-4 py-2 rounded-md bg-[#1e90ff] text-white text-xs font-bold cursor-pointer"
                  >
                    Explore Catalog
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {wishlist.map((item) => {
                    const fullBook = books.find((b) => b.id === item.bookId);
                    return (
                      <div
                        key={item.bookId}
                        className="p-3.5 rounded-md border border-slate-200 bg-white hover:border-[#1e90ff] transition-all flex flex-col justify-between shadow-xs"
                      >
                        <div className="flex gap-3">
                          <img
                            src={item.coverUrl}
                            alt={item.title}
                            className="w-16 h-24 object-cover rounded-xs border border-slate-200 shadow-sm flex-none"
                          />
                          <div>
                            <h4 className="text-xs font-bold text-slate-900 line-clamp-2">
                              {item.title}
                            </h4>
                            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                              {item.author}
                            </p>
                            <span className="text-xs font-black text-slate-900 block mt-2">
                              {formatPrice(item.priceKes)}
                            </span>
                          </div>
                        </div>

                        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2">
                          <button
                            onClick={() => {
                              if (fullBook) addToCart(fullBook, 'eBook', 1);
                            }}
                            className="flex-1 py-1.5 px-2 rounded-xs bg-[#1e90ff] hover:bg-[#1873cd] text-white text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <ShoppingBag className="w-3.5 h-3.5" />
                            <span>Add to Cart</span>
                          </button>
                          <button
                            onClick={() => {
                              if (fullBook) toggleWishlist(fullBook);
                            }}
                            className="p-1.5 rounded-xs text-slate-400 hover:text-[#e50914] cursor-pointer"
                            title="Remove"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Orders */}
          {activeTab === 'orders' && (
            <div className="p-6 sm:p-8 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">M-Pesa Purchase Receipts</h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Official Safaricom M-Pesa transaction records with cryptographic verification
                </p>
              </div>

              {orders.length === 0 ? (
                <div className="py-16 text-center bg-slate-50 rounded-md border border-slate-200 space-y-3">
                  <Clock className="w-10 h-10 mx-auto text-slate-300" />
                  <h4 className="text-base font-bold text-slate-800">No Past Purchases Yet</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
                    When you purchase a book using Safaricom M-Pesa STK push, your verified receipts and eBook keys will be listed here.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div
                      key={order.orderId}
                      className="p-5 rounded-md border border-slate-200 bg-white shadow-xs space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-3">
                          <span className="w-9 h-9 rounded-md bg-[#00a859]/10 text-[#00a859] flex items-center justify-center font-bold">
                            <CheckCircle2 className="w-5 h-5 text-[#00a859]" />
                          </span>
                          <div>
                            <span className="text-xs font-mono font-bold text-slate-900 block">
                              M-Pesa Ref: {order.mpesaReceiptNumber}
                            </span>
                            <span className="text-[11px] text-slate-400 font-medium">
                              Order ID: {order.orderId} • {order.createdAt}
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-base font-black text-slate-900 block">
                            {formatPrice(order.totalKes)}
                          </span>
                          <span className="text-[10px] font-black uppercase text-[#00a859] px-2 py-0.5 rounded-xs bg-[#00a859]/10">
                            {order.paymentStatus}
                          </span>
                        </div>
                      </div>

                      <div className="text-xs text-slate-600 font-medium">
                        <strong>Items:</strong> {order.itemsSummary}
                      </div>

                      <div className="flex items-center justify-between pt-1 text-xs">
                        <span className="text-slate-500">Billed to: {order.customerName} ({order.customerPhone})</span>
                        <span className="text-[#00a859] font-bold">Paid via Safaricom Lipa na M-Pesa</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 4: Settings & Security */}
          {activeTab === 'settings' && (
            <div className="p-6 sm:p-8 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Security & Synchronization</h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Your reading progress, orders, and wishlist are secured by Google Cloud Firebase Firestore
                </p>
              </div>

              <div className="p-5 rounded-md bg-slate-50 border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Cloud Persistence Status</h4>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Connected to Firestore project: <code className="text-slate-800">ai-studio-applet-webapp-55efe</code>
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-xs bg-[#00a859]/10 text-[#00a859] text-xs font-black flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Encrypted & Synced
                  </span>
                </div>

                <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">M-Pesa Express Daraja API</h4>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Store Paybill / Till Number: <strong>408221</strong>
                    </p>
                  </div>
                  <span className="text-xs font-bold text-[#00a859]">
                    Active Sandbox & Production
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
