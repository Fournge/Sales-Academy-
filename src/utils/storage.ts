import { AgencyDataState, AgentModuleProgress } from '../types';
import { INITIAL_STATE } from '../data/initialData';

const STORAGE_KEY_STATE = 'tibbs_academy_state_v4';
const STORAGE_KEY_PROGRESS = 'tibbs_agent_progress_v1';

export function loadAgencyState(): AgencyDataState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_STATE);
    if (!raw) {
      saveAgencyState(INITIAL_STATE);
      return INITIAL_STATE;
    }

    const parsed = JSON.parse(raw);
    return {
      ...INITIAL_STATE,
      ...parsed,
      categories: parsed.categories && parsed.categories.length > 0 ? parsed.categories : INITIAL_STATE.categories,
      modules: parsed.modules && parsed.modules.length > 0 ? parsed.modules : INITIAL_STATE.modules,
    };
  } catch (err) {
    console.error('Error loading agency state from localStorage:', err);
    return INITIAL_STATE;
  }
}

export function saveAgencyState(state: AgencyDataState): void {
  try {
    localStorage.setItem(STORAGE_KEY_STATE, JSON.stringify(state));
  } catch (err) {
    console.error('Error saving agency state to localStorage:', err);
  }
}

export function loadAgentProgress(): Record<string, AgentModuleProgress> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROGRESS);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error loading agent progress:', err);
    return {};
  }
}

export function saveAgentProgress(progress: Record<string, AgentModuleProgress>): void {
  try {
    localStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify(progress));
  } catch (err) {
    console.error('Error saving agent progress:', err);
  }
}

export function exportLibraryToJson(state: AgencyDataState): void {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  const dateStr = new Date().toISOString().slice(0, 10);
  downloadAnchor.setAttribute('download', `tibbs_insurance_sales_academy_backup_${dateStr}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export async function importLibraryFromJson(file: File): Promise<AgencyDataState> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        if (!parsed.modules || !Array.isArray(parsed.modules) || !parsed.categories || !Array.isArray(parsed.categories)) {
          throw new Error('Invalid JSON format. Must contain "categories" and "modules" arrays.');
        }
        resolve(parsed);
      } catch (e) {
        reject(e);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.readAsText(file);
  });
}

/**
 * Firebase Realtime Database sync via REST API
 */
export async function syncToFirebase(state: AgencyDataState): Promise<boolean> {
  if (!state.firebaseConfig?.databaseURL) return false;
  try {
    let dbUrl = state.firebaseConfig.databaseURL.trim().replace(/\/$/, '');
    if (!dbUrl.startsWith('http://') && !dbUrl.startsWith('https://')) {
      dbUrl = `https://${dbUrl}`;
    }
    const endpoint = `${dbUrl}/tibbs_academy.json${state.firebaseConfig.apiKey ? `?auth=${state.firebaseConfig.apiKey}` : ''}`;
    
    const response = await fetch(endpoint, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...state,
        lastSyncedAt: new Date().toISOString(),
      }),
    });
    return response.ok;
  } catch (err) {
    console.warn('Firebase REST sync error:', err);
    return false;
  }
}

export async function fetchFromFirebase(config: { databaseURL: string; apiKey?: string }): Promise<AgencyDataState | null> {
  if (!config.databaseURL) return null;
  try {
    let dbUrl = config.databaseURL.trim().replace(/\/$/, '');
    if (!dbUrl.startsWith('http://') && !dbUrl.startsWith('https://')) {
      dbUrl = `https://${dbUrl}`;
    }
    const endpoint = `${dbUrl}/tibbs_academy.json${config.apiKey ? `?auth=${config.apiKey}` : ''}`;
    
    const response = await fetch(endpoint, {
      method: 'GET',
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data;
  } catch (err) {
    console.warn('Firebase fetch error:', err);
    return null;
  }
}
