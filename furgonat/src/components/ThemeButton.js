import React, { useContext } from "react";
import { TouchableOpacity, StyleSheet, Text } from "react-native";
import { ThemeContext } from "../context/ThemeContext";

export default function ThemeButton() {
  const { toggleTheme, theme } = useContext(ThemeContext);

  return (
    <TouchableOpacity style={styles.button} onPress={toggleTheme}>
      <Text style={styles.text}>{theme === "light" ? "🌙" : "☀️"}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#333",
    borderRadius: 30,
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
  text: {
    fontSize: 20,
    color: "#fff",
  },
});
