import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Star, 
  Heart, 
  ShoppingCart, 
  Zap, 
  BookOpen, 
  Headphones, 
  Check, 
  ChevronDown, 
  User, 
  Send, 
  Sparkles, 
  Percent, 
  Layers, 
  Award,
  ChevronRight,
  ShieldCheck,
  Share2
} from 'lucide-react';
import { Book, BookFormat, Review } from '../types/book';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { BookCard } from './BookCard';

export const BookDetailPage: React.FC = () => {
  const { 
    selectedBook, 
    setSelectedBook, 
    setReadingBook, 
    toggleWishlist, 
    isInWishlist, 
    addToCart, 
    setIsCheckoutOpen,
    formatPrice,
    books,
    reviewsByBook,
    loadBookReviews,
    submitReview,
    showToast,
    playAudioBook
  } = useStore();

  const { user } = useAuth();

  const [selectedFormat, setSelectedFormat] = useState<BookFormat>('eBook');
  const [expandedChapter, setExpandedChapter] = useState<number | null>(1);
  const [activeTab, setActiveTab] = useState<'overview' | 'toc' | 'author' | 'reviews'>('overview');

  // Review Form state
  const [newRating, setNewRating] = useState(5);
  const [newTitle, setNewTitle] = useState('');
  const [newComment, setNewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    if (selectedBook) {
      loadBookReviews(selectedBook.id);
      setSelectedFormat(selectedBook.formats[0] || 'eBook');
      setExpandedChapter(1);
      setActiveTab('overview');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [selectedBook?.id]);

  if (!selectedBook) return null;

  const isFavorited = isInWishlist(selectedBook.id);
  const currentReviews = reviewsByBook[selectedBook.id] || [];

  // Recommendations: books with same category or matching tags
  const recommendations = books
    .filter((b) => b.id !== selectedBook.id)
    .map((b) => {
      let score = 0;
      if (b.category === selectedBook.category) score += 40;
      if (b.subcategory === selectedBook.subcategory) score += 35;
      const commonTags = b.tags.filter((t) => selectedBook.tags.includes(t));
      score += commonTags.length * 10;
      return { book: b, matchPercent: Math.min(99, 60 + score) };
    })
    .sort((a, b) => b.matchPercent - a.matchPercent)
    .slice(0, 6);

  const handleQuickMpesaBuy = async () => {
    await addToCart(selectedBook, selectedFormat, 1);
    setIsCheckoutOpen(true);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setIsSubmittingReview(true);
    await submitReview(selectedBook.id, newRating, newComment, newTitle);
    setNewTitle('');
    setNewComment('');
    setIsSubmittingReview(false);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Book link copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 animate-in fade-in duration-200">
      {/* Top Breadcrumb & Return Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-16 sm:top-18 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-3.5 flex items-center justify-between gap-4">
          <button
            onClick={() => setSelectedBook(null)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 text-xs sm:text-sm font-bold transition-all cursor-pointer border border-slate-300"
            aria-label="Back to book catalog"
          >
            <ArrowLeft className="w-4 h-4 text-[#1e90ff]" />
            <span>Back to Browse</span>
          </button>

          <nav aria-label="Breadcrumb" className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-500 overflow-hidden text-ellipsis whitespace-nowrap">
            <button 
              onClick={() => setSelectedBook(null)} 
              className="hover:text-[#1e90ff] cursor-pointer"
            >
              Midusa Catalog
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-700">{selectedBook.category}</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[#1e90ff] font-bold truncate max-w-[200px]">{selectedBook.title}</span>
          </nav>

          <button
            onClick={handleShare}
            className="p-2 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
            title="Share Book"
            aria-label="Share Book Link"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Page Showcase */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-8 pb-12">
        {/* Achieng Liquid Glass Hero Showcase Card */}
        <section 
          aria-label="Book information hero"
          className="relative rounded-lg bg-[#0b1325] text-white border border-slate-800 shadow-2xl overflow-hidden mb-12"
        >
          {/* Specular Liquid Glass Top Sheen & Subtle Ambient Glow */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#e50914] via-[#1e90ff] to-[#00a859]" />
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#1e90ff]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#00a859]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="p-6 sm:p-8 md:p-12 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-start">
              {/* Left Column: Tactile Book Cover with Specular Edge */}
              <div className="md:col-span-5 lg:col-span-4 flex flex-col items-center">
                <div className="relative w-56 sm:w-64 md:w-full max-w-[280px] aspect-[2/3] rounded-md overflow-hidden bg-slate-950 border border-white/20 p-1.5 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                  <img
                    src={selectedBook.coverUrl}
                    alt={selectedBook.title}
                    className="w-full h-full object-cover rounded-xs"
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-black/60 via-transparent to-white/10 pointer-events-none rounded-xs" />

                  {selectedBook.discountPercent && (
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-xs text-xs font-black bg-[#e50914] text-white shadow-lg tracking-wider">
                      -{selectedBook.discountPercent}% OFF
                    </span>
                  )}

                  {selectedBook.rank && (
                    <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded-xs text-xs font-black bg-[#1e90ff] text-white shadow-lg flex items-center gap-1">
                      <Sparkles className="w-3 h-3 fill-current" />
                      TOP #{selectedBook.rank} TODAY
                    </span>
                  )}
                </div>

                {/* Available Formats Selector (Neutral Radius) */}
                <div className="w-full max-w-[280px] mt-4 p-1.5 rounded-md bg-white/5 border border-white/10 flex items-center gap-1">
                  {selectedBook.formats.map((fmt) => {
                    const isSelected = selectedFormat === fmt;
                    return (
                      <button
                        key={fmt}
                        onClick={() => setSelectedFormat(fmt)}
                        className={`flex-1 py-2 px-2 rounded-xs text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#1e90ff] text-white shadow-md'
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        {fmt === 'Audiobook' && <Headphones className="w-3.5 h-3.5" />}
                        {fmt === 'eBook' && <BookOpen className="w-3.5 h-3.5" />}
                        <span>{fmt}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Sample Reader Trigger */}
                {selectedBook.sampleExcerpt && (
                  <button
                    onClick={() => setReadingBook(selectedBook)}
                    className="w-full max-w-[280px] mt-3 py-2.5 px-4 rounded-md bg-white/10 hover:bg-white/15 text-white text-xs font-bold border border-white/20 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <BookOpen className="w-4 h-4 text-[#1e90ff]" />
                    <span>Read Sample Excerpt (Free)</span>
                  </button>
                )}

                {/* Audiobook Player Trigger */}
                {selectedBook.formats.includes('Audiobook') && (
                  <button
                    onClick={() => playAudioBook(selectedBook)}
                    className="w-full max-w-[280px] mt-2 py-2.5 px-4 rounded-md bg-[#e50914] hover:bg-[#f40612] text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#e50914]/25"
                  >
                    <Headphones className="w-4 h-4" />
                    <span>Listen to Audiobook Sample</span>
                  </button>
                )}
              </div>

              {/* Right Column: Title, Metadata, Pricing, Actions */}
              <div className="md:col-span-7 lg:col-span-8 flex flex-col justify-between">
                <div>
                  {/* Category Pills & Rating */}
                  <div className="flex flex-wrap items-center gap-2.5 mb-3">
                    <span className="px-2.5 py-1 rounded-xs bg-[#1e90ff]/20 text-[#1e90ff] text-xs font-black uppercase tracking-wider border border-[#1e90ff]/30">
                      {selectedBook.category}
                    </span>
                    <span className="px-2.5 py-1 rounded-xs bg-white/10 text-slate-300 text-xs font-bold uppercase tracking-wider border border-white/10">
                      {selectedBook.subcategory}
                    </span>
                    <div className="flex items-center gap-1 ml-auto text-amber-400 text-sm font-black">
                      <Star className="w-4 h-4 fill-amber-400" />
                      <span>{selectedBook.rating.toFixed(1)}</span>
                      <span className="text-xs text-slate-400 font-medium">({selectedBook.reviewsCount} verified reviews)</span>
                    </div>
                  </div>

                  {/* Main Title & Subtitle */}
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
                    {selectedBook.title}
                  </h1>
                  {selectedBook.subtitle && (
                    <p className="text-sm sm:text-base text-slate-300 mt-2 font-medium leading-relaxed">
                      {selectedBook.subtitle}
                    </p>
                  )}

                  {/* Author Line */}
                  <div className="mt-3 flex items-center gap-2 text-sm text-slate-300 font-semibold">
                    <span>By</span>
                    <span className="text-[#1e90ff] font-bold">{selectedBook.author}</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-400">{selectedBook.pages} pages</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-400">{selectedBook.publishedYear}</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-400">{selectedBook.language}</span>
                  </div>

                  {/* Pricing Display */}
                  <div className="mt-6 p-4 rounded-md bg-white/5 border border-white/10 flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Format: <span className="text-white">{selectedFormat}</span> Edition
                      </div>
                      <div className="flex items-baseline gap-3">
                        <span className="text-2xl sm:text-3xl font-black text-white">
                          {formatPrice(selectedBook.priceKes)}
                        </span>
                        {selectedBook.originalPriceKes && (
                          <span className="text-sm sm:text-base text-slate-400 line-through">
                            {formatPrice(selectedBook.originalPriceKes)}
                          </span>
                        )}
                        {selectedBook.discountPercent && (
                          <span className="px-2 py-0.5 rounded-xs text-xs font-black bg-[#e50914] text-white">
                            SAVE {selectedBook.discountPercent}%
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-[#00a859] font-bold">
                      <ShieldCheck className="w-4 h-4 text-[#00a859]" />
                      <span>Instant Digital Delivery via Safaricom M-Pesa</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    {/* Primary M-Pesa Buy */}
                    <button
                      onClick={handleQuickMpesaBuy}
                      className="flex-1 min-w-[200px] py-3.5 px-6 rounded-md bg-[#00a859] hover:bg-[#00924d] text-white font-black text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-xl shadow-[#00a859]/30 transition-all active:scale-[0.98] cursor-pointer"
                    >
                      <Zap className="w-5 h-5 fill-current" />
                      <span>Buy Now with M-Pesa ({formatPrice(selectedBook.priceKes)})</span>
                    </button>

                    {/* Add to Cart */}
                    <button
                      onClick={() => addToCart(selectedBook, selectedFormat, 1)}
                      className="py-3.5 px-5 rounded-md bg-[#1e90ff] hover:bg-[#1873cd] text-white font-bold text-sm sm:text-base flex items-center gap-2 shadow-lg shadow-[#1e90ff]/25 transition-all cursor-pointer"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      <span>Add to Cart</span>
                    </button>

                    {/* Wishlist Toggle */}
                    <button
                      onClick={() => toggleWishlist(selectedBook)}
                      className={`p-3.5 rounded-md border transition-all cursor-pointer ${
                        isFavorited
                          ? 'bg-[#e50914] border-[#e50914] text-white'
                          : 'bg-white/10 border-white/20 text-slate-300 hover:text-white hover:bg-white/15'
                      }`}
                      aria-label={isFavorited ? 'Remove from wishlist' : 'Save to wishlist'}
                      title={isFavorited ? 'Remove from Wishlist' : 'Add to Wishlist'}
                    >
                      <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  {/* Tags */}
                  <div className="mt-6 flex flex-wrap items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-400 mr-1.5">Tags:</span>
                    {selectedBook.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded-xs bg-white/5 border border-white/10 text-slate-300 text-xs font-medium"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Detailed Tabs Section */}
        <section 
          aria-label="Book details and reader reviews"
          className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden mb-12"
        >
          {/* Tabs Navigation Header */}
          <div className="border-b border-slate-200 bg-slate-50/70 px-4 sm:px-8 flex items-center gap-2 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-4 font-bold text-xs sm:text-sm border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'border-[#1e90ff] text-[#1e90ff]'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              Synopsis & Overview
            </button>
            <button
              onClick={() => setActiveTab('toc')}
              className={`py-4 px-4 font-bold text-xs sm:text-sm border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'toc'
                  ? 'border-[#1e90ff] text-[#1e90ff]'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <span>Table of Contents</span>
              <span className="px-1.5 py-0.5 rounded-xs bg-slate-200 text-slate-700 text-[11px] font-bold">
                {selectedBook.tableOfContents.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('author')}
              className={`py-4 px-4 font-bold text-xs sm:text-sm border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'author'
                  ? 'border-[#1e90ff] text-[#1e90ff]'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              Author Biography
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`py-4 px-4 font-bold text-xs sm:text-sm border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'reviews'
                  ? 'border-[#1e90ff] text-[#1e90ff]'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <span>Reader Reviews</span>
              <span className="px-1.5 py-0.5 rounded-xs bg-[#1e90ff]/10 text-[#1e90ff] text-[11px] font-bold">
                {currentReviews.length}
              </span>
            </button>
          </div>

          {/* Tab 1: Overview */}
          {activeTab === 'overview' && (
            <div className="p-6 sm:p-8 md:p-10 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-3">Book Description</h3>
                <p className="text-slate-700 text-sm sm:text-base leading-relaxed whitespace-pre-line font-medium">
                  {selectedBook.description}
                </p>
              </div>

              {selectedBook.sampleExcerpt && (
                <div className="p-5 rounded-md bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-[#1e90ff] uppercase tracking-wider">
                      Excerpt Highlight
                    </span>
                    <button
                      onClick={() => setReadingBook(selectedBook)}
                      className="text-xs font-bold text-[#1e90ff] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>Open Full Reader</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 italic leading-relaxed line-clamp-3">
                    "{selectedBook.sampleExcerpt.slice(0, 320)}..."
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Table of Contents */}
          {activeTab === 'toc' && (
            <div className="p-6 sm:p-8 md:p-10 space-y-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-bold text-slate-900">
                  Chapters & Curated Sections
                </h3>
                <span className="text-xs text-slate-500 font-medium">
                  {selectedBook.pages} total estimated pages
                </span>
              </div>

              <div className="space-y-2">
                {selectedBook.tableOfContents.map((ch) => {
                  const isExpanded = expandedChapter === ch.chapterNumber;
                  return (
                    <div
                      key={ch.chapterNumber}
                      className="rounded-md border border-slate-200 overflow-hidden bg-slate-50/50"
                    >
                      <button
                        onClick={() => setExpandedChapter(isExpanded ? null : ch.chapterNumber)}
                        className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-100/70 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-7 h-7 rounded-xs bg-[#1e90ff]/10 text-[#1e90ff] font-bold text-xs flex items-center justify-center border border-[#1e90ff]/20">
                            {ch.chapterNumber}
                          </span>
                          <span className="text-sm font-bold text-slate-900">
                            {ch.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500 font-semibold">
                          <span>Chapter {ch.chapterNumber}</span>
                          <ChevronDown
                            className={`w-4 h-4 transition-transform duration-200 ${
                              isExpanded ? 'rotate-180 text-[#1e90ff]' : ''
                            }`}
                          />
                        </div>
                      </button>

                      {isExpanded && ch.previewExcerpt && (
                        <div className="p-4 pt-1 border-t border-slate-200 bg-white text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                          {ch.previewExcerpt}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab 3: Author Biography */}
          {activeTab === 'author' && (
            <div className="p-6 sm:p-8 md:p-10 space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pb-6 border-b border-slate-200">
                <div className="w-16 h-16 rounded-md bg-[#1e90ff]/10 border border-[#1e90ff]/20 flex items-center justify-center text-[#1e90ff] font-bold text-xl">
                  {selectedBook.author.split(' ').map((n) => n[0]).join('')}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{selectedBook.author}</h3>
                  <p className="text-xs font-semibold text-[#1e90ff]">
                    Distinguished Scholar & Author
                  </p>
                </div>
              </div>

              <div className="text-sm sm:text-base text-slate-700 leading-relaxed font-medium">
                {selectedBook.authorBio}
              </div>
            </div>
          )}

          {/* Tab 4: Reviews */}
          {activeTab === 'reviews' && (
            <div className="p-6 sm:p-8 md:p-10 space-y-8">
              {/* Write a Review Section */}
              <div className="p-5 rounded-md bg-slate-50 border border-slate-200">
                <h4 className="text-sm font-bold text-slate-900 mb-2">Write a Reader Review</h4>
                <form onSubmit={handleReviewSubmit} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-600">Your Rating:</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setNewRating(s)}
                          className="p-1 text-amber-400 hover:scale-110 transition-transform cursor-pointer"
                        >
                          <Star
                            className={`w-4 h-4 ${
                              s <= newRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Review headline (optional)"
                    className="w-full px-3 py-2 text-xs rounded-xs border border-slate-300 bg-white focus:border-[#1e90ff] focus:outline-hidden"
                  />

                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    required
                    placeholder="Share your feedback, key takeaways, and thoughts on this book..."
                    rows={3}
                    className="w-full px-3 py-2 text-xs rounded-xs border border-slate-300 bg-white focus:border-[#1e90ff] focus:outline-hidden"
                  />

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isSubmittingReview || !newComment.trim()}
                      className="px-4 py-2 rounded-xs bg-[#1e90ff] hover:bg-[#1873cd] disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isSubmittingReview ? 'Publishing...' : 'Submit Review'}</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Reviews List */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-900">
                  Community Reviews ({currentReviews.length})
                </h4>

                {currentReviews.length === 0 ? (
                  <p className="text-xs text-slate-500 font-medium">
                    No reviews yet. Be the first reader to share your insights!
                  </p>
                ) : (
                  currentReviews.map((rev) => (
                    <div
                      key={rev.reviewId}
                      className="p-4 rounded-md border border-slate-200 bg-slate-50/50 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#1e90ff]/10 text-[#1e90ff] font-bold text-xs flex items-center justify-center">
                            {rev.userName[0]}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-900 block">
                              {rev.userName}
                            </span>
                            <span className="text-[11px] text-slate-400 font-medium">
                              {rev.createdAt}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 text-amber-400">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${
                                i < rev.rating
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-slate-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      {rev.title && (
                        <h5 className="text-xs font-bold text-slate-900">{rev.title}</h5>
                      )}
                      <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                        {rev.comment}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </section>

        {/* Netflix-style "What to Pick Next" Recommendations Row */}
        <section aria-label="Book recommendations">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
                <span>What to Pick Next</span>
                <span className="text-xs font-bold text-[#1e90ff] px-2 py-0.5 rounded-xs bg-[#1e90ff]/10 border border-[#1e90ff]/20">
                  Recommended For You
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
                Readers who enjoyed <strong className="text-slate-700">{selectedBook.title}</strong> also acquired these titles
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
            {recommendations.map(({ book, matchPercent }) => (
              <div key={book.id} className="relative group">
                <BookCard book={book} isGrid />
                <div className="absolute top-2 left-2 z-20 pointer-events-none">
                  <span className="px-1.5 py-0.5 rounded-xs text-[10px] font-black bg-[#00a859] text-white shadow-md">
                    {matchPercent}% Match
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
