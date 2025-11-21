import { Request, Response, NextFunction } from "express";

let dbConnected = false;


export function setDbConnected(status: boolean) {
  dbConnected = status;
}


export function getDbStatus(): boolean {
  return dbConnected;
}


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

