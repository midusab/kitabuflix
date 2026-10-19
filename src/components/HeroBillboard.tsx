import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Info, 
  Zap, 
  Volume2, 
  VolumeX, 
  Plus, 
  Check, 
  Star,
  ChevronRight,
  TrendingUp,
  Percent
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Book } from '../types/book';

export const HeroBillboard: React.FC = () => {
  const { 
    books, 
    setSelectedBook, 
    setReadingBook, 
    toggleWishlist, 
    isInWishlist, 
    addToCart, 
    setIsCheckoutOpen,
    formatPrice,
    playAudioBook 
  } = useStore();

  const spotlightBooks = books.filter((b) => b.featured).slice(0, 4);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Auto-advance spotlight every 10 seconds if not playing audio
  useEffect(() => {
    if (isPlayingAudio) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % (spotlightBooks.length || 1));
    }, 10000);
    return () => clearInterval(interval);
  }, [isPlayingAudio, spotlightBooks.length]);

  const book = spotlightBooks[currentIndex] || books[0];
  if (!book) return null;

  const inWishlist = isInWishlist(book.id);

  const handleQuickBuy = async () => {
    await addToCart(book, 'eBook', 1);
    setIsCheckoutOpen(true);
  };

  return (
    <div className="relative w-full h-[76vh] min-h-[540px] max-h-[780px] flex items-center select-none overflow-hidden">
      {/* Background Image with Netflix cinematic filters */}
      <div className="absolute inset-0 z-0">
        <img
          key={book.id}
          src={book.heroBannerUrl || book.coverUrl}
          alt={book.title}
          className="w-full h-full object-cover object-center filter brightness-[0.55] contrast-[1.15] scale-100 transition-all duration-700 ease-out"
        />

        {/* Netflix Exact Vignettes: Left dark gradient for text + Bottom gradient fade into page */}
        <div className="absolute inset-0 netflix-hero-vignette" />
        <div className="absolute inset-0 netflix-bottom-vignette" />
      </div>

      {/* Main Billboard Content Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-8 md:px-12 flex items-center justify-between">
        <div className="max-w-2xl pt-8 sm:pt-12">

          {/* Netflix #1 in Books Today Badge */}
          <div className="flex items-center gap-2.5 mb-3">
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-xs bg-[#e50914] text-white text-[11px] font-black tracking-wide shadow-sm">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>TOP 10</span>
            </div>
            <span className="text-xs sm:text-sm font-bold text-white tracking-tight">
              #1 in Books Today
            </span>
            {book.discountPercent && book.discountPercent > 0 && (
              <span className="px-2 py-0.5 rounded-xs text-[11px] font-bold bg-[#e50914]/20 text-[#ef4444] border border-[#e50914]/40 flex items-center gap-1">
                <Percent className="w-3 h-3" />
                {book.discountPercent}% OFF
              </span>
            )}
          </div>

          {/* Giant Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.05] drop-shadow-md mb-2">
            {book.title}
          </h1>

          {/* Subtitle / Author Info */}
          {book.subtitle && (
            <p className="text-sm sm:text-base md:text-lg font-semibold text-slate-100 drop-shadow-sm line-clamp-1 mb-2">
              {book.subtitle}
            </p>
          )}

          {/* Meta details line */}
          <div className="flex items-center gap-3 text-xs sm:text-sm font-semibold text-slate-200 mb-4">
            <span className="text-emerald-400 font-bold">98% Match</span>
            <span className="text-slate-400">•</span>
            <span className="text-white font-bold">By {book.author}</span>
            <span className="text-slate-400">•</span>
            <span className="px-1.5 py-0.5 border border-slate-400 text-[11px] text-white rounded font-bold bg-black/40">
              DIGITAL EDITION
            </span>
            <span className="text-slate-400">•</span>
            <div className="flex items-center gap-1 text-amber-400">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span className="font-bold text-white">{book.rating}</span>
            </div>
          </div>

          {/* Synopsis */}
          <p className="text-xs sm:text-sm md:text-base text-slate-100 leading-relaxed max-w-xl line-clamp-3 drop-shadow mb-6 font-normal">
            {book.description}
          </p>

          {/* Netflix Exact Buttons + Accessible Direct Purchase */}
          <div className="flex flex-wrap items-center gap-3">
            {/* 1. Netflix Iconic Solid White "Play / Read Sample" Button */}
            <button
              onClick={() => setReadingBook(book)}
              aria-label={`Read sample chapter of ${book.title}`}
              className="px-6 py-2.5 rounded-md bg-white hover:bg-slate-100 text-slate-950 font-black text-sm sm:text-base flex items-center gap-2 shadow-lg transition-transform active:scale-95 cursor-pointer"
            >
              <Play className="w-5 h-5 fill-slate-950" />
              <span>Read Sample</span>
            </button>

            {/* 2. Netflix Iconic Gray "More Info" Button */}
            <button
              onClick={() => setSelectedBook(book)}
              aria-label={`More information about ${book.title}`}
              className="px-5 py-2.5 rounded-md bg-slate-800/90 hover:bg-slate-700 text-white font-bold text-sm sm:text-base flex items-center gap-2 border border-slate-600/80 backdrop-blur-md transition-colors active:scale-95 cursor-pointer"
            >
              <Info className="w-5 h-5" />
              <span>More Info</span>
            </button>

            {/* 3. High-Accessibility Direct Purchase with M-Pesa Green */}
            <button
              onClick={handleQuickBuy}
              aria-label={`Buy ${book.title} instantly with M-Pesa for ${formatPrice(book.priceKes)}`}
              className="px-5 py-2.5 rounded-md bg-[#00a859] hover:bg-[#00924d] text-white font-extrabold text-sm sm:text-base flex items-center gap-2 shadow-xl shadow-[#00a859]/30 transition-transform active:scale-95 cursor-pointer border border-emerald-400/30"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>Buy with M-Pesa ({formatPrice(book.priceKes)})</span>
            </button>

            {/* 4. Wishlist Button */}
            <button
              onClick={() => toggleWishlist(book)}
              aria-label={inWishlist ? 'Remove from My List' : 'Add to My List'}
              className={`p-2.5 rounded-md border backdrop-blur-md transition-all cursor-pointer ${
                inWishlist
                  ? 'bg-[#e50914] text-white border-[#e50914]'
                  : 'bg-black/40 hover:bg-black/70 text-white border-white/20'
              }`}
              title={inWishlist ? 'In My List' : 'Add to My List'}
            >
              {inWishlist ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Right Corner: Exact Netflix Maturity Tag & Audio Controller */}
        <div className="hidden md:flex flex-col items-end gap-3 self-end pb-8">
          <div className="flex items-center gap-3">
            {/* Audio Toggle Button */}
            <button
              onClick={() => playAudioBook(book)}
              aria-label="Play audiobook sample in studio player"
              className="p-2.5 rounded-full border border-white/30 bg-black/60 hover:bg-[#e50914] hover:border-[#e50914] text-white backdrop-blur-md transition-all cursor-pointer shadow-lg group"
              title="Listen to Audiobook in Studio Player"
            >
              <Volume2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
            </button>

            {/* Exact Netflix Maturity Rating Border Box */}
            <div className="px-3.5 py-1.5 bg-black/50 backdrop-blur-md border-l-3 border-white text-white text-xs font-bold tracking-wider">
              16+ DIGITAL EDITION
            </div>
          </div>

          {/* Active audio waveform indicator */}
          {isPlayingAudio && (
            <div className="px-3 py-1 rounded-md bg-black/60 border border-white/10 flex items-center gap-2 text-xs text-[#1e90ff]">
              <span className="font-semibold">Narrator: Audio Excerpt</span>
              <div className="flex items-center gap-1">
                <span className="w-1 h-3 bg-[#1e90ff] animate-pulse" />
                <span className="w-1 h-5 bg-[#1e90ff] animate-bounce" />
                <span className="w-1 h-2 bg-[#1e90ff] animate-pulse" />
              </div>
            </div>
          )}

          {/* Spotlight switcher indicator dots */}
          <div className="flex items-center gap-1.5 pt-2">
            {spotlightBooks.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setCurrentIndex(idx);
                  setIsPlayingAudio(false);
                }}
                aria-label={`Jump to featured book ${idx + 1}`}
                className={`h-1 transition-all cursor-pointer ${
                  currentIndex === idx ? 'w-6 bg-[#1e90ff]' : 'w-2 bg-white/30 hover:bg-white/60'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
