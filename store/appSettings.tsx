import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';

type ThemeMode = 'system' | 'light' | 'dark';

interface AppSettingsState {
  themeMode: ThemeMode;
  colorScheme: 'light' | 'dark';
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const SettingsContext = createContext<AppSettingsState | undefined>(undefined);
const storageKey = 'careermate:theme-mode';

export function AppSettingsProvider({ children }: PropsWithChildren) {
  const systemScheme = useSystemColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');

  useEffect(() => {
    AsyncStorage.getItem(storageKey).then((value) => {
      if (value === 'light' || value === 'dark' || value === 'system') {
        setThemeModeState(value);
      }
    });
  }, []);

  function setThemeMode(mode: ThemeMode) {
    setThemeModeState(mode);
    AsyncStorage.setItem(storageKey, mode);
  }

  const colorScheme = themeMode === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : themeMode;

  const value = useMemo(
    () => ({
      themeMode,
      colorScheme,
      setThemeMode,
      toggleTheme: () => setThemeMode(colorScheme === 'dark' ? 'light' : 'dark'),
    }),
    [colorScheme, themeMode],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useAppSettings() {
  const value = useContext(SettingsContext);
  if (!value) {
    return {
      themeMode: 'system' as ThemeMode,
      colorScheme: 'light' as const,
      setThemeMode: () => undefined,
      toggleTheme: () => undefined,
    };
  }
  return value;
}

