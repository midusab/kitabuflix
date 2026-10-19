import React, { useState, useEffect } from 'react';
import { 
  X, 
  BookOpen, 
  ChevronLeft, 
  ChevronRight, 
  Zap 
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const SampleReaderModal: React.FC = () => {
  const { 
    readingBook, 
    setReadingBook, 
    addToCart, 
    setIsCheckoutOpen,
    formatPrice 
  } = useStore();

  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg' | 'xl'>('base');
  const [readerTheme, setReaderTheme] = useState<'dark' | 'sepia' | 'charcoal'>('dark');
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && readingBook) {
        setReadingBook(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [readingBook]);

  if (!readingBook) return null;

  const currentChapter = readingBook.tableOfContents[activeChapterIndex] || {
    chapterNumber: 1,
    title: 'Chapter 1: The Beginning',
    previewExcerpt: readingBook.sampleExcerpt,
  };

  const handleBuyBook = async () => {
    await addToCart(readingBook, 'eBook', 1);
    setReadingBook(null);
    setIsCheckoutOpen(true);
  };

  const themeClasses = {
    dark: 'bg-[#0f172a] text-slate-200 border-white/15',
    sepia: 'bg-[#2d241e] text-[#f4ecd8] border-[#5e4b3c]',
    charcoal: 'bg-[#18181b] text-zinc-200 border-zinc-800',
  };

  const fontClasses = {
    sm: 'text-sm leading-relaxed',
    base: 'text-base leading-relaxed',
    lg: 'text-lg leading-loose',
    xl: 'text-xl leading-loose',
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/90 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-label="Book sample reader"
    >
      <div 
        className={`relative w-full max-w-4xl h-[90vh] rounded-lg flex flex-col overflow-hidden border shadow-2xl transition-colors duration-150 ${themeClasses[readerTheme]}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar (Neutral Radius) */}
        <div className="px-6 py-3.5 border-b border-inherit flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-md bg-[#1e90ff]/20 text-[#1e90ff]">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white line-clamp-1">
                {readingBook.title}
              </h3>
              <p className="text-xs text-slate-400">
                Sample Reader • By {readingBook.author}
              </p>
            </div>
          </div>

          {/* Reader Preferences */}
          <div className="flex items-center gap-2">
            {/* Font Size Selector */}
            <div className="flex items-center gap-0.5 p-0.5 rounded-md bg-black/40 border border-inherit text-xs">
              <button
                onClick={() => setFontSize('sm')}
                className={`px-2 py-1 rounded-xs ${fontSize === 'sm' ? 'bg-[#1e90ff] text-white font-bold' : 'text-slate-400'}`}
              >
                A-
              </button>
              <button
                onClick={() => setFontSize('base')}
                className={`px-2 py-1 rounded-xs ${fontSize === 'base' ? 'bg-[#1e90ff] text-white font-bold' : 'text-slate-400'}`}
              >
                A
              </button>
              <button
                onClick={() => setFontSize('lg')}
                className={`px-2 py-1 rounded-xs ${fontSize === 'lg' ? 'bg-[#1e90ff] text-white font-bold' : 'text-slate-400'}`}
              >
                A+
              </button>
            </div>

            {/* Theme switcher */}
            <div className="flex items-center gap-0.5 p-0.5 rounded-md bg-black/40 border border-inherit text-xs">
              <button
                onClick={() => setReaderTheme('dark')}
                className={`px-2 py-1 rounded-xs ${readerTheme === 'dark' ? 'bg-slate-700 text-white font-bold' : 'text-slate-400'}`}
              >
                Dark
              </button>
              <button
                onClick={() => setReaderTheme('sepia')}
                className={`px-2 py-1 rounded-xs ${readerTheme === 'sepia' ? 'bg-[#4a3b2c] text-[#f4ecd8] font-bold' : 'text-slate-400'}`}
              >
                Sepia
              </button>
              <button
                onClick={() => setReaderTheme('charcoal')}
                className={`px-2 py-1 rounded-xs ${readerTheme === 'charcoal' ? 'bg-zinc-700 text-white font-bold' : 'text-slate-400'}`}
              >
                Noir
              </button>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setReadingBook(null)}
              aria-label="Close reader"
              className="p-1.5 rounded-md bg-black/40 hover:bg-black text-slate-300 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Reader Body Text Container */}
        <div className="flex-1 overflow-y-auto px-6 sm:px-12 md:px-20 py-8 max-w-3xl mx-auto w-full">
          <div className="text-center mb-8 border-b border-inherit pb-6">
            <span className="text-xs uppercase tracking-widest text-[#1e90ff] font-bold">
              Sample Chapter {currentChapter.chapterNumber}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
              {currentChapter.title}
            </h2>
          </div>

          <div className={`space-y-6 font-serif ${fontClasses[fontSize]}`}>
            <p className="first-letter:text-5xl first-letter:font-bold first-letter:float-left first-letter:mr-3 first-letter:text-[#1e90ff]">
              {readingBook.sampleExcerpt}
            </p>

            <p>
              {currentChapter.previewExcerpt}
            </p>

            <p>
              The quiet persistence of systematic ideas has always superseded brute force in human advancement. As the chapters unfold, you will observe the structural friction between older conventions and the emerging velocity of the new era. Each framework and narrative layer documented within these pages was extracted from real-world telemetry and verified case studies.
            </p>

            <p>
              Beyond the immediate mechanics, there lies an architectural philosophy: to construct systems—whether financial ledgers, code pipelines, or personal habits—that thrive under unpredictable volatility rather than collapsing under sudden strain.
            </p>
          </div>

          {/* End of Sample Banner (Neutral Radius + Green M-Pesa Buy) */}
          <div className="mt-12 p-6 rounded-md bg-black/40 border border-inherit text-center space-y-3">
            <div className="inline-flex p-2.5 rounded-md bg-[#00a859]/20 text-[#00a859]">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Enjoying this excerpt?</h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
              Unlock the full {readingBook.pages}-page edition with instant Safaricom M-Pesa access and lifetime updates.
            </p>
            <div className="flex items-center justify-center gap-3 pt-1">
              <button
                onClick={handleBuyBook}
                className="px-5 py-2.5 rounded-md bg-[#00a859] hover:bg-[#00924d] text-white font-extrabold text-sm shadow-xl shadow-[#00a859]/30 transition-transform active:scale-95 cursor-pointer flex items-center gap-2"
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>Buy Full Book for {formatPrice(readingBook.priceKes)}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="px-6 py-3.5 border-t border-inherit flex items-center justify-between text-xs text-slate-400">
          <button
            disabled={activeChapterIndex === 0}
            onClick={() => setActiveChapterIndex((p) => Math.max(0, p - 1))}
            className="flex items-center gap-1 hover:text-white disabled:opacity-30 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous Chapter</span>
          </button>

          <span>
            Chapter {activeChapterIndex + 1} of {readingBook.tableOfContents.length || 1}
          </span>

          <button
            disabled={activeChapterIndex >= (readingBook.tableOfContents.length - 1)}
            onClick={() => setActiveChapterIndex((p) => Math.min(readingBook.tableOfContents.length - 1, p + 1))}
            className="flex items-center gap-1 hover:text-white disabled:opacity-30 cursor-pointer"
          >
            <span>Next Chapter</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
