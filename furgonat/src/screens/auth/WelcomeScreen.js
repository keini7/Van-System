import React, { useContext } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { ThemeContext } from "../../context/ThemeContext";
import ThemeButton from "../../components/ThemeButton";

export default function WelcomeScreen({ navigation }) {
  const { colors } = useContext(ThemeContext);

  return (
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

      {/* Butoni poshtë djathtas */}
      <ThemeButton />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 40 },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
    width: "80%",
  },
});
