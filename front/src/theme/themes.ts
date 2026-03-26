export type ThemeMode = "light" | "dark";

export type ThemeColors = {
  bgColor: string;
  textColor: string;
  cardBg: string;
  borderColor: string;
  accentColor: string;
  mutedColor: string;
  heroGlow: string;
  heroShadow: string;
  selectionColor: string;
};

export const themes: Record<ThemeMode, ThemeColors> = {
  light: {
    bgColor: "#F8FAFC",
    textColor: "#0F172A",
    cardBg: "rgba(255,255,255,0.88)",
    borderColor: "#E2E8F0",
    accentColor: "#0284C7",
    mutedColor: "#64748B",
    heroGlow: "rgba(56,189,248,0.18)",
    heroShadow: "rgba(2,132,199,0.16)",
    selectionColor: "rgba(14,165,233,0.25)",
  },
  dark: {
    bgColor: "#020617",
    textColor: "#F8FAFC",
    cardBg: "rgba(15,23,42,0.82)",
    borderColor: "#1E293B",
    accentColor: "#38BDF8",
    mutedColor: "#94A3B8",
    heroGlow: "rgba(56,189,248,0.20)",
    heroShadow: "rgba(37,99,235,0.35)",
    selectionColor: "rgba(56,189,248,0.20)",
  },
};

export const themeLabels: Record<keyof ThemeColors, string> = {
  bgColor: "Background",
  textColor: "Text",
  cardBg: "Card",
  borderColor: "Border",
  accentColor: "Accent",
  mutedColor: "Muted",
  heroGlow: "Hero Glow",
  heroShadow: "Hero Shadow",
  selectionColor: "Selection",
};