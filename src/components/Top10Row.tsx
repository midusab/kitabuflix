import React, { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, TrendingUp } from 'lucide-react';
import { Book } from '../types/book';
import { BookCard } from './BookCard';

interface Top10RowProps {
  books: Book[];
}

export const Top10Row: React.FC<Top10RowProps> = ({ books }) => {
  const rowRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const top10 = books.slice(0, 10);

  const checkScroll = () => {
    if (rowRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const amount = rowRef.current.clientWidth * 0.75;
      rowRef.current.scrollBy({
        left: direction === 'left' ? -amount : amount,
        behavior: 'smooth',
      });
      setTimeout(checkScroll, 350);
    }
  };

  if (!top10.length) return null;

  return (
    <div className="relative py-6 group/top10" role="region" aria-label="Top 10 Books Today">
      {/* Header (White Theme) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-md bg-[#e50914] text-white shadow-xs">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
              <span>Top 10 in Books Today</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-xs bg-[#e50914]/10 text-[#e50914] border border-[#e50914]/20">
                KENYA & EAST AFRICA
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              The most purchased titles across mobile money networks this week
            </p>
          </div>
        </div>
      </div>

      {/* Row Carousel */}
      <div className="relative max-w-7xl mx-auto">
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            aria-label="Scroll left in Top 10"
            className="absolute -left-3 top-0 bottom-0 z-30 w-11 bg-white/90 hover:bg-white text-slate-900 backdrop-blur-md flex items-center justify-center opacity-0 group-hover/top10:opacity-100 transition-opacity rounded-r-md border-y border-r border-slate-200 shadow-md cursor-pointer"
          >
            <ChevronLeft className="w-6 h-6 hover:scale-110 transition-transform" />
          </button>
        )}

        <div
          ref={rowRef}
          onScroll={checkScroll}
          className="flex items-center gap-2 sm:gap-3 overflow-x-auto no-scrollbar px-4 sm:px-6 md:px-8 py-3 scroll-smooth"
        >
          {top10.map((book, index) => {
            const rank = index + 1;
            return (
              <div key={book.id} className="flex items-center flex-none relative">
                {/* Netflix-Style Giant Rank Number for White Background */}
                <div className="relative select-none pointer-events-none -mr-6 sm:-mr-8 md:-mr-10 z-0">
                  <span 
                    className="text-[110px] sm:text-[130px] md:text-[150px] font-black leading-none tracking-tighter"
                    style={{
                      WebkitTextStroke: '4px #0f172a',
                      color: '#e2e8f0',
                      filter: 'drop-shadow(2px 6px 14px rgba(15, 23, 42, 0.2))'
                    }}
                  >
                    {rank}
                  </span>
                </div>

                {/* Book Card positioned with subtle overlap */}
                <div className="relative z-10">
                  <BookCard book={book} rank={rank} />
                </div>
              </div>
            );
          })}
        </div>

        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            aria-label="Scroll right in Top 10"
            className="absolute -right-3 top-0 bottom-0 z-30 w-11 bg-white/90 hover:bg-white text-slate-900 backdrop-blur-md flex items-center justify-center opacity-0 group-hover/top10:opacity-100 transition-opacity rounded-l-md border-y border-l border-slate-200 shadow-md cursor-pointer"
          >
            <ChevronRight className="w-6 h-6 hover:scale-110 transition-transform" />
          </button>
        )}
      </div>
    </div>
  );
};
