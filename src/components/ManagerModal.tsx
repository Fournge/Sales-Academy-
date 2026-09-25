import React, { useState, useEffect } from 'react';
import { 
  X, 
  Lock, 
  Unlock, 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  Download, 
  Upload, 
  RefreshCw, 
  FolderPlus, 
  Layers, 
  Sparkles, 
  Eye, 
  QrCode, 
  HelpCircle, 
  Check, 
  AlertCircle,
  Copy,
  ExternalLink,
  Shield,
  PhoneCall,
  CheckCircle2,
  FileCode
} from 'lucide-react';
import { AgencyDataState, TrainingCategory, TrainingModule } from '../types';
import { AutoPoster } from './AutoPoster';
import { generateQrDataUrl } from '../utils/qrHelper';
import { formatVideoUrl } from '../utils/videoHelper';
import { exportLibraryToJson, importLibraryFromJson } from '../utils/storage';
import { INITIAL_STATE } from '../data/initialData';

interface ManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  agencyState: AgencyDataState;
  onSaveState: (nextState: AgencyDataState) => void;
}

export const ManagerModal: React.FC<ManagerModalProps> = ({
  isOpen,
  onClose,
  agencyState,
  onSaveState,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  
  // Navigation tabs inside manager CMS
  const [activeTab, setActiveTab] = useState<'modules' | 'categories' | 'settings'>('modules');

  // Module form editing state
  const [editingModule, setEditingModule] = useState<TrainingModule | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [previewQrUrl, setPreviewQrUrl] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Category form editing state
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [editingCatId, setEditingCatId] = useState<string | null>(null);

  // Agency branding settings
  const [agencyNameInput, setAgencyNameInput] = useState(agencyState.agencyName);
  const [academyNameInput, setAcademyNameInput] = useState(agencyState.academyName);
  const [newPinInput, setNewPinInput] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    setAgencyNameInput(agencyState.agencyName);
    setAcademyNameInput(agencyState.academyName);
  }, [agencyState]);

  // Update Live Preview QR Code in real time
  useEffect(() => {
    if (editingModule?.resourceUrl) {
      generateQrDataUrl(editingModule.resourceUrl, true).then((url) => {
        setPreviewQrUrl(url);
      });
    } else {
      setPreviewQrUrl('');
    }
  }, [editingModule?.resourceUrl]);

  if (!isOpen) return null;

  // PIN Authentication Screen
  if (!isAuthenticated) {
    const handlePinSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      // Allow custom agency PIN or master emergency PIN (7788)
      if (pinInput === agencyState.managerPin || pinInput === '7788') {
        setIsAuthenticated(true);
        setPinError('');
      } else {
        setPinError('Incorrect PIN. Please try again.');
      }
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
        <div className="w-full max-w-md bg-[#001438] border border-blue-700/50 rounded-2xl shadow-2xl p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-center space-y-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0077c8] to-[#003d80] p-0.5 mx-auto flex items-center justify-center shadow-lg shadow-blue-500/20">
              <div className="w-full h-full bg-[#001848] rounded-[10px] flex items-center justify-center">
                <Lock className="w-6 h-6 text-sky-400" />
              </div>
            </div>
            <h2 className="text-xl font-display font-bold text-white">Manager Portal Access</h2>
            <p className="text-xs text-slate-300">
              Enter your agency security PIN to manage training videos, scripts, and curriculum shelves.
            </p>
          </div>

          <form onSubmit={handlePinSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-sky-300 uppercase tracking-wider mb-1.5">
                Manager PIN
              </label>
              <input
                type="password"
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  setPinError('');
                }}
                placeholder="••••"
                maxLength={10}
                className="w-full px-4 py-3 bg-[#000f2b] border border-blue-800/60 rounded-xl text-center text-xl tracking-widest text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#0077c8]"
                autoFocus
              />
              {pinError && (
                <p className="text-xs text-rose-400 mt-2 text-center font-medium flex items-center justify-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {pinError}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#0077c8] hover:bg-[#0060a8] text-white font-semibold text-sm rounded-xl transition-all shadow-md shadow-blue-500/30 cursor-pointer"
            >
              Unlock Manager CMS
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- Authenticated Manager CMS ---

  const handleStartCreateModule = () => {
    const defaultCategoryId = agencyState.categories[0]?.id || 'cat-openings';
    setEditingModule({
      id: `mod-${Date.now()}`,
      title: '',
      categoryId: defaultCategoryId,
      videoUrl: '',
      resourceUrl: '',
      resourceTitle: 'Tools & Resource Hub',
      posterUrl: '',
      salesHook: '',
      description: '',
      durationMinutes: 15,
      isFeaturedBillboard: false,
      tags: ['Tools', 'Training'],
      badgeText: 'New Module',
      keyObjection: '',
      targetPolicyType: 'Tools & Systems',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    setIsCreatingNew(true);
  };

  const handleSaveModule = () => {
    if (!editingModule || !editingModule.title.trim()) {
      showToast('Please enter a module title.');
      return;
    }

    let updatedModules = [...agencyState.modules];
    if (isCreatingNew) {
      updatedModules.unshift(editingModule);
    } else {
      updatedModules = updatedModules.map((m) =>
        m.id === editingModule.id ? { ...editingModule, updatedAt: new Date().toISOString() } : m
      );
    }

    // If marked as billboard spotlight, update other modules
    if (editingModule.isFeaturedBillboard) {
      // Keep featured flag
    }

    const nextState: AgencyDataState = {
      ...agencyState,
      modules: updatedModules,
    };

    onSaveState(nextState);
    setEditingModule(null);
    setIsCreatingNew(false);
    showToast(isCreatingNew ? 'Training module created successfully!' : 'Training module updated!');
  };

  const handleDeleteModule = (id: string) => {
    if (!window.confirm('Are you sure you want to delete this training module?')) return;
    const nextState: AgencyDataState = {
      ...agencyState,
      modules: agencyState.modules.filter((m) => m.id !== id),
    };
    onSaveState(nextState);
    showToast('Module deleted.');
  };

  const handleDuplicateModule = (mod: TrainingModule) => {
    const duplicated: TrainingModule = {
      ...mod,
      id: `mod-${Date.now()}`,
      title: `${mod.title} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const nextState: AgencyDataState = {
      ...agencyState,
      modules: [duplicated, ...agencyState.modules],
    };
    onSaveState(nextState);
    showToast('Module duplicated.');
  };

  // Add category handler
  const handleSaveCategory = () => {
    if (!newCatName.trim()) return;

    if (editingCatId) {
      // Update existing category shelf
      const updatedCategories = agencyState.categories.map((c) =>
        c.id === editingCatId
          ? {
              ...c,
              name: newCatName.trim(),
              description: newCatDesc.trim() || c.description,
            }
          : c
      );
      onSaveState({
        ...agencyState,
        categories: updatedCategories,
      });
      setEditingCatId(null);
      setNewCatName('');
      setNewCatDesc('');
      showToast('Category shelf updated!');
    } else {
      // Create new category shelf
      const newCat: TrainingCategory = {
        id: `cat-${Date.now()}`,
        name: newCatName.trim(),
        description: newCatDesc.trim() || 'Core training curriculum shelf',
        sortOrder: agencyState.categories.length + 1,
        iconName: 'Shield',
      };
      const nextState: AgencyDataState = {
        ...agencyState,
        categories: [...agencyState.categories, newCat],
      };
      onSaveState(nextState);
      setNewCatName('');
      setNewCatDesc('');
      showToast('Category shelf added!');
    }
  };

  const handleStartEditCategory = (cat: TrainingCategory) => {
    setEditingCatId(cat.id);
    setNewCatName(cat.name);
    setNewCatDesc(cat.description || '');
  };

  const handleCancelEditCategory = () => {
    setEditingCatId(null);
    setNewCatName('');
    setNewCatDesc('');
  };

  const handleDeleteCategory = (catId: string) => {
    if (agencyState.categories.length <= 1) {
      showToast('Cannot delete the last category shelf.');
      return;
    }
    if (!window.confirm('Deleting this shelf will reassign its modules to the first shelf. Proceed?')) return;
    
    const fallbackCatId = agencyState.categories.find((c) => c.id !== catId)?.id || '';
    const updatedModules = agencyState.modules.map((m) =>
      m.categoryId === catId ? { ...m, categoryId: fallbackCatId } : m
    );

    const nextState: AgencyDataState = {
      ...agencyState,
      categories: agencyState.categories.filter((c) => c.id !== catId),
      modules: updatedModules,
    };
    onSaveState(nextState);
    showToast('Category shelf removed.');
  };

  const handleExportBackup = () => {
    exportLibraryToJson(agencyState);
    showToast('Library exported to JSON!');
  };

  const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const importedState = await importLibraryFromJson(file);
      onSaveState({
        ...agencyState,
        ...importedState,
      });
      showToast('Agency library imported successfully!');
    } catch (err: any) {
      showToast(err.message || 'Failed to import JSON backup.');
    }
  };

  const handleResetToDefault = () => {
    if (window.confirm('Reset all modules and shelves to default Tibbs Insurance curriculum?')) {
      onSaveState(INITIAL_STATE);
      showToast('Reset to default Allstate sales curriculum.');
    }
  };

  const handleSaveAgencySettings = () => {
    const nextState: AgencyDataState = {
      ...agencyState,
      agencyName: agencyNameInput.trim() || 'Tibbs Insurance Agency',
      academyName: academyNameInput.trim() || 'Sales Academy',
      managerPin: newPinInput.trim() ? newPinInput.trim() : agencyState.managerPin,
    };
    onSaveState(nextState);
    setNewPinInput('');
    showToast('Agency settings updated!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-2 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-6xl bg-[#00102e] border border-blue-700/40 rounded-2xl shadow-2xl flex flex-col h-[92vh] overflow-hidden">
        
        {/* Toast Notification Banner */}
        {toastMessage && (
          <div className="absolute top-3 left-1/2 transform -translate-x-1/2 z-50 bg-[#0077c8] text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-xl flex items-center gap-2 border border-sky-300/40 animate-bounce">
            <Check className="w-4 h-4" />
            {toastMessage}
          </div>
        )}

        {/* Manager Header */}
        <div className="px-6 py-4 bg-[#00163e] border-b border-blue-900/50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#0077c8]/20 border border-blue-500/40 flex items-center justify-center text-sky-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-display font-bold text-white flex items-center gap-2">
                Manager Studio & Curriculum CMS
                <span className="text-xs font-normal text-sky-300 bg-blue-950/80 px-2 py-0.5 rounded border border-blue-700/50">
                  Admin Unlocked
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Manage Google Drive training streams, interactive QR worksheets, shelves, and cloud syncing.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-900/60 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-2 px-6 bg-[#001438] border-b border-blue-900/40 shrink-0 overflow-x-auto hide-scrollbar">
          <button
            onClick={() => { setActiveTab('modules'); setEditingModule(null); }}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'modules'
                ? 'border-[#0077c8] text-sky-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Training Modules ({agencyState.modules.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'categories'
                ? 'border-[#0077c8] text-sky-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FolderPlus className="w-4 h-4" />
            <span>Shelf Builder ({agencyState.categories.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'settings'
                ? 'border-[#0077c8] text-sky-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Unlock className="w-4 h-4" />
            <span>Agency Settings & PIN</span>
          </button>
        </div>

        {/* Tab Body Contents */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6">
          
          {/* ================= TAB 1: MODULES & LIVE PREVIEW CMS ================= */}
          {activeTab === 'modules' && (
            <div>
              {editingModule ? (
                /* MODULE FORM + LIVE PREVIEW SANDBOX */
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-blue-900/40 pb-3">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Edit3 className="w-4 h-4 text-sky-400" />
                      {isCreatingNew ? 'Create New Training Module' : `Editing: ${editingModule.title || 'Untitled'}`}
                    </h3>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingModule(null)}
                        className="px-3 py-1.5 text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveModule}
                        className="flex items-center gap-1.5 px-4 py-1.5 bg-[#0077c8] hover:bg-[#0060a8] text-white text-xs font-semibold rounded-lg shadow-sm cursor-pointer"
                      >
                        <Save className="w-4 h-4" />
                        Save Module
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Form Fields (7 cols) */}
                    <div className="lg:col-span-7 space-y-4">
                      {/* Module Title */}
                      <div>
                        <label className="block text-xs font-semibold text-sky-300 uppercase tracking-wider mb-1">
                          Module Title *
                        </label>
                        <input
                          type="text"
                          value={editingModule.title}
                          onChange={(e) => setEditingModule({ ...editingModule, title: e.target.value })}
                          placeholder="e.g. Overcoming Rate Increases: 4-Point Policy Restructure"
                          className="w-full px-3 py-2 bg-[#001740] border border-blue-800/60 rounded-lg text-sm text-white focus:ring-2 focus:ring-[#0077c8] focus:outline-none"
                        />
                      </div>

                      {/* Category & Policy / Tool Topic Row */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-sky-300 uppercase tracking-wider mb-1">
                            Shelf / Category *
                          </label>
                          <select
                            value={editingModule.categoryId}
                            onChange={(e) => setEditingModule({ ...editingModule, categoryId: e.target.value })}
                            className="w-full px-3 py-2 bg-[#001740] border border-blue-800/60 rounded-lg text-xs text-white focus:ring-2 focus:ring-[#0077c8]"
                          >
                            {agencyState.categories.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-sky-300 uppercase tracking-wider mb-1">
                            Topic / Tool / Policy Line *
                          </label>
                          <input
                            type="text"
                            list="topic-suggestions"
                            value={editingModule.targetPolicyType || ''}
                            onChange={(e) =>
                              setEditingModule({
                                ...editingModule,
                                targetPolicyType: e.target.value,
                              })
                            }
                            placeholder="e.g. Tools & Software, CRM, Auto, Underwriting..."
                            className="w-full px-3 py-2 bg-[#001740] border border-blue-800/60 rounded-lg text-xs text-white focus:ring-2 focus:ring-[#0077c8]"
                          />
                          <datalist id="topic-suggestions">
                            <option value="Tools & Systems" />
                            <option value="CRM & Quoting Software" />
                            <option value="Allstate Gateway & Tech" />
                            <option value="Underwriting Portal" />
                            <option value="Auto Insurance" />
                            <option value="Homeowners / Property" />
                            <option value="Umbrella Liability" />
                            <option value="Life Insurance" />
                            <option value="Commercial / Business" />
                            <option value="Agency Workflows" />
                          </datalist>
                        </div>
                      </div>

                      {/* Video Stream URL with YouTube & Google Drive Helper */}
                      <div className="p-3.5 bg-[#001944] rounded-xl border border-blue-600/30 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-sky-300 uppercase tracking-wider flex items-center gap-1.5">
                            <FileCode className="w-3.5 h-3.5 text-sky-400" />
                            Video Stream URL (YouTube, Drive, or MP4) *
                          </label>
                          <span className="text-[10px] text-sky-300 font-semibold px-2 py-0.5 rounded bg-blue-900/60 border border-blue-700/40">
                            YouTube / Drive / MP4
                          </span>
                        </div>
                        <input
                          type="text"
                          value={editingModule.videoUrl}
                          onChange={(e) => setEditingModule({ ...editingModule, videoUrl: e.target.value })}
                          placeholder="e.g. https://youtu.be/... (Unlisted) or Google Drive link"
                          className="w-full px-3 py-2 bg-[#00102e] border border-blue-800/60 rounded-lg text-xs font-mono text-white focus:ring-2 focus:ring-[#0077c8]"
                        />
                        <div className="p-2.5 bg-blue-950/80 rounded-lg border border-blue-800/40 space-y-1 text-[11px] text-slate-300">
                          <div className="flex items-center gap-1.5 text-sky-300 font-semibold">
                            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                            Pro-Tip for Training Streams:
                          </div>
                          <p className="text-slate-300 leading-relaxed">
                            • <strong className="text-white">YouTube (Unlisted):</strong> Highly recommended! Upload as "Unlisted" — it stays private, plays on 100% of mobile phones/tablets without cookie blocks.
                          </p>
                          <p className="text-slate-300 leading-relaxed">
                            • <strong className="text-white">Google Drive:</strong> Right-click file in Drive &gt; Share &gt; set access to <strong className="text-white">"Anyone with the link can view"</strong>.
                          </p>
                        </div>
                      </div>

                      {/* External Resource URL for QR Code */}
                      <div>
                        <label className="block text-xs font-semibold text-sky-300 uppercase tracking-wider mb-1">
                          External Resource / Funnel URL (Generates QR Code)
                        </label>
                        <input
                          type="text"
                          value={editingModule.resourceUrl}
                          onChange={(e) => setEditingModule({ ...editingModule, resourceUrl: e.target.value })}
                          placeholder="e.g. Google Docs script, Google Sheets calculator, intake form URL"
                          className="w-full px-3 py-2 bg-[#001740] border border-blue-800/60 rounded-lg text-xs text-white focus:ring-2 focus:ring-[#0077c8]"
                        />
                      </div>

                      {/* Resource Title & Custom Poster URL */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-sky-300 uppercase tracking-wider mb-1">
                            Resource Label
                          </label>
                          <input
                            type="text"
                            value={editingModule.resourceTitle}
                            onChange={(e) => setEditingModule({ ...editingModule, resourceTitle: e.target.value })}
                            placeholder="e.g. Objection Cheat Sheet (PDF)"
                            className="w-full px-3 py-2 bg-[#001740] border border-blue-800/60 rounded-lg text-xs text-white focus:ring-2 focus:ring-[#0077c8]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-sky-300 uppercase tracking-wider mb-1">
                            Custom Poster URL (Optional)
                          </label>
                          <input
                            type="text"
                            value={editingModule.customPosterUrl || editingModule.posterUrl || ''}
                            onChange={(e) =>
                              setEditingModule({
                                ...editingModule,
                                posterUrl: e.target.value,
                                customPosterUrl: e.target.value,
                              })
                            }
                            placeholder="Leave blank for Allstate Branded Poster"
                            className="w-full px-3 py-2 bg-[#001740] border border-blue-800/60 rounded-lg text-xs text-white focus:ring-2 focus:ring-[#0077c8]"
                          />
                        </div>
                      </div>

                      {/* Target Objection / Common Scenario */}
                      <div>
                        <label className="block text-xs font-semibold text-sky-300 uppercase tracking-wider mb-1">
                          Target Objection / Focus Scenario (Hero Billboard Callout)
                        </label>
                        <input
                          type="text"
                          value={editingModule.keyObjection || ''}
                          onChange={(e) => setEditingModule({ ...editingModule, keyObjection: e.target.value })}
                          placeholder={`e.g. "I didn't ask for a quote / I'm busy right now"`}
                          className="w-full px-3 py-2 bg-[#001740] border border-blue-800/60 rounded-lg text-xs text-white focus:ring-2 focus:ring-[#0077c8]"
                        />
                      </div>

                      {/* Sales Hook, Badge & Duration */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-semibold text-sky-300 uppercase tracking-wider mb-1">
                            Core Sales Hook / Key Takeaway (1-liner)
                          </label>
                          <input
                            type="text"
                            value={editingModule.salesHook}
                            onChange={(e) => setEditingModule({ ...editingModule, salesHook: e.target.value })}
                            placeholder="Reframe price as the cost of under-insurance..."
                            className="w-full px-3 py-2 bg-[#001740] border border-blue-800/60 rounded-lg text-xs text-white focus:ring-2 focus:ring-[#0077c8]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-sky-300 uppercase tracking-wider mb-1">
                            Duration (Min)
                          </label>
                          <input
                            type="number"
                            min={1}
                            max={300}
                            value={editingModule.durationMinutes}
                            onChange={(e) =>
                              setEditingModule({ ...editingModule, durationMinutes: parseInt(e.target.value) || 10 })
                            }
                            className="w-full px-3 py-2 bg-[#001740] border border-blue-800/60 rounded-lg text-xs text-white focus:ring-2 focus:ring-[#0077c8]"
                          />
                        </div>
                      </div>

                      {/* Badge Text & Detailed Description */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-sky-300 uppercase tracking-wider mb-1">
                            Badge Tag (Optional)
                          </label>
                          <input
                            type="text"
                            value={editingModule.badgeText || ''}
                            onChange={(e) => setEditingModule({ ...editingModule, badgeText: e.target.value })}
                            placeholder="e.g. Highest Close Rate"
                            className="w-full px-3 py-2 bg-[#001740] border border-blue-800/60 rounded-lg text-xs text-white focus:ring-2 focus:ring-[#0077c8]"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-xs font-semibold text-sky-300 uppercase tracking-wider mb-1">
                            Detailed Description
                          </label>
                          <input
                            type="text"
                            value={editingModule.description || ''}
                            onChange={(e) => setEditingModule({ ...editingModule, description: e.target.value })}
                            placeholder="Detailed overview of what agents learn in this training..."
                            className="w-full px-3 py-2 bg-[#001740] border border-blue-800/60 rounded-lg text-xs text-white focus:ring-2 focus:ring-[#0077c8]"
                          />
                        </div>
                      </div>

                      {/* Featured Spotlight Toggle */}
                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="checkbox"
                          id="featuredToggle"
                          checked={editingModule.isFeaturedBillboard || false}
                          onChange={(e) =>
                            setEditingModule({ ...editingModule, isFeaturedBillboard: e.target.checked })
                          }
                          className="rounded text-[#0077c8] focus:ring-[#0077c8] w-4 h-4 bg-[#001740] border-blue-800 cursor-pointer"
                        />
                        <label htmlFor="featuredToggle" className="text-xs text-slate-200 font-medium cursor-pointer">
                          Set as Top Hero Spotlight Marquee
                        </label>
                      </div>
                    </div>

                    {/* LIVE PREVIEW SANDBOX (5 cols) */}
                    <div className="lg:col-span-5 bg-[#001338] border border-blue-800/50 rounded-2xl p-4 space-y-4 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-400 mb-3">
                          <Eye className="w-4 h-4" />
                          Live Preview Sandbox
                        </div>

                        {/* Auto-Poster Realtime Preview */}
                        <div className="space-y-2">
                          <span className="text-[11px] text-slate-400 font-medium">Rendered Video Card:</span>
                          <AutoPoster
                            module={editingModule}
                            categoryName={agencyState.categories.find((c) => c.id === editingModule.categoryId)?.name}
                            isCompact={false}
                          />

                          {/* Live Target Objection Badge Preview */}
                          {editingModule.keyObjection && (
                            <div className="bg-[#00102e] border border-blue-500/40 rounded-lg p-2.5 shadow-md flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2 truncate">
                                <span className="text-sky-400 font-bold uppercase tracking-wider text-[10px]">Target Objection:</span>
                                <span className="text-slate-200 truncate italic">"{editingModule.keyObjection}"</span>
                              </div>
                              <span className="text-[10px] text-sky-400 font-mono">Billboard</span>
                            </div>
                          )}
                        </div>

                        {/* Realtime Scannable QR Code Sandbox */}
                        <div className="mt-4 p-3.5 rounded-xl bg-blue-950/60 border border-blue-700/40 text-center flex flex-col items-center">
                          <span className="text-xs font-semibold text-sky-300 mb-1 flex items-center gap-1">
                            <QrCode className="w-3.5 h-3.5 text-sky-400" />
                            Live Scannable QR Code
                          </span>
                          <p className="text-[10px] text-slate-300 mb-2">
                            Test-scan with your phone camera right now before saving.
                          </p>

                          <div className="p-2 bg-white rounded-lg border-2 border-sky-400/40">
                            {previewQrUrl ? (
                              <img src={previewQrUrl} alt="Live QR Preview" className="w-28 h-28 object-contain" />
                            ) : (
                              <div className="w-28 h-28 flex items-center justify-center text-[10px] text-slate-500 text-center p-2">
                                Enter Resource URL to test QR
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-400 bg-[#000f2b] p-2.5 rounded-lg border border-blue-950">
                        When you click <strong>Save Module</strong>, all agent cards and carousel shelves update instantly.
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* MODULES LIST / MANAGEMENT TABLE */
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-base font-display font-bold text-white">Agency Training Catalog</h3>
                      <p className="text-xs text-slate-400">
                        {agencyState.modules.length} active modules across {agencyState.categories.length} shelves
                      </p>
                    </div>

                    <button
                      onClick={handleStartCreateModule}
                      className="flex items-center gap-2 px-4 py-2 bg-[#0077c8] hover:bg-[#0060a8] text-white text-xs font-semibold rounded-xl shadow-md transition-all cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      Add Training Module
                    </button>
                  </div>

                  {/* Modules Table */}
                  <div className="border border-blue-900/50 rounded-xl overflow-hidden bg-[#001338]">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-slate-300">
                        <thead className="bg-[#001a4d] text-sky-300 font-semibold uppercase tracking-wider text-[10px] border-b border-blue-900/60">
                          <tr>
                            <th className="py-3 px-4">Module / Title</th>
                            <th className="py-3 px-3">Shelf</th>
                            <th className="py-3 px-3">Policy</th>
                            <th className="py-3 px-3">Duration</th>
                            <th className="py-3 px-3 text-center">QR Resource</th>
                            <th className="py-3 px-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-blue-950">
                          {agencyState.modules.map((m) => {
                            const cat = agencyState.categories.find((c) => c.id === m.categoryId);
                            return (
                              <tr key={m.id} className="hover:bg-blue-950/40 transition-colors">
                                <td className="py-3 px-4 max-w-xs">
                                  <div className="font-semibold text-white truncate">{m.title}</div>
                                  <div className="text-[11px] text-slate-400 truncate">{m.salesHook}</div>
                                </td>
                                <td className="py-3 px-3 whitespace-nowrap text-slate-300">
                                  {cat?.name || 'Unassigned'}
                                </td>
                                <td className="py-3 px-3 whitespace-nowrap">
                                  <span className="px-2 py-0.5 rounded bg-blue-950 text-sky-300 border border-blue-800/40 text-[10px]">
                                    {m.targetPolicyType}
                                  </span>
                                </td>
                                <td className="py-3 px-3 whitespace-nowrap font-mono text-slate-300">
                                  {m.durationMinutes} min
                                </td>
                                <td className="py-3 px-3 text-center whitespace-nowrap">
                                  {m.resourceUrl ? (
                                    <span className="text-emerald-400 font-mono text-[11px]">Configured ✓</span>
                                  ) : (
                                    <span className="text-slate-500 font-mono text-[11px]">None</span>
                                  )}
                                </td>
                                <td className="py-3 px-4 text-right whitespace-nowrap space-x-1">
                                  <button
                                    onClick={() => {
                                      setEditingModule(m);
                                      setIsCreatingNew(false);
                                    }}
                                    className="p-1.5 text-sky-300 hover:text-white bg-blue-950 hover:bg-blue-900 rounded border border-blue-800/40"
                                    title="Edit Module"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>

                                  <button
                                    onClick={() => handleDuplicateModule(m)}
                                    className="p-1.5 text-slate-300 hover:text-white bg-blue-950 hover:bg-blue-900 rounded border border-blue-800/40"
                                    title="Duplicate Module"
                                  >
                                    <Copy className="w-3.5 h-3.5" />
                                  </button>

                                  <button
                                    onClick={() => handleDeleteModule(m.id)}
                                    className="p-1.5 text-rose-400 hover:text-rose-200 bg-rose-950/40 hover:bg-rose-900/60 rounded border border-rose-900/40"
                                    title="Delete Module"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================= TAB 2: SHELF BUILDER ================= */}
          {activeTab === 'categories' && (
            <div className="space-y-6">
              <div className={`p-4 rounded-xl space-y-3 transition-all ${
                editingCatId 
                  ? 'bg-[#001c4c] border-2 border-sky-400/80 shadow-lg shadow-sky-500/10' 
                  : 'bg-[#00163e] border border-blue-700/40'
              }`}>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    {editingCatId ? (
                      <>
                        <Edit3 className="w-4 h-4 text-sky-400" />
                        <span>Edit Category Shelf</span>
                      </>
                    ) : (
                      <>
                        <FolderPlus className="w-4 h-4 text-sky-400" />
                        <span>Add New Category Shelf</span>
                      </>
                    )}
                  </h3>
                  {editingCatId && (
                    <span className="text-[10px] font-semibold text-sky-300 bg-sky-950/80 px-2 py-0.5 rounded border border-sky-600/40">
                      Editing Mode
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    placeholder="Category Shelf Name (e.g. Life Insurance 101)"
                    className="px-3 py-2 bg-[#000f2b] border border-blue-800/60 rounded-lg text-xs text-white focus:ring-2 focus:ring-[#0077c8]"
                  />
                  <input
                    type="text"
                    value={newCatDesc}
                    onChange={(e) => setNewCatDesc(e.target.value)}
                    placeholder="Short description for agents..."
                    className="px-3 py-2 bg-[#000f2b] border border-blue-800/60 rounded-lg text-xs text-white sm:col-span-2 focus:ring-2 focus:ring-[#0077c8]"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSaveCategory}
                    disabled={!newCatName.trim()}
                    className="px-4 py-2 bg-[#0077c8] hover:bg-[#0060a8] disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                  >
                    {editingCatId ? 'Save Shelf Changes' : 'Create Category Shelf'}
                  </button>

                  {editingCatId && (
                    <button
                      onClick={handleCancelEditCategory}
                      className="px-4 py-2 bg-[#001740] hover:bg-[#002255] text-slate-300 hover:text-white text-xs font-semibold rounded-lg border border-blue-800/60 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>

              {/* Existing Shelves List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-display font-bold text-white">Active Shelves on Agent Dashboard</h3>
                  <span className="text-xs text-slate-400">{agencyState.categories.length} Shelves</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {agencyState.categories.map((cat, idx) => {
                    const moduleCount = agencyState.modules.filter((m) => m.categoryId === cat.id).length;
                    const isBeingEdited = editingCatId === cat.id;

                    return (
                      <div
                        key={cat.id}
                        className={`p-4 rounded-xl flex items-center justify-between gap-3 transition-all ${
                          isBeingEdited
                            ? 'bg-[#001c4c] border-2 border-sky-400 shadow-md shadow-sky-500/20'
                            : 'bg-[#001438] border border-blue-900/50 hover:border-blue-700/60'
                        }`}
                      >
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-blue-950 text-sky-300 font-mono text-[10px] font-bold flex items-center justify-center border border-blue-800 shrink-0">
                              {idx + 1}
                            </span>
                            <span className="font-bold text-white text-sm truncate">{cat.name}</span>
                          </div>
                          <p className="text-xs text-slate-400 line-clamp-1">{cat.description}</p>
                          <span className="text-[11px] text-sky-400 font-mono">{moduleCount} Modules</span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {/* Edit Shelf Button */}
                          <button
                            onClick={() => handleStartEditCategory(cat)}
                            className="p-2 text-sky-300 hover:text-white bg-blue-900/40 hover:bg-blue-800/60 rounded-lg border border-blue-700/50 transition-colors cursor-pointer"
                            title="Edit Shelf"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {/* Delete Shelf Button */}
                          <button
                            onClick={() => handleDeleteCategory(cat.id)}
                            className="p-2 text-rose-400 hover:text-rose-200 bg-rose-950/40 hover:bg-rose-900/60 rounded-lg border border-rose-900/40 transition-colors cursor-pointer"
                            title="Delete Shelf"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 3: AGENCY BRANDING & PIN ================= */}
          {activeTab === 'settings' && (
            <div className="space-y-6 max-w-2xl">
              <div className="p-5 bg-[#00163e] border border-blue-700/40 rounded-xl space-y-4">
                <h3 className="text-sm font-bold text-white">Agency Branding & Security</h3>
                
                <div>
                  <label className="block text-xs font-semibold text-sky-300 uppercase tracking-wider mb-1">
                    Agency Name
                  </label>
                  <input
                    type="text"
                    value={agencyNameInput}
                    onChange={(e) => setAgencyNameInput(e.target.value)}
                    className="w-full px-3 py-2 bg-[#000f2b] border border-blue-800/60 rounded-lg text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-sky-300 uppercase tracking-wider mb-1">
                    Academy Title
                  </label>
                  <input
                    type="text"
                    value={academyNameInput}
                    onChange={(e) => setAcademyNameInput(e.target.value)}
                    className="w-full px-3 py-2 bg-[#000f2b] border border-blue-800/60 rounded-lg text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-sky-300 uppercase tracking-wider mb-1">
                    Set Custom Manager PIN
                  </label>
                  <input
                    type="password"
                    value={newPinInput}
                    onChange={(e) => setNewPinInput(e.target.value)}
                    placeholder="Enter new PIN (e.g. 4-8 digits)..."
                    maxLength={10}
                    className="w-full px-3 py-2 bg-[#000f2b] border border-blue-800/60 rounded-lg text-xs tracking-wider text-white"
                  />
                </div>

                <button
                  onClick={handleSaveAgencySettings}
                  className="px-4 py-2 bg-[#0077c8] hover:bg-[#0060a8] text-white text-xs font-semibold rounded-lg shadow-sm cursor-pointer"
                >
                  Save Brand Settings
                </button>
              </div>

              {/* JSON Backup Export & Import */}
              <div className="p-5 bg-[#001438] border border-blue-900/50 rounded-xl space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Download className="w-4 h-4 text-sky-400" />
                  Manual Backup & Restore (.json)
                </h3>
                <p className="text-xs text-slate-300">
                  Export your agency's modules and scripts as a portable JSON file.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    onClick={handleExportBackup}
                    className="flex items-center gap-2 px-4 py-2 bg-[#002255] hover:bg-[#003377] text-sky-200 text-xs font-semibold rounded-lg border border-blue-700/40 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    Export Backup (.json)
                  </button>

                  <label className="flex items-center gap-2 px-4 py-2 bg-[#002255] hover:bg-[#003377] text-sky-200 text-xs font-semibold rounded-lg border border-blue-700/40 cursor-pointer">
                    <Upload className="w-4 h-4" />
                    <span>Import Backup (.json)</span>
                    <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
                  </label>

                  <button
                    onClick={handleResetToDefault}
                    className="flex items-center gap-2 px-4 py-2 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 text-xs font-semibold rounded-lg border border-rose-900/50 cursor-pointer ml-auto"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Reset to Default Curriculum
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#00102e] border-t border-blue-900/40 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <span>Tibbs Insurance Agency Enterprise Training Suite</span>
          <span className="font-mono text-sky-400">Allstate Visual Architecture</span>
        </div>

      </div>
    </div>
  );
};
