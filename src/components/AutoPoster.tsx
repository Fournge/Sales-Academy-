import React, { useState } from 'react';
import { 
  Shield, 
  Sparkles, 
  Play, 
  Layers, 
  Laptop, 
  Car, 
  Home, 
  Umbrella, 
  Award, 
  FileCheck,
  Zap
} from 'lucide-react';
import { TrainingModule } from '../types';

interface AutoPosterProps {
  module: TrainingModule;
  categoryName?: string;
  className?: string;
  showPlayOverlay?: boolean;
  isCompact?: boolean;
}

/**
 * Generates a consistent, branded CSS thumbnail with the Allstate navy/blue gradient
 * and the module title overlaid prominently in the center.
 */
export const renderAllstateBrandedThumbnail = (
  module: TrainingModule,
  categoryName?: string,
  isCompact: boolean = false
) => {
  const rawType = (module.targetPolicyType || '').toLowerCase();
  
  let topicIcon = <Layers className="w-3.5 h-3.5 text-sky-300" />;
  if (rawType.includes('tool') || rawType.includes('software') || rawType.includes('system') || rawType.includes('crm') || rawType.includes('tech')) {
    topicIcon = <Laptop className="w-3.5 h-3.5 text-indigo-300" />;
  } else if (rawType.includes('auto') || rawType.includes('car') || rawType.includes('vehicle')) {
    topicIcon = <Car className="w-3.5 h-3.5 text-sky-300" />;
  } else if (rawType.includes('home') || rawType.includes('property')) {
    topicIcon = <Home className="w-3.5 h-3.5 text-blue-300" />;
  } else if (rawType.includes('umbrella') || rawType.includes('liability')) {
    topicIcon = <Umbrella className="w-3.5 h-3.5 text-cyan-300" />;
  } else if (rawType.includes('life')) {
    topicIcon = <Award className="w-3.5 h-3.5 text-amber-300" />;
  } else if (rawType.includes('commercial') || rawType.includes('business')) {
    topicIcon = <FileCheck className="w-3.5 h-3.5 text-emerald-300" />;
  }

  const topicLabel = (module.targetPolicyType || 'TRAINING').toUpperCase();

  return (
    <div className="w-full h-full p-3.5 sm:p-4 md:p-5 flex flex-col justify-between bg-gradient-to-br from-[#000f2e] via-[#00225c] to-[#005ea6] relative overflow-hidden select-none">
      
      {/* Allstate Radial Brand Flare & Grid Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(0,119,200,0.45),rgba(255,255,255,0))] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(0,163,224,0.25),transparent_60%)] pointer-events-none" />
      
      {/* Background Micro Grid Vector */}
      <svg className="absolute inset-0 w-full h-full opacity-15 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id={`allstate-grid-${module.id}`} width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#ffffff" strokeWidth="0.8" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#allstate-grid-${module.id})`} />
      </svg>

      {/* Top Header: Topic Tag & Duration Badge */}
      <div className="relative z-10 flex items-center justify-between gap-2">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#001438]/90 border border-blue-400/30 backdrop-blur-md shadow-sm">
          {topicIcon}
          <span className="text-[10px] font-bold tracking-wider text-sky-300 uppercase truncate max-w-[120px]">
            {topicLabel}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {module.badgeText && (
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-sky-400/20 text-sky-200 border border-sky-300/30 backdrop-blur-sm">
              {module.badgeText}
            </span>
          )}
          <span className="text-[10px] font-mono font-semibold text-white bg-blue-950/90 px-2 py-0.5 rounded border border-blue-700/50 backdrop-blur-sm">
            {module.durationMinutes}m
          </span>
        </div>
      </div>

      {/* Center Stage: Bold Prominent Centered Module Title */}
      <div className="relative z-10 my-auto py-2 text-center flex flex-col items-center justify-center px-1">
        <div className="w-7 h-0.5 bg-[#0077c8] rounded-full mb-2 opacity-80" />
        <h4 
          className={`font-display font-extrabold text-white leading-snug tracking-tight line-clamp-3 text-center drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] ${
            isCompact ? 'text-xs sm:text-sm' : 'text-sm sm:text-base md:text-lg'
          }`}
        >
          {module.title}
        </h4>
        {categoryName && !isCompact && (
          <p className="text-[11px] text-sky-200/90 font-medium mt-1.5 tracking-wide drop-shadow-sm truncate max-w-[90%]">
            {categoryName}
          </p>
        )}
      </div>

      {/* Bottom Footer: Tibbs Agency Watermark */}
      <div className="relative z-10 flex items-center justify-between text-[10px] text-blue-200/80 pt-2 border-t border-blue-400/20">
        <span className="font-semibold tracking-wider uppercase flex items-center gap-1">
          <Shield className="w-3 h-3 text-sky-400" />
          Tibbs Insurance Academy
        </span>
        <span className="font-mono text-slate-300">Allstate Brand</span>
      </div>
    </div>
  );
};

export const AutoPoster: React.FC<AutoPosterProps> = ({
  module,
  categoryName,
  className = '',
  showPlayOverlay = false,
  isCompact = false,
}) => {
  const [imageFailed, setImageFailed] = useState(false);

  // Check for explicit custom poster URL
  const customPoster = (module.customPosterUrl || module.posterUrl || '').trim();
  const hasValidCustomPoster = Boolean(customPoster && !imageFailed);

  return (
    <div className={`relative w-full aspect-video overflow-hidden rounded-xl bg-[#001438] border border-blue-900/40 select-none group ${className}`}>
      {hasValidCustomPoster ? (
        <div className="relative w-full h-full overflow-hidden">
          <img
            src={customPoster}
            alt={module.title}
            referrerPolicy="no-referrer"
            onError={() => setImageFailed(true)}
            className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
          />
          {/* Subtle gradient vignette for text legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#000f2b]/95 via-[#000f2b]/40 to-transparent flex flex-col justify-between p-3.5" />

          {/* Top Row Badges on Image */}
          <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2 z-10">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-950/90 text-sky-300 border border-blue-600/40 backdrop-blur-sm">
              {module.targetPolicyType}
            </span>
            <span className="text-[10px] font-mono font-medium text-white bg-slate-950/80 px-2 py-0.5 rounded border border-white/10 backdrop-blur-sm">
              {module.durationMinutes}m
            </span>
          </div>

          {/* Centered Overlay Title on Custom Image */}
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-4 text-center">
            <h4 className={`font-display font-extrabold text-white leading-snug tracking-tight line-clamp-2 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] ${isCompact ? 'text-xs sm:text-sm' : 'text-sm md:text-base'}`}>
              {module.title}
            </h4>
          </div>
        </div>
      ) : (
        /* Consistent Branded Allstate Navy/Blue Gradient Thumbnail with Centered Title */
        renderAllstateBrandedThumbnail(module, categoryName, isCompact)
      )}

      {/* Hover & Play Overlay */}
      {showPlayOverlay && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4 z-20">
          <div className="w-12 h-12 rounded-full bg-[#0077c8] text-white flex items-center justify-center shadow-lg shadow-blue-500/50 transform scale-90 group-hover:scale-100 transition-transform duration-300">
            <Play className="w-6 h-6 fill-white translate-x-0.5" />
          </div>
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white">
            <span className="font-medium truncate max-w-[70%]">{module.title}</span>
            <span className="text-sky-300 font-mono shrink-0">{module.durationMinutes} min</span>
          </div>
        </div>
      )}
    </div>
  );
};
