import React from 'react';
import { Search, Lock, Shield, CheckCircle2, X, SlidersHorizontal, BookOpen } from 'lucide-react';
import { TrainingCategory } from '../types';

interface NavbarProps {
  agencyName: string;
  academyName: string;
  categories: TrainingCategory[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onCategoryClick: (categoryId: string) => void;
  selectedCategoryId: string | null;
  onOpenManagerModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  agencyName,
  academyName,
  categories,
  searchQuery,
  onSearchChange,
  onCategoryClick,
  selectedCategoryId,
  onOpenManagerModal,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#001233]/90 backdrop-blur-md border-b border-blue-900/40 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Zone 1: Brand Mark */}
          <div className="flex items-center gap-3 shrink-0 cursor-pointer" onClick={() => onCategoryClick('')}>
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#0077c8] to-[#003d80] p-0.5 flex items-center justify-center shadow-md shadow-blue-900/40">
              <div className="w-full h-full bg-[#001848] rounded-[7px] flex items-center justify-center">
                <Shield className="w-5 h-5 text-sky-400 fill-sky-500/20" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-base sm:text-lg font-display font-extrabold tracking-tight text-white leading-none">
                {agencyName}
              </span>
              <span className="text-[11px] font-medium tracking-wide text-sky-400 mt-0.5">
                {academyName}
              </span>
            </div>
          </div>

          {/* Zone 2: Navigation & Instant Search */}
          <div className="flex-1 max-w-xl mx-2 sm:mx-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4 text-sky-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search objections, scripts, roof, deductible, rate hike..."
                className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-[#001c4c]/80 text-white placeholder-slate-400 rounded-lg border border-blue-800/40 focus:outline-none focus:ring-2 focus:ring-[#0077c8] focus:border-transparent transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Zone 3: Actions & Manager Gate */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Manager Access CTA */}
            <button
              onClick={onOpenManagerModal}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-sky-200 bg-[#002466] hover:bg-[#003399] border border-blue-700/40 rounded-lg transition-all shadow-sm active:scale-95 cursor-pointer"
              title="Open Manager CMS & Shelf Editor"
            >
              <Lock className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden sm:inline">Manager Mode</span>
              <span className="sm:hidden">Admin</span>
            </button>
          </div>

        </div>

        {/* Dynamic Category Quick Jump Sub-bar */}
        <div className="flex items-center gap-2 py-2 overflow-x-auto hide-scrollbar border-t border-blue-900/30 text-xs">
          <button
            onClick={() => onCategoryClick('')}
            className={`px-3 py-1 rounded-md whitespace-nowrap transition-colors font-medium ${
              selectedCategoryId === null || selectedCategoryId === ''
                ? 'bg-[#0077c8] text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-blue-950/60'
            }`}
          >
            All Trainings
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onCategoryClick(cat.id)}
              className={`px-3 py-1 rounded-md whitespace-nowrap transition-colors font-medium ${
                selectedCategoryId === cat.id
                  ? 'bg-[#0077c8] text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-blue-950/60'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

      </div>
    </header>
  );
};
