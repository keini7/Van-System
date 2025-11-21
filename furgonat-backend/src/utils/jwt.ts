import jwt, { SignOptions, JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "secret";

if (!process.env.JWT_SECRET) {
  console.warn("⚠️ JWT_SECRET not set in environment, using default 'secret'");
}

export const signToken = (payload: object, expiresIn: string = "1h"): string => {
  const options: SignOptions = { expiresIn: expiresIn as any };
  const token = jwt.sign(payload, JWT_SECRET, options);
  
  if (process.env.NODE_ENV === "development") {
    console.log("🔑 Token signed with secret length:", JWT_SECRET.length);
  }
  
  return token;
};

export const verifyToken = (token: string): string | JwtPayload => {
  return jwt.verify(token, JWT_SECRET);
};
