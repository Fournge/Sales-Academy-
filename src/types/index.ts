export interface TrainingCategory {
  id: string;
  name: string;
  description: string;
  sortOrder: number;
  iconName: string;
}

export interface TrainingModule {
  id: string;
  title: string;
  categoryId: string;
  videoUrl: string;
  resourceUrl: string;
  resourceTitle: string;
  posterUrl?: string;
  customPosterUrl?: string;
  salesHook: string;
  description: string;
  scriptBullets?: string[];
  durationMinutes: number;
  isFeaturedBillboard?: boolean;
  tags: string[];
  badgeText?: string;
  keyObjection?: string;
  targetPolicyType: string;
  createdAt: string;
  updatedAt: string;
}

export interface AgentModuleProgress {
  completed: boolean;
  notes?: string;
  completedAt?: string;
}

export interface FirebaseSyncConfig {
  apiKey: string;
  authDomain?: string;
  databaseURL: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
}

export interface AgencyDataState {
  agencyName: string;
  academyName: string;
  managerPin: string;
  categories: TrainingCategory[];
  modules: TrainingModule[];
  firebaseConfig: FirebaseSyncConfig | null;
  lastSyncedAt?: string;
}
