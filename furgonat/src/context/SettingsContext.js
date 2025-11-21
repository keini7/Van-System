import React, { createContext, useState, useEffect } from "react";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const SettingsContext = createContext();

const SETTINGS_STORAGE_KEY = "@furgonat_settings";

const defaultSettings = {
  fontSize: "medium",
  fontType: "system",
  theme: "light",
  notifications: true,
  language: "sq",
  showPhotos: true,
  autoRefresh: true,
  refreshInterval: 30,
};

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setSettings({ ...defaultSettings, ...parsed });
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (newSettings) => {
    try {
      const updated = { ...settings, ...newSettings };
      setSettings(updated);
      await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error("Error saving settings:", error);
    }
  };

  const updateSetting = (key, value) => {
    saveSettings({ [key]: value });
  };

  const resetSettings = async () => {
    try {
      setSettings(defaultSettings);
      await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(defaultSettings));
    } catch (error) {
      console.error("Error resetting settings:", error);
    }
  };

  const getFontSizeMultiplier = () => {
    switch (settings.fontSize) {
      case "small":
        return 0.85;
      case "medium":
        return 1.0;
      case "large":
        return 1.15;
      case "xlarge":
        return 1.3;
      default:
        return 1.0;
    }
  };

  const getFontFamily = () => {
    switch (settings.fontType) {
      case "system":
        return Platform.select({
          ios: "System",
          android: "Roboto",
          default: "System",
        });
      case "sans-serif":
        return "sans-serif";
      case "serif":
        return "serif";
      case "monospace":
        return "monospace";
      default:
        return "System";
    }
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSetting,
        resetSettings,
        getFontSizeMultiplier,
        getFontFamily,
        loading,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

