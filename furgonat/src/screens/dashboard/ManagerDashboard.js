import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  TextInput,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  Image,
  Modal,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import * as ImagePicker from "expo-image-picker";
import { ThemeContext } from "../../context/ThemeContext";
import { AuthContext } from "../../context/AuthContext";
import { getApiEndpoints } from "../../config/api";

export default function ManagerDashboard({ navigation }) {
  const { colors, getScaledFontSize, getFontFamily } = useContext(ThemeContext);
  const { user, logout, isTokenValid } = useContext(AuthContext);

  useEffect(() => {
    if (__DEV__) {
      console.log("👤 Manager Dashboard - User state:", {
        hasUser: !!user,
        hasToken: !!user?.token,
        tokenLength: user?.token?.length,
        role: user?.role,
      });
    }
  }, [user]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [vans, setVans] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [activeTab, setActiveTab] = useState("home");
  
  // Form states
  const [showVanForm, setShowVanForm] = useState(false);
  const [vanForm, setVanForm] = useState({ plateNumber: "", model: "", capacity: "15", photo: null });
  const [routeForm, setRouteForm] = useState({
    vanId: "",
    destination: "",
    departureTime: "",
    arrivalTime: "",
    price: "",
    date: "",
    totalSeats: "",
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showDepartureTimePicker, setShowDepartureTimePicker] = useState(false);
  const [showArrivalTimePicker, setShowArrivalTimePicker] = useState(false);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [scheduleForm, setScheduleForm] = useState({
    vanId: "",
    destination: "",
    departureTime: "",
    arrivalTime: "",
    price: "",
    daysOfWeek: [],
    totalSeats: "",
  });
  const [showScheduleDepartureTimePicker, setShowScheduleDepartureTimePicker] = useState(false);
  const [showScheduleArrivalTimePicker, setShowScheduleArrivalTimePicker] = useState(false);
  const [showClientsModal, setShowClientsModal] = useState(false);

  useEffect(() => {
    if (user?.token) {
      loadDashboardData();
    } else {
      console.warn("⚠️ No token found for manager dashboard");
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const endpoints = await getApiEndpoints();

      if (!user?.token) {
        console.error("❌ No token available for dashboard");
        Alert.alert("Gabim", "Token-i i autentifikimit mungon. Ju lutem bëni login përsëri.");
        return;
      }

      console.log("📊 Loading dashboard data...");
      console.log("🔑 Token exists:", !!user?.token);
      console.log("🔑 Token length:", user?.token?.length);

      // Pastro token-in para se ta dërgojmë
      const cleanToken = user.token.trim();

      // Load dashboard
      const dashboardRes = await fetch(endpoints.MANAGER.DASHBOARD, {
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          Authorization: `Bearer ${cleanToken}`,
        },
      });
      const dashboardJson = await dashboardRes.json();
      setDashboardData(dashboardJson);

      // Load vans
      const vansRes = await fetch(endpoints.MANAGER.VANS, {
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          Authorization: `Bearer ${cleanToken}`,
        },
      });
      const vansJson = await vansRes.json();
      setVans(vansJson.vans || []);

      // Load routes
      const routesRes = await fetch(endpoints.MANAGER.ROUTES, {
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          Authorization: `Bearer ${cleanToken}`,
        },
      });
      const routesJson = await routesRes.json();
      setRoutes(routesJson.routes || []);

      // Load bookings
      const bookingsRes = await fetch(endpoints.MANAGER.BOOKINGS, {
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          Authorization: `Bearer ${cleanToken}`,
        },
      });
      const bookingsJson = await bookingsRes.json();
      setBookings(bookingsJson.bookings || []);

      // Load schedules
      const schedulesRes = await fetch(endpoints.MANAGER.SCHEDULES, {
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          Authorization: `Bearer ${cleanToken}`,
        },
      });
      const schedulesJson = await schedulesRes.json();
      setSchedules(schedulesJson.schedules || []);
    } catch (err) {
      console.error("Error loading dashboard:", err);
      Alert.alert("Error", "Failed to load dashboard data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Leje e nevojshme",
        "Duhet leje për të përdorur kamerën për të bërë foto të furgonit."
      );
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    Alert.alert(
      "Zgjidh Foto",
      "Nga dëshiron të marrësh foton?",
      [
        {
          text: "Kamera",
          onPress: async () => {
            try {
              const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
                base64: true,
              });

              if (!result.canceled && result.assets[0]) {
                const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
                setVanForm({ ...vanForm, photo: base64Image });
              }
            } catch (error) {
              console.error("Error taking photo:", error);
              Alert.alert("Gabim", "Dështoi marrja e fotos");
            }
          },
        },
        {
          text: "Galeria",
          onPress: async () => {
            try {
              const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.5, // Redukto quality për të zvogëluar madhësinë
                base64: true,
              });

              if (!result.canceled && result.assets[0]) {
                if (!result.assets[0].base64) {
                  Alert.alert("Gabim", "Foto nuk u mor si duhet. Provo përsëri.");
                  return;
                }
                const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
                console.log("📸 Photo selected from gallery, size:", base64Image.length, "bytes");
                setVanForm({ ...vanForm, photo: base64Image });
              }
            } catch (error) {
              console.error("Error picking image:", error);
              Alert.alert("Gabim", `Dështoi zgjedhja e fotos: ${error.message}`);
            }
          },
        },
        { text: "Anulo", style: "cancel" },
      ]
    );
  };

  const handleCreateVan = async () => {
    if (!vanForm.plateNumber) {
      Alert.alert("Gabim", "Targa është e detyrueshme");
      return;
    }

    if (!user?.token) {
      Alert.alert("Gabim", "Token-i i autentifikimit mungon. Ju lutem bëni login përsëri.");
      return;
    }

    if (!isTokenValid()) {
      Alert.alert(
        "Token i skaduar",
        "Token-i juaj ka skaduar. Ju lutem bëni login përsëri.",
        [
          { text: "OK", onPress: logout }
        ]
      );
      return;
    }

    try {
      const endpoints = await getApiEndpoints();
      const url = endpoints.MANAGER.CREATE_VAN;
      
      console.log("🚐 Creating van:", { 
        plateNumber: vanForm.plateNumber, 
        model: vanForm.model,
        hasPhoto: !!vanForm.photo,
        photoSize: vanForm.photo ? vanForm.photo.length : 0
      });
      console.log("🔑 Token exists:", !!user?.token);
      console.log("📤 URL:", url);

      // Pastro token-in para se ta dërgojmë
      const cleanToken = user.token.trim();
      
      console.log("🔑 Token details:");
      console.log("   Original length:", user.token.length);
      console.log("   Clean length:", cleanToken.length);
      console.log("   First 30 chars:", cleanToken.substring(0, 30));
      console.log("   Last 30 chars:", cleanToken.substring(cleanToken.length - 30));

      // Prepare request body
      const requestBody = {
        plateNumber: vanForm.plateNumber,
        vanModel: vanForm.model || undefined,
        capacity: Number(vanForm.capacity) || 15,
        photo: vanForm.photo || undefined,
      };

      console.log("📤 Request body size:", JSON.stringify(requestBody).length, "bytes");
      if (vanForm.photo) {
        console.log("📸 Photo size:", vanForm.photo.length, "bytes");
        console.log("📸 Photo preview:", vanForm.photo.substring(0, 100) + "...");
      }

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          Authorization: `Bearer ${cleanToken}`,
        },
        body: JSON.stringify(requestBody),
      });

      console.log("📥 Response status:", res.status);
      console.log("📥 Response headers:", Object.fromEntries(res.headers.entries()));

      let data;
      const contentType = res.headers.get("content-type");
      
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
        console.log("📥 Response data:", data);
      } else {
        const text = await res.text();
        console.error("Non-JSON response:", text);
        Alert.alert("Gabim", `Server error: ${res.status} ${res.statusText}`);
        return;
      }

      if (res.ok) {
        Alert.alert("Sukses", "Furgoni u krijua me sukses!");
        setShowVanForm(false);
        setVanForm({ plateNumber: "", model: "", capacity: "15", photo: null });
        loadDashboardData();
      } else {
        console.error("❌ Error response:", data);
        Alert.alert("Gabim", data.error || "Dështoi krijimi i furgonit");
      }
    } catch (err) {
      console.error("❌ Error creating van:", err);
      console.error("Error details:", err.message);
      Alert.alert("Gabim", `Dështoi krijimi i furgonit: ${err.message}`);
    }
  };

  const handleCreateRoute = async () => {
    if (!routeForm.vanId || !routeForm.destination || !routeForm.departureTime || 
        !routeForm.arrivalTime || !routeForm.price || !routeForm.date) {
      Alert.alert("Gabim", "Të gjitha fushat janë të detyrueshme");
      return;
    }

    // Validate time format
    const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(routeForm.departureTime) || !timeRegex.test(routeForm.arrivalTime)) {
      Alert.alert("Gabim", "Formati i orës duhet të jetë HH:MM (p.sh. 08:00)");
      return;
    }

    // Validate time range (5:00 - 18:00)
    const [depHour, depMin] = routeForm.departureTime.split(":").map(Number);
    const depMinutes = depHour * 60 + depMin;
    if (depMinutes < 5 * 60 || depMinutes >= 18 * 60) {
      Alert.alert("Gabim", "Ora e nisjes duhet të jetë ndërmjet 05:00 dhe 18:00");
      return;
    }

    try {
      const endpoints = await getApiEndpoints();
      const res = await fetch(endpoints.MANAGER.CREATE_ROUTE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({
          vanId: routeForm.vanId,
          destination: routeForm.destination,
          departureTime: routeForm.departureTime,
          arrivalTime: routeForm.arrivalTime,
          price: Number(routeForm.price),
          date: routeForm.date,
          totalSeats: routeForm.totalSeats ? Number(routeForm.totalSeats) : undefined,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        Alert.alert("Sukses", "Destinacioni u krijua me sukses!");
        setShowRouteForm(false);
        setRouteForm({
          vanId: "",
          destination: "",
          departureTime: "",
          arrivalTime: "",
          price: "",
          date: "",
          totalSeats: "",
        });
        setShowDatePicker(false);
        setShowDepartureTimePicker(false);
        setShowArrivalTimePicker(false);
        loadDashboardData();
      } else {
        Alert.alert("Gabim", data.error || "Dështoi krijimi i destinacionit");
      }
    } catch (err) {
      console.error("Error creating route:", err);
      Alert.alert("Gabim", "Dështoi krijimi i destinacionit");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("sq-AL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return "";
    // Nëse është në format HH:MM, ktheje si është
    if (timeString.includes(":")) {
      return timeString;
    }
    return timeString;
  };

  const handleDateConfirm = (date) => {
    const formattedDate = date.toISOString().split("T")[0];
    setRouteForm({ ...routeForm, date: formattedDate });
    setShowDatePicker(false);
  };

  const handleDepartureTimeConfirm = (date) => {
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const timeString = `${hours}:${minutes}`;
    setRouteForm({ ...routeForm, departureTime: timeString });
    setShowDepartureTimePicker(false);
  };

  const handleArrivalTimeConfirm = (date) => {
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const timeString = `${hours}:${minutes}`;
    setRouteForm({ ...routeForm, arrivalTime: timeString });
    setShowArrivalTimePicker(false);
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const getMinDate = () => {
    return new Date(); // Sot
  };

  const getDayName = (dayIndex) => {
    const days = ["E Diel", "E Hënë", "E Martë", "E Mërkurë", "E Enjte", "E Premte", "E Shtunë"];
    return days[dayIndex] || "Unknown";
  };

  // Helper to get font style with both size and family
  const getFontStyle = (baseSize) => ({ 
    fontSize: getScaledFontSize(baseSize),
    fontFamily: getFontFamily(),
  });
  
  // Keep getFontSize for backward compatibility, but include font family
  const getFontSize = (baseSize) => getFontStyle(baseSize);

  // Get unique clients from bookings
  const getUniqueClients = () => {
    const clientsMap = new Map();
    bookings.forEach((booking) => {
      if (booking.user) {
        const userId = booking.user._id || booking.user.id;
        if (!clientsMap.has(userId)) {
          clientsMap.set(userId, {
            id: userId,
            name: `${booking.user.firstName || ""} ${booking.user.lastName || ""}`.trim() || booking.user.email || "Unknown",
            phone: booking.user.phone || booking.passengerPhone || "N/A",
            email: booking.user.email || "N/A",
          });
        }
      }
    });
    return Array.from(clientsMap.values());
  };

  // Handle phone call
  const handlePhoneCall = (phoneNumber) => {
    if (!phoneNumber || phoneNumber === "N/A") {
      Alert.alert("Gabim", "Numri i telefonit nuk është i disponueshëm");
      return;
    }

    // Clean phone number (remove spaces, dashes, etc.)
    const cleanPhone = phoneNumber.replace(/[\s\-\(\)]/g, "");
    
    // Check if phone number is valid
    if (cleanPhone.length < 3) {
      Alert.alert("Gabim", "Numri i telefonit nuk është i vlefshëm");
      return;
    }

    const phoneUrl = `tel:${cleanPhone}`;
    
    Linking.canOpenURL(phoneUrl)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(phoneUrl);
        } else {
          Alert.alert("Gabim", "Aplikacioni i telefonit nuk është i disponueshëm");
        }
      })
      .catch((err) => {
        console.error("Error opening phone dialer:", err);
        Alert.alert("Gabim", "Dështoi hapja e aplikacionit të telefonit");
      });
  };

  const handleEditSchedule = (schedule) => {
    setEditingSchedule(schedule);
    setScheduleForm({
      vanId: schedule.van._id || schedule.van,
      destination: schedule.destination,
      departureTime: schedule.departureTime,
      arrivalTime: schedule.arrivalTime,
      price: String(schedule.price),
      daysOfWeek: schedule.daysOfWeek || [],
      totalSeats: schedule.totalSeats ? String(schedule.totalSeats) : "",
    });
    setShowScheduleForm(true);
  };

  const handleCreateSchedule = async () => {
    if (!scheduleForm.vanId || !scheduleForm.destination || !scheduleForm.departureTime || 
        !scheduleForm.arrivalTime || !scheduleForm.price) {
      Alert.alert("Gabim", "Të gjitha fushat janë të detyrueshme");
      return;
    }

    // Validate time format
    const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(scheduleForm.departureTime) || !timeRegex.test(scheduleForm.arrivalTime)) {
      Alert.alert("Gabim", "Formati i orës duhet të jetë HH:MM (p.sh. 08:00)");
      return;
    }

    // Validate time range (5:00 - 18:00)
    const [depHour, depMin] = scheduleForm.departureTime.split(":").map(Number);
    const depMinutes = depHour * 60 + depMin;
    if (depMinutes < 5 * 60 || depMinutes >= 18 * 60) {
      Alert.alert("Gabim", "Ora e nisjes duhet të jetë ndërmjet 05:00 dhe 18:00");
      return;
    }

    try {
      const endpoints = await getApiEndpoints();
      
      // Nëse po editojmë, përdor PUT, përndryshe POST
      const url = editingSchedule 
        ? `${endpoints.MANAGER.SCHEDULES}/${editingSchedule._id}`
        : endpoints.MANAGER.CREATE_SCHEDULE;
      const method = editingSchedule ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          Authorization: `Bearer ${user.token.trim()}`,
        },
        body: JSON.stringify({
          vanId: scheduleForm.vanId,
          destination: scheduleForm.destination,
          departureTime: scheduleForm.departureTime,
          arrivalTime: scheduleForm.arrivalTime,
          price: Number(scheduleForm.price),
          daysOfWeek: scheduleForm.daysOfWeek.length > 0 ? scheduleForm.daysOfWeek : undefined,
          totalSeats: scheduleForm.totalSeats ? Number(scheduleForm.totalSeats) : undefined,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        Alert.alert("Sukses", editingSchedule ? "Orari u përditësua me sukses!" : "Orari u krijua me sukses!");
        setShowScheduleForm(false);
        setEditingSchedule(null);
        setScheduleForm({
          vanId: "",
          destination: "",
          departureTime: "",
          arrivalTime: "",
          price: "",
          daysOfWeek: [],
          totalSeats: "",
        });
        loadDashboardData();
      } else {
        Alert.alert("Gabim", data.error || (editingSchedule ? "Dështoi përditësimi i orarit" : "Dështoi krijimi i orarit"));
      }
    } catch (err) {
      console.error("Error saving schedule:", err);
      Alert.alert("Gabim", editingSchedule ? "Dështoi përditësimi i orarit" : "Dështoi krijimi i orarit");
    }
  };

  const handleToggleSchedule = async (scheduleId) => {
    try {
      const endpoints = await getApiEndpoints();
      const res = await fetch(endpoints.MANAGER.TOGGLE_SCHEDULE(scheduleId), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          Authorization: `Bearer ${user.token.trim()}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        loadDashboardData();
      } else {
        Alert.alert("Gabim", data.error || "Dështoi ndryshimi i statusit");
      }
    } catch (err) {
      console.error("Error toggling schedule:", err);
      Alert.alert("Gabim", "Dështoi ndryshimi i statusit");
    }
  };

  const [showRouteFromScheduleModal, setShowRouteFromScheduleModal] = useState(false);
  const [selectedScheduleId, setSelectedScheduleId] = useState(null);
  const [routeDateFromSchedule, setRouteDateFromSchedule] = useState("");

  const handleCreateRouteFromSchedule = (scheduleId) => {
    setSelectedScheduleId(scheduleId);
    setRouteDateFromSchedule(getTodayDate());
    setShowRouteFromScheduleModal(true);
  };

  const confirmCreateRouteFromSchedule = async () => {
    if (!routeDateFromSchedule) {
      Alert.alert("Gabim", "Data është e detyrueshme");
      return;
    }

    try {
      const endpoints = await getApiEndpoints();
      const res = await fetch(endpoints.MANAGER.CREATE_ROUTE_FROM_SCHEDULE(selectedScheduleId), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          Authorization: `Bearer ${user.token.trim()}`,
        },
        body: JSON.stringify({ date: routeDateFromSchedule }),
      });

      const data = await res.json();

      if (res.ok) {
        Alert.alert("Sukses", "Route u krijua me sukses!");
        setShowRouteFromScheduleModal(false);
        setSelectedScheduleId(null);
        setRouteDateFromSchedule("");
        loadDashboardData();
      } else {
        Alert.alert("Gabim", data.error || "Dështoi krijimi i route");
      }
    } catch (err) {
      console.error("Error creating route from schedule:", err);
      Alert.alert("Gabim", "Dështoi krijimi i route");
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
        <ActivityIndicator size="large" color={colors.text} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }, getFontSize(20)]}>
          {dashboardData?.user?.firstName || user?.email}
        </Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            onPress={() => navigation.navigate("Settings")}
            style={[styles.settingsButton, { backgroundColor: colors.border }]}
            activeOpacity={0.7}
          >
            <Text style={styles.settingsIcon}>⚙️</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
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
            }}
            style={[styles.logoutButton, { backgroundColor: colors.border }]}
            activeOpacity={0.7}
          >
            <Text style={styles.logoutIcon}>🚪</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tabs */}
      <View style={[styles.tabs, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === "home" && { borderBottomColor: colors.text, borderBottomWidth: 2 },
          ]}
          onPress={() => setActiveTab("home")}
        >
          <Text style={[styles.tabText, { color: colors.text }, getFontSize(14)]}>Kryefaqja</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === "vans" && { borderBottomColor: colors.text, borderBottomWidth: 2 },
          ]}
          onPress={() => setActiveTab("vans")}
        >
          <Text style={[styles.tabText, { color: colors.text }, getFontSize(14)]}>Furgonat</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === "schedules" && { borderBottomColor: colors.text, borderBottomWidth: 2 },
          ]}
          onPress={() => setActiveTab("schedules")}
        >
          <Text style={[styles.tabText, { color: colors.text }, getFontSize(14)]}>Orarë fikse</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === "bookings" && { borderBottomColor: colors.text, borderBottomWidth: 2 },
          ]}
          onPress={() => setActiveTab("bookings")}
        >
          <Text style={[styles.tabText, { color: colors.text }, getFontSize(14)]}>Rezervimet</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.text} />
        }
      >
        {activeTab === "home" && (
          <View style={styles.homeContent}>
            {/* Quick Actions */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }, getFontSize(18)]}>Veprime të shpejta</Text>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.text }]}
                onPress={() => setShowVanForm(true)}
              >
                <Text style={[{ color: colors.background, fontWeight: "bold" }, getFontSize(14)]}>
                  + Shto Furgon të ri
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.text }]}
                onPress={() => {
                  if (vans.length === 0) {
                    Alert.alert("Gabim", "Duhet të kesh të paktën një furgon për të krijuar orar");
                    return;
                  }
                  setShowScheduleForm(true);
                }}
              >
                <Text style={[{ color: colors.background, fontWeight: "bold" }, getFontSize(14)]}>
                  + Shto Orar të ri
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.border, borderWidth: 1, borderColor: colors.text }]}
                onPress={() => setShowClientsModal(true)}
              >
                <Text style={{ color: colors.text, fontWeight: "bold" }}>
                  👥 Klientet ({getUniqueClients().length})
                </Text>
              </TouchableOpacity>
            </View>

            {/* Active Schedules */}
            {schedules.filter(s => s.isActive).length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }, getFontSize(18)]}>
                  Orarët e mia aktive ({schedules.filter(s => s.isActive).length})
                </Text>
                {schedules
                  .filter(s => s.isActive)
                  .slice(0, 5)
                  .map((schedule) => (
                    <View key={schedule._id} style={[styles.scheduleCard, { borderColor: colors.border }]}>
                      <View style={styles.scheduleContent}>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.scheduleTitle, { color: colors.text }, getFontSize(18)]}>
                            🚐 {schedule.van?.plateNumber} → {schedule.destination}
                          </Text>
                          <Text style={[styles.scheduleInfo, { color: colors.text }, getFontSize(14)]}>
                            🕐 {schedule.departureTime} - {schedule.arrivalTime} | 💰 {schedule.price} ALL
                          </Text>
                          <Text style={[styles.scheduleInfo, { color: colors.text }, getFontSize(14)]}>
                            📅 {schedule.daysOfWeek && schedule.daysOfWeek.length > 0
                              ? schedule.daysOfWeek.map(day => getDayName(day)).join(", ")
                              : "Çdo ditë"}
                          </Text>
                        </View>
                        {schedule.van?.photo ? (
                          <Image
                            source={{ uri: schedule.van.photo }}
                            style={styles.scheduleVanPhoto}
                          />
                        ) : (
                          <View style={[styles.scheduleVanPhotoPlaceholder, { backgroundColor: colors.border }]}>
                            <Text style={{ color: colors.text, fontSize: 24 }}>🚐</Text>
                          </View>
                        )}
                      </View>
                      <View style={styles.scheduleHeader}>
                        <TouchableOpacity
                          style={[styles.toggleButton, { backgroundColor: "#4CAF50" }]}
                          onPress={() => handleToggleSchedule(schedule._id)}
                        >
                          <Text style={{ color: "#fff" }}>✅</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
              </View>
            )}
          </View>
        )}

        {activeTab === "vans" && (
          <View style={styles.vansContent}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }, getFontSize(18)]}>Furgonat e mia</Text>
              <TouchableOpacity
                style={[styles.addButton, { backgroundColor: colors.text }]}
                onPress={() => setShowVanForm(true)}
              >
                <Text style={{ color: colors.background, fontWeight: "bold" }}>+ Shto</Text>
              </TouchableOpacity>
            </View>

            {vans.length === 0 ? (
              <Text style={[styles.emptyText, { color: colors.text }, getFontSize(14)]}>
                Nuk ke furgonat akoma. Shto një furgon për të filluar.
              </Text>
            ) : (
              vans.map((van) => (
                <View key={van._id} style={[styles.vanCard, { borderColor: colors.border }]}>
                  <View style={styles.vanCardContent}>
                    <Text style={[styles.vanPlate, { color: colors.text }, getFontSize(18)]}>
                      🚐 {van.plateNumber}
                    </Text>
                    {van.vanModel && (
                      <Text style={[styles.vanInfo, { color: colors.text }, getFontSize(14)]}>Model: {van.vanModel}</Text>
                    )}
                    <Text style={[styles.vanInfo, { color: colors.text }, getFontSize(14)]}>
                      Kapacitet: {van.capacity} vende
                    </Text>
                    <Text style={[styles.vanStatus, { color: colors.text }, getFontSize(14)]}>
                      Status: {van.status === "active" ? "✅ Aktiv" : "⏸️ Jo aktiv"}
                    </Text>
                  </View>
                  {van.photo ? (
                    <Image
                      source={{ uri: van.photo }}
                      style={styles.vanPhoto}
                    />
                  ) : (
                    <View style={[styles.vanPhotoPlaceholder, { backgroundColor: colors.border }]}>
                      <Text style={{ color: colors.text, fontSize: 32 }}>🚐</Text>
                    </View>
                  )}
                </View>
              ))
            )}
          </View>
        )}

        {activeTab === "bookings" && (
          <View style={styles.bookingsContent}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }, getFontSize(18)]}>
                Rezervimet ({bookings.length})
              </Text>
              <TouchableOpacity
                style={[styles.clientsButton, { backgroundColor: colors.border, borderWidth: 1, borderColor: colors.text }]}
                onPress={() => setShowClientsModal(true)}
              >
                <Text style={{ color: colors.text, fontWeight: "bold", fontSize: 14 }}>
                  👥 Klientet ({getUniqueClients().length})
                </Text>
              </TouchableOpacity>
            </View>
            {bookings.length === 0 ? (
              <Text style={[styles.emptyText, { color: colors.text }, getFontSize(14)]}>
                Nuk ka rezervime akoma
              </Text>
            ) : (
              bookings.map((booking) => (
                <View
                  key={booking._id}
                  style={[styles.bookingCard, { borderColor: colors.border }]}
                >
                  <View style={styles.bookingHeader}>
                    <Text style={[styles.bookingRoute, { color: colors.text }, getFontSize(16)]}>
                      {booking.route?.origin} → {booking.route?.destination}
                    </Text>
                    <Text style={[styles.bookingStatus, { color: colors.text }, getFontSize(14)]}>
                      {booking.status === "confirmed" ? "✅" : booking.status === "pending" ? "⏳" : "❌"}
                    </Text>
                  </View>
                  <Text style={[styles.bookingDate, { color: colors.text }, getFontSize(14)]}>
                    {formatDate(booking.route?.date)} - {booking.route?.departureTime}
                  </Text>
                  <Text style={[styles.bookingInfo, { color: colors.text }, getFontSize(14)]}>
                    👤 {booking.user?.firstName} {booking.user?.lastName}
                  </Text>
                  <Text style={[styles.bookingInfo, { color: colors.text }, getFontSize(14)]}>
                    📞 {booking.user?.phone || booking.user?.email}
                  </Text>
                  <Text style={[styles.bookingInfo, { color: colors.text }, getFontSize(14)]}>
                    {booking.numberOfSeats} vend(e) - {booking.totalPrice} ALL
                  </Text>
                </View>
              ))
            )}
          </View>
        )}

        {activeTab === "schedules" && (
          <View style={styles.schedulesContent}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }, getFontSize(18)]}>Orarë fikse</Text>
              <TouchableOpacity
                style={[styles.addButton, { backgroundColor: colors.text }]}
                onPress={() => {
                  if (vans.length === 0) {
                    Alert.alert("Gabim", "Duhet të kesh të paktën një furgon për të krijuar orar");
                    return;
                  }
                  setShowScheduleForm(true);
                }}
              >
                <Text style={{ color: colors.background, fontWeight: "bold" }}>+ Shto</Text>
              </TouchableOpacity>
            </View>

            {schedules.length === 0 ? (
              <Text style={[styles.emptyText, { color: colors.text }, getFontSize(14)]}>
                Nuk ke orarë fikse akoma. Krijoni një orar për të filluar.
              </Text>
            ) : (
              schedules.map((schedule) => (
                <View key={schedule._id} style={[styles.scheduleCard, { borderColor: colors.border }]}>
                  <View style={styles.scheduleContent}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.scheduleTitle, { color: colors.text }, getFontSize(18)]}>
                        Pogradec → {schedule.destination}
                      </Text>
                      <Text style={[styles.scheduleInfo, { color: colors.text }, getFontSize(14)]}>
                        🕐 {schedule.departureTime} - {schedule.arrivalTime} | 💰 {schedule.price} ALL
                      </Text>
                      <Text style={[styles.scheduleInfo, { color: colors.text }, getFontSize(14)]}>
                        🚐 {schedule.van?.plateNumber}
                      </Text>
                      <Text style={[styles.scheduleInfo, { color: colors.text }, getFontSize(14)]}>
                        📅 {schedule.daysOfWeek && schedule.daysOfWeek.length > 0
                          ? schedule.daysOfWeek.map(day => getDayName(day)).join(", ")
                          : "Çdo ditë"}
                      </Text>
                    </View>
                    {schedule.van?.photo ? (
                      <Image
                        source={{ uri: schedule.van.photo }}
                        style={styles.scheduleVanPhoto}
                      />
                    ) : (
                      <View style={[styles.scheduleVanPhotoPlaceholder, { backgroundColor: colors.border }]}>
                        <Text style={{ color: colors.text, fontSize: 24 }}>🚐</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.scheduleHeader}>
                    <TouchableOpacity
                      style={[
                        styles.toggleButton,
                        {
                          backgroundColor: schedule.isActive ? "#4CAF50" : colors.border,
                        },
                      ]}
                      onPress={() => handleToggleSchedule(schedule._id)}
                    >
                      <Text style={{ color: schedule.isActive ? "#fff" : colors.text }}>
                        {schedule.isActive ? "✅ Aktiv" : "⏸️ Jo aktiv"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.scheduleActions}>
                    {schedule.isActive && (
                      <TouchableOpacity
                        style={[styles.createRouteButton, { borderColor: colors.border }]}
                        onPress={() => handleCreateRouteFromSchedule(schedule._id)}
                      >
                        <Text style={[{ color: colors.text }, getFontSize(14)]}>Krijo route</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      style={[styles.editButton, { borderColor: colors.border }]}
                      onPress={() => handleEditSchedule(schedule)}
                    >
                      <Text style={{ color: colors.text }}>✏️ Edito</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>

      {/* Van Form Modal */}
      {showVanForm && (
        <View style={[styles.modalOverlay, { backgroundColor: "rgba(0,0,0,0.5)" }]}>
          <ScrollView 
            style={styles.modalScrollView}
            keyboardShouldPersistTaps="handled"
          >
            <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Shto Furgon të ri</Text>
            
            <TextInput
              placeholder="Targa (p.sh. AB123CD)"
              placeholderTextColor="gray"
              value={vanForm.plateNumber}
              onChangeText={(text) => setVanForm({ ...vanForm, plateNumber: text.toUpperCase() })}
              style={[styles.input, { borderColor: colors.border, color: colors.text }]}
              autoCapitalize="characters"
            />
            
            <TextInput
              placeholder="Modeli (opsional)"
              placeholderTextColor="gray"
              value={vanForm.model}
              onChangeText={(text) => setVanForm({ ...vanForm, model: text })}
              style={[styles.input, { borderColor: colors.border, color: colors.text }]}
            />
            
            <TextInput
              placeholder="Kapaciteti (default: 15)"
              placeholderTextColor="gray"
              value={vanForm.capacity}
              onChangeText={(text) => setVanForm({ ...vanForm, capacity: text })}
              keyboardType="numeric"
              style={[styles.input, { borderColor: colors.border, color: colors.text }]}
            />

            <Text style={[styles.label, { color: colors.text, marginTop: 12 }]}>Foto e Furgonit</Text>
            <TouchableOpacity
              style={[styles.photoButton, { borderColor: colors.border }]}
              onPress={pickImage}
            >
              {vanForm.photo ? (
                <Image
                  source={{ uri: vanForm.photo }}
                  style={styles.photoPreview}
                />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <Text style={{ color: colors.text, fontSize: 48 }}>📷</Text>
                  <Text style={{ color: colors.text, marginTop: 8 }}>Shto Foto</Text>
                </View>
              )}
            </TouchableOpacity>
            {vanForm.photo && (
              <TouchableOpacity
                style={[styles.removePhotoButton, { borderColor: colors.border }]}
                onPress={() => setVanForm({ ...vanForm, photo: null })}
              >
                <Text style={{ color: "red" }}>Hiq Foton</Text>
              </TouchableOpacity>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { borderColor: colors.border }]}
                onPress={() => {
                  setShowVanForm(false);
                  setVanForm({ plateNumber: "", model: "", capacity: "15", photo: null });
                }}
              >
                <Text style={[{ color: colors.text }, getFontSize(14)]}>Anulo</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.text }]}
                onPress={handleCreateVan}
              >
                <Text style={[{ color: colors.background, fontWeight: "bold" }, getFontSize(14)]}>Krijo</Text>
              </TouchableOpacity>
            </View>
            </View>
          </ScrollView>
        </View>
      )}

      {/* Schedule Form Modal */}
      {showScheduleForm && (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={[styles.modalOverlay, { backgroundColor: "rgba(0,0,0,0.5)" }]}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <ScrollView 
                style={styles.modalScrollView}
                keyboardShouldPersistTaps="handled"
              >
                <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
                  <Text style={[styles.modalTitle, { color: colors.text }]}>
                    {editingSchedule ? "Edito Orar" : "Shto Orar të ri"}
                  </Text>
                  <Text style={[styles.modalSubtitle, { color: colors.text }]}>
                    Nisja është nga Pogradec
                  </Text>

                  <Text style={[styles.label, { color: colors.text }]}>Furgoni *</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {vans.map((van) => (
                      <TouchableOpacity
                        key={van._id}
                        style={[
                          styles.vanOption,
                          {
                            backgroundColor: scheduleForm.vanId === van._id ? colors.text : colors.border,
                            borderColor: colors.border,
                          },
                        ]}
                        onPress={() => setScheduleForm({ ...scheduleForm, vanId: van._id })}
                      >
                        <Text
                          style={{
                            color: scheduleForm.vanId === van._id ? colors.background : colors.text,
                            fontWeight: scheduleForm.vanId === van._id ? "bold" : "normal",
                          }}
                        >
                          {van.plateNumber}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>

                  <Text style={[styles.label, { color: colors.text }]}>Destinacioni *</Text>
                  <TextInput
                    placeholder="P.sh. Tirana, Durrës, Shkodër"
                    placeholderTextColor="gray"
                    value={scheduleForm.destination}
                    onChangeText={(text) => setScheduleForm({ ...scheduleForm, destination: text })}
                    style={[styles.input, { borderColor: colors.border, color: colors.text }]}
                  />

                  <Text style={[styles.label, { color: colors.text }]}>
                    Ora e nisjes * (05:00 - 18:00)
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      Keyboard.dismiss();
                      setShowScheduleDepartureTimePicker(true);
                    }}
                    style={[styles.input, styles.pickerInput, { borderColor: colors.border }]}
                  >
                    <Text style={{ color: scheduleForm.departureTime ? colors.text : "gray" }}>
                      {scheduleForm.departureTime || "Zgjidh orën e nisjes"}
                    </Text>
                  </TouchableOpacity>
                  <DateTimePickerModal
                    isVisible={showScheduleDepartureTimePicker}
                    mode="time"
                    onConfirm={(date) => {
                      const hours = String(date.getHours()).padStart(2, "0");
                      const minutes = String(date.getMinutes()).padStart(2, "0");
                      setScheduleForm({ ...scheduleForm, departureTime: `${hours}:${minutes}` });
                      setShowScheduleDepartureTimePicker(false);
                    }}
                    onCancel={() => setShowScheduleDepartureTimePicker(false)}
                    is24Hour={true}
                  />

                  <Text style={[styles.label, { color: colors.text }]}>Ora e mbërritjes *</Text>
                  <TouchableOpacity
                    onPress={() => {
                      Keyboard.dismiss();
                      setShowScheduleArrivalTimePicker(true);
                    }}
                    style={[styles.input, styles.pickerInput, { borderColor: colors.border }]}
                  >
                    <Text style={{ color: scheduleForm.arrivalTime ? colors.text : "gray" }}>
                      {scheduleForm.arrivalTime || "Zgjidh orën e mbërritjes"}
                    </Text>
                  </TouchableOpacity>
                  <DateTimePickerModal
                    isVisible={showScheduleArrivalTimePicker}
                    mode="time"
                    onConfirm={(date) => {
                      const hours = String(date.getHours()).padStart(2, "0");
                      const minutes = String(date.getMinutes()).padStart(2, "0");
                      setScheduleForm({ ...scheduleForm, arrivalTime: `${hours}:${minutes}` });
                      setShowScheduleArrivalTimePicker(false);
                    }}
                    onCancel={() => setShowScheduleArrivalTimePicker(false)}
                    is24Hour={true}
                  />

                  <Text style={[styles.label, { color: colors.text }]}>Çmimi për person (ALL) *</Text>
                  <TextInput
                    placeholder="P.sh. 500"
                    placeholderTextColor="gray"
                    value={scheduleForm.price}
                    onChangeText={(text) => setScheduleForm({ ...scheduleForm, price: text })}
                    keyboardType="numeric"
                    style={[styles.input, { borderColor: colors.border, color: colors.text }]}
                  />

                  <Text style={[styles.label, { color: colors.text }]}>
                    Ditët e javës (lëre bosh për çdo ditë)
                  </Text>
                  <View style={styles.daysContainer}>
                    {["E Diel", "E Hënë", "E Martë", "E Mërkurë", "E Enjte", "E Premte", "E Shtunë"].map(
                      (day, index) => (
                        <TouchableOpacity
                          key={index}
                          style={[
                            styles.dayButton,
                            {
                              backgroundColor: scheduleForm.daysOfWeek.includes(index)
                                ? colors.text
                                : colors.border,
                              borderColor: colors.border,
                            },
                          ]}
                          onPress={() => {
                            const newDays = scheduleForm.daysOfWeek.includes(index)
                              ? scheduleForm.daysOfWeek.filter((d) => d !== index)
                              : [...scheduleForm.daysOfWeek, index];
                            setScheduleForm({ ...scheduleForm, daysOfWeek: newDays });
                          }}
                        >
                          <Text
                            style={{
                              color: scheduleForm.daysOfWeek.includes(index)
                                ? colors.background
                                : colors.text,
                              fontSize: 12,
                            }}
                          >
                            {day.substring(2)}
                          </Text>
                        </TouchableOpacity>
                      )
                    )}
                  </View>
                  {scheduleForm.daysOfWeek.length === 0 && (
                    <Text style={[styles.hintText, { color: colors.text }]}>
                      Nëse nuk zgjedh asnjë ditë, orari do të jetë aktiv çdo ditë
                    </Text>
                  )}

                  <Text style={[styles.label, { color: colors.text }]}>
                    Numri i vendeve (opsional, default: kapaciteti i furgonit)
                  </Text>
                  <TextInput
                    placeholder="P.sh. 15"
                    placeholderTextColor="gray"
                    value={scheduleForm.totalSeats}
                    onChangeText={(text) => setScheduleForm({ ...scheduleForm, totalSeats: text })}
                    keyboardType="numeric"
                    style={[styles.input, { borderColor: colors.border, color: colors.text }]}
                  />

                  <View style={styles.modalButtons}>
                    <TouchableOpacity
                      style={[styles.modalButton, { borderColor: colors.border }]}
                      onPress={() => {
                        Keyboard.dismiss();
                        setShowScheduleForm(false);
                        setEditingSchedule(null);
                        setScheduleForm({
                          vanId: "",
                          destination: "",
                          departureTime: "",
                          arrivalTime: "",
                          price: "",
                          daysOfWeek: [],
                          totalSeats: "",
                        });
                      }}
                    >
                      <Text style={[{ color: colors.text }, getFontSize(14)]}>Anulo</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.modalButton, { backgroundColor: colors.text }]}
                      onPress={() => {
                        Keyboard.dismiss();
                        handleCreateSchedule();
                      }}
                    >
                      <Text style={[{ color: colors.background, fontWeight: "bold" }, getFontSize(14)]}>
                        {editingSchedule ? "Ruaj" : "Krijo"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      )}

      {/* Route From Schedule Modal */}
      {showRouteFromScheduleModal && (
        <View style={[styles.modalOverlay, { backgroundColor: "rgba(0,0,0,0.5)" }]}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Krijo Route</Text>
            <Text style={[styles.modalSubtitle, { color: colors.text }]}>
              Zgjidh datën për të cilën dëshiron të krijosh route
            </Text>

            <Text style={[styles.label, { color: colors.text }]}>Data *</Text>
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              style={[styles.input, styles.pickerInput, { borderColor: colors.border }]}
            >
              <Text style={{ color: routeDateFromSchedule ? colors.text : "gray" }}>
                {routeDateFromSchedule ? formatDate(routeDateFromSchedule) : "Zgjidh datën"}
              </Text>
            </TouchableOpacity>
            <DateTimePickerModal
              isVisible={showDatePicker}
              mode="date"
              minimumDate={getMinDate()}
              onConfirm={(date) => {
                setRouteDateFromSchedule(date.toISOString().split("T")[0]);
                setShowDatePicker(false);
              }}
              onCancel={() => setShowDatePicker(false)}
              locale="sq_AL"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { borderColor: colors.border }]}
                onPress={() => {
                  setShowRouteFromScheduleModal(false);
                  setSelectedScheduleId(null);
                  setRouteDateFromSchedule("");
                }}
              >
                <Text style={[{ color: colors.text }, getFontSize(14)]}>Anulo</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.text }]}
                onPress={confirmCreateRouteFromSchedule}
              >
                <Text style={[{ color: colors.background, fontWeight: "bold" }, getFontSize(14)]}>Krijo</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Clients Modal */}
      <Modal
        visible={showClientsModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowClientsModal(false)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: "rgba(0,0,0,0.5)" }]}>
          <View style={[styles.modalContent, { backgroundColor: colors.background, maxHeight: "80%" }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Klientet</Text>
              <TouchableOpacity
                onPress={() => setShowClientsModal(false)}
                style={[styles.closeButton, { backgroundColor: colors.border }]}
              >
                <Text style={{ color: colors.text, fontSize: 20, fontWeight: "bold" }}>×</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.clientsList}>
              {getUniqueClients().length === 0 ? (
                <Text style={[styles.emptyText, { color: colors.text, textAlign: "center", marginTop: 20 }, getFontSize(14)]}>
                  Nuk ka klientë akoma
                </Text>
              ) : (
                getUniqueClients().map((client, index) => (
                  <View
                    key={client.id || index}
                    style={[styles.clientCard, { borderColor: colors.border, backgroundColor: colors.background }]}
                  >
                    <Text style={[styles.clientName, { color: colors.text }, getFontSize(18)]}>
                      👤 {client.name}
                    </Text>
                    {client.phone && client.phone !== "N/A" ? (
                      <TouchableOpacity
                        onPress={() => handlePhoneCall(client.phone)}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.clientPhone, { color: colors.text, textDecorationLine: "underline" }, getFontSize(16)]}>
                          📞 {client.phone}
                        </Text>
                      </TouchableOpacity>
                    ) : (
                      <Text style={[styles.clientPhone, { color: colors.text, opacity: 0.5 }, getFontSize(16)]}>
                        📞 N/A
                      </Text>
                    )}
                    {client.email && client.email !== "N/A" && (
                      <Text style={[styles.clientEmail, { color: colors.text }, getFontSize(14)]}>
                        ✉️ {client.email}
                      </Text>
                    )}
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Theme Button */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    paddingTop: Platform.OS === "ios" ? 8 : 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    flex: 1,
    marginRight: 12,
  },
  headerButtons: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  settingsIcon: {
    fontSize: 20,
  },
  logoutButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  logoutIcon: {
    fontSize: 20,
  },
  tabs: {
    flexDirection: "row",
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    padding: 12,
    alignItems: "center",
  },
  tabText: {
    fontSize: 12,
    fontWeight: "600",
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Platform.OS === "ios" ? 100 : 80,
  },
  homeContent: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  actionButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  addButton: {
    padding: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  vansContent: {
    padding: 16,
  },
  vanCard: {
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 12,
    overflow: "hidden",
    flexDirection: "row",
  },
  vanCardContent: {
    flex: 1,
    padding: 16,
  },
  vanPhoto: {
    width: 120,
    height: 140,
    resizeMode: "cover",
  },
  vanPhotoPlaceholder: {
    width: 120,
    height: 140,
    justifyContent: "center",
    alignItems: "center",
  },
  vanPlate: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  vanInfo: {
    fontSize: 14,
    marginBottom: 4,
  },
  vanStatus: {
    fontSize: 12,
    marginTop: 4,
  },
  routesContent: {
    padding: 16,
  },
  routeCard: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  routeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  routeTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  routePrice: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4CAF50",
  },
  routeInfo: {
    fontSize: 14,
    marginBottom: 4,
  },
  bookingsContent: {
    padding: 16,
  },
  bookingCard: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  bookingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  bookingRoute: {
    fontSize: 16,
    fontWeight: "600",
  },
  bookingStatus: {
    fontSize: 12,
  },
  bookingDate: {
    fontSize: 14,
    marginBottom: 4,
  },
  bookingInfo: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 2,
  },
  emptyText: {
    textAlign: "center",
    fontSize: 14,
    marginTop: 32,
    opacity: 0.6,
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modalScrollView: {
    maxHeight: "80%",
    width: "90%",
  },
  modalContent: {
    borderRadius: 12,
    padding: 20,
    width: "100%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    marginBottom: 16,
    opacity: 0.7,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  pickerInput: {
    justifyContent: "center",
    minHeight: 48,
  },
  vanOption: {
    padding: 12,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
  },
  schedulesContent: {
    padding: 16,
  },
  scheduleCard: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    overflow: "hidden",
  },
  scheduleContent: {
    flexDirection: "row",
    marginBottom: 8,
  },
  scheduleVanPhoto: {
    width: 100,
    height: 100,
    borderRadius: 8,
    resizeMode: "cover",
    marginLeft: 12,
  },
  scheduleVanPhotoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
  },
  scheduleHeader: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  scheduleTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  scheduleInfo: {
    fontSize: 14,
    marginBottom: 2,
  },
  toggleButton: {
    padding: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  scheduleActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  createRouteButton: {
    flex: 1,
    borderWidth: 1,
    padding: 10,
    borderRadius: 6,
    alignItems: "center",
  },
  editButton: {
    borderWidth: 1,
    padding: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: "center",
  },
  daysContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  dayButton: {
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    minWidth: 50,
    alignItems: "center",
  },
  hintText: {
    fontSize: 12,
    fontStyle: "italic",
    opacity: 0.7,
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  photoButton: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 150,
    marginBottom: 8,
  },
  photoPreview: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    resizeMode: "cover",
  },
  photoPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  removePhotoButton: {
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
    alignItems: "center",
    marginBottom: 12,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  clientsList: {
    maxHeight: 400,
  },
  clientCard: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  clientName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  clientPhone: {
    fontSize: 16,
    marginBottom: 4,
  },
  clientEmail: {
    fontSize: 14,
    opacity: 0.7,
  },
  clientsButton: {
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
});
