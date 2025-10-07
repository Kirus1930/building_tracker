const STORAGE_KEYS = {
  USERS: 'defects_users',
  PROJECTS: 'defects_projects',
  DEFECTS: 'defects_defects',
  COMMENTS: 'defects_comments',
  HISTORY: 'defects_history',
  CURRENT_USER: 'defects_current_user',
};

export function getFromStorage(key) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(`Error reading ${key} from storage:`, error);
    return null;
  }
}

export function saveToStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error(`Error saving ${key} to storage:`, error);
    return false;
  }
}

export function removeFromStorage(key) {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing ${key} from storage:`, error);
    return false;
  }
}

export function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function initializeStorage() {
  if (!getFromStorage(STORAGE_KEYS.USERS)) {
    saveToStorage(STORAGE_KEYS.USERS, []);
  }
  if (!getFromStorage(STORAGE_KEYS.PROJECTS)) {
    saveToStorage(STORAGE_KEYS.PROJECTS, []);
  }
  if (!getFromStorage(STORAGE_KEYS.DEFECTS)) {
    saveToStorage(STORAGE_KEYS.DEFECTS, []);
  }
  if (!getFromStorage(STORAGE_KEYS.COMMENTS)) {
    saveToStorage(STORAGE_KEYS.COMMENTS, []);
  }
  if (!getFromStorage(STORAGE_KEYS.HISTORY)) {
    saveToStorage(STORAGE_KEYS.HISTORY, []);
  }
}

export { STORAGE_KEYS };
