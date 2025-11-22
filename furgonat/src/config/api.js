import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "@api_base_url";
const PORT = 5001;

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

export const detectServerIP = async () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    if (__DEV__) {
      console.log("🔗 Using EXPO_PUBLIC_API_URL:", process.env.EXPO_PUBLIC_API_URL);
    }
    return process.env.EXPO_PUBLIC_API_URL;
  }

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
    if (__DEV__) {
      console.warn("⚠️ Error reading stored URL:", e.message);
    }
  }

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
      return `http://10.0.2.2:${PORT}`;
    }
  }

  if (Platform.OS === "ios") {
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
        
        if (data.ip && data.ip !== "localhost" && data.ip !== "127.0.0.1") {
          const url = `http://${data.ip}:${data.port || PORT}`;
          await AsyncStorage.setItem(STORAGE_KEY, url);
          if (__DEV__) {
            console.log("📱 iOS: Using network IP:", url);
          }
          return url;
        } else {
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
      
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
        const response = await fetch(`http://192.168.1.98:${PORT}/api/config/ip`, {
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
      
      if (__DEV__) {
        console.log("📱 iOS: Using localhost as fallback");
      }
      return `http://localhost:${PORT}`;
    }
  }

  if (Platform.OS === "web") {
    return `http://localhost:${PORT}`;
  }

  try {
    const localhostTest = await testUrl(`http://localhost:${PORT}`);
    if (localhostTest.success && localhostTest.data) {
      const serverIP = localhostTest.data.ip;
      const serverPort = localhostTest.data.port || PORT;
      
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
  
  const localhostUrl = `http://localhost:${PORT}`;
  if (__DEV__) {
    console.log("📱 Using localhost:", localhostUrl);
  }
  return localhostUrl;
};

let cachedApiBaseUrl = null;

export const getApiBaseUrl = async () => {
  if (cachedApiBaseUrl) {
    return cachedApiBaseUrl;
  }
  
  cachedApiBaseUrl = await detectServerIP();
  return cachedApiBaseUrl;
};

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

const defaultApiBaseUrl = `http://localhost:${PORT}`;

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

export default defaultApiBaseUrl;

