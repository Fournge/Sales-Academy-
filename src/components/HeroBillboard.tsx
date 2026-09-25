import React from 'react';
import { Play, QrCode, ShieldCheck, Sparkles, Clock, CheckCircle2, ChevronRight, ChevronLeft } from 'lucide-react';
import { TrainingModule, TrainingCategory } from '../types';
import { AutoPoster } from './AutoPoster';

interface HeroBillboardProps {
  featuredModules: TrainingModule[];
  currentIndex: number;
  onNext: () => void;
  onPrev: () => void;
  onSelectIndex: (index: number) => void;
  onWatchModule: (module: TrainingModule) => void;
  onOpenResource: (module: TrainingModule) => void;
  categories: TrainingCategory[];
  isCompleted?: boolean;
}

export const HeroBillboard: React.FC<HeroBillboardProps> = ({
  featuredModules,
  currentIndex,
  onNext,
  onPrev,
  onSelectIndex,
  onWatchModule,
  onOpenResource,
  categories,
  isCompleted,
}) => {
  if (!featuredModules || featuredModules.length === 0) return null;

  const currentModule = featuredModules[currentIndex % featuredModules.length];
  const category = categories.find((c) => c.id === currentModule.categoryId);

  return (
    <div className="relative w-full overflow-hidden bg-gradient-to-b from-[#001438] via-[#001c4c] to-[#000f2b] border-b border-blue-900/40">
      {/* Background Ambient Glow */}
      <div 
        className="absolute inset-0 opacity-25 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 75% 30%, #0077c8 0%, transparent 60%), radial-gradient(circle at 20% 80%, #002b66 0%, transparent 50%)',
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Headline, Sales Hook, Script Preview, Action CTAs */}
          <div className="lg:col-span-7 space-y-4 md:space-y-5">
            {/* Kicker / Category & Badges */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-semibold text-sky-400 uppercase tracking-wider flex items-center gap-1.5 bg-blue-950/80 px-2.5 py-1 rounded-md border border-blue-500/30">
                <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                Featured Spotlight Training
              </span>
              {category && (
                <span className="text-slate-300 font-medium">
                  {category.name}
                </span>
              )}
              <span className="text-slate-500">·</span>
              <span className="flex items-center gap-1 text-slate-300 font-mono">
                <Clock className="w-3.5 h-3.5 text-sky-400" />
                {currentModule.durationMinutes} min
              </span>
              {isCompleted && (
                <span className="flex items-center gap-1 text-emerald-400 font-semibold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                  <CheckCircle2 className="w-3 h-3" /> Mastered
                </span>
              )}
            </div>

            {/* Bold Title */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-extrabold text-white tracking-tight leading-[1.15] text-balance">
              {currentModule.title}
            </h1>

            {/* High-Impact Sales Hook */}
            <div className="p-3.5 rounded-xl bg-blue-950/60 border border-blue-600/30 text-sky-100 text-sm md:text-base font-medium flex items-start gap-3 shadow-inner">
              <div className="p-1 rounded-md bg-[#0077c8]/20 text-sky-400 shrink-0 mt-0.5">
                <ShieldCheck className="w-5 h-5 text-sky-400" />
              </div>
              <p className="leading-relaxed">
                <span className="text-sky-300 font-semibold mr-1.5">Key Takeaway:</span>
                {currentModule.salesHook}
              </p>
            </div>

            {/* Core Description */}
            <p className="text-slate-300 text-sm leading-relaxed line-clamp-3">
              {currentModule.description}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onWatchModule(currentModule)}
                className="flex items-center gap-2.5 px-6 py-3 bg-[#0077c8] hover:bg-[#0060a8] text-white font-semibold text-sm sm:text-base rounded-xl transition-all shadow-lg shadow-blue-600/30 active:scale-95 group cursor-pointer"
              >
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Play className="w-3.5 h-3.5 fill-white text-white translate-x-0.5" />
                </div>
                <span>Watch Training Stream</span>
              </button>

              <button
                onClick={() => onOpenResource(currentModule)}
                className="flex items-center gap-2 px-4 py-3 bg-[#002255] hover:bg-[#003078] text-sky-200 font-medium text-sm rounded-xl border border-blue-700/40 transition-all cursor-pointer"
              >
                <QrCode className="w-4 h-4 text-sky-400" />
                <span>Worksheet & QR Hub</span>
              </button>
            </div>

            {/* Multi-Featured Selector Tabs */}
            {featuredModules.length > 1 && (
              <div className="flex items-center gap-2 pt-2">
                <span className="text-xs text-slate-400 font-medium">Spotlights:</span>
                <div className="flex items-center gap-1.5">
                  {featuredModules.map((mod, idx) => (
                    <button
                      key={mod.id}
                      onClick={() => onSelectIndex(idx)}
                      className={`w-2.5 h-2.5 rounded-full transition-all ${
                        idx === currentIndex
                          ? 'bg-[#0077c8] w-6'
                          : 'bg-slate-600 hover:bg-slate-400'
                      }`}
                      title={mod.title}
                    />
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Right Column: Hero Visual Card with Play Trigger */}
          <div className="lg:col-span-5">
            <div 
              className="cursor-pointer group relative rounded-2xl p-1 bg-gradient-to-b from-blue-500/30 to-blue-900/20 shadow-2xl transition-all hover:scale-[1.02]"
              onClick={() => onWatchModule(currentModule)}
            >
              <AutoPoster
                module={currentModule}
                categoryName={category?.name}
                showPlayOverlay={true}
                className="shadow-2xl rounded-xl"
              />
              
              {/* Floating Key Objection Badge */}
              {currentModule.keyObjection && (
                <div className="absolute -bottom-3 left-4 right-4 bg-[#00102e]/95 backdrop-blur-md border border-blue-500/40 rounded-lg p-2.5 shadow-lg flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-sky-400 font-bold uppercase tracking-wider text-[10px]">Target Objection:</span>
                    <span className="text-slate-200 truncate italic">"{currentModule.keyObjection}"</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-sky-400 shrink-0" />
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
