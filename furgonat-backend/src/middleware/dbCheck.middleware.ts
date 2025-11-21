// Middleware për të kontrolluar nëse database është connected
import { Request, Response, NextFunction } from "express";

let dbConnected = false;

/**
 * Update database connection status
 * Called from index.ts after database initialization
 */
export function setDbConnected(status: boolean) {
  dbConnected = status;
}

/**
 * Get current database connection status
 */
export function getDbStatus(): boolean {
  return dbConnected;
}

/**
 * Middleware për të kontrolluar database connection
 * Kthen error nëse database nuk është connected
 */
export const requireDatabase = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!dbConnected) {
    return res.status(503).json({
      error: "Database not connected",
      message: "Database connection is required for this endpoint",
      solution: [
        "1. Check .env file has correct database credentials",
        "2. Make sure PostgreSQL is running: sudo systemctl status postgresql",
        "3. Create database and user if needed (see README.md)",
        "4. Restart server: npm run dev"
      ],
    });
  }
  next();
};

