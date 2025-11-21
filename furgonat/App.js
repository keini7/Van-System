import "react-native-gesture-handler";
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import AppNavigator from "./src/screens/AppNavigator";
import { AuthProvider } from "./src/context/AuthContext";
import { ThemeProvider } from "./src/context/ThemeContext";
import { SettingsProvider } from "./src/context/SettingsContext";

export default function App() {
  return (
    <SettingsProvider>
      <ThemeProvider>
        <AuthProvider>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </AuthProvider>
      </ThemeProvider>
    </SettingsProvider>
  );
}
