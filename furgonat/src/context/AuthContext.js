import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getApiEndpoints } from "../config/api";

export const AuthContext = createContext();

const TOKEN_KEY = "@auth_token";
const USER_KEY = "@auth_user";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from storage on mount
  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      const userData = await AsyncStorage.getItem(USER_KEY);
      
      if (token && userData) {
        const parsedUserData = JSON.parse(userData);
        // Siguro që token-i është në userData dhe është i pastër (pa whitespace)
        const cleanToken = token.trim();
        parsedUserData.token = cleanToken;
        
        if (__DEV__) {
          console.log("✅ Loaded stored auth");
          console.log("   Token length:", cleanToken.length);
          console.log("   Token preview:", cleanToken.substring(0, 20) + "...");
          console.log("   User role:", parsedUserData.role);
        }
        
        setUser(parsedUserData);
      } else {
        if (__DEV__) {
          console.log("⚠️ No stored auth found");
        }
      }
    } catch (error) {
      console.error("Error loading stored auth:", error);
    } finally {
      setLoading(false);
    }
  };

  const login = async ({ email, password }) => {
    try {
      const endpoints = await getApiEndpoints();
      const loginUrl = endpoints.AUTH.LOGIN;
      
      console.log("🔐 Logging in to:", loginUrl);
      
      const res = await fetch(loginUrl, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ email, password }),
      });

      console.log("📥 Login response status:", res.status);

      let data;
      const contentType = res.headers.get("content-type");
      
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
        console.log("📥 Login response data:", { ...data, token: data.token ? "***" : null });
      } else {
        const text = await res.text();
        console.error("Non-JSON login response:", text);
        return { 
          success: false, 
          error: `Server returned non-JSON: ${res.status} ${res.statusText}` 
        };
      }

      if (res.ok) {
        if (!data.token) {
          console.error("❌ No token in login response");
          return { success: false, error: "No token received from server" };
        }

        // Pastro token-in (hiq whitespace)
        const cleanToken = data.token.trim();
        
        const userData = {
          id: data.id,
          email: data.email,
          role: data.role,
          token: cleanToken,
        };
        
        // Save to state
        setUser(userData);
        
        // Save to storage - siguro që token-i është i pastër
        await AsyncStorage.setItem(TOKEN_KEY, cleanToken);
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
        
        if (__DEV__) {
          console.log("✅ Login successful, token saved");
          console.log("   Token length:", cleanToken.length);
          console.log("   Token preview:", cleanToken.substring(0, 30) + "...");
          console.log("   User role:", data.role);
        }
        
        return { success: true };
      } else {
        return { success: false, error: data.error || data.message || "Login failed" };
      }
    } catch (err) {
      console.error("Login error:", err);
      console.error("Error details:", err.message);
      
      if (err.message === "Network request failed" || err.message.includes("Failed to fetch")) {
        const endpoints = await getApiEndpoints();
        return { 
          success: false, 
          error: `Cannot connect to server. Make sure backend is running at ${endpoints.AUTH.LOGIN}` 
        };
      }
      
      return { 
        success: false, 
        error: `Network error: ${err.message || "Please check your connection"}` 
      };
    }
  };

  const register = async (userData) => {
    try {
      const endpoints = await getApiEndpoints();
      const registerUrl = endpoints.AUTH.REGISTER;
      
      console.log("📤 Registering to:", registerUrl);
      console.log("📤 Request body:", { ...userData, password: "***" });
      
      const res = await fetch(registerUrl, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(userData),
      });

      console.log("📥 Response status:", res.status);
      console.log("📥 Response headers:", Object.fromEntries(res.headers.entries()));

      // Check if response is JSON
      let data;
      const contentType = res.headers.get("content-type");
      
      if (contentType && contentType.includes("application/json")) {
        try {
          data = await res.json();
          console.log("📥 Response data:", data);
        } catch (jsonError) {
          console.error("Failed to parse JSON response:", jsonError);
          const text = await res.text();
          console.error("Response text:", text);
          return { 
            success: false, 
            error: `Server error: ${res.status} ${res.statusText}` 
          };
        }
      } else {
        const text = await res.text();
        console.error("Non-JSON response:", text);
        return { 
          success: false, 
          error: `Server returned non-JSON: ${res.status} ${res.statusText}` 
        };
      }

      if (res.ok) {
        return { success: true, message: data.message || "Registration successful" };
      } else {
        return { success: false, error: data.error || data.message || "Registration failed" };
      }
    } catch (err) {
      console.error("Register error:", err);
      console.error("Error details:", err.message);
      console.error("Error stack:", err.stack);
      
      // More specific error messages
      if (err.message === "Network request failed" || err.message.includes("Failed to fetch")) {
        const endpoints = await getApiEndpoints();
        return { 
          success: false, 
          error: `Cannot connect to server. Make sure backend is running at ${endpoints.AUTH.REGISTER}` 
        };
      }
      
      return { 
        success: false, 
        error: `Network error: ${err.message || "Please check your connection"}` 
      };
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem(TOKEN_KEY);
      await AsyncStorage.removeItem(USER_KEY);
      setUser(null);
      if (__DEV__) {
        console.log("✅ Logged out, storage cleared");
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Funksion për të verifikuar nëse token-i është i vlefshëm
  const isTokenValid = () => {
    if (!user?.token) return false;
    
    try {
      // JWT tokens kanë 3 pjesë të ndara me .
      const parts = user.token.split(".");
      if (parts.length !== 3) {
        console.error("❌ Invalid token format");
        return false;
      }
      
      // Dekodo payload për të kontrolluar expiry
      const payload = JSON.parse(atob(parts[1]));
      const now = Math.floor(Date.now() / 1000);
      
      if (payload.exp && payload.exp < now) {
        console.error("❌ Token expired");
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("❌ Error validating token:", error);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, isTokenValid }}>
      {children}
    </AuthContext.Provider>
  );
}
