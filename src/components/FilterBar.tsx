import React, { useState } from 'react';
import { 
  SlidersHorizontal, 
  RotateCcw, 
  Check, 
  ChevronDown, 
  Percent, 
  Star 
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { CATEGORIES_WITH_SUBS } from '../data/books';
import { BookFormat } from '../types/book';

export const FilterBar: React.FC = () => {
  const {
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedSubcategory,
    setSelectedSubcategory,
    onlyDiscounts,
    setOnlyDiscounts,
    formatFilter,
    setFormatFilter,
    minRating,
    setMinRating,
    sortBy,
    setSortBy,
    resetFilters,
    filteredBooks,
  } = useStore();

  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  const currentCategoryObj = CATEGORIES_WITH_SUBS.find((c) => c.name === selectedCategory);

  const activeFiltersCount = 
    (selectedCategory ? 1 : 0) +
    (selectedSubcategory ? 1 : 0) +
    (onlyDiscounts ? 1 : 0) +
    (formatFilter ? 1 : 0) +
    (minRating > 0 ? 1 : 0) +
    (searchQuery.trim() ? 1 : 0) +
    (sortBy !== 'featured' ? 1 : 0);

  return (
    <div className="px-4 sm:px-6 md:px-8 py-3 bg-white border-b border-slate-100" role="region" aria-label="Book categories and refinement">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Category Navigation (White theme with neutral radius) */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <button
            onClick={() => {
              setSelectedCategory(null);
              setSelectedSubcategory(null);
            }}
            className={`px-3.5 py-1.5 rounded-md text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
              selectedCategory === null
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:text-slate-950 hover:bg-slate-200 border border-slate-300'
            }`}
          >
            All Categories
          </button>

          {CATEGORIES_WITH_SUBS.map((cat) => {
            const isSelected = selectedCategory === cat.name;
            return (
              <button
                key={cat.name}
                onClick={() => {
                  if (isSelected) {
                    setSelectedCategory(null);
                    setSelectedSubcategory(null);
                  } else {
                    setSelectedCategory(cat.name);
                    setSelectedSubcategory(null);
                  }
                }}
                className={`px-3.5 py-1.5 rounded-md text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? 'bg-[#1e90ff] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:text-slate-950 hover:bg-slate-200 border border-slate-300'
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>

        {/* Refinement Actions: Discounts, Sort, Advanced Filter Toggle */}
        <div className="flex items-center gap-2 self-end md:self-auto flex-none">
          {/* Quick 50% Off Discount toggle */}
          <button
            onClick={() => setOnlyDiscounts(!onlyDiscounts)}
            className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              onlyDiscounts
                ? 'bg-[#e50914] text-white shadow-xs'
                : 'bg-rose-50 text-[#e50914] hover:bg-rose-100 border border-rose-200'
            }`}
          >
            <Percent className="w-3.5 h-3.5" />
            <span>Discounts Only</span>
            {onlyDiscounts && <Check className="w-3 h-3 ml-0.5" />}
          </button>

          {/* Quick Sort Dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              aria-label="Sort books catalog"
              className="px-3 pr-7 py-1.5 rounded-md bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-200 focus:outline-none focus:border-[#1e90ff] cursor-pointer appearance-none"
            >
              <option value="featured">Featured First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
              <option value="newest">Newest First</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Detailed Filters Modal Button */}
          <button
            onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
            aria-expanded={isAdvancedOpen}
            aria-label="More filters"
            className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              isAdvancedOpen || activeFiltersCount > 0
                ? 'bg-[#1e90ff]/10 text-[#1e90ff] border border-[#1e90ff]/40'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Refine</span>
            {activeFiltersCount > 0 && (
              <span className="w-4 h-4 rounded-xs bg-[#1e90ff] text-white text-[10px] font-black flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Subcategory Pills */}
      {currentCategoryObj && (
        <div className="max-w-7xl mx-auto flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-2.5">
          <span className="text-xs text-slate-700 font-bold pl-0.5">Subcategories:</span>
          <button
            onClick={() => setSelectedSubcategory(null)}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
              selectedSubcategory === null
                ? 'bg-slate-900 text-white font-bold'
                : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100 border border-transparent'
            }`}
          >
            All Subcategories
          </button>
          {currentCategoryObj.subcategories.map((sub) => {
            const isSubSelected = selectedSubcategory === sub;
            return (
              <button
                key={sub}
                onClick={() => setSelectedSubcategory(isSubSelected ? null : sub)}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  isSubSelected
                    ? 'bg-[#1e90ff] text-white font-bold'
                    : 'bg-slate-50 text-slate-700 hover:text-slate-950 hover:bg-slate-100 border border-slate-300'
                }`}
              >
                {sub}
              </button>
            );
          })}
        </div>
      )}

      {/* Advanced Filter Drawer (White Theme) */}
      {isAdvancedOpen && (
        <div className="max-w-7xl mx-auto mt-3 p-4 rounded-md bg-white border border-slate-200 shadow-md space-y-3 animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#1e90ff]" />
              Detailed Catalog Refinement
            </span>

            {activeFiltersCount > 0 && (
              <button
                onClick={resetFilters}
                className="text-xs text-[#ef4444] hover:text-[#dc2626] font-bold flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset all filters
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Format Filter */}
            <div>
              <label className="text-[11px] font-bold uppercase text-slate-700 block mb-1.5">
                Format
              </label>
              <div className="flex flex-wrap gap-1">
                {(['eBook', 'Audiobook'] as BookFormat[]).map((fmt) => {
                  const isSelected = formatFilter === fmt;
                  return (
                    <button
                      key={fmt}
                      onClick={() => setFormatFilter(isSelected ? null : fmt)}
                      className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#1e90ff] text-white font-bold'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                      }`}
                    >
                      {fmt}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Minimum Rating */}
            <div>
              <label className="text-[11px] font-bold uppercase text-slate-700 block mb-1.5">
                Rating
              </label>
              <div className="flex items-center gap-1">
                {[4.0, 4.5, 4.8].map((rating) => {
                  const isSelected = minRating === rating;
                  return (
                    <button
                      key={rating}
                      onClick={() => setMinRating(isSelected ? 0 : rating)}
                      className={`px-2 py-1 rounded-md text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-amber-100 text-amber-900 border border-amber-300 font-bold'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                      }`}
                    >
                      <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                      <span>{rating}+</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Matching Count */}
            <div className="flex items-end justify-start sm:justify-end">
              <span className="text-xs text-slate-600 font-medium">
                Matching: <strong className="text-slate-900 font-bold">{filteredBooks.length} books</strong>
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
