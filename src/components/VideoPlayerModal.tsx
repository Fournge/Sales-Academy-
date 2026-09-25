import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Maximize2, 
  Minimize2, 
  QrCode, 
  Copy, 
  Check, 
  ExternalLink, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles,
  HelpCircle,
  Clock,
  BookOpen,
  Info,
  RefreshCw,
  PlayCircle,
  AlertTriangle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { TrainingModule, TrainingCategory, AgentModuleProgress } from '../types';
import { formatVideoUrl } from '../utils/videoHelper';
import { generateQrDataUrl } from '../utils/qrHelper';

interface VideoPlayerModalProps {
  module: TrainingModule | null;
  category?: TrainingCategory;
  isOpen: boolean;
  onClose: () => void;
  agentProgress: Record<string, AgentModuleProgress>;
  onUpdateProgress: (moduleId: string, progress: Partial<AgentModuleProgress>) => void;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  module,
  category,
  isOpen,
  onClose,
  agentProgress,
  onUpdateProgress,
}) => {
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [agentNote, setAgentNote] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'resources' | 'notes'>('resources');
  const [playerKey, setPlayerKey] = useState(0);
  const iframeContainerRef = useRef<HTMLDivElement>(null);

  const isCompleted = module ? agentProgress[module.id]?.completed : false;

  useEffect(() => {
    if (!module || !isOpen) return;

    // Load initial note
    setAgentNote(agentProgress[module.id]?.notes || '');

    // Generate QR Code Data URL
    if (module.resourceUrl) {
      generateQrDataUrl(module.resourceUrl, true).then((url) => {
        setQrDataUrl(url);
      });
    } else {
      setQrDataUrl('');
    }
  }, [module, isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !module) return null;

  // Active streaming target
  const formattedVideo = formatVideoUrl(module.videoUrl);

  const handleToggleComplete = () => {
    const nextState = !isCompleted;
    onUpdateProgress(module.id, {
      completed: nextState,
      completedAt: nextState ? new Date().toISOString() : undefined,
    });

    if (nextState) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#0077c8', '#00a3e0', '#38bdf8', '#ffffff'],
        });
      } catch (e) {
        // Safe fallback
      }
    }
  };

  const handleSaveNotes = () => {
    onUpdateProgress(module.id, { notes: agentNote });
  };

  const handleCopyLink = () => {
    if (!module.resourceUrl) return;
    navigator.clipboard.writeText(module.resourceUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const toggleFullscreen = () => {
    if (!iframeContainerRef.current) return;
    if (!document.fullscreenElement) {
      iframeContainerRef.current.requestFullscreen().catch((err) => {
        console.warn('Fullscreen request failed:', err);
      });
    } else {
      document.exitFullscreen().catch((err) => {
        console.warn('Exit fullscreen failed:', err);
      });
    }
  };

  const handleReloadPlayer = () => {
    setPlayerKey((k) => k + 1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 md:p-6 overflow-y-auto">
      {/* Modal Container */}
      <div 
        className={`relative w-full bg-[#00102e] border border-blue-800/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col transition-all duration-300 ${
          isTheaterMode ? 'max-w-7xl h-[94vh]' : 'max-w-6xl h-[90vh]'
        }`}
      >
        {/* Top Header Bar */}
        <div className="px-4 py-3 bg-[#001438] border-b border-blue-900/50 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 truncate">
            <span className="text-xs font-semibold text-sky-400 uppercase tracking-wider bg-blue-950/90 px-2 py-0.5 rounded border border-blue-600/30 shrink-0">
              {category?.name || 'Tibbs Academy'}
            </span>
            <span className="text-xs text-slate-400 hidden sm:inline">·</span>
            <h2 className="text-sm md:text-base font-display font-bold text-white truncate">
              {module.title}
            </h2>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Mark as Mastered button */}
            <button
              onClick={handleToggleComplete}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                isCompleted
                  ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-600/30'
                  : 'bg-blue-900/30 text-slate-300 border border-blue-800/40 hover:bg-blue-800/50 hover:text-white'
              }`}
            >
              <CheckCircle2 className={`w-4 h-4 ${isCompleted ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span className="hidden sm:inline">{isCompleted ? 'Mastered ✓' : 'Mark Mastered'}</span>
            </button>

            {/* Theater Mode Toggle */}
            <button
              onClick={() => setIsTheaterMode(!isTheaterMode)}
              className="p-1.5 text-slate-300 hover:text-white bg-blue-950/60 hover:bg-blue-900/60 rounded-lg border border-blue-900/50 transition-colors cursor-pointer"
              title={isTheaterMode ? 'Standard Mode' : 'Theater Mode'}
            >
              {isTheaterMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Close Modal */}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white bg-slate-900/60 hover:bg-red-950/60 rounded-lg border border-white/10 transition-colors cursor-pointer"
              title="Close (ESC)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Diagnostic Stream Bar */}
        <div className="px-4 py-1.5 bg-[#000c24] border-b border-blue-950 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-300">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-sky-400 font-semibold">
              <PlayCircle className="w-3.5 h-3.5" />
              Stream Engine:
            </span>
            <span className="font-mono text-slate-300">
              {formattedVideo.isGoogleDrive ? 'Google Drive Preview (/preview)' : formattedVideo.type.toUpperCase()}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {module.videoUrl && (
              <a
                href={module.videoUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-sky-300 hover:text-white underline cursor-pointer"
              >
                <ExternalLink className="w-3 h-3" />
                <span>Open in New Tab</span>
              </a>
            )}

            <button
              onClick={handleReloadPlayer}
              className="flex items-center gap-1 text-slate-400 hover:text-white cursor-pointer ml-2"
              title="Reload video stream"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reload Stream</span>
            </button>
          </div>
        </div>

        {/* Main Content Area: Split Stage & Resource Panel */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          
          {/* Left / Center Stage: Video Player */}
          <div 
            ref={iframeContainerRef}
            className={`bg-black flex flex-col justify-center items-center relative overflow-hidden transition-all duration-300 ${
              isTheaterMode ? 'lg:w-[72%]' : 'lg:w-[62%]'
            } w-full min-h-[280px] sm:min-h-[400px] lg:min-h-full`}
          >
            {formattedVideo.isValid ? (
              formattedVideo.type === 'direct' ? (
                <div className="w-full h-full flex items-center justify-center bg-black">
                  <video
                    key={`video-${playerKey}-${formattedVideo.embedUrl}`}
                    src={formattedVideo.embedUrl}
                    controls
                    autoPlay
                    playsInline
                    preload="auto"
                    className="w-full h-full max-h-[75vh] object-contain"
                  />
                </div>
              ) : (
                <iframe
                  key={`iframe-${playerKey}-${formattedVideo.embedUrl}`}
                  src={formattedVideo.embedUrl}
                  title={module.title}
                  className="w-full h-full border-0 absolute inset-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                  allowFullScreen
                />
              )
            ) : (
              <div className="p-8 text-center max-w-md text-slate-300 flex flex-col items-center">
                <AlertTriangle className="w-12 h-12 text-amber-400 mb-3" />
                <h4 className="text-lg font-bold text-white mb-2">Video Stream Notice</h4>
                <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                  {formattedVideo.helperMessage || 'Please verify the Google Drive share link in Manager Mode.'}
                </p>

                {module.videoUrl && (
                  <a
                    href={module.videoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0077c8] text-white text-xs font-semibold rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open Video Link
                  </a>
                )}
              </div>
            )}

            {/* Bottom Stream Bar on Player */}
            <div className="absolute bottom-2 left-3 right-3 z-20 pointer-events-none flex items-center justify-between">
              <span className="text-[10px] text-white/80 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded border border-white/10">
                HD Training Playback Active
              </span>
              <button
                onClick={toggleFullscreen}
                className="pointer-events-auto p-1.5 bg-black/80 hover:bg-[#0077c8] text-white rounded text-xs flex items-center gap-1 cursor-pointer transition-colors shadow-md"
              >
                <Maximize2 className="w-3.5 h-3.5" /> Fullscreen
              </button>
            </div>
          </div>

          {/* Right Side Panel: Resource Hub, QR Code & Scripts */}
          <div className="flex-1 flex flex-col bg-[#001233] border-t lg:border-t-0 lg:border-l border-blue-900/50 overflow-hidden">
            
            {/* Panel Navigation Tabs */}
            <div className="flex items-center border-b border-blue-900/40 px-3 pt-2 bg-[#00163d]">
              <button
                onClick={() => setActiveTab('resources')}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'resources'
                    ? 'border-[#0077c8] text-sky-300'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>QR Hub & Worksheet</span>
              </button>

              <button
                onClick={() => setActiveTab('notes')}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'notes'
                    ? 'border-[#0077c8] text-sky-300'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Agent Notes</span>
              </button>
            </div>

            {/* Tab Contents */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
              
              {/* TAB 1: Resources & Dynamic QR Code Hub */}
              {activeTab === 'resources' && (
                <div className="space-y-4">
                  {/* QR Code Scannable Card */}
                  <div className="p-4 rounded-xl bg-gradient-to-br from-[#001b4d] to-[#00266e] border border-blue-600/30 text-center flex flex-col items-center shadow-lg">
                    <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-sky-300 mb-2">
                      <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                      Mobile Agent Hub
                    </div>

                    <h4 className="text-sm font-semibold text-white mb-1">
                      {module.resourceTitle || 'Live Intake Form & Worksheet'}
                    </h4>
                    <p className="text-xs text-sky-200/80 mb-3">
                      Scan with your smartphone camera to open live objection cheat sheet during phone calls.
                    </p>

                    {/* Rendered Scannable QR Code */}
                    <div className="p-2.5 bg-white rounded-xl shadow-md border-2 border-sky-400/40 mb-3">
                      {qrDataUrl ? (
                        <img
                          src={qrDataUrl}
                          alt="Resource QR Code"
                          className="w-36 h-36 sm:w-40 sm:h-40 object-contain mx-auto"
                        />
                      ) : (
                        <div className="w-36 h-36 flex items-center justify-center text-slate-400 text-xs">
                          No resource URL configured
                        </div>
                      )}
                    </div>

                    {/* Action Links & Desktop Fallback */}
                    <div className="w-full flex flex-col sm:flex-row items-center gap-2 pt-1">
                      {module.resourceUrl && (
                        <a
                          href={module.resourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="w-full sm:flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-[#0077c8] hover:bg-[#0062a8] text-white text-xs font-semibold rounded-lg transition-colors shadow-sm cursor-pointer"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Open On Desktop</span>
                        </a>
                      )}

                      <button
                        onClick={handleCopyLink}
                        disabled={!module.resourceUrl}
                        className="w-full sm:w-auto flex items-center justify-center gap-1.5 py-2 px-3 bg-[#00163d] hover:bg-[#002255] text-sky-300 text-xs font-medium rounded-lg border border-blue-700/40 transition-colors cursor-pointer"
                      >
                        {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedLink ? 'Link Copied!' : 'Copy Link'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Summary Callout */}
                  <div className="p-3.5 rounded-xl bg-blue-950/40 border border-blue-900/50 space-y-2">
                    <h5 className="text-xs font-bold text-sky-300 uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
                      Core Training Focus
                    </h5>
                    <p className="text-xs text-slate-200 leading-relaxed font-medium">
                      {module.salesHook}
                    </p>
                    <p className="text-xs text-slate-400 leading-relaxed pt-1">
                      {module.description}
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 2: Agent Study Notes */}
              {activeTab === 'notes' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5" />
                      Personal Key Takeaways
                    </span>
                    <span className="text-[10px] text-slate-400">Auto-saved to your browser</span>
                  </div>

                  <textarea
                    value={agentNote}
                    onChange={(e) => setAgentNote(e.target.value)}
                    onBlur={handleSaveNotes}
                    placeholder="Write your custom notes, client phone scenarios, or adjustments for your local market..."
                    rows={8}
                    className="w-full p-3 bg-[#001740] text-slate-100 text-xs rounded-xl border border-blue-800/40 focus:outline-none focus:ring-2 focus:ring-[#0077c8] placeholder-slate-500 leading-relaxed"
                  />

                  <div className="flex justify-end">
                    <button
                      onClick={handleSaveNotes}
                      className="px-3 py-1.5 bg-[#0077c8] hover:bg-[#0062a8] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                    >
                      Save Notes
                    </button>
                  </div>
                </div>
              )}

            </div>

            {/* Bottom Footer Info */}
            <div className="px-4 py-2.5 bg-[#00102e] border-t border-blue-900/40 text-[11px] text-slate-400 flex items-center justify-between shrink-0">
              <span className="truncate max-w-[200px]">
                Target: <strong className="text-sky-300">{module.targetPolicyType} Policyholders</strong>
              </span>
              <span className="font-mono text-slate-500">{module.durationMinutes} min runtime</span>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
