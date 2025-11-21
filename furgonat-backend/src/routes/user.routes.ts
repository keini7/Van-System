import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";
import { requireDatabase } from "../middleware/dbCheck.middleware";
import {
  getUserDashboard,
  getAvailableRoutes,
  getUserBookings,
  createBooking,
  cancelBooking,
} from "../controllers/user.controller";

const router = Router();

// All routes require authentication and client role
router.use(requireDatabase, authMiddleware, requireRole(["client"]));

// Dashboard
router.get("/dashboard", getUserDashboard);

// Routes (destinacione)
router.get("/routes", getAvailableRoutes);

// Bookings
router.get("/bookings", getUserBookings);
router.post("/bookings", createBooking);
router.put("/bookings/:bookingId/cancel", cancelBooking);

export default router;
