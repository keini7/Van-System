import React, { useContext, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemeContext } from "../context/ThemeContext";
import { SettingsContext } from "../context/SettingsContext";
import { AuthContext } from "../context/AuthContext";

export default function SettingsScreen({ navigation }) {
  const { colors, theme, toggleTheme, getFontFamily } = useContext(ThemeContext);
  const { settings, updateSetting, resetSettings, getFontSizeMultiplier } = useContext(SettingsContext);
  const { user, logout } = useContext(AuthContext);

  const fontSizeOptions = [
    { label: "E vogël", value: "small" },
    { label: "Normale", value: "medium" },
    { label: "E madhe", value: "large" },
    { label: "Shumë e madhe", value: "xlarge" },
  ];

  const fontTypeOptions = [
    { label: "Sistemi", value: "system" },
    { label: "Roboto", value: "roboto" },
    { label: "Arial", value: "arial" },
    { label: "Times New Roman", value: "times" },
  ];

  const handleResetSettings = () => {
    Alert.alert(
      "Rivendos Cilësimet",
      "A jeni të sigurt që dëshironi të rivendosni të gjitha cilësimet në vlerat e paracaktuara?",
      [
        { text: "Anulo", style: "cancel" },
        {
          text: "Rivendos",
          style: "destructive",
          onPress: () => {
            resetSettings();
            Alert.alert("Sukses", "Cilësimet u rivendosën me sukses");
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      "Dil",
      "A jeni të sigurt që dëshironi të dilni?",
      [
        { text: "Anulo", style: "cancel" },
        {
          text: "Dil",
          style: "destructive",
          onPress: logout,
        },
      ]
    );
  };

  const baseFontSize = 14 * getFontSizeMultiplier();
  
  // Helper to get font style with both size and family
  const getFontStyle = (size) => ({
    fontSize: size,
    fontFamily: getFontFamily(),
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={[styles.backButtonText, { color: colors.text }, getFontStyle(16)]}>← Kthehu</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }, getFontStyle(20)]}>Cilësimet</Text>
        <View style={{ width: 80 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Theme Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }, getFontStyle(baseFontSize + 2)]}>
            🎨 Temë
          </Text>
          <View style={[styles.settingItem, { borderColor: colors.border }]}>
            <View style={styles.settingLeft}>
              <Text style={[styles.settingLabel, { color: colors.text }, getFontStyle(baseFontSize)]}>
                Mënyra e errët/dritë
              </Text>
              <Text style={[styles.settingDescription, { color: colors.text, opacity: 0.6 }, getFontStyle(baseFontSize - 2)]}>
                {theme === "light" ? "Mënyra e dritës aktive" : "Mënyra e errët aktive"}
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.themeToggle,
                {
                  backgroundColor: theme === "light" ? "#1E1E1E" : "#FFD700",
                },
              ]}
              onPress={toggleTheme}
            >
              <Text style={styles.themeIcon}>{theme === "light" ? "🌙" : "☀️"}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Font Size Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }, getFontStyle(baseFontSize + 2)]}>
            📝 Madhësia e shkronjave
          </Text>
          <View style={styles.optionsContainer}>
            {fontSizeOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.optionButton,
                  {
                    backgroundColor: settings.fontSize === option.value ? colors.primary : colors.border,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => updateSetting("fontSize", option.value)}
              >
                <Text
                  style={[
                    styles.optionText,
                    {
                      color: settings.fontSize === option.value ? "#FFFFFF" : colors.text,
                    },
                    getFontStyle(baseFontSize),
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Font Type Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }, getFontStyle(baseFontSize + 2)]}>
            🔤 Lloji i shkronjave
          </Text>
          <View style={styles.optionsContainer}>
            {fontTypeOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.optionButton,
                  {
                    backgroundColor: settings.fontType === option.value ? colors.primary : colors.border,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => updateSetting("fontType", option.value)}
              >
                <Text
                  style={[
                    styles.optionText,
                    {
                      color: settings.fontType === option.value ? "#FFFFFF" : colors.text,
                    },
                    getFontStyle(baseFontSize),
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }, getFontStyle(baseFontSize + 2)]}>
            🔔 Njoftimet
          </Text>
          <View style={[styles.settingItem, { borderColor: colors.border }]}>
            <View style={styles.settingLeft}>
              <Text style={[styles.settingLabel, { color: colors.text }, getFontStyle(baseFontSize)]}>
                Aktivizo njoftimet
              </Text>
              <Text style={[styles.settingDescription, { color: colors.text, opacity: 0.6 }, getFontStyle(baseFontSize - 2)]}>
                Merr njoftime për rezervime dhe përditësime
              </Text>
            </View>
            <Switch
              value={settings.notifications}
              onValueChange={(value) => updateSetting("notifications", value)}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={Platform.OS === "ios" ? "#fff" : colors.background}
            />
          </View>
        </View>

        {/* Display Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }, getFontStyle(baseFontSize + 2)]}>
            🖼️ Shfaqja
          </Text>
          <View style={[styles.settingItem, { borderColor: colors.border }]}>
            <View style={styles.settingLeft}>
              <Text style={[styles.settingLabel, { color: colors.text }, getFontStyle(baseFontSize)]}>
                Shfaq foto të furgonave
              </Text>
              <Text style={[styles.settingDescription, { color: colors.text, opacity: 0.6 }, getFontStyle(baseFontSize - 2)]}>
                Shfaq ose fshih fotot në listat e furgonave
              </Text>
            </View>
            <Switch
              value={settings.showPhotos}
              onValueChange={(value) => updateSetting("showPhotos", value)}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={Platform.OS === "ios" ? "#fff" : colors.background}
            />
          </View>
        </View>

        {/* Data Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }, getFontStyle(baseFontSize + 2)]}>
            📊 Të dhënat
          </Text>
          <View style={[styles.settingItem, { borderColor: colors.border }]}>
            <View style={styles.settingLeft}>
              <Text style={[styles.settingLabel, { color: colors.text }, getFontStyle(baseFontSize)]}>
                Përditësim automatik
              </Text>
              <Text style={[styles.settingDescription, { color: colors.text, opacity: 0.6 }, getFontStyle(baseFontSize - 2)]}>
                Përditëso automatikisht të dhënat çdo {settings.refreshInterval} sekonda
              </Text>
            </View>
            <Switch
              value={settings.autoRefresh}
              onValueChange={(value) => updateSetting("autoRefresh", value)}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={Platform.OS === "ios" ? "#fff" : colors.background}
            />
          </View>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }, getFontStyle(baseFontSize + 2)]}>
            👤 Llogaria
          </Text>
          <View style={[styles.settingItem, { borderColor: colors.border }]}>
            <View style={styles.settingLeft}>
              <Text style={[styles.settingLabel, { color: colors.text }, getFontStyle(baseFontSize)]}>
                {user?.firstName} {user?.lastName}
              </Text>
              <Text style={[styles.settingDescription, { color: colors.text, opacity: 0.6 }, getFontStyle(baseFontSize - 2)]}>
                {user?.email}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.actionButton, { borderColor: colors.border }]}
            onPress={handleLogout}
          >
            <Text style={[styles.actionButtonText, { color: "#FF3B30" }, getFontStyle(baseFontSize)]}>
              Dil nga llogaria
            </Text>
          </TouchableOpacity>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }, getFontStyle(baseFontSize + 2)]}>
            ℹ️ Rreth aplikacionit
          </Text>
          <View style={[styles.infoCard, { backgroundColor: colors.border, opacity: 0.3 }]}>
            <Text style={[styles.infoText, { color: colors.text }, getFontStyle(baseFontSize)]}>
              Furgonat v1.0.0
            </Text>
            <Text style={[styles.infoText, { color: colors.text, opacity: 0.7 }, getFontStyle(baseFontSize - 2)]}>
              Aplikacion për rezervimin e furgonave
            </Text>
          </View>
        </View>

        {/* Reset Section */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.resetButton, { borderColor: colors.border }]}
            onPress={handleResetSettings}
          >
            <Text style={[styles.resetButtonText, { color: colors.text }, getFontStyle(baseFontSize)]}>
              Rivendos të gjitha cilësimet
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 80,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  settingLeft: {
    flex: 1,
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 12,
  },
  themeToggle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  themeIcon: {
    fontSize: 24,
  },
  optionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 80,
    alignItems: "center",
  },
  optionText: {
    fontWeight: "600",
  },
  actionButton: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    marginTop: 8,
  },
  actionButtonText: {
    fontWeight: "600",
  },
  infoCard: {
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  infoText: {
    marginBottom: 4,
  },
  resetButton: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    borderStyle: "dashed",
  },
  resetButtonText: {
    fontWeight: "600",
  },
});

