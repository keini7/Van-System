import React, { useContext, useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { ThemeContext } from "../../context/ThemeContext";
import { AuthContext } from "../../context/AuthContext";
import ThemeButton from "../../components/ThemeButton";

export default function ManagerDashboard() {
  const { colors } = useContext(ThemeContext);
  const { user, logout } = useContext(AuthContext);
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/manager/dashboard", {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        });
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("Error fetching manager dashboard:", err);
      }
    };

    if (user?.token) {
      fetchDashboard();
    }
  }, [user]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>
        Menaxher i loguar: {user?.email}
      </Text>
      <Text style={{ color: colors.text, marginBottom: 20 }}>
        Roli: {user?.role}
      </Text>

      {data && (
        <Text style={{ color: colors.text, marginBottom: 10 }}>
          {data.message}
        </Text>
      )}

      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.text }]}
        onPress={logout}
      >
        <Text style={{ color: colors.background }}>Logout</Text>
      </TouchableOpacity>

      <ThemeButton />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
  button: { padding: 12, borderRadius: 8, marginTop: 20 },
});
