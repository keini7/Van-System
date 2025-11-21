import React, { useContext } from "react";
import { TouchableOpacity, StyleSheet, Text, View, Platform } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { ThemeContext } from "../context/ThemeContext";

export default function ThemeButton() {
  const { theme } = useContext(ThemeContext);
  const navigation = useNavigation();

  const isLight = theme === "light";

  const handlePress = () => {
    // Navigate to Settings screen
    if (navigation) {
      navigation.navigate("Settings");
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.button,
          {
            backgroundColor: isLight ? "#1E1E1E" : "#FFD700",
            shadowColor: isLight ? "#000" : "#FFD700",
            borderColor: isLight ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
          },
        ]}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <View style={styles.iconContainer}>
          <Text style={[styles.icon, { color: isLight ? "#FFD700" : "#1E1E1E" }]}>
            ⚙️
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: Platform.OS === "ios" ? 30 : 20,
    alignSelf: "center",
    zIndex: 1000,
  },
  button: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  iconContainer: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  icon: {
    fontSize: 24,
    fontWeight: "600",
  },
});
