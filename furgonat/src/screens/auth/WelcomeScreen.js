import React, { useContext } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemeContext } from "../../context/ThemeContext";

export default function WelcomeScreen({ navigation }) {
  const { colors } = useContext(ThemeContext);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["top", "bottom"]}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.title, { color: colors.text }]}>
          Mirësevini te Furgonat
        </Text>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.text }]}
        onPress={() => navigation.navigate("Login")}
      >
        <Text style={{ color: colors.background, fontWeight: "bold" }}>
          Login
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.text }]}
        onPress={() => navigation.navigate("Register")}
      >
        <Text style={{ color: colors.background, fontWeight: "bold" }}>
          Register
        </Text>
      </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    paddingTop: Platform.OS === "ios" ? 20 : 20,
  },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 40 },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
    width: "80%",
  },
});
