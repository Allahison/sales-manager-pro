import { createContext, useContext, useEffect, useRef } from "react";
import { useGetSettings } from "@workspace/api-client-react";
import { applyTheme, getTheme, DEFAULT_THEME_ID } from "@/lib/themes";

const ThemeContext = createContext<{ themeId: string }>({ themeId: DEFAULT_THEME_ID });

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { data: settings } = useGetSettings();
  const appliedRef = useRef<string>("");

  const themeId = (settings as any)?.theme ?? DEFAULT_THEME_ID;

  useEffect(() => {
    if (themeId && themeId !== appliedRef.current) {
      const theme = getTheme(themeId);
      applyTheme(theme);
      appliedRef.current = themeId;
    }
  }, [themeId]);

  return (
    <ThemeContext.Provider value={{ themeId }}>
      {children}
    </ThemeContext.Provider>
  );
}
