/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { AuthProvider } from './context/AuthContext';
import { StoreProvider, useStore } from './context/StoreContext';
import { Navbar } from './components/Navbar';
import { HeroBillboard } from './components/HeroBillboard';
import { FilterBar } from './components/FilterBar';
import { NetflixRow } from './components/NetflixRow';
import { Top10Row } from './components/Top10Row';
import { BookCard } from './components/BookCard';
import { BookDetailPage } from './components/BookDetailPage';
import { UserProfilePage } from './components/UserProfilePage';
import { CheckoutPage } from './components/CheckoutPage';
import { SampleReaderModal } from './components/SampleReaderModal';
import { CartDrawer } from './components/CartDrawer';
import { WishlistModal } from './components/WishlistModal';
import { OrdersModal } from './components/OrdersModal';
import { AudiobookPlayerModal } from './components/AudiobookPlayerModal';
import { 
  BookMarked, 
  ShieldCheck, 
  Smartphone, 
  Zap, 
  ArrowRight,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Home
} from 'lucide-react';

const ITEMS_PER_PAGE = 12;

const BookstoreContent: React.FC = () => {
  const { 
    books, 
    filteredBooks, 
    searchQuery, 
    selectedCategory, 
    selectedSubcategory, 
    onlyDiscounts, 
    formatFilter, 
    minRating, 
    sortBy,
    setSelectedCategory,
    setSelectedSubcategory,
    setSearchQuery,
    setOnlyDiscounts,
    resetFilters,
    selectedBook,
    setSelectedBook,
    setReadingBook,
    cart,
    cartTotalKes,
    formatPrice,
    isCheckoutOpen,
    setIsCheckoutOpen,
    setIsCartOpen,
    toastMessage
  } = useStore();

  const [currentView, setCurrentView] = useState<'catalog' | 'profile'>('catalog');
  const [isWishlistModalOpen, setIsWishlistModalOpen] = useState(false);
  const [isOrdersModalOpen, setIsOrdersModalOpen] = useState(false);

  // Pagination for catalog search and filters
  const [currentPage, setCurrentPage] = useState(1);

  // Check if user has active filters that should display search grid rather than homepage carousels
  const isFiltering = 
    Boolean(searchQuery.trim()) || 
    Boolean(selectedCategory) || 
    Boolean(selectedSubcategory) || 
    onlyDiscounts || 
    Boolean(formatFilter) || 
    minRating > 0 || 
    sortBy !== 'featured';

  // Reset pagination to page 1 whenever search or filter params change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchQuery, 
    selectedCategory, 
    selectedSubcategory, 
    onlyDiscounts, 
    formatFilter, 
    minRating, 
    sortBy
  ]);

  // Paginated books for grid view
  const totalPages = Math.ceil(filteredBooks.length / ITEMS_PER_PAGE) || 1;
  const paginatedBooks = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredBooks.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredBooks, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    document.getElementById('catalog-grid')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Row partitions for Netflix layout (Miller's Law 5-9 items per chunk)
  const top10Books = books.filter((b) => b.rank && b.rank <= 10).sort((a, b) => (a.rank || 0) - (b.rank || 0));
  const achiengPicks = books.filter((b) => b.id === 'mpesa-revolution' || b.id === 'silicon-horizons' || b.id === 'liquid-glass-design' || b.id === 'sons-of-the-savannah');
  const fictionBooks = books.filter((b) => b.category === 'Fiction');
  const techBooks = books.filter((b) => b.category === 'Non-Fiction & Tech');
  const academicBooks = books.filter((b) => b.category === 'Academic & Professional');
  const wellnessBooks = books.filter((b) => b.category === 'Wellness & Personal Growth');
  const discountedBooks = books.filter((b) => b.discountPercent && b.discountPercent >= 25);
  const audioBooks = books.filter((b) => b.formats.includes('Audiobook'));

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleOpenProfile = () => {
    setSelectedBook(null);
    setIsCheckoutOpen(false);
    setCurrentView('profile');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToHome = () => {
    setSelectedBook(null);
    setIsCheckoutOpen(false);
    setCurrentView('catalog');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col selection:bg-[#1e90ff]/25 selection:text-[#1e90ff]">
      {/* Toast Notification (Neutral Radius) */}
      {toastMessage && (
        <div 
          role="status" 
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-md bg-slate-900 border border-slate-700 shadow-2xl flex items-center gap-2.5 text-xs font-bold text-white animate-in slide-in-from-bottom-3 duration-150"
        >
          <div className="w-2 h-2 rounded-xs bg-[#1e90ff] animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Dominating Search Navigation Bar (Accessible modern icons & Shopping Cart) */}
      <Navbar 
        onOpenWishlist={() => setIsWishlistModalOpen(true)}
        onOpenOrders={() => setIsOrdersModalOpen(true)}
        onOpenProfile={handleOpenProfile}
      />

      {/* Primary Page Content: Checkout Page OR Book Detail Page OR Profile Page OR Main Catalog */}
      {isCheckoutOpen ? (
        /* Dedicated Full-Page Checkout (No Popup Modal!) */
        <main className="flex-1">
          <CheckoutPage 
            onBackToCart={() => {
              setIsCheckoutOpen(false);
              setIsCartOpen(true);
            }}
            onBackToHome={handleBackToHome}
            onOpenReader={(bookId) => {
              const target = books.find((b) => b.id === bookId);
              if (target) setReadingBook(target);
              setIsCheckoutOpen(false);
            }}
          />
        </main>
      ) : selectedBook ? (
        /* Dedicated Full-Page Book Detail (No Popup Modal!) */
        <main className="flex-1">
          <BookDetailPage />
        </main>
      ) : currentView === 'profile' ? (
        /* Dedicated Full-Page User Profile (No Popup Modal!) */
        <main className="flex-1">
          <UserProfilePage 
            onBackToHome={handleBackToHome}
            onOpenCheckout={() => {
              setIsCheckoutOpen(true);
            }}
          />
        </main>
      ) : (
        /* Netflix-Style Bookstore Catalog */
        <main className="flex-1 pb-16">
          {/* Netflix Billboard Spotlight (Hidden when searching or filtering) */}
          {!isFiltering && <HeroBillboard />}

          {/* Categories Bar */}
          <div id="categories-section" className="relative z-20">
            <FilterBar />
          </div>

          {/* View Mode: Filtered Grid with Breadcrumbs & Pagination vs Netflix Multi-Row Carousels */}
          {isFiltering ? (
            <div id="catalog-grid" className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6">
              {/* Breadcrumb Trail for Catalog Filtering */}
              <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-2 text-xs font-bold text-slate-600">
                <button 
                  onClick={resetFilters}
                  className="flex items-center gap-1 hover:text-[#1e90ff] transition-colors cursor-pointer"
                >
                  <Home className="w-3.5 h-3.5" />
                  <span>Home</span>
                </button>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                {selectedCategory ? (
                  <>
                    <button 
                      onClick={() => setSelectedSubcategory(null)}
                      className="hover:text-[#1e90ff] cursor-pointer"
                    >
                      {selectedCategory}
                    </button>
                    {selectedSubcategory && (
                      <>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-[#1e90ff] font-bold">{selectedSubcategory}</span>
                      </>
                    )}
                  </>
                ) : searchQuery ? (
                  <span className="text-[#1e90ff] font-bold">Search results for "{searchQuery}"</span>
                ) : onlyDiscounts ? (
                  <span className="text-[#1e90ff] font-bold">Special Discount Offers</span>
                ) : (
                  <span className="text-[#1e90ff] font-bold">Filtered Catalog</span>
                )}
              </nav>

              {/* Header with Title and Clear Button */}
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <span>Catalog Results</span>
                    <span className="text-xs font-semibold text-slate-600">
                      ({filteredBooks.length} titles found)
                    </span>
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 mt-0.5 font-medium">
                    Showing {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filteredBooks.length)}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredBooks.length)} of {filteredBooks.length} titles
                  </p>
                </div>

                <button
                  onClick={resetFilters}
                  className="px-3 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-slate-200"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-[#1e90ff]" />
                  <span>Reset Filters</span>
                </button>
              </div>

              {filteredBooks.length === 0 ? (
                <div className="py-20 text-center bg-slate-50 rounded-md p-8 border border-slate-200 space-y-3">
                  <div className="w-14 h-14 mx-auto rounded-md bg-white flex items-center justify-center text-slate-400 border border-slate-200 shadow-xs">
                    <BookMarked className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">No Books Matched Your Filters</h3>
                  <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto font-medium">
                    Try clearing some filter criteria, broadening your search query, or resetting the price range.
                  </p>
                  <button
                    onClick={resetFilters}
                    className="mt-2 px-4 py-2 rounded-md bg-[#1e90ff] text-white text-xs font-bold cursor-pointer"
                  >
                    Clear All Filters
                  </button>
                </div>
              ) : (
                <>
                  {/* Card Grid with Increased Width & Presence */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5 sm:gap-5">
                    {paginatedBooks.map((book) => (
                      <BookCard key={book.id} book={book} isGrid />
                    ))}
                  </div>

                  {/* Accessible Pagination (Miller's Law Chunking) */}
                  {totalPages > 1 && (
                    <div className="mt-10 pt-6 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
                      <div className="text-xs text-slate-700 font-bold">
                        Page <strong className="text-slate-900">{currentPage}</strong> of <strong className="text-slate-900">{totalPages}</strong>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {/* Previous Button */}
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="px-3 py-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold text-slate-700 flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                          aria-label="Previous page"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                          <span>Previous</span>
                        </button>

                        {/* Page Numbers */}
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                          const isActive = page === currentPage;
                          return (
                            <button
                              key={page}
                              onClick={() => handlePageChange(page)}
                              aria-current={isActive ? 'page' : undefined}
                              className={`w-8 h-8 rounded-md text-xs font-bold transition-all cursor-pointer ${
                                isActive
                                  ? 'bg-[#1e90ff] text-white shadow-sm'
                                  : 'bg-white hover:bg-slate-100 border border-slate-200 text-slate-700'
                              }`}
                            >
                              {page}
                            </button>
                          );
                        })}

                        {/* Next Button */}
                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="px-3 py-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold text-slate-700 flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                          aria-label="Next page"
                        >
                          <span>Next</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            /* Netflix Multi-Row Layout with Tightened Card Spacing */
            <div className="space-y-6 pt-2">
              {/* Row 1: Netflix Top 10 in Books Today */}
              <div id="top10-section">
                <Top10Row books={top10Books} />
              </div>

              {/* Row 2: Achieng Liquid Glass Curated Collection */}
              <NetflixRow
                title="Achieng's Liquid Glass Collection"
                subtitle="Handpicked African masterworks, fintech revelations, and tactile specular designs"
                books={achiengPicks}
              />

              {/* Row 3: Hot Discounts & Special Offers */}
              <NetflixRow
                title="Hot Discounts & Special Offers"
                subtitle="Save up to 50% on best-selling non-fiction, fiction, and tech guides"
                books={discountedBooks}
                onViewCategory={() => setOnlyDiscounts(true)}
              />

              {/* Row 4: Non-Fiction & Tech */}
              <NetflixRow
                title="Non-Fiction, AI & Distributed Tech"
                subtitle="Software architecture, agentic loops, and African venture models"
                books={techBooks}
                onViewCategory={() => setSelectedCategory('Non-Fiction & Tech')}
              />

              {/* Row 5: Fiction, Afro-futurism & Cyberpunk */}
              <NetflixRow
                title="Fiction, Afro-Futurism & Speculative Noir"
                subtitle="Visionary narratives spanning from the Great Rift to 2099 megacities"
                books={fictionBooks}
                onViewCategory={() => setSelectedCategory('Fiction')}
              />

              {/* Row 6: Academic & Professional */}
              <NetflixRow
                title="Academic, Economics & Financial Ledgers"
                subtitle="Groundbreaking research on the M-Pesa revolution and mathematical learning"
                books={academicBooks}
                onViewCategory={() => setSelectedCategory('Academic & Professional')}
              />

              {/* Row 7: Wellness & Personal Growth */}
              <NetflixRow
                title="Mindset, Stoicism & Wealth Mastery"
                subtitle="Timeless wisdom and tactical compounding in volatile markets"
                books={wellnessBooks}
                onViewCategory={() => setSelectedCategory('Wellness & Personal Growth')}
              />

              {/* Row 8: Narrated Audiobooks */}
              <NetflixRow
                title="Audiobook Excerpts & Studio Narrations"
                subtitle="Listen anywhere with professional voice actors and author commentary"
                books={audioBooks}
              />
            </div>
          )}
        </main>
      )}

      {/* Floating High-Accessibility Quick Purchase Bar (Visible when Cart has items, Not on checkout) */}
      {totalCartCount > 0 && !isCheckoutOpen && (
        <aside 
          aria-label="Floating quick checkout"
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 z-40"
        >
          <div className="flex items-center gap-2 p-2 rounded-md bg-slate-900 border border-slate-800 shadow-2xl">
            <button
              onClick={() => setIsCartOpen(true)}
              aria-label="View shopping cart items"
              className="px-3 py-2 rounded-md bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
            >
              <ShoppingCart className="w-3.5 h-3.5 text-[#1e90ff]" />
              <span>{totalCartCount} in Cart</span>
            </button>

            <button
              onClick={() => {
                setSelectedBook(null);
                setIsCheckoutOpen(true);
              }}
              aria-label={`Instant M-Pesa Checkout for ${formatPrice(cartTotalKes)}`}
              className="px-4 py-2 rounded-md bg-[#00a859] hover:bg-[#00924d] text-white text-xs sm:text-sm font-black flex items-center gap-2 shadow-lg shadow-[#00a859]/30 transition-transform active:scale-95 cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>Pay with M-Pesa ({formatPrice(cartTotalKes)})</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </aside>
      )}

      {/* Footer (White Theme with Neutral Radius) */}
      <footer className="border-t border-slate-200 bg-slate-50 py-12 px-4 sm:px-6 md:px-8 text-xs text-slate-600 font-medium">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-md bg-[#e50914] flex items-center justify-center text-white font-black text-lg">
                M
              </div>
              <span className="font-extrabold text-slate-900 text-base">Midusa eLibrary</span>
            </div>
            <p className="text-slate-600 leading-relaxed font-normal">
              Curated African and global literature, computer science architectures, and wealth strategies in a cinematic, minimalist digital reading environment. Designed with Achieng Liquid Glass Aesthetics.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-3 uppercase tracking-wider text-[11px]">
              Categories
            </h4>
            <ul className="space-y-2 font-medium text-slate-600">
              <li>
                <button
                  onClick={() => {
                    handleBackToHome();
                    setSelectedCategory('Fiction');
                  }}
                  className="hover:text-[#1e90ff] transition-colors cursor-pointer"
                >
                  Fiction & Afro-futurism
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    handleBackToHome();
                    setSelectedCategory('Non-Fiction & Tech');
                  }}
                  className="hover:text-[#1e90ff] transition-colors cursor-pointer"
                >
                  Software & Autonomous AI
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    handleBackToHome();
                    setSelectedCategory('Academic & Professional');
                  }}
                  className="hover:text-[#1e90ff] transition-colors cursor-pointer"
                >
                  Economics & M-Pesa Revolution
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    handleBackToHome();
                    setSelectedCategory('Wellness & Personal Growth');
                  }}
                  className="hover:text-[#1e90ff] transition-colors cursor-pointer"
                >
                  Mindset & Wealth Building
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-3 uppercase tracking-wider text-[11px]">
              Payments & M-Pesa
            </h4>
            <div className="space-y-2 text-slate-600 font-medium">
              <p>Instant STK Push via Safaricom Daraja 2.0</p>
              <p>Paybill / Buy Goods: <strong className="text-slate-900 font-mono">408221</strong></p>
              <div className="flex items-center gap-2 pt-1 text-[#00a859] font-bold">
                <ShieldCheck className="w-4 h-4 text-[#00a859]" />
                <span>Zero Transaction Fees on Digital Books</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-3 uppercase tracking-wider text-[11px]">
              Platform Architecture
            </h4>
            <div className="space-y-2 text-slate-600 font-medium">
              <p>React 19, Tailwind CSS & Firebase Firestore</p>
              <p>iPhone SF Typography & Achieng Liquid Glass</p>
              <p className="text-[#1e90ff] font-bold">Nairobi • Kigali • Lagos • London</p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Midusa eLibrary Inc. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-slate-600 font-semibold">
              <Smartphone className="w-3.5 h-3.5 text-[#00a859]" />
              Safaricom Lipa na M-Pesa Official Partner
            </span>
          </div>
        </div>
      </footer>

      {/* Interactive Drawers, Audiobooks, and Reader Modals */}
      <SampleReaderModal />
      <AudiobookPlayerModal />
      <CartDrawer />
      <WishlistModal 
        isOpen={isWishlistModalOpen} 
        onClose={() => setIsWishlistModalOpen(false)} 
      />
      <OrdersModal 
        isOpen={isOrdersModalOpen} 
        onClose={() => setIsOrdersModalOpen(false)} 
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <StoreProvider>
        <BookstoreContent />
      </StoreProvider>
    </AuthProvider>
  );
}
