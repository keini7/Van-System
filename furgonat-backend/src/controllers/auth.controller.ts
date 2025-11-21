import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { User } from "../models/User";
import { signToken } from "../utils/jwt";

export const register = async (req: Request, res: Response) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      gender,
      birthdate,
      password,
      role,
      plate_number,
    } = req.body;

    // Validation
    if (!firstName || !lastName || !email || !password || !role) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    // Password validation
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    // Phone validation
    if (phone) {
      const phoneRegex = /^\+?[0-9]+$/;
      if (!phoneRegex.test(phone)) {
        return res.status(400).json({ error: "Invalid phone number format" });
      }
    }

    if (role === "manager") {
      const plateRegex = /^[A-Z]{2}[0-9]{3}[A-Z]{2}$/;
      if (!plate_number || !plateRegex.test(plate_number)) {
        return res
          .status(400)
          .json({ error: "Plate number must be in format AA123BB" });
      }
    }

    // Check if email already exists
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      firstName,
      lastName,
      email,
      phone: phone || undefined,
      gender: gender || undefined,
      birthdate: birthdate || undefined,
      password: hashedPassword,
      role,
      plate_number: role === "manager" ? plate_number.toUpperCase() : undefined,
    });

    await user.save();

    return res
      .status(201)
      .json({ 
        id: user._id.toString(), 
        email: user.email,
        role: user.role,
        message: "User registered successfully" 
      });
  } catch (error: any) {
    console.error("Registration error:", error);
    
    // Check if it's a database connection error
    if (error.name === "MongoNetworkError" || error.message.includes("ECONNREFUSED")) {
      return res.status(503).json({ 
        error: "Database connection failed. Please check if MongoDB is running." 
      });
    }
    
    // MongoDB duplicate key error
    if (error.code === 11000 || error.name === "MongoServerError") {
      return res.status(400).json({ error: "Email already registered" });
    }
    
    return res.status(500).json({ 
      error: "Registration failed",
      details: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate token using utility
    const token = signToken(
      { id: user._id.toString(), role: user.role },
      "24h"  // Token valid për 24 orë
    );

    return res.json({
      token,
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    });
  } catch (error: any) {
    console.error("Login error:", error);
    
    // Check if it's a database connection error
    if (error.name === "MongoNetworkError" || error.message.includes("ECONNREFUSED")) {
      return res.status(503).json({ 
        error: "Database connection failed. Please check if MongoDB is running." 
      });
    }
    
    return res.status(500).json({ 
      error: "Login failed",
      details: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};
