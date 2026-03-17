export type ThemeId =
  | "midnight"
  | "ocean"
  | "emerald"
  | "sunset"
  | "rose"
  | "slate";

export interface Theme {
  id: ThemeId;
  name: string;
  description: string;
  preview: string[];
  vars: Record<string, string>;
}

export const THEMES: Theme[] = [
  {
    id: "midnight",
    name: "Midnight",
    description: "Deep navy with electric indigo",
    preview: ["#5c6ef8", "#a855f7", "#224040"],
    vars: {
      "--background": "224 40% 4%",
      "--card": "224 40% 8%",
      "--card-border": "224 30% 14%",
      "--popover": "224 40% 8%",
      "--popover-border": "224 30% 14%",
      "--primary": "230 100% 67%",
      "--primary-foreground": "0 0% 100%",
      "--primary-border": "230 100% 57%",
      "--secondary": "224 20% 16%",
      "--secondary-foreground": "210 40% 98%",
      "--muted": "224 20% 14%",
      "--muted-foreground": "215 20% 65%",
      "--accent": "262 83% 65%",
      "--accent-foreground": "0 0% 100%",
      "--border": "224 30% 16%",
      "--input": "224 30% 18%",
      "--ring": "230 100% 67%",
      "--sidebar": "224 40% 6%",
      "--sidebar-primary": "230 100% 67%",
      "--sidebar-accent": "224 30% 14%",
      "--chart-1": "230 100% 67%",
      "--chart-2": "262 83% 65%",
      "--chart-3": "320 80% 60%",
      "--chart-4": "190 90% 45%",
      "--chart-5": "45 90% 55%",
    },
  },
  {
    id: "ocean",
    name: "Ocean",
    description: "Deep sea with cyan accents",
    preview: ["#06b6d4", "#0ea5e9", "#042830"],
    vars: {
      "--background": "210 50% 4%",
      "--card": "210 45% 8%",
      "--card-border": "210 35% 14%",
      "--popover": "210 45% 8%",
      "--popover-border": "210 35% 14%",
      "--primary": "188 95% 43%",
      "--primary-foreground": "0 0% 100%",
      "--primary-border": "188 95% 33%",
      "--secondary": "210 25% 16%",
      "--secondary-foreground": "210 40% 98%",
      "--muted": "210 25% 13%",
      "--muted-foreground": "210 20% 60%",
      "--accent": "199 89% 48%",
      "--accent-foreground": "0 0% 100%",
      "--border": "210 30% 16%",
      "--input": "210 30% 18%",
      "--ring": "188 95% 43%",
      "--sidebar": "210 50% 6%",
      "--sidebar-primary": "188 95% 43%",
      "--sidebar-accent": "210 30% 14%",
      "--chart-1": "188 95% 43%",
      "--chart-2": "199 89% 48%",
      "--chart-3": "217 91% 60%",
      "--chart-4": "142 71% 45%",
      "--chart-5": "45 90% 55%",
    },
  },
  {
    id: "emerald",
    name: "Emerald",
    description: "Dark forest with vibrant green",
    preview: ["#10b981", "#34d399", "#051a0f"],
    vars: {
      "--background": "150 40% 4%",
      "--card": "150 35% 8%",
      "--card-border": "150 25% 14%",
      "--popover": "150 35% 8%",
      "--popover-border": "150 25% 14%",
      "--primary": "160 84% 39%",
      "--primary-foreground": "0 0% 100%",
      "--primary-border": "160 84% 29%",
      "--secondary": "150 20% 16%",
      "--secondary-foreground": "150 40% 98%",
      "--muted": "150 20% 13%",
      "--muted-foreground": "150 15% 60%",
      "--accent": "142 76% 36%",
      "--accent-foreground": "0 0% 100%",
      "--border": "150 25% 16%",
      "--input": "150 25% 18%",
      "--ring": "160 84% 39%",
      "--sidebar": "150 40% 6%",
      "--sidebar-primary": "160 84% 39%",
      "--sidebar-accent": "150 25% 14%",
      "--chart-1": "160 84% 39%",
      "--chart-2": "142 76% 36%",
      "--chart-3": "188 95% 43%",
      "--chart-4": "45 90% 55%",
      "--chart-5": "230 100% 67%",
    },
  },
  {
    id: "sunset",
    name: "Sunset",
    description: "Warm dusk with amber glow",
    preview: ["#f59e0b", "#f97316", "#1a0a00"],
    vars: {
      "--background": "25 50% 4%",
      "--card": "25 45% 8%",
      "--card-border": "25 35% 14%",
      "--popover": "25 45% 8%",
      "--popover-border": "25 35% 14%",
      "--primary": "38 92% 50%",
      "--primary-foreground": "0 0% 10%",
      "--primary-border": "38 92% 40%",
      "--secondary": "25 20% 16%",
      "--secondary-foreground": "25 40% 98%",
      "--muted": "25 20% 13%",
      "--muted-foreground": "25 15% 60%",
      "--accent": "20 90% 48%",
      "--accent-foreground": "0 0% 100%",
      "--border": "25 25% 16%",
      "--input": "25 25% 18%",
      "--ring": "38 92% 50%",
      "--sidebar": "25 50% 6%",
      "--sidebar-primary": "38 92% 50%",
      "--sidebar-accent": "25 25% 14%",
      "--chart-1": "38 92% 50%",
      "--chart-2": "20 90% 48%",
      "--chart-3": "0 84% 60%",
      "--chart-4": "142 71% 45%",
      "--chart-5": "230 100% 67%",
    },
  },
  {
    id: "rose",
    name: "Rose",
    description: "Elegant dark rose and fuchsia",
    preview: ["#f43f5e", "#d946ef", "#1a0010"],
    vars: {
      "--background": "340 45% 4%",
      "--card": "340 40% 8%",
      "--card-border": "340 30% 14%",
      "--popover": "340 40% 8%",
      "--popover-border": "340 30% 14%",
      "--primary": "338 84% 58%",
      "--primary-foreground": "0 0% 100%",
      "--primary-border": "338 84% 48%",
      "--secondary": "340 20% 16%",
      "--secondary-foreground": "340 40% 98%",
      "--muted": "340 20% 13%",
      "--muted-foreground": "340 15% 60%",
      "--accent": "292 91% 61%",
      "--accent-foreground": "0 0% 100%",
      "--border": "340 25% 16%",
      "--input": "340 25% 18%",
      "--ring": "338 84% 58%",
      "--sidebar": "340 45% 6%",
      "--sidebar-primary": "338 84% 58%",
      "--sidebar-accent": "340 25% 14%",
      "--chart-1": "338 84% 58%",
      "--chart-2": "292 91% 61%",
      "--chart-3": "230 100% 67%",
      "--chart-4": "38 92% 50%",
      "--chart-5": "188 95% 43%",
    },
  },
  {
    id: "slate",
    name: "Slate",
    description: "Classic charcoal and cool gray",
    preview: ["#94a3b8", "#64748b", "#0a0b0f"],
    vars: {
      "--background": "222 25% 4%",
      "--card": "222 20% 8%",
      "--card-border": "222 15% 14%",
      "--popover": "222 20% 8%",
      "--popover-border": "222 15% 14%",
      "--primary": "215 25% 65%",
      "--primary-foreground": "222 25% 10%",
      "--primary-border": "215 25% 55%",
      "--secondary": "222 15% 16%",
      "--secondary-foreground": "210 40% 98%",
      "--muted": "222 15% 13%",
      "--muted-foreground": "215 15% 58%",
      "--accent": "215 20% 55%",
      "--accent-foreground": "222 25% 10%",
      "--border": "222 15% 16%",
      "--input": "222 15% 18%",
      "--ring": "215 25% 65%",
      "--sidebar": "222 25% 6%",
      "--sidebar-primary": "215 25% 65%",
      "--sidebar-accent": "222 15% 14%",
      "--chart-1": "215 25% 65%",
      "--chart-2": "188 60% 48%",
      "--chart-3": "38 80% 55%",
      "--chart-4": "160 60% 45%",
      "--chart-5": "292 70% 60%",
    },
  },
];

export const DEFAULT_THEME_ID: ThemeId = "midnight";

export function getTheme(id: string): Theme {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}

export function applyTheme(theme: Theme) {
  const root = document.documentElement;
  for (const [key, value] of Object.entries(theme.vars)) {
    root.style.setProperty(key, value);
  }
}

export function resetThemeVars() {
  const root = document.documentElement;
  const firstTheme = THEMES[0];
  for (const key of Object.keys(firstTheme.vars)) {
    root.style.removeProperty(key);
  }
}
