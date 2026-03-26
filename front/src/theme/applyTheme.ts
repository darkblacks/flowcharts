import type { ThemeColors } from "./themes";

export function applyTheme(theme: ThemeColors) {
  const root = document.documentElement;

  root.style.setProperty("--bg-color", theme.bgColor);
  root.style.setProperty("--text-color", theme.textColor);
  root.style.setProperty("--card-bg", theme.cardBg);
  root.style.setProperty("--border-color", theme.borderColor);
  root.style.setProperty("--accent-color", theme.accentColor);
  root.style.setProperty("--muted-color", theme.mutedColor);
  root.style.setProperty("--hero-glow", theme.heroGlow);
  root.style.setProperty("--hero-shadow", theme.heroShadow);
  root.style.setProperty("--selection-color", theme.selectionColor);
}