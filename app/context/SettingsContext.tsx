import React, { createContext, useContext, useState } from 'react';

type UvDataType = 'combined' | 'separated';

type ThemeType = 'light' | 'dark';

interface SettingsState {
  notifications: boolean;
  alertSounds: boolean;
  autoUpdate: boolean;
  uvDataType: UvDataType;
  theme: ThemeType;
}

interface SettingsContextValue {
  settings: SettingsState;
  updateSettings: (newSettings: Partial<SettingsState>) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SettingsState>({
    notifications: true,
    alertSounds: true,
    autoUpdate: true,
    uvDataType: 'combined',
    theme: 'light',
  });

  const updateSettings = (newSettings: Partial<SettingsState>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
};
