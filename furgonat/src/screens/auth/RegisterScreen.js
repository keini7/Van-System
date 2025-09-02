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
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { ThemeContext } from "../../context/ThemeContext";
import { Picker } from "@react-native-picker/picker";
import ThemeButton from "../../components/ThemeButton";

export default function RegisterScreen({ navigation }) {
  const { colors } = useContext(ThemeContext);

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

  const plateRegex = /^[A-Z]{2}[0-9]{3}[A-Z]{2}$/;

  const handleRegister = async () => {
    if (role === "manager" && !plateRegex.test(plateNumber)) {
      alert("Plate number duhet të jetë në formatin AA123BB");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords nuk përputhen!");
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

    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (res.ok) {
        alert("User registered successfully!");
        navigation.navigate("Login");
      } else {
        alert(data.error || "Registration failed");
      }
    } catch (err) {
      console.error("Register error:", err);
      alert("Network error");
    }
  };

  const handleConfirmDate = (date) => {
    setBirthdate(date.toISOString().split("T")[0]);
    setShowDatePicker(false);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
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

          <TouchableOpacity
            onPress={() => navigation.navigate("Login")}
            style={{ marginTop: 20 }}
          >
            <Text style={{ color: colors.link }}>
              Already have an account? Login
            </Text>
          </TouchableOpacity>
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
          <View style={[styles.input, { padding: 0 }]}>
            <Picker
              selectedValue={gender}
              onValueChange={(value) => setGender(value)}
              dropdownIconColor={colors.text}
              style={{ color: colors.text }}
            >
              <Picker.Item label="Zgjidh gjininë" value="" />
              <Picker.Item label="Mashkull" value="male" />
              <Picker.Item label="Femër" value="female" />
              <Picker.Item label="Preferoj të mos e them" value="prefer_not" />
            </Picker>
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
            style={[styles.button, { backgroundColor: colors.text }]}
            onPress={handleRegister}
          >
            <Text style={{ color: colors.background, fontWeight: "bold" }}>
              Register
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setStep(0)}>
            <Text style={{ color: colors.link, marginTop: 10 }}>⬅ Back</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      <ThemeButton />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
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
});
