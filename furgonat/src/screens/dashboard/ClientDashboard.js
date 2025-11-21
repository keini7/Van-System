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
  Platform,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemeContext } from "../../context/ThemeContext";
import { AuthContext } from "../../context/AuthContext";
import { getApiEndpoints } from "../../config/api";

export default function ClientDashboard({ navigation }) {
  const { colors } = useContext(ThemeContext);
  const { user, logout } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState("home");

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const endpoints = await getApiEndpoints();

      const dashboardRes = await fetch(endpoints.USER.DASHBOARD, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });
      const dashboardJson = await dashboardRes.json();
      setDashboardData(dashboardJson);

      const routesRes = await fetch(endpoints.USER.ROUTES, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });
      const routesJson = await routesRes.json();
      setRoutes(routesJson.routes || []);

      const bookingsRes = await fetch(endpoints.USER.BOOKINGS, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });
      const bookingsJson = await bookingsRes.json();
      setBookings(bookingsJson.bookings || []);
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

  const handleBookRoute = (route) => {
    Alert.alert(
      "Rezervo Vend",
      `Dëshiron të rezervosh për ${route.origin} → ${route.destination}?`,
      [
        { text: "Anulo", style: "cancel" },
        {
          text: "Rezervo",
          onPress: () => createBooking(route._id, 1),
        },
      ]
    );
  };

  const createBooking = async (routeId, numberOfSeats = 1) => {
    try {
      const endpoints = await getApiEndpoints();
      const res = await fetch(endpoints.USER.CREATE_BOOKING, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({
          routeId,
          numberOfSeats,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        Alert.alert("Sukses", "Rezervimi u krijua me sukses!");
        loadDashboardData(); // Reload data
      } else {
        Alert.alert("Gabim", data.error || "Dështoi rezervimi");
      }
    } catch (err) {
      console.error("Error creating booking:", err);
      Alert.alert("Gabim", "Dështoi rezervimi");
    }
  };

  const handleCancelBooking = (bookingId) => {
    Alert.alert(
      "Anulo Rezervim",
      "Je i sigurt që dëshiron të anulosh këtë rezervim?",
      [
        { text: "Jo", style: "cancel" },
        {
          text: "Po, Anulo",
          style: "destructive",
          onPress: async () => {
            try {
              const endpoints = await getApiEndpoints();
              const res = await fetch(`${endpoints.USER.CANCEL_BOOKING}/${bookingId}/cancel`, {
                method: "PUT",
                headers: {
                  Authorization: `Bearer ${user?.token}`,
                },
              });

              const data = await res.json();

              if (res.ok) {
                Alert.alert("Sukses", "Rezervimi u anulua");
                loadDashboardData();
              } else {
                Alert.alert("Gabim", data.error || "Dështoi anulimi");
              }
            } catch (err) {
              console.error("Error cancelling booking:", err);
              Alert.alert("Gabim", "Dështoi anulimi");
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("sq-AL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const activeBookings = bookings.filter(
    (b) => b.status === "pending" || b.status === "confirmed"
  );
  const pastBookings = bookings.filter(
    (b) => b.status === "completed" || b.status === "cancelled"
  );

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
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Mirë se erdhe, {dashboardData?.user?.firstName || user?.email}!
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
          <Text style={[styles.tabText, { color: colors.text }]}>Kryefaqja</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === "routes" && { borderBottomColor: colors.text, borderBottomWidth: 2 },
          ]}
          onPress={() => setActiveTab("routes")}
        >
          <Text style={[styles.tabText, { color: colors.text }]}>Destinacione</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === "bookings" && { borderBottomColor: colors.text, borderBottomWidth: 2 },
          ]}
          onPress={() => setActiveTab("bookings")}
        >
          <Text style={[styles.tabText, { color: colors.text }]}>Rezervimet</Text>
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
            {/* Recent Bookings */}
            {activeBookings.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Rezervimet e mia aktive
                </Text>
                {activeBookings.slice(0, 3).map((booking) => (
                  <View
                    key={booking._id}
                    style={[styles.bookingCard, { borderColor: colors.border }]}
                  >
                    <View style={styles.bookingHeader}>
                      <Text style={[styles.bookingRoute, { color: colors.text }]}>
                        {booking.route?.origin} → {booking.route?.destination}
                      </Text>
                      <Text style={[styles.bookingStatus, { color: colors.text }]}>
                        {booking.status === "confirmed" ? "✅ Konfirmuar" : "⏳ Në pritje"}
                      </Text>
                    </View>
                    <Text style={[styles.bookingDate, { color: colors.text }]}>
                      {formatDate(booking.route?.date)} - {booking.route?.departureTime}
                    </Text>
                    <Text style={[styles.bookingInfo, { color: colors.text }]}>
                      {booking.numberOfSeats} vend(e) - {booking.totalPrice} ALL
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {activeTab === "routes" && (
          <View style={styles.routesContent}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Destinacione të disponueshme
            </Text>
            {routes.length === 0 ? (
              <Text style={[styles.emptyText, { color: colors.text }]}>
                Nuk ka destinacione të disponueshme për momentin
              </Text>
            ) : (
              routes.map((route) => (
                <View key={route._id} style={[styles.routeCard, { borderColor: colors.border }]}>
                  <View style={styles.routeCardContent}>
                    <View style={styles.routeHeader}>
                      <Text style={[styles.routeTitle, { color: colors.text }]}>
                        {route.origin} → {route.destination}
                      </Text>
                      <Text style={[styles.routePrice, { color: colors.text }]}>
                        {route.price} ALL
                      </Text>
                    </View>
                    <Text style={[styles.routeInfo, { color: colors.text }]}>
                      📅 {formatDate(route.date)} | 🕐 {route.departureTime} - {route.arrivalTime}
                    </Text>
                    <Text style={[styles.routeInfo, { color: colors.text }]}>
                      🚐 {route.van?.plateNumber}{route.van?.vanModel ? ` (${route.van.vanModel})` : ""} | {route.availableSeats}/{route.totalSeats || route.van?.capacity || "?"} vende të lira
                    </Text>
                    {route.manager && (
                      <Text style={[styles.routeInfo, { color: colors.text, fontSize: 12 }]}>
                        👤 {route.manager?.firstName} {route.manager?.lastName}
                        {route.manager?.phone ? ` | 📞 ${route.manager.phone}` : ""}
                      </Text>
                    )}
                    {route.availableSeats > 0 ? (
                      <TouchableOpacity
                        style={[styles.bookButton, { backgroundColor: colors.text }]}
                        onPress={() => handleBookRoute(route)}
                      >
                        <Text style={{ color: colors.background, fontWeight: "bold" }}>
                          Rezervo Vend
                        </Text>
                      </TouchableOpacity>
                    ) : (
                      <View style={[styles.bookButton, { backgroundColor: colors.border }]}>
                        <Text style={{ color: colors.text }}>I plotë</Text>
                      </View>
                    )}
                  </View>
                  {route.van?.photo ? (
                    <Image
                      source={{ uri: route.van.photo }}
                      style={styles.routeVanPhoto}
                    />
                  ) : (
                    <View style={[styles.routeVanPhotoPlaceholder, { backgroundColor: colors.border }]}>
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
            {/* Active Bookings */}
            {activeBookings.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Rezervime Aktive ({activeBookings.length})
                </Text>
                {activeBookings.map((booking) => (
                  <View
                    key={booking._id}
                    style={[styles.bookingCard, { borderColor: colors.border }]}
                  >
                    <View style={styles.bookingHeader}>
                      <Text style={[styles.bookingRoute, { color: colors.text }]}>
                        {booking.route?.origin} → {booking.route?.destination}
                      </Text>
                      <Text style={[styles.bookingStatus, { color: colors.text }]}>
                        {booking.status === "confirmed" ? "✅" : "⏳"}
                      </Text>
                    </View>
                    <Text style={[styles.bookingDate, { color: colors.text }]}>
                      {formatDate(booking.route?.date)} - {booking.route?.departureTime}
                    </Text>
                    <Text style={[styles.bookingInfo, { color: colors.text }]}>
                      {booking.numberOfSeats} vend(e) - {booking.totalPrice} ALL
                    </Text>
                    <Text style={[styles.bookingInfo, { color: colors.text }]}>
                      🚐 {booking.van?.plateNumber}
                    </Text>
                    <TouchableOpacity
                      style={[styles.cancelButton, { borderColor: colors.border }]}
                      onPress={() => handleCancelBooking(booking._id)}
                    >
                      <Text style={{ color: "red" }}>Anulo Rezervim</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {/* Past Bookings */}
            {pastBookings.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Rezervime të kaluara ({pastBookings.length})
                </Text>
                {pastBookings.map((booking) => (
                  <View
                    key={booking._id}
                    style={[styles.bookingCard, { borderColor: colors.border, opacity: 0.7 }]}
                  >
                    <View style={styles.bookingHeader}>
                      <Text style={[styles.bookingRoute, { color: colors.text }]}>
                        {booking.route?.origin} → {booking.route?.destination}
                      </Text>
                      <Text style={[styles.bookingStatus, { color: colors.text }]}>
                        {booking.status === "completed" ? "✅" : "❌"}
                      </Text>
                    </View>
                    <Text style={[styles.bookingDate, { color: colors.text }]}>
                      {formatDate(booking.route?.date)} - {booking.route?.departureTime}
                    </Text>
                    <Text style={[styles.bookingInfo, { color: colors.text }]}>
                      {booking.numberOfSeats} vend(e) - {booking.totalPrice} ALL
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {bookings.length === 0 && (
              <Text style={[styles.emptyText, { color: colors.text }]}>
                Nuk ke rezervime akoma
              </Text>
            )}
          </View>
        )}
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
    padding: 16,
    alignItems: "center",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Platform.OS === "ios" ? 100 : 80, // Padding për butonat dhe safe area
  },
  homeContent: {
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
  },
  routesContent: {
    padding: 16,
  },
  routeCard: {
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 12,
    overflow: "hidden",
    flexDirection: "row",
  },
  routeCardContent: {
    flex: 1,
    padding: 16,
  },
  routeVanPhoto: {
    width: 120,
    height: 160,
    resizeMode: "cover",
  },
  routeVanPhotoPlaceholder: {
    width: 120,
    height: 160,
    justifyContent: "center",
    alignItems: "center",
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
  bookButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 12,
  },
  cancelButton: {
    borderWidth: 1,
    padding: 8,
    borderRadius: 6,
    alignItems: "center",
    marginTop: 8,
  },
  bookingsContent: {
    padding: 16,
  },
  emptyText: {
    textAlign: "center",
    fontSize: 14,
    marginTop: 32,
    opacity: 0.6,
  },
});
