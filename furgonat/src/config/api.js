// API Configuration
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "@api_base_url";
const PORT = 5000;

// Funksion për të testuar nëse një URL funksionon
const testUrl = async (url, timeout = 2000) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    const response = await fetch(`${url}/api/config/ip`, {
      method: "GET",
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    
    if (response.ok) {
      const data = await response.json();
      return { success: true, url, data };
    }
    return { success: false, url, error: `Status: ${response.status}` };
  } catch (e) {
    return { success: false, url, error: e.message };
  }
};

// Funksion për të detektuar automatikisht IP-në e kompjuterit
export const detectServerIP = async () => {
  // Nëse ka environment variable, përdor atë
  if (process.env.EXPO_PUBLIC_API_URL) {
    if (__DEV__) {
      console.log("🔗 Using EXPO_PUBLIC_API_URL:", process.env.EXPO_PUBLIC_API_URL);
    }
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // Kontrollo nëse kemi ruajtur IP-në më parë
  try {
    const storedUrl = await AsyncStorage.getItem(STORAGE_KEY);
    if (storedUrl) {
      // Testo nëse IP-ja e ruajtur funksionon
      const testResult = await testUrl(storedUrl);
      if (testResult.success) {
        if (__DEV__) {
          console.log("✅ Using stored URL:", storedUrl);
        }
        return storedUrl;
      } else {
        if (__DEV__) {
          console.warn("⚠️ Stored URL not working, detecting new one:", testResult.error);
        }
      }
    }
  } catch (e) {
    // Ignore storage errors
    if (__DEV__) {
      console.warn("⚠️ Error reading stored URL:", e.message);
    }
  }

  // Për Android emulator, përdor 10.0.2.2 (alias për localhost)
  if (Platform.OS === "android") {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const response = await fetch(`http://10.0.2.2:${PORT}/api/config/ip`, {
        method: "GET",
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const data = await response.json();
      if (data.ip && data.ip !== "localhost") {
        const url = `http://${data.ip}:${data.port || PORT}`;
        await AsyncStorage.setItem(STORAGE_KEY, url);
        return url;
      }
    } catch (e) {
      // Nëse nuk funksionon, përdor 10.0.2.2 për emulator
      return `http://10.0.2.2:${PORT}`;
    }
  }

  // Për iOS simulator, provo localhost dhe IP të detektuar
  if (Platform.OS === "ios") {
    // Provo localhost së pari (funksionon në iOS simulator)
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const response = await fetch(`http://localhost:${PORT}/api/config/ip`, {
        method: "GET",
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        if (__DEV__) {
          console.log("📱 iOS: Detected server config:", data);
        }
        
        // Nëse backend kthen IP, përdor atë (për device fizik)
        if (data.ip && data.ip !== "localhost" && data.ip !== "127.0.0.1") {
          const url = `http://${data.ip}:${data.port || PORT}`;
          await AsyncStorage.setItem(STORAGE_KEY, url);
          if (__DEV__) {
            console.log("📱 iOS: Using network IP:", url);
          }
          return url;
        } else {
          // Për simulator, përdor localhost
          const url = `http://localhost:${PORT}`;
          await AsyncStorage.setItem(STORAGE_KEY, url);
          if (__DEV__) {
            console.log("📱 iOS: Using localhost:", url);
          }
          return url;
        }
      }
    } catch (e) {
      if (__DEV__) {
        console.warn("📱 iOS: localhost failed, trying network IP:", e.message);
      }
      
      // Nëse localhost nuk funksionon, provo IP të detektuar
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
        const response = await fetch(`http://192.168.1.216:${PORT}/api/config/ip`, {
          method: "GET",
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        
        if (response.ok) {
          const data = await response.json();
          const url = `http://${data.ip}:${data.port || PORT}`;
          await AsyncStorage.setItem(STORAGE_KEY, url);
          if (__DEV__) {
            console.log("📱 iOS: Using network IP (fallback):", url);
          }
          return url;
        }
      } catch (e2) {
        if (__DEV__) {
          console.warn("📱 iOS: Network IP also failed:", e2.message);
        }
      }
      
      // Fallback në localhost
      if (__DEV__) {
        console.log("📱 iOS: Using localhost as fallback");
      }
      return `http://localhost:${PORT}`;
    }
  }

  // Për web, përdor localhost
  if (Platform.OS === "web") {
    return `http://localhost:${PORT}`;
  }

  // Për device fizik ose kur platform nuk është e detektuar, provo të detektojmë IP-në
  // Së pari, provo të marrim IP nga backend përmes localhost
  try {
    const localhostTest = await testUrl(`http://localhost:${PORT}`);
    if (localhostTest.success && localhostTest.data) {
      const serverIP = localhostTest.data.ip;
      const serverPort = localhostTest.data.port || PORT;
      
      // Nëse backend kthen IP tjetër (jo localhost), përdor atë
      if (serverIP && serverIP !== "localhost" && serverIP !== "127.0.0.1") {
        const networkUrl = `http://${serverIP}:${serverPort}`;
        await AsyncStorage.setItem(STORAGE_KEY, networkUrl);
        if (__DEV__) {
          console.log("✅ Detected server IP from backend:", networkUrl);
        }
        return networkUrl;
      }
    }
  } catch (e) {
    if (__DEV__) {
      console.warn("⚠️ Could not get IP from backend:", e.message);
    }
  }
  
  // Nëse localhost funksionon, përdor atë
  const localhostUrl = `http://localhost:${PORT}`;
  if (__DEV__) {
    console.log("📱 Using localhost:", localhostUrl);
  }
  return localhostUrl;
};

// Cache për API base URL
let cachedApiBaseUrl = null;

// Funksion për të marrë API base URL (me cache)
export const getApiBaseUrl = async () => {
  if (cachedApiBaseUrl) {
    return cachedApiBaseUrl;
  }
  
  cachedApiBaseUrl = await detectServerIP();
  return cachedApiBaseUrl;
};

// Funksion për të marrë API endpoints (async)
export const getApiEndpoints = async () => {
  const baseUrl = await getApiBaseUrl();
  const endpoints = {
    AUTH: {
      LOGIN: `${baseUrl}/api/auth/login`,
      REGISTER: `${baseUrl}/api/auth/register`,
    },
    USER: {
      DASHBOARD: `${baseUrl}/api/user/dashboard`,
      ROUTES: `${baseUrl}/api/user/routes`,
      BOOKINGS: `${baseUrl}/api/user/bookings`,
      CREATE_BOOKING: `${baseUrl}/api/user/bookings`,
      CANCEL_BOOKING: `${baseUrl}/api/user/bookings`, // Will append /:bookingId/cancel
    },
    MANAGER: {
      DASHBOARD: `${baseUrl}/api/manager/dashboard`,
      VANS: `${baseUrl}/api/manager/vans`,
      CREATE_VAN: `${baseUrl}/api/manager/vans`,
      ROUTES: `${baseUrl}/api/manager/routes`,
      CREATE_ROUTE: `${baseUrl}/api/manager/routes`,
      BOOKINGS: `${baseUrl}/api/manager/bookings`,
      SCHEDULES: `${baseUrl}/api/manager/schedules`,
      CREATE_SCHEDULE: `${baseUrl}/api/manager/schedules`,
      UPDATE_SCHEDULE: (scheduleId) => `${baseUrl}/api/manager/schedules/${scheduleId}`,
      TOGGLE_SCHEDULE: (scheduleId) => `${baseUrl}/api/manager/schedules/${scheduleId}/toggle`,
      CREATE_ROUTE_FROM_SCHEDULE: (scheduleId) => `${baseUrl}/api/manager/schedules/${scheduleId}/create-route`,
    },
  };
  
  if (__DEV__) {
    console.log("🔗 API Endpoints:", endpoints);
  }
  
  return endpoints;
};

// Default API base URL (për backward compatibility)
const defaultApiBaseUrl = `http://localhost:${PORT}`;

// Detekto IP-në automatikisht në startup
detectServerIP().then((url) => {
  cachedApiBaseUrl = url;
  if (__DEV__) {
    console.log("🔗 API Base URL (detected):", url);
    console.log("📱 Platform:", Platform.OS);
  }
}).catch((error) => {
  console.error("❌ Error detecting server IP:", error);
  console.error("   Using default:", defaultApiBaseUrl);
  cachedApiBaseUrl = defaultApiBaseUrl;
});

// Export default (përdor default nëse nuk është detektuar akoma)
export default defaultApiBaseUrl;

