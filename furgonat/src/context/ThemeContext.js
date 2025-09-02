import React, { createContext, useState } from "react";
import { Appearance } from "react-native";

export const ThemeContext = createContext();

export function ThemeProvider({ children }) {
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

  return (
    <ThemeContext.Provider value={{ theme, colors, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
