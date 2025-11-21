import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers["authorization"];
  
  if (!authHeader) {
    console.error("❌ No authorization header provided");
    return res.status(401).json({ error: "No authorization header provided" });
  }

  const token = authHeader.startsWith("Bearer ") 
    ? authHeader.substring(7) 
    : authHeader;

  if (!token) {
    console.error("❌ No token found in authorization header");
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const JWT_SECRET = process.env.JWT_SECRET || "secret";
    
    // Log për debugging (vetëm në development)
    if (process.env.NODE_ENV === "development") {
      console.log("🔑 Verifying token...");
      console.log("   Token length:", token.length);
      console.log("   Token starts with:", token.substring(0, 20) + "...");
      console.log("   JWT_SECRET exists:", !!JWT_SECRET);
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    
    if (process.env.NODE_ENV === "development") {
      console.log("✅ Token verified successfully");
      console.log("   User ID:", (decoded as any).id);
      console.log("   Role:", (decoded as any).role);
    }
    
    (req as any).user = decoded;
    next();
  } catch (err: any) {
    console.error("❌ Token verification error:", err.name, err.message);
    
    if (err.name === "TokenExpiredError") {
      return res.status(403).json({ 
        error: "Token expired. Please login again.", 
        code: "TOKEN_EXPIRED" 
      });
    }
    
    if (err.name === "JsonWebTokenError") {
      console.error("   Token might be malformed or signed with different secret");
      return res.status(403).json({ 
        error: "Invalid token. Please login again.", 
        code: "INVALID_TOKEN",
        details: process.env.NODE_ENV === "development" ? err.message : undefined
      });
    }
    
    return res.status(403).json({ 
      error: "Token verification failed", 
      code: "TOKEN_ERROR",
      details: process.env.NODE_ENV === "development" ? err.message : undefined
    });
  }
};
