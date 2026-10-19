import React, { useState, useEffect } from 'react';
import { 
  X, 
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
  Award
} from 'lucide-react';
import { Book, BookFormat, Review } from '../types/book';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';

export const BookDetailModal: React.FC = () => {
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
    submitReview
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
    }
  }, [selectedBook?.id]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedBook) {
        setSelectedBook(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedBook]);

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
    .slice(0, 4);

  const handleQuickMpesaBuy = async () => {
    await addToCart(selectedBook, selectedFormat, 1);
    setSelectedBook(null);
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

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-book-title"
    >
      {/* Achieng Liquid Glass Modal Container */}
      <div 
        className="relative w-full max-w-5xl my-auto rounded-lg bg-[#0c1424] border border-white/20 text-white shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Specular Liquid Glass Top Sheen */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#e50914] via-[#1e90ff] to-[#00a859]" />

        {/* Close Button */}
        <button
          onClick={() => setSelectedBook(null)}
          aria-label="Close book details modal"
          className="absolute top-4 right-4 z-30 p-2 rounded-md bg-black/60 hover:bg-black text-slate-300 hover:text-white border border-white/20 transition-all cursor-pointer shadow-md"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Top Banner & Hero Grid */}
        <div className="p-6 sm:p-8 md:p-10 border-b border-white/10 bg-gradient-to-b from-white/10 via-white/5 to-transparent">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-start">
            {/* Book Cover with Achieng Liquid Glass 3D Depth */}
            <div className="md:col-span-4 flex flex-col items-center">
              <div className="relative w-48 sm:w-56 aspect-[2/3] rounded-md overflow-hidden bg-slate-900 border border-white/20 p-1 shadow-2xl">
                <img
                  src={selectedBook.coverUrl}
                  alt={selectedBook.title}
                  className="w-full h-full object-cover rounded-xs"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-black/50 via-transparent to-white/10 pointer-events-none rounded-xs" />

                {selectedBook.discountPercent && (
                  <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-xs text-xs font-black bg-[#e50914] text-white shadow-md">
                    -{selectedBook.discountPercent}% OFF
                  </span>
                )}
              </div>

              {/* Format Switcher (Neutral Radius) */}
              <div className="w-full mt-3.5 flex items-center justify-center gap-1 p-1 rounded-md bg-white/5 border border-white/10">
                {selectedBook.formats.map((fmt) => {
                  const isSelected = selectedFormat === fmt;
                  return (
                    <button
                      key={fmt}
                      onClick={() => setSelectedFormat(fmt)}
                      className={`flex-1 py-1.5 px-2 rounded-xs text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#1e90ff] text-white shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {fmt === 'Audiobook' && <Headphones className="w-3 h-3" />}
                      {fmt === 'eBook' && <BookOpen className="w-3 h-3" />}
                      <span>{fmt}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Book Details Summary */}
            <div className="md:col-span-8 flex flex-col justify-between h-full">
              <div>
                {/* Category & Badge */}
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#1e90ff]">
                    {selectedBook.category} • {selectedBook.subcategory}
                  </span>
                  {selectedBook.badge && (
                    <span className="px-2 py-0.5 rounded-xs text-[10px] font-bold bg-[#e50914] text-white">
                      {selectedBook.badge}
                    </span>
                  )}
                  <span className="px-2 py-0.5 rounded-xs text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Achieng Liquid Glass Verified
                  </span>
                </div>

                {/* Title & Subtitle */}
                <h2 id="modal-book-title" className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
                  {selectedBook.title}
                </h2>
                {selectedBook.subtitle && (
                  <p className="text-sm sm:text-base text-slate-300 font-medium mt-1">
                    {selectedBook.subtitle}
                  </p>
                )}

                {/* Author & Rating */}
                <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-slate-300 mt-3">
                  <span className="font-bold text-white">
                    By {selectedBook.author}
                  </span>
                  <span className="text-slate-600">•</span>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="font-bold text-white">{selectedBook.rating}</span>
                    <span className="text-slate-400">({selectedBook.reviewsCount} reviews)</span>
                  </div>
                  <span className="text-slate-600">•</span>
                  <span className="text-slate-300">{selectedBook.publisher} ({selectedBook.publishedYear})</span>
                </div>

                {/* Synopsis */}
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mt-3.5 line-clamp-4">
                  {selectedBook.description}
                </p>

                {/* Metadata Details (Neutral Radius) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
                  <div className="p-2.5 rounded-md bg-white/5 border border-white/10">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Pages</div>
                    <div className="text-xs font-bold text-white mt-0.5">{selectedBook.pages} pp</div>
                  </div>
                  <div className="p-2.5 rounded-md bg-white/5 border border-white/10">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Read Time</div>
                    <div className="text-xs font-bold text-white mt-0.5">{selectedBook.readTime}</div>
                  </div>
                  <div className="p-2.5 rounded-md bg-white/5 border border-white/10">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Language</div>
                    <div className="text-xs font-bold text-white mt-0.5">{selectedBook.language}</div>
                  </div>
                  <div className="p-2.5 rounded-md bg-white/5 border border-white/10">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">ISBN</div>
                    <div className="text-xs font-mono font-bold text-white mt-0.5 truncate">{selectedBook.isbn}</div>
                  </div>
                </div>
              </div>

              {/* Price & Action Bar (High Accessibility) */}
              <div className="pt-5 mt-5 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="text-xs text-slate-400 font-medium">Price for {selectedFormat}</div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-black text-white">
                      {formatPrice(selectedBook.priceKes)}
                    </span>
                    {selectedBook.originalPriceKes && (
                      <span className="text-sm text-slate-500 line-through">
                        {formatPrice(selectedBook.originalPriceKes)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Action CTA Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Instant M-Pesa Buy (Green) */}
                  <button
                    onClick={handleQuickMpesaBuy}
                    aria-label={`Buy ${selectedBook.title} immediately with M-Pesa`}
                    className="px-5 py-2.5 rounded-md bg-[#00a859] hover:bg-[#00924d] text-white text-xs sm:text-sm font-extrabold flex items-center gap-2 shadow-lg shadow-[#00a859]/30 transition-transform active:scale-95 cursor-pointer"
                  >
                    <Zap className="w-4 h-4 fill-current" />
                    <span>Instant M-Pesa Buy</span>
                  </button>

                  {/* Add to Cart */}
                  <button
                    onClick={() => addToCart(selectedBook, selectedFormat, 1)}
                    aria-label="Add book to cart"
                    className="px-4 py-2.5 rounded-md bg-[#1e90ff] hover:bg-[#1a7cdb] text-white text-xs sm:text-sm font-bold flex items-center gap-2 transition-transform active:scale-95 cursor-pointer shadow-sm"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>Add to Cart</span>
                  </button>

                  {/* Read Sample */}
                  <button
                    onClick={() => {
                      setSelectedBook(null);
                      setReadingBook(selectedBook);
                    }}
                    aria-label="Read sample chapter"
                    className="p-2.5 rounded-md bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-all cursor-pointer"
                    title="Read sample excerpt"
                  >
                    <BookOpen className="w-4 h-4" />
                  </button>

                  {/* Wishlist */}
                  <button
                    onClick={() => toggleWishlist(selectedBook)}
                    aria-label={isFavorited ? 'Remove from wishlist' : 'Add to wishlist'}
                    className={`p-2.5 rounded-md border transition-all cursor-pointer ${
                      isFavorited
                        ? 'bg-[#e50914] text-white border-[#e50914]'
                        : 'bg-white/5 hover:bg-white/15 text-slate-300 border-white/10'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Tabs Navigation */}
        <div className="px-6 sm:px-10 border-b border-white/10 bg-white/[0.03] flex items-center gap-6 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-[#1e90ff] text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Overview & Tags
          </button>
          <button
            onClick={() => setActiveTab('toc')}
            className={`py-3 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'toc'
                ? 'border-[#1e90ff] text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Table of Contents ({selectedBook.tableOfContents.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('author')}
            className={`py-3 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'author'
                ? 'border-[#1e90ff] text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Author Biography</span>
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`py-3 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'reviews'
                ? 'border-[#1e90ff] text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Star className="w-3.5 h-3.5" />
            <span>Reviews ({currentReviews.length})</span>
          </button>
        </div>

        {/* Modal Tab Content Area */}
        <div className="p-6 sm:p-8 max-h-[380px] overflow-y-auto bg-[#0a101d]">
          {activeTab === 'overview' && (
            <div className="space-y-5">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Tags & Taxonomy
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedBook.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 rounded-md text-xs font-medium bg-white/5 border border-white/10 text-slate-200"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Full Synopsis
                </h4>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                  {selectedBook.description}
                </p>
              </div>

              {selectedBook.sampleExcerpt && (
                <div className="p-4 rounded-md bg-white/5 border border-white/10">
                  <h4 className="text-xs font-bold text-[#1e90ff] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" />
                    Chapter 1 Preview Excerpt
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-300 italic leading-relaxed">
                    "{selectedBook.sampleExcerpt}"
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'toc' && (
            <div className="space-y-2.5">
              <p className="text-xs text-slate-400 mb-1">
                Click any chapter to expand summary excerpt:
              </p>
              {selectedBook.tableOfContents.map((ch) => {
                const isOpen = expandedChapter === ch.chapterNumber;
                return (
                  <div
                    key={ch.chapterNumber}
                    className="rounded-md border border-white/10 overflow-hidden bg-white/5 transition-all"
                  >
                    <button
                      onClick={() => setExpandedChapter(isOpen ? null : ch.chapterNumber)}
                      className="w-full p-3.5 text-left flex items-center justify-between text-xs sm:text-sm font-semibold text-white hover:text-[#1e90ff] transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-xs bg-white/10 border border-white/10 text-[#1e90ff] flex items-center justify-center font-mono text-xs font-bold">
                          {ch.chapterNumber}
                        </span>
                        <span>{ch.title}</span>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 transition-transform ${
                          isOpen ? 'rotate-180 text-[#1e90ff]' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-3 pt-1 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-white/5 bg-black/20">
                        <p className="italic text-slate-400">"{ch.previewExcerpt}"</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'author' && (
            <div className="p-5 rounded-md bg-white/5 border border-white/10 flex flex-col sm:flex-row items-center sm:items-start gap-5">
              {selectedBook.authorAvatar && (
                <img
                  src={selectedBook.authorAvatar}
                  alt={selectedBook.author}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-md object-cover border border-[#1e90ff]/40 shadow-md"
                />
              )}
              <div className="flex-1 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                  <h4 className="text-base font-bold text-white">{selectedBook.author}</h4>
                  <span className="p-1 rounded-xs bg-[#1e90ff]/20 text-[#1e90ff]" title="Verified Author">
                    <Award className="w-3.5 h-3.5" />
                  </span>
                </div>
                <div className="text-xs text-[#1e90ff] font-semibold mb-2">
                  Featured Author • Published with {selectedBook.publisher}
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {selectedBook.authorBio}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-5">
              <div className="p-4 rounded-md bg-white/5 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3.5 text-center sm:text-left">
                  <div className="text-3xl font-black text-white">{selectedBook.rating}</div>
                  <div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Based on {selectedBook.reviewsCount} verified reader ratings
                    </div>
                  </div>
                </div>

                <div className="text-xs text-emerald-400 flex items-center gap-1.5 font-semibold">
                  <Check className="w-4 h-4" />
                  <span>100% Verified Community Reviews</span>
                </div>
              </div>

              {/* Review Input */}
              <form onSubmit={handleReviewSubmit} className="p-4 rounded-md bg-white/5 border border-white/10 space-y-2.5">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Write Your Review
                </h4>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Rating:</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setNewRating(star)}
                        className="cursor-pointer p-0.5"
                      >
                        <Star
                          className={`w-4 h-4 ${
                            star <= newRating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-600'
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
                  placeholder="Review title (e.g. Essential reading)"
                  className="w-full px-3 py-1.5 rounded-md bg-black/40 border border-white/10 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#1e90ff]"
                />

                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  required
                  rows={3}
                  placeholder="Share your thoughts on the narrative, concepts, or key takeaways..."
                  className="w-full px-3 py-1.5 rounded-md bg-black/40 border border-white/10 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#1e90ff]"
                />

                <button
                  type="submit"
                  disabled={isSubmittingReview || !newComment.trim()}
                  className="px-4 py-2 rounded-md bg-[#1e90ff] hover:bg-[#1a7cdb] disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmittingReview ? 'Posting...' : 'Submit Review'}</span>
                </button>
              </form>

              {/* Reviews List */}
              <div className="space-y-2.5">
                {currentReviews.map((rev) => (
                  <div
                    key={rev.reviewId}
                    className="p-3.5 rounded-md bg-white/5 border border-white/10 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-xs bg-[#1e90ff] text-white flex items-center justify-center font-bold text-xs">
                          {rev.userName[0]}
                        </div>
                        <span className="text-xs font-bold text-white">{rev.userName}</span>
                        {rev.verifiedPurchase && (
                          <span className="text-[10px] text-emerald-400 font-medium">
                            (Verified Purchase)
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3 h-3 ${
                              s <= rev.rating
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-700'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {rev.title && (
                      <h5 className="text-xs font-bold text-white">{rev.title}</h5>
                    )}
                    <p className="text-xs text-slate-300 leading-relaxed">{rev.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* "What to Pick Next" Recommendations */}
          <div className="pt-6 mt-6 border-t border-white/10">
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5 mb-3">
              <Sparkles className="w-4 h-4 text-[#1e90ff]" />
              What to Pick Next (Curated by Achieng)
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {recommendations.map(({ book: rec, matchPercent }) => (
                <div
                  key={rec.id}
                  onClick={() => setSelectedBook(rec)}
                  className="cursor-pointer bg-white/5 p-2 rounded-md group hover:border-[#1e90ff]/50 border border-white/10 transition-all flex flex-col justify-between"
                >
                  <div className="relative aspect-[2/3] rounded-xs overflow-hidden bg-slate-900 mb-2">
                    <img
                      src={rec.coverUrl}
                      alt={rec.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded-xs text-[9px] font-bold bg-[#1e90ff] text-white">
                      {matchPercent}% Match
                    </span>
                  </div>

                  <div>
                    <h5 className="text-xs font-bold text-white line-clamp-1 group-hover:text-[#1e90ff]">
                      {rec.title}
                    </h5>
                    <p className="text-[10px] text-slate-400 line-clamp-1">{rec.author}</p>
                    <div className="text-xs font-extrabold text-white mt-1">
                      {formatPrice(rec.priceKes)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
