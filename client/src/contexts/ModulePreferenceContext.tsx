"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface ModulePreference {
  name: string;
  label: string;
  description: string;
  isEnabled: boolean;
}

interface ModulePreferenceContextType {
  modulePreferences: ModulePreference[];
  loading: boolean;
  refreshPreferences: () => Promise<void>;
  isModuleEnabled: (moduleName: string) => boolean;
}

const ModulePreferenceContext = createContext<
  ModulePreferenceContextType | undefined
>(undefined);

export const useModulePreferences = () => {
  const context = useContext(ModulePreferenceContext);
  if (context === undefined) {
    throw new Error(
      "useModulePreferences must be used within a ModulePreferenceProvider"
    );
  }
  return context;
};

interface ModulePreferenceProviderProps {
  children: ReactNode;
}

export const ModulePreferenceProvider: React.FC<
  ModulePreferenceProviderProps
> = ({ children }) => {
  const [modulePreferences, setModulePreferences] = useState<
    ModulePreference[]
  >([]);
  const [loading, setLoading] = useState(true);

  const loadPreferences = async () => {
    try {
      setLoading(true);

      // Direct API call to get module preferences
      const response = await fetch(
        "http://localhost:5000/api/module-preferences/preferences",
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setModulePreferences(data.data);
    } catch (error) {
      console.error("Error loading module preferences:", error);
      // Set default preferences if loading fails
      setModulePreferences([]);
    } finally {
      setLoading(false);
    }
  };

  const refreshPreferences = async () => {
    await loadPreferences();
  };

  const isModuleEnabled = (moduleName: string): boolean => {
    const module = modulePreferences.find((m) => m.name === moduleName);
    return module ? module.isEnabled : true; // Default to enabled if not found
  };

  useEffect(() => {
    loadPreferences();
  }, []);

  const value: ModulePreferenceContextType = {
    modulePreferences,
    loading,
    refreshPreferences,
    isModuleEnabled,
  };

  return (
    <ModulePreferenceContext.Provider value={value}>
      {children}
    </ModulePreferenceContext.Provider>
  );
};
