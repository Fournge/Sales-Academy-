/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  AgencyDataState, 
  TrainingModule, 
  AgentModuleProgress 
} from './types';
import { 
  loadAgencyState, 
  saveAgencyState, 
  loadAgentProgress, 
  saveAgentProgress, 
  fetchFromFirebase 
} from './utils/storage';
import { Navbar } from './components/Navbar';
import { HeroBillboard } from './components/HeroBillboard';
import { ShelfCarousel } from './components/ShelfCarousel';
import { VideoPlayerModal } from './components/VideoPlayerModal';
import { ManagerModal } from './components/ManagerModal';
import { SearchFilterGrid } from './components/SearchFilterGrid';
import { Shield, BookOpen, Award, Sparkles, CheckCircle2, PhoneCall, HelpCircle } from 'lucide-react';

export default function App() {
  // Agency state & Agent progress
  const [agencyState, setAgencyState] = useState<AgencyDataState>(loadAgencyState);
  const [agentProgress, setAgentProgress] = useState<Record<string, AgentModuleProgress>>(loadAgentProgress);

  // Search and Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedPolicyFilter, setSelectedPolicyFilter] = useState<string | null>(null);

  // Active Modals state
  const [selectedModule, setSelectedModule] = useState<TrainingModule | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isManagerModalOpen, setIsManagerModalOpen] = useState(false);

  // Billboard Carousel index
  const [billboardIndex, setBillboardIndex] = useState(0);

  // Save changes to localStorage
  const handleSaveAgencyState = (nextState: AgencyDataState) => {
    setAgencyState(nextState);
    saveAgencyState(nextState);
  };

  const handleUpdateAgentProgress = (moduleId: string, update: Partial<AgentModuleProgress>) => {
    const nextProgress = {
      ...agentProgress,
      [moduleId]: {
        ...(agentProgress[moduleId] || { completed: false }),
        ...update,
      },
    };
    setAgentProgress(nextProgress);
    saveAgentProgress(nextProgress);
  };

  // Check for Firebase sync on initial mount if configured
  useEffect(() => {
    if (agencyState.firebaseConfig?.databaseURL) {
      fetchFromFirebase(agencyState.firebaseConfig).then((remoteData) => {
        if (remoteData && remoteData.modules) {
          setAgencyState(remoteData);
          saveAgencyState(remoteData);
        }
      });
    }
  }, []);

  // Featured Billboard Modules
  const featuredBillboardModules = useMemo(() => {
    const explicitFeatured = agencyState.modules.filter((m) => m.isFeaturedBillboard);
    return explicitFeatured.length > 0 ? explicitFeatured : [agencyState.modules[0]].filter(Boolean);
  }, [agencyState.modules]);

  // Filtered Modules for Search & Filter Views
  const filteredModules = useMemo(() => {
    return agencyState.modules.filter((mod) => {
      // Category filter
      if (selectedCategoryId && mod.categoryId !== selectedCategoryId) {
        return false;
      }
      // Policy type filter
      if (selectedPolicyFilter && mod.targetPolicyType !== selectedPolicyFilter) {
        return false;
      }
      // Search query filter (matches title, description, salesHook, scriptBullets, tags, keyObjection)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const inTitle = mod.title.toLowerCase().includes(query);
        const inHook = mod.salesHook.toLowerCase().includes(query);
        const inDesc = mod.description.toLowerCase().includes(query);
        const inObjection = mod.keyObjection?.toLowerCase().includes(query) || false;
        const inPolicy = (mod.targetPolicyType || '').toLowerCase().includes(query);
        const inTags = mod.tags?.some((t) => t.toLowerCase().includes(query)) || false;
        const inBullets = mod.scriptBullets?.some((b) => b.toLowerCase().includes(query)) || false;
        return inTitle || inHook || inDesc || inObjection || inPolicy || inTags || inBullets;
      }
      return true;
    });
  }, [agencyState.modules, selectedCategoryId, selectedPolicyFilter, searchQuery]);

  // Mastered count
  const completedCount = useMemo(() => {
    return Object.values(agentProgress).filter((p) => p.completed).length;
  }, [agentProgress]);

  const handleWatchModule = (module: TrainingModule) => {
    setSelectedModule(module);
    setIsVideoModalOpen(true);
  };

  const handleOpenResource = (module: TrainingModule) => {
    setSelectedModule(module);
    setIsVideoModalOpen(true);
  };

  const isFilteredMode = Boolean(searchQuery.trim() || selectedCategoryId || selectedPolicyFilter);

  return (
    <div className="min-h-screen bg-[#000f2b] text-slate-100 flex flex-col selection:bg-[#0077c8] selection:text-white">
      
      {/* Top Sticky Navigation Bar */}
      <Navbar
        agencyName={agencyState.agencyName}
        academyName={agencyState.academyName}
        categories={agencyState.categories}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onCategoryClick={(catId) => {
          setSelectedCategoryId(catId || null);
          setSearchQuery('');
          setSelectedPolicyFilter(null);
        }}
        selectedCategoryId={selectedCategoryId}
        onOpenManagerModal={() => setIsManagerModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        
        {isFilteredMode ? (
          /* Search & Filter Grid View */
          <SearchFilterGrid
            modules={filteredModules}
            categories={agencyState.categories}
            searchQuery={searchQuery}
            selectedCategoryId={selectedCategoryId}
            selectedPolicyFilter={selectedPolicyFilter}
            onPolicyFilterChange={setSelectedPolicyFilter}
            onWatchModule={handleWatchModule}
            onOpenResource={handleOpenResource}
            agentProgress={agentProgress}
            onClearFilters={() => {
              setSearchQuery('');
              setSelectedCategoryId(null);
              setSelectedPolicyFilter(null);
            }}
          />
        ) : (
          /* Netflix Streaming View (Billboard + Category Shelves) */
          <>
            {/* Spotlight Hero Billboard */}
            {featuredBillboardModules.length > 0 && (
              <HeroBillboard
                featuredModules={featuredBillboardModules}
                currentIndex={billboardIndex}
                onNext={() => setBillboardIndex((prev) => (prev + 1) % featuredBillboardModules.length)}
                onPrev={() =>
                  setBillboardIndex(
                    (prev) => (prev - 1 + featuredBillboardModules.length) % featuredBillboardModules.length
                  )
                }
                onSelectIndex={setBillboardIndex}
                onWatchModule={handleWatchModule}
                onOpenResource={handleOpenResource}
                categories={agencyState.categories}
                isCompleted={agentProgress[featuredBillboardModules[billboardIndex]?.id]?.completed}
              />
            )}

            {/* Category Shelves */}
            <div className="space-y-4 pt-4">
              {agencyState.categories
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .map((category) => {
                  const categoryModules = agencyState.modules.filter((m) => m.categoryId === category.id);
                  if (categoryModules.length === 0) return null;

                  return (
                    <ShelfCarousel
                      key={category.id}
                      category={category}
                      modules={categoryModules}
                      onWatchModule={handleWatchModule}
                      onOpenResource={handleOpenResource}
                      agentProgress={agentProgress}
                    />
                  );
                })}
            </div>
          </>
        )}

      </main>

      {/* Video Player, Fullscreen & QR Resource Modal */}
      <VideoPlayerModal
        isOpen={isVideoModalOpen}
        module={selectedModule}
        category={agencyState.categories.find((c) => c.id === selectedModule?.categoryId)}
        onClose={() => setIsVideoModalOpen(false)}
        agentProgress={agentProgress}
        onUpdateProgress={handleUpdateAgentProgress}
      />

      {/* Manager Studio CMS Modal */}
      <ManagerModal
        isOpen={isManagerModalOpen}
        onClose={() => setIsManagerModalOpen(false)}
        agencyState={agencyState}
        onSaveState={handleSaveAgencyState}
      />

      {/* Quiet Corporate Footer */}
      <footer className="border-t border-blue-900/40 bg-[#000c24] py-8 px-4 sm:px-6 lg:px-8 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-sky-400" />
            <span className="font-display font-bold text-white tracking-tight">
              {agencyState.agencyName}
            </span>
            <span>·</span>
            <span>Sales Academy & Objection Playbook</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span>{agencyState.modules.length} Active Modules</span>
            <span>·</span>
            <span>Google Drive Direct Stream</span>
            <span>·</span>
            <button
              onClick={() => setIsManagerModalOpen(true)}
              className="text-sky-400 hover:text-sky-300 font-medium transition-colors cursor-pointer"
            >
              Manager Portal
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
}
