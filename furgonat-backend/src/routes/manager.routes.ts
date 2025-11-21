import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";
import { requireDatabase } from "../middleware/dbCheck.middleware";
import {
  getManagerDashboard,
  getManagerVans,
  createVan,
  getManagerRoutes,
  createRoute,
  getManagerBookings,
  getManagerSchedules,
  createSchedule,
  updateSchedule,
  toggleSchedule,
  createRouteFromSchedule,
} from "../controllers/manager.controller";

const router = Router();

// All routes require authentication and manager role
router.use(requireDatabase, authMiddleware, requireRole(["manager"]));

// Dashboard
router.get("/dashboard", getManagerDashboard);

// Vans
router.get("/vans", getManagerVans);
router.post("/vans", createVan);

// Routes
router.get("/routes", getManagerRoutes);
router.post("/routes", createRoute);

// Bookings
router.get("/bookings", getManagerBookings);

// Schedules
router.get("/schedules", getManagerSchedules);
router.post("/schedules", createSchedule);
router.put("/schedules/:scheduleId", updateSchedule);
router.put("/schedules/:scheduleId/toggle", toggleSchedule);
router.post("/schedules/:scheduleId/create-route", createRouteFromSchedule);

export default router;
