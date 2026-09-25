import React from 'react';
import { Search, Play, QrCode, CheckCircle2, Clock, Sparkles, Filter } from 'lucide-react';
import { TrainingModule, TrainingCategory, AgentModuleProgress } from '../types';
import { AutoPoster } from './AutoPoster';

interface SearchFilterGridProps {
  modules: TrainingModule[];
  categories: TrainingCategory[];
  searchQuery: string;
  selectedCategoryId: string | null;
  selectedPolicyFilter: string | null;
  onPolicyFilterChange: (policy: string | null) => void;
  onWatchModule: (module: TrainingModule) => void;
  onOpenResource: (module: TrainingModule) => void;
  agentProgress: Record<string, AgentModuleProgress>;
  onClearFilters: () => void;
}

export const SearchFilterGrid: React.FC<SearchFilterGridProps> = ({
  modules,
  categories,
  searchQuery,
  selectedCategoryId,
  selectedPolicyFilter,
  onPolicyFilterChange,
  onWatchModule,
  onOpenResource,
  agentProgress,
  onClearFilters,
}) => {
  const activeCategory = categories.find((c) => c.id === selectedCategoryId);

  // Derive unique topics/tools/policies from modules
  const dynamicTopics = React.useMemo(() => {
    const list = new Set<string>();
    modules.forEach((m) => {
      if (m.targetPolicyType) list.add(m.targetPolicyType);
    });
    return ['All', ...Array.from(list)];
  }, [modules]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Search / Filter Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-blue-900/40 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-display font-bold text-white">
              {searchQuery ? `Search Results for "${searchQuery}"` : activeCategory ? activeCategory.name : 'All Training Modules'}
            </h2>
            <span className="text-xs font-mono font-medium text-sky-400 bg-blue-950/80 px-2.5 py-1 rounded-md border border-blue-800/60">
              {modules.length} {modules.length === 1 ? 'Result' : 'Results'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {activeCategory?.description || 'Instant-access objection handling playbooks, verbatim scripts, and Google Drive streaming.'}
          </p>
        </div>

        {/* Topic / Tool / Policy Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar py-1">
          <Filter className="w-3.5 h-3.5 text-sky-400 shrink-0 mr-1" />
          {dynamicTopics.map((tag) => {
            const isSelected = (tag === 'All' && !selectedPolicyFilter) || selectedPolicyFilter === tag;
            return (
              <button
                key={tag}
                onClick={() => onPolicyFilterChange(tag === 'All' ? null : tag)}
                className={`px-3 py-1 text-xs font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-[#0077c8] text-white shadow-sm'
                    : 'bg-[#001740] text-slate-300 hover:text-white hover:bg-[#002255] border border-blue-900/40'
                }`}
              >
                {tag}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of Results */}
      {modules.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {modules.map((module) => {
            const cat = categories.find((c) => c.id === module.categoryId);
            const isCompleted = agentProgress[module.id]?.completed;

            return (
              <div
                key={module.id}
                className="bg-[#001438] rounded-xl border border-blue-900/40 hover:border-blue-500/50 transition-all shelf-card p-3 flex flex-col justify-between"
              >
                <div>
                  {/* Poster Thumbnail */}
                  <div
                    className="cursor-pointer relative overflow-hidden rounded-lg"
                    onClick={() => onWatchModule(module)}
                  >
                    <AutoPoster
                      module={module}
                      categoryName={cat?.name}
                      showPlayOverlay={true}
                      isCompact={true}
                    />

                    {isCompleted && (
                      <div className="absolute top-2 right-2 z-20 flex items-center gap-1 bg-emerald-950/90 border border-emerald-500/40 text-emerald-300 text-[10px] font-semibold px-2 py-0.5 rounded shadow-md">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        Mastered
                      </div>
                    )}
                  </div>

                  {/* Title & Hook */}
                  <div className="mt-3 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="font-semibold text-sky-400 uppercase tracking-wider">
                        {module.targetPolicyType}
                      </span>
                      <span className="flex items-center gap-1 font-mono text-slate-300">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {module.durationMinutes}m
                      </span>
                    </div>

                    <h3
                      onClick={() => onWatchModule(module)}
                      className="text-sm font-display font-bold text-white hover:text-sky-300 transition-colors line-clamp-2 cursor-pointer leading-snug"
                    >
                      {module.title}
                    </h3>

                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                      {module.salesHook}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-3 pt-2.5 border-t border-blue-900/30 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onWatchModule(module)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 text-xs font-semibold text-white bg-[#0077c8] hover:bg-[#0062a3] rounded-lg transition-colors cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-white text-white" />
                    Stream Video
                  </button>

                  <button
                    onClick={() => onOpenResource(module)}
                    className="p-1.5 text-sky-300 hover:text-white bg-[#001e4a] hover:bg-[#002e6e] border border-blue-800/40 rounded-lg transition-colors cursor-pointer"
                    title="View QR Code & Resource Hub"
                  >
                    <QrCode className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-16 text-center bg-[#001438] rounded-2xl border border-blue-900/40 p-8 space-y-4 max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-full bg-blue-950/80 border border-blue-700/40 flex items-center justify-center mx-auto text-sky-400">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-display font-bold text-white">No Matching Training Modules Found</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            We couldn't find any modules matching your keywords or filter. Try searching for "roof", "deductible", "rate hike", or "umbrella".
          </p>
          <button
            onClick={onClearFilters}
            className="px-4 py-2 bg-[#0077c8] hover:bg-[#0060a8] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Clear All Filters & Show Everything
          </button>
        </div>
      )}

    </div>
  );
};
