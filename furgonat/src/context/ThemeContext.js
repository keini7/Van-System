import React, { createContext, useState, useContext } from "react";
import { Appearance } from "react-native";
import { SettingsContext } from "./SettingsContext";

export const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const settingsContext = useContext(SettingsContext);
  const systemTheme = Appearance.getColorScheme();
  const [theme, setTheme] = useState(systemTheme || "light");

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const lightColors = {
    background: "#FFFFFF",
    text: "#1E1E1E",
    primary: "#007AFF",
    secondary: "#34C759",
    border: "#DDDDDD",
    link: "#007AFF",
  };

  const darkColors = {
    background: "#121212",
    text: "#FFFFFF",
    primary: "#0A84FF",
    secondary: "#30D158",
    border: "#333333",
    link: "#0A84FF",
  };

  const colors = theme === "light" ? lightColors : darkColors;

  // Get font size multiplier from settings
  const getFontSizeMultiplier = () => {
    if (!settingsContext) return 1.0;
    return settingsContext.getFontSizeMultiplier();
  };

  // Helper function to get scaled font size
  const getScaledFontSize = (baseSize) => {
    return baseSize * getFontSizeMultiplier();
  };

  // Helper function to get font family from settings
  const getFontFamily = () => {
    if (!settingsContext) return "System";
    return settingsContext.getFontFamily();
  };

  return (
    <ThemeContext.Provider 
      value={{ 
        theme, 
        colors, 
        toggleTheme,
        getScaledFontSize,
        getFontSizeMultiplier,
        getFontFamily,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}
