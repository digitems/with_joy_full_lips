const SPLASH_SHOWN_KEY = 'wjl_splash_shown';
const THEME_MODE_KEY = 'wjl_theme_mode';

export function hasSplashBeenShown(): boolean {
  return localStorage.getItem(SPLASH_SHOWN_KEY) === 'true';
}

export function markSplashShown(): void {
  localStorage.setItem(SPLASH_SHOWN_KEY, 'true');
}

export function getStoredThemeMode(): 'light' | 'dark' | null {
  const mode = localStorage.getItem(THEME_MODE_KEY);
  return mode === 'light' || mode === 'dark' ? mode : null;
}

export function setStoredThemeMode(mode: 'light' | 'dark'): void {
  localStorage.setItem(THEME_MODE_KEY, mode);
}
