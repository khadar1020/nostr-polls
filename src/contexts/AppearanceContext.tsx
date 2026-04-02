import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { FONT_PRESETS, COLOR_PRESETS, getFontPreset } from '../styles/themes';

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
  const [fontPresetId, setFontPresetId] = useState(() => {
    const stored = localStorage.getItem('pollerama:fontPreset');
    if (stored) return stored;
    const random = FONT_PRESETS[Math.floor(Math.random() * FONT_PRESETS.length)].id;
    localStorage.setItem('pollerama:fontPreset', random);
    return random;
  });
  const [colorPresetId, setColorPresetId] = useState(() => {
    const stored = localStorage.getItem('pollerama:colorPreset');
    if (stored) return stored;
    const random = COLOR_PRESETS[Math.floor(Math.random() * COLOR_PRESETS.length)].id;
    localStorage.setItem('pollerama:colorPreset', random);
    return random;
  });

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
