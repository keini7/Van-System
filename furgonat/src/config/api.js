import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "@api_base_url";
const PORT = 3001;

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

// Funksion për të provuar të gjitha IP-të që kthen backend-i
const tryAllIPsFromBackend = async (backendData, port) => {
  const allIPs = backendData.allIPs || [backendData.ip];
  const serverPort = backendData.port || port;
  
  if (__DEV__) {
    console.log("🔍 Trying all IPs from backend:", allIPs);
  }
  
  for (const ip of allIPs) {
    if (ip === "localhost" || ip === "127.0.0.1") {
      continue; // Skip localhost për device fizik
    }
    
    try {
      const testResult = await testUrl(`http://${ip}:${serverPort}`, 1500);
      if (testResult.success) {
        const networkUrl = `http://${ip}:${serverPort}`;
        if (__DEV__) {
          console.log(`✅ IP ${ip} works! Using:`, networkUrl);
        }
        return networkUrl;
      }
    } catch (e) {
      continue;
    }
  }
  
  return null;
};

export const detectServerIP = async () => {
  if (__DEV__) {
    console.log("🔍 Detecting server IP...");
    console.log("📱 Platform:", Platform.OS);
  }

  if (process.env.EXPO_PUBLIC_API_URL) {
    if (__DEV__) {
      console.log("🔗 Using EXPO_PUBLIC_API_URL:", process.env.EXPO_PUBLIC_API_URL);
    }
    return process.env.EXPO_PUBLIC_API_URL;
  }

  try {
    const storedUrl = await AsyncStorage.getItem(STORAGE_KEY);
    if (storedUrl) {
      if (__DEV__) {
        console.log("📦 Found stored URL:", storedUrl);
      }
      
      // Nëse URL-ja e ruajtur përmban "localhost", fshijmë atë sepse nuk funksionon në React Native
      if (storedUrl.includes("localhost") || storedUrl.includes("127.0.0.1")) {
        if (__DEV__) {
          console.warn("⚠️ Stored URL contains localhost, removing it:", storedUrl);
        }
        await AsyncStorage.removeItem(STORAGE_KEY);
      } else {
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
          // Fshi URL-në e vjetër që nuk funksionon
          await AsyncStorage.removeItem(STORAGE_KEY);
        }
      }
    }
  } catch (e) {
    if (__DEV__) {
      console.warn("⚠️ Error reading stored URL:", e.message);
    }
  }

  if (Platform.OS === "android") {
    // Për Android, provo vetëm me 10.0.2.2 (emulator) dhe merr IP-të dinamikisht nga backend-i
    try {
      if (__DEV__) {
        console.log("🔍 Android: Trying 10.0.2.2 (emulator)...");
      }
      
      const testResult = await testUrl(`http://10.0.2.2:${PORT}`, 2000);
      if (testResult.success && testResult.data) {
        // Provo të gjitha IP-të që kthen backend-i
        const workingUrl = await tryAllIPsFromBackend(testResult.data, PORT);
        if (workingUrl) {
          await AsyncStorage.setItem(STORAGE_KEY, workingUrl);
          if (__DEV__) {
            console.log("✅ Android: Using IP from backend:", workingUrl);
          }
          return workingUrl;
        }
        
        // Nëse asnjë IP nuk funksionon, përdorim IP-në që na dha backend-i
        const serverIP = testResult.data.ip;
        const serverPort = testResult.data.port || PORT;
        
        if (serverIP && serverIP !== "localhost" && serverIP !== "127.0.0.1") {
          const networkUrl = `http://${serverIP}:${serverPort}`;
          await AsyncStorage.setItem(STORAGE_KEY, networkUrl);
          if (__DEV__) {
            console.log("✅ Android: Using network IP from backend:", networkUrl);
          }
          return networkUrl;
        }
        
        // Fallback: përdorim 10.0.2.2 për emulator
        const fallbackUrl = `http://10.0.2.2:${serverPort}`;
        await AsyncStorage.setItem(STORAGE_KEY, fallbackUrl);
        if (__DEV__) {
          console.log("✅ Android: Using emulator IP:", fallbackUrl);
        }
        return fallbackUrl;
      }
    } catch (e) {
      if (__DEV__) {
        console.warn("⚠️ Android: 10.0.2.2 failed (might be physical device):", e.message);
      }
    }
    
    // Nëse 10.0.2.2 dështon, kjo është device fizik
    // Në këtë rast, duhet të përdorim IP-të që kthen backend-i, por nuk kemi mënyrë t'i marrim pa hardcoduar
    // Kështu që do të kthejmë null dhe do të përdoret fallback i përgjithshëm
    if (__DEV__) {
      console.warn("⚠️ Android: Could not detect server IP. Make sure device and computer are on the same network.");
    }
    return null;
  }

  if (Platform.OS === "ios") {
    // Për iOS, provo vetëm me localhost (simulator) dhe merr IP-të dinamikisht nga backend-i
    try {
      if (__DEV__) {
        console.log("🔍 iOS: Trying localhost (simulator)...");
      }
      
      const testResult = await testUrl(`http://localhost:${PORT}`, 2000);
      if (testResult.success && testResult.data) {
        // Provo të gjitha IP-të që kthen backend-i
        const workingUrl = await tryAllIPsFromBackend(testResult.data, PORT);
        if (workingUrl) {
          await AsyncStorage.setItem(STORAGE_KEY, workingUrl);
          if (__DEV__) {
            console.log("✅ iOS: Using IP from backend:", workingUrl);
          }
          return workingUrl;
        }
        
        const serverIP = testResult.data.ip;
        const serverPort = testResult.data.port || PORT;
        
        // Përdorim IP-në që kthen backend-i (network IP)
        if (serverIP && serverIP !== "localhost" && serverIP !== "127.0.0.1") {
          const networkUrl = `http://${serverIP}:${serverPort}`;
          await AsyncStorage.setItem(STORAGE_KEY, networkUrl);
          if (__DEV__) {
            console.log("✅ iOS: Using network IP from backend:", networkUrl);
          }
          return networkUrl;
        }
        
        // Nëse backend-i kthen localhost dhe ne jemi në simulator, përdorim localhost
        const localhostUrl = `http://localhost:${serverPort}`;
        await AsyncStorage.setItem(STORAGE_KEY, localhostUrl);
        if (__DEV__) {
          console.log("✅ iOS: Using localhost for simulator:", localhostUrl);
        }
        return localhostUrl;
      }
    } catch (e) {
      if (__DEV__) {
        console.warn("⚠️ iOS: localhost failed (might be physical device):", e.message);
      }
    }
    
    // Nëse localhost dështon, kjo është device fizik
    if (__DEV__) {
      console.warn("⚠️ iOS: Could not detect server IP. Make sure device and computer are on the same network.");
    }
    return null;
  }

  if (Platform.OS === "web") {
    return `http://localhost:${PORT}`;
  }


  // Për platforma të tjera (p.sh. Expo Go), provo vetëm me localhost dhe merr IP-të dinamikisht nga backend-i
  try {
    if (__DEV__) {
      console.log("🔍 Trying localhost...");
    }
    
    const testResult = await testUrl(`http://localhost:${PORT}`, 2000);
    if (testResult.success && testResult.data) {
      // Provo të gjitha IP-të që kthen backend-i
      const workingUrl = await tryAllIPsFromBackend(testResult.data, PORT);
      if (workingUrl) {
        await AsyncStorage.setItem(STORAGE_KEY, workingUrl);
        if (__DEV__) {
          console.log("✅ Using IP from backend:", workingUrl);
        }
        return workingUrl;
      }
      
      const serverIP = testResult.data.ip;
      const serverPort = testResult.data.port || PORT;
      
      // Përdorim IP-në që kthen backend-i (network IP)
      if (serverIP && serverIP !== "localhost" && serverIP !== "127.0.0.1") {
        const networkUrl = `http://${serverIP}:${serverPort}`;
        await AsyncStorage.setItem(STORAGE_KEY, networkUrl);
        if (__DEV__) {
          console.log("✅ Detected network IP from backend:", networkUrl);
        }
        return networkUrl;
      }
      
      // Nëse backend-i kthen localhost dhe ne jemi në simulator/web, përdorim localhost
      if (Platform.OS === "web" || Platform.OS === "ios") {
        const localhostUrl = `http://localhost:${serverPort}`;
        await AsyncStorage.setItem(STORAGE_KEY, localhostUrl);
        if (__DEV__) {
          console.log("✅ Using localhost:", localhostUrl);
        }
        return localhostUrl;
      }
    }
  } catch (e) {
    if (__DEV__) {
      console.warn("⚠️ localhost failed:", e.message);
    }
  }
  
  // Nëse asgjë nuk funksionon, kthejmë null
  if (__DEV__) {
    console.error("❌ Could not detect server IP. Make sure backend is running and device is on the same network.");
    console.error("   Platform:", Platform.OS);
  }
  
  return null;
};

let cachedApiBaseUrl = null;

export const getApiBaseUrl = async () => {
  if (cachedApiBaseUrl) {
    return cachedApiBaseUrl;
  }
  
  // Provo të detektojmë IP-në
  const detectedUrl = await detectServerIP();
  if (detectedUrl) {
    cachedApiBaseUrl = detectedUrl;
    return detectedUrl;
  }
  
  // Nëse detektimi dështon, kthejmë null dhe do të përdoret defaultApiBaseUrl
  // Por kjo nuk do të funksionojë në device fizik
  if (__DEV__) {
    console.error("❌ Could not detect server IP. Please set EXPO_PUBLIC_API_URL environment variable.");
  }
  
  return defaultApiBaseUrl;
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

// Default URL - do të zëvendësohet me IP-në e detektuar
// Nuk përdorim IP të hardcoduar, do të detektohet dinamikisht
const defaultApiBaseUrl = `http://localhost:${PORT}`;

detectServerIP().then((url) => {
  if (url) {
    cachedApiBaseUrl = url;
    if (__DEV__) {
      console.log("🔗 API Base URL (detected):", url);
      console.log("📱 Platform:", Platform.OS);
    }
  } else {
    if (__DEV__) {
      console.error("❌ Could not detect server IP. Will retry on next API call.");
    }
    cachedApiBaseUrl = null; // Do të detektohet përsëri në getApiBaseUrl
  }
}).catch((error) => {
  console.error("❌ Error detecting server IP:", error);
  cachedApiBaseUrl = null; // Do të detektohet përsëri në getApiBaseUrl
});

export default defaultApiBaseUrl;

