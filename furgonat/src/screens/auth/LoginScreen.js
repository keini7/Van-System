import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemeContext } from "../../context/ThemeContext";
import { AuthContext } from "../../context/AuthContext";

export default function LoginScreen({ navigation }) {
  const { colors } = useContext(ThemeContext);
  const { login } = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Invalid email format";
    }
    
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    setLoading(true);
    const result = await login({ email, password });
    setLoading(false);

    if (result.success) {
      // Navigation do të ndryshojë automatikisht përmes AppNavigator
      console.log("Logged in successfully");
    } else {
      Alert.alert("Login Failed", result.error || "Please try again");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          <Text style={[styles.title, { color: colors.text }]}>Login</Text>

      <TextInput
        placeholder="Email"
        placeholderTextColor="gray"
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          if (errors.email) setErrors({ ...errors, email: null });
        }}
        autoCapitalize="none"
        keyboardType="email-address"
        style={[
          styles.input,
          { 
            borderColor: errors.email ? "red" : colors.border, 
            color: colors.text 
          },
        ]}
        editable={!loading}
      />
      {errors.email && (
        <Text style={styles.errorText}>{errors.email}</Text>
      )}

      <TextInput
        placeholder="Password"
        placeholderTextColor="gray"
        secureTextEntry
        value={password}
        onChangeText={(text) => {
          setPassword(text);
          if (errors.password) setErrors({ ...errors, password: null });
        }}
        style={[
          styles.input,
          { 
            borderColor: errors.password ? "red" : colors.border, 
            color: colors.text 
          },
        ]}
        editable={!loading}
      />
      {errors.password && (
        <Text style={styles.errorText}>{errors.password}</Text>
      )}

      <TouchableOpacity
        style={[
          styles.button, 
          { 
            backgroundColor: loading ? colors.border : colors.text,
            opacity: loading ? 0.6 : 1,
          }
        ]}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={colors.background} />
        ) : (
          <Text style={{ color: colors.background, fontWeight: "bold" }}>
            Login
          </Text>
        )}
      </TouchableOpacity>

      <View style={styles.registerContainer}>
        <Text style={[styles.registerText, { color: colors.text, opacity: 0.7 }]}>
          Nuk ke llogari?
        </Text>
        <TouchableOpacity 
          onPress={() => navigation.navigate("Register")}
          disabled={loading}
          style={[styles.registerButton, { borderColor: colors.border }]}
          activeOpacity={0.7}
        >
          <Text style={[styles.registerButtonText, { color: colors.text }]}>
            Krijoni një llogari
          </Text>
          </TouchableOpacity>
        </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    paddingTop: Platform.OS === "ios" ? 20 : 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginBottom: 8,
    marginLeft: 4,
  },
  registerContainer: {
    marginTop: 24,
    alignItems: "center",
  },
  registerText: {
    fontSize: 14,
    marginBottom: 12,
  },
  registerButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1.5,
    minWidth: 200,
    alignItems: "center",
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
