import { UserPreferences, StoreId } from '../types';

const COOKIE_NAME = 'salkal_user_prefs';

/**
 * Meal plans and dietary choices are personal data under the Privacy Protection
 * Law (Amendment 13). Keep them in localStorage so they are not sent to the
 * server on every request. A legacy cookie, if present, is copied once and cleared.
 */
export const PREFERENCE_STORAGE_KEY = COOKIE_NAME;

export function readNamedCookie(cookieString: string, name: string): string | null {
  const parts = cookieString.split(';');
  for (const part of parts) {
    const trimmed = part.trim();
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    if (trimmed.slice(0, eq) !== name) continue;
    const raw = trimmed.slice(eq + 1);
    try {
      return decodeURIComponent(raw);
    } catch {
      return raw;
    }
  }
  return null;
}

function readLocalPreferences(): UserPreferences | null {
  try {
    if (typeof localStorage === 'undefined') return null;
    const local = localStorage.getItem(PREFERENCE_STORAGE_KEY);
    if (!local) return null;
    const parsed = JSON.parse(local);
    if (parsed && typeof parsed === 'object') return parsed as UserPreferences;
  } catch (err) {
    console.warn('Failed to parse saved user preferences', err);
  }
  return null;
}

function readLegacyCookiePreferences(): UserPreferences | null {
  try {
    if (typeof document === 'undefined') return null;
    const raw = readNamedCookie(document.cookie, COOKIE_NAME);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') return parsed as UserPreferences;
  } catch (err) {
    console.warn('Failed to parse legacy preference cookie', err);
  }
  return null;
}

function clearLegacyPreferenceCookie(): void {
  if (typeof document === 'undefined') return;
  const secure = typeof location !== 'undefined' && location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${COOKIE_NAME}=; max-age=0; path=/; SameSite=Lax${secure}`;
}

/**
 * Reads user preferences from localStorage.
 * Migrates a previously stored cookie into localStorage and then deletes the cookie.
 */
export function getSavedUserPreferences(): UserPreferences | null {
  const local = readLocalPreferences();
  if (local) {
    clearLegacyPreferenceCookie();
    return local;
  }

  const fromCookie = readLegacyCookiePreferences();
  if (fromCookie) {
    try {
      localStorage.setItem(PREFERENCE_STORAGE_KEY, JSON.stringify(fromCookie));
    } catch (err) {
      console.warn('Failed to migrate preference cookie into localStorage', err);
    }
    clearLegacyPreferenceCookie();
    return fromCookie;
  }

  return null;
}

/**
 * Checks if a cookie or saved preferences exist for returning user
 */
export function hasUserPreferencesCookie(): boolean {
  if (readLocalPreferences()) return true;
  return readLegacyCookiePreferences() != null;
}

/**
 * Saves user preferences on this device only. They are not written to a cookie.
 */
export function saveUserPreferences(prefs: UserPreferences): void {
  try {
    const jsonStr = JSON.stringify(prefs);
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(PREFERENCE_STORAGE_KEY, jsonStr);
    clearLegacyPreferenceCookie();
  } catch (err) {
    console.warn('Failed to save user preferences', err);
  }
}

/**
 * Clears saved preferences cookie and localStorage
 */
export function clearUserPreferencesCookie(): void {
  try {
    if (typeof document !== 'undefined') {
      clearLegacyPreferenceCookie();
      localStorage.removeItem(PREFERENCE_STORAGE_KEY);
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
