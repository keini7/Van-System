import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../config/db";

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

    if (!firstName || !lastName || !email || !password || !role) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const phoneRegex = /^\+?[0-9]+$/;
    if (phone && !phoneRegex.test(phone)) {
      return res.status(400).json({ error: "Invalid phone number format" });
    }

    if (role === "manager") {
      const plateRegex = /^[A-Z]{2}[0-9]{3}[A-Z]{2}$/;
      if (!plate_number || !plateRegex.test(plate_number)) {
        return res
          .status(400)
          .json({ error: "Plate number must be in format AA123BB" });
      }
    }

    const exists = await pool.query("SELECT id FROM users WHERE email=$1", [email]);
    if (exists.rows.length > 0) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users
        (first_name, last_name, email, phone, gender, birthdate, password, role, plate_number)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id`,
      [
        firstName,
        lastName,
        email,
        phone,
        gender,
        birthdate,
        hashedPassword,
        role,
        role === "manager" ? plate_number.toUpperCase() : null,
      ]
    );

    return res
      .status(201)
      .json({ id: result.rows[0].id, message: "User registered successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Registration failed" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const result = await pool.query("SELECT * FROM users WHERE email=$1", [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "1h" }
    );

    return res.json({
      token,
      id: user.id,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Login failed" });
  }
};
