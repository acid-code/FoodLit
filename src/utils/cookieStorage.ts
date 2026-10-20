import { UserPreferences, StoreId } from '../types';

const COOKIE_NAME = 'salkal_user_prefs';

/**
 * Reads user preferences from cookie (with localStorage fallback)
 */
export function getSavedUserPreferences(): UserPreferences | null {
  try {
    // 1. Check document.cookie
    if (typeof document !== 'undefined') {
      const match = document.cookie
        .split('; ')
        .find((row) => row.startsWith(`${COOKIE_NAME}=`));

      if (match) {
        const raw = decodeURIComponent(match.split('=')[1]);
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          return parsed as UserPreferences;
        }
      }

      // 2. Fallback to localStorage
      const local = localStorage.getItem(COOKIE_NAME);
      if (local) {
        const parsed = JSON.parse(local);
        if (parsed && typeof parsed === 'object') {
          return parsed as UserPreferences;
        }
      }
    }
  } catch (err) {
    console.warn('Failed to parse saved user preferences from cookie', err);
  }
  return null;
}

/**
 * Checks if a cookie or saved preferences exist for returning user
 */
export function hasUserPreferencesCookie(): boolean {
  if (typeof document === 'undefined') return false;
  const match = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${COOKIE_NAME}=`));
  if (match) return true;
  return !!localStorage.getItem(COOKIE_NAME);
}

/**
 * Saves user preferences to both cookie and localStorage
 */
export function saveUserPreferences(prefs: UserPreferences): void {
  try {
    const jsonStr = JSON.stringify(prefs);
    if (typeof document !== 'undefined') {
      // 1 year expiration
      const maxAge = 60 * 60 * 24 * 365;
      document.cookie = `${COOKIE_NAME}=${encodeURIComponent(jsonStr)}; max-age=${maxAge}; path=/; SameSite=Lax`;
      localStorage.setItem(COOKIE_NAME, jsonStr);
    }
  } catch (err) {
    console.warn('Failed to save user preferences to cookie', err);
  }
}

/**
 * Clears saved preferences cookie and localStorage
 */
export function clearUserPreferencesCookie(): void {
  try {
    if (typeof document !== 'undefined') {
      document.cookie = `${COOKIE_NAME}=; max-age=0; path=/; SameSite=Lax`;
      localStorage.removeItem(COOKIE_NAME);
    }
  } catch (err) {
    console.warn('Failed to clear user preferences cookie', err);
  }
}

/**
 * Generates an empty initial preferences object where all 7 days start empty
 */
export function createEmptyPreferences(): UserPreferences {
  return {
    householdSize: 4,
    budgetMin: 250,
    budgetMax: 750,
    weeklyBudget: 750,
    dietary: 'standard',
    culinaryPreferences: ['quick-20', 'israeli-home'],
    cuisinePreferences: ['israeli', 'italian', 'mediterranean'],
    selectedMealsByDay: {
      sun: [],
      mon: [],
      tue: [],
      wed: [],
      thu: [],
      fri: [],
      sat: [],
    },
    preferredStoreId: 'carrefour',
  };
}
