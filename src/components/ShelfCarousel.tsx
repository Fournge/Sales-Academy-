import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Play, QrCode, CheckCircle2, FileText, Clock, ExternalLink } from 'lucide-react';
import { TrainingModule, TrainingCategory, AgentModuleProgress } from '../types';
import { AutoPoster } from './AutoPoster';

interface ShelfCarouselProps {
  category: TrainingCategory;
  modules: TrainingModule[];
  onWatchModule: (module: TrainingModule) => void;
  onOpenResource: (module: TrainingModule) => void;
  agentProgress: Record<string, AgentModuleProgress>;
}

export const ShelfCarousel: React.FC<ShelfCarouselProps> = ({
  category,
  modules,
  onWatchModule,
  onOpenResource,
  agentProgress,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [modules]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const scrollAmount = scrollRef.current.clientWidth * 0.75;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
    setTimeout(checkScroll, 350);
  };

  if (!modules || modules.length === 0) return null;

  return (
    <section className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto group/shelf">
      {/* Shelf Header */}
      <div className="flex items-end justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-display font-bold text-white tracking-tight">
              {category.name}
            </h2>
            <span className="text-xs text-sky-400/80 font-mono font-medium bg-blue-950/60 px-2 py-0.5 rounded border border-blue-900/60">
              {modules.length} {modules.length === 1 ? 'Module' : 'Modules'}
            </span>
          </div>
          {category.description && (
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl line-clamp-1">
              {category.description}
            </p>
          )}
        </div>

        {/* Navigation Arrows */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleScroll('left')}
            disabled={!canScrollLeft}
            className={`p-2 rounded-lg border transition-all ${
              canScrollLeft
                ? 'bg-[#001c4c] text-white hover:bg-[#002b75] border-blue-800/60 cursor-pointer shadow-sm active:scale-95'
                : 'bg-slate-900/40 text-slate-600 border-white/5 cursor-not-allowed opacity-40'
            }`}
            aria-label="Scroll shelf left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleScroll('right')}
            disabled={!canScrollRight}
            className={`p-2 rounded-lg border transition-all ${
              canScrollRight
                ? 'bg-[#001c4c] text-white hover:bg-[#002b75] border-blue-800/60 cursor-pointer shadow-sm active:scale-95'
                : 'bg-slate-900/40 text-slate-600 border-white/5 cursor-not-allowed opacity-40'
            }`}
            aria-label="Scroll shelf right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Carousel Track */}
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex items-stretch gap-4 sm:gap-5 overflow-x-auto pb-4 pt-1 hide-scrollbar snap-x snap-mandatory"
      >
        {modules.map((module) => {
          const isCompleted = agentProgress[module.id]?.completed;

          return (
            <div
              key={module.id}
              className="w-[280px] sm:w-[320px] md:w-[340px] shrink-0 snap-start flex flex-col justify-between bg-[#001438] rounded-xl border border-blue-900/40 hover:border-blue-500/50 transition-all shelf-card p-3"
            >
              {/* Poster Card Thumbnail with Click to Watch */}
              <div
                className="cursor-pointer relative overflow-hidden rounded-lg group/poster"
                onClick={() => onWatchModule(module)}
              >
                <AutoPoster
                  module={module}
                  categoryName={category.name}
                  showPlayOverlay={true}
                  isCompact={true}
                />

                {/* Mastered Badge if Completed */}
                {isCompleted && (
                  <div className="absolute top-2 right-2 z-20 flex items-center gap-1 bg-emerald-950/90 border border-emerald-500/40 text-emerald-300 text-[10px] font-semibold px-2 py-0.5 rounded shadow-md">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    Mastered
                  </div>
                )}
              </div>

              {/* Module Metadata and Hook */}
              <div className="mt-3 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 text-[11px] text-slate-400 mb-1">
                    <span className="font-semibold text-sky-400 uppercase tracking-wider">
                      {module.targetPolicyType} Policy
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

                  <p className="text-xs text-slate-300 mt-1.5 line-clamp-2 leading-relaxed">
                    {module.salesHook}
                  </p>
                </div>

                {/* Card Actions Footer */}
                <div className="mt-3 pt-2.5 border-t border-blue-900/30 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onWatchModule(module)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 text-xs font-semibold text-white bg-[#0077c8] hover:bg-[#0062a3] rounded-lg transition-colors cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-white text-white translate-x-0.2" />
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
            </div>
          );
        })}
      </div>
    </section>
  );
};
