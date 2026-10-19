import React, { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Book } from '../types/book';
import { BookCard } from './BookCard';

interface NetflixRowProps {
  title: string;
  subtitle?: string;
  books: Book[];
  onViewCategory?: () => void;
}

export const NetflixRow: React.FC<NetflixRowProps> = ({
  title,
  subtitle,
  books,
  onViewCategory,
}) => {
  const rowRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

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

  if (!books.length) return null;

  return (
    <div className="relative py-4 group/row" role="region" aria-label={title}>
      {/* Header (White Theme) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mb-3 flex items-end justify-between">
        <div>
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <span>{title}</span>
            <span className="text-xs font-normal text-slate-400">({books.length})</span>
          </h2>
          {subtitle && (
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">{subtitle}</p>
          )}
        </div>
        {onViewCategory && (
          <button
            onClick={onViewCategory}
            className="text-xs sm:text-sm font-bold text-[#1e90ff] hover:text-[#1a7cdb] transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span>Explore all</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Row Carousel Container */}
      <div className="relative max-w-7xl mx-auto">
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            aria-label={`Scroll left in ${title}`}
            className="absolute -left-3 top-0 bottom-0 z-30 w-11 bg-white/90 hover:bg-white text-slate-800 backdrop-blur-md flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity rounded-r-md border-y border-r border-slate-200 shadow-md cursor-pointer"
          >
            <ChevronLeft className="w-6 h-6 hover:scale-110 transition-transform" />
          </button>
        )}

        <div
          ref={rowRef}
          onScroll={checkScroll}
          className="flex items-stretch gap-2 sm:gap-2.5 overflow-x-auto no-scrollbar px-4 sm:px-6 md:px-8 py-2 scroll-smooth"
        >
          {books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>

        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            aria-label={`Scroll right in ${title}`}
            className="absolute -right-3 top-0 bottom-0 z-30 w-11 bg-white/90 hover:bg-white text-slate-800 backdrop-blur-md flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity rounded-l-md border-y border-l border-slate-200 shadow-md cursor-pointer"
          >
            <ChevronRight className="w-6 h-6 hover:scale-110 transition-transform" />
          </button>
        )}
      </div>
    </div>
  );
};
