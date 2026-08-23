/**
 * Numvax Favorites Manager
 * Handles local browser storage for user favorites.
 */

export interface FavoriteItem {
  slug: string;
  name: string;
  category: string;
  addedAt: string;
}

const FAVORITES_KEY = 'numvax_favorites';

export function getFavorites(): FavoriteItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(FAVORITES_KEY) || localStorage.getItem('calcora_favorites');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function isFavorite(slug: string): boolean {
  return getFavorites().some((item) => item.slug === slug);
}

export function toggleFavorite(slug: string, name: string, category: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const current = getFavorites();
    const exists = current.some((item) => item.slug === slug);

    let updated: FavoriteItem[];
    if (exists) {
      updated = current.filter((item) => item.slug !== slug);
    } else {
      updated = [{ slug, name, category, addedAt: new Date().toISOString() }, ...current];
    }

    localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
    return !exists;
  } catch {
    return false;
  }
}
