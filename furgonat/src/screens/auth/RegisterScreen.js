import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { ThemeContext } from "../../context/ThemeContext";
import { AuthContext } from "../../context/AuthContext";
import { Picker } from "@react-native-picker/picker";

export default function RegisterScreen({ navigation }) {
  const { colors } = useContext(ThemeContext);
  const { register } = useContext(AuthContext);

  const [step, setStep] = useState(0);
  const [role, setRole] = useState(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [gender, setGender] = useState("");
  const [birthdate, setBirthdate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [plateNumber, setPlateNumber] = useState("");
  const [loading, setLoading] = useState(false);

  const plateRegex = /^[A-Z]{2}[0-9]{3}[A-Z]{2}$/;

  const handleRegister = async () => {
    // Validation
    if (role === "manager" && !plateRegex.test(plateNumber)) {
      Alert.alert("Error", "Plate number duhet të jetë në formatin AA123BB");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords nuk përputhen!");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password duhet të jetë të paktën 6 karaktere");
      return;
    }

    const body = {
      firstName,
      lastName,
      email,
      phone,
      gender,
      birthdate,
      password,
      role,
      ...(role === "manager" && { plate_number: plateNumber.toUpperCase() }),
    };

    setLoading(true);
    const result = await register(body);
    setLoading(false);

    if (result.success) {
      Alert.alert("Success", result.message || "User registered successfully!", [
        { text: "OK", onPress: () => navigation.navigate("Login") }
      ]);
    } else {
      Alert.alert("Registration Failed", result.error || "Please try again");
    }
  };

  const handleConfirmDate = (date) => {
    setBirthdate(date.toISOString().split("T")[0]);
    setShowDatePicker(false);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        {step === 0 ? (
          <View style={styles.container}>
          <Text style={[styles.title, { color: colors.text }]}>
            Register as:
          </Text>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.text }]}
            onPress={() => {
              setRole("client");
              setStep(1);
            }}
          >
            <Text style={{ color: colors.background, fontWeight: "bold" }}>
              User
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: colors.text, marginTop: 15 },
            ]}
            onPress={() => {
              setRole("manager");
              setStep(1);
            }}
          >
            <Text style={{ color: colors.background, fontWeight: "bold" }}>
              Van Manager
            </Text>
          </TouchableOpacity>

          <View style={styles.loginContainer}>
            <Text style={[styles.loginText, { color: colors.text, opacity: 0.7 }]}>
              Ke tashmë llogari?
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("Login")}
              style={[styles.loginButton, { borderColor: colors.border }]}
              activeOpacity={0.7}
            >
              <Text style={[styles.loginButtonText, { color: colors.text }]}>
                Hyr në llogari
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[styles.container, { paddingBottom: 120 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={[styles.title, { color: colors.text }]}>
            Register {role === "manager" ? "Van Manager" : "User"}
          </Text>

          {/* Emri, mbiemri */}
          <TextInput
            placeholder="First Name"
            placeholderTextColor="gray"
            value={firstName}
            onChangeText={setFirstName}
            style={[
              styles.input,
              { borderColor: colors.border, color: colors.text },
            ]}
          />
          <TextInput
            placeholder="Last Name"
            placeholderTextColor="gray"
            value={lastName}
            onChangeText={setLastName}
            style={[
              styles.input,
              { borderColor: colors.border, color: colors.text },
            ]}
          />

          {/* Email, telefon */}
          <TextInput
            placeholder="Email"
            placeholderTextColor="gray"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            style={[
              styles.input,
              { borderColor: colors.border, color: colors.text },
            ]}
          />
          <TextInput
            placeholder="Phone"
            placeholderTextColor="gray"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
            style={[
              styles.input,
              { borderColor: colors.border, color: colors.text },
            ]}
          />

          {/* Gender */}
          <View style={styles.genderContainer}>
            <Text style={[styles.genderLabel, { color: colors.text }]}>Gjinia</Text>
            <View style={styles.genderButtons}>
              <TouchableOpacity
                style={[
                  styles.genderButton,
                  {
                    backgroundColor: gender === "male" ? colors.primary : colors.border,
                    borderColor: gender === "male" ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setGender("male")}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.genderButtonText,
                    {
                      color: gender === "male" ? "#FFFFFF" : colors.text,
                    },
                  ]}
                >
                  👨 Mashkull
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.genderButton,
                  {
                    backgroundColor: gender === "female" ? colors.primary : colors.border,
                    borderColor: gender === "female" ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setGender("female")}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.genderButtonText,
                    {
                      color: gender === "female" ? "#FFFFFF" : colors.text,
                    },
                  ]}
                >
                  👩 Femër
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.genderButton,
                  {
                    backgroundColor: gender === "prefer_not" ? colors.primary : colors.border,
                    borderColor: gender === "prefer_not" ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setGender("prefer_not")}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.genderButtonText,
                    {
                      color: gender === "prefer_not" ? "#FFFFFF" : colors.text,
                    },
                  ]}
                >
                  🚫 Preferoj të mos e them
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Birthdate */}
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            style={[styles.input, { justifyContent: "center" }]}
          >
            <Text style={{ color: birthdate ? colors.text : "gray" }}>
              {birthdate || "Select Birthdate"}
            </Text>
          </TouchableOpacity>
          <DateTimePickerModal
            isVisible={showDatePicker}
            mode="date"
            onConfirm={handleConfirmDate}
            onCancel={() => setShowDatePicker(false)}
          />

          {/* Nëse është manager → plate number */}
          {role === "manager" && (
            <TextInput
              placeholder="Plate Number (AA123BB)"
              placeholderTextColor="gray"
              autoCapitalize="characters"
              maxLength={7}
              value={plateNumber}
              onChangeText={(text) => setPlateNumber(text.toUpperCase())}
              style={[
                styles.input,
                { borderColor: colors.border, color: colors.text },
              ]}
            />
          )}

          {/* Password */}
          <TextInput
            placeholder="Password"
            placeholderTextColor="gray"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            style={[
              styles.input,
              { borderColor: colors.border, color: colors.text },
            ]}
          />

          {/* Confirm Password */}
          <TextInput
            placeholder="Confirm Password"
            placeholderTextColor="gray"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            style={[
              styles.input,
              { borderColor: colors.border, color: colors.text },
            ]}
          />

          {/* Register Button */}
          <TouchableOpacity
            style={[
              styles.button, 
              { 
                backgroundColor: loading ? colors.border : colors.text,
                opacity: loading ? 0.6 : 1,
              }
            ]}
            onPress={handleRegister}
            disabled={loading}
          >
            <Text style={{ color: colors.background, fontWeight: "bold" }}>
              {loading ? "Registering..." : "Register"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setStep(0)}
            style={[styles.backButton, { borderColor: colors.border }]}
            activeOpacity={0.7}
          >
            <Text style={[styles.backButtonIcon, { color: colors.text }]}>←</Text>
            <Text style={[styles.backButtonText, { color: colors.text }]}>Kthehu</Text>
          </TouchableOpacity>
        </ScrollView>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
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
    marginBottom: 12,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  loginContainer: {
    marginTop: 24,
    alignItems: "center",
  },
  loginText: {
    fontSize: 14,
    marginBottom: 12,
  },
  loginButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1.5,
    minWidth: 200,
    alignItems: "center",
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  genderContainer: {
    marginBottom: 12,
  },
  genderLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  genderButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  genderButton: {
    flex: 1,
    minWidth: "30%",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  genderButtonText: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1.5,
    marginTop: 16,
    alignSelf: "center",
    minWidth: 120,
  },
  backButtonIcon: {
    fontSize: 20,
    marginRight: 8,
    fontWeight: "bold",
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
