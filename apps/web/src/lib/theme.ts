/** Colour theme: follow the OS, or force one. The server writes a forced one on <html data-theme>. */
export const THEMES = ['system', 'light', 'dark'] as const;
export type Theme = (typeof THEMES)[number];
export const THEME_COOKIE = 'theme';
export const isTheme = (v: unknown): v is Theme => typeof v === 'string' && (THEMES as readonly string[]).includes(v);
