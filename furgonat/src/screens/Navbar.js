import React, { useContext } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { ThemeContext } from "../context/ThemeContext";

export default function Navbar({ navigation }) {
  const { colors } = useContext(ThemeContext);

  return (
    <View style={[styles.navbar, { backgroundColor: colors.primary }]}>
      <TouchableOpacity onPress={() => navigation.navigate("ClientDashboard")}>
        <Text style={styles.navText}>Client</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate("ManagerDashboard")}>
        <Text style={styles.navText}>Manager</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  navbar: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 15,
  },
  navText: { color: "#fff", fontWeight: "bold" },
});
