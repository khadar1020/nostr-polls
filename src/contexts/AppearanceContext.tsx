import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { getFontPreset } from '../styles/themes';

interface AppearanceContextType {
  fontPresetId: string;
  colorPresetId: string;
  setFontPreset: (id: string) => void;
  setColorPreset: (id: string) => void;
}

const AppearanceContext = createContext<AppearanceContextType>({
  fontPresetId: 'shantell',
  colorPresetId: 'golden',
  setFontPreset: () => {},
  setColorPreset: () => {},
});

export function AppearanceProvider({ children }: { children: React.ReactNode }) {
  const [fontPresetId, setFontPresetId] = useState(
    () => localStorage.getItem('pollerama:fontPreset') ?? 'shantell'
  );
  const [colorPresetId, setColorPresetId] = useState(
    () => localStorage.getItem('pollerama:colorPreset') ?? 'golden'
  );

  useEffect(() => {
    document.body.style.fontFamily = getFontPreset(fontPresetId).fontFamily;
  }, [fontPresetId]);

  const setFontPreset = useCallback((id: string) => {
    localStorage.setItem('pollerama:fontPreset', id);
    setFontPresetId(id);
  }, []);

  const setColorPreset = useCallback((id: string) => {
    localStorage.setItem('pollerama:colorPreset', id);
    setColorPresetId(id);
  }, []);

  return (
    <AppearanceContext.Provider value={{ fontPresetId, colorPresetId, setFontPreset, setColorPreset }}>
      {children}
    </AppearanceContext.Provider>
  );
}

export function useAppearance() {
  return useContext(AppearanceContext);
}
