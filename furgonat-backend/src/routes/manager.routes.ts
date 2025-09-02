import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";
import { getManagerDashboard } from "../controllers/manager.controller";

const router = Router();

router.get("/dashboard", authMiddleware, requireRole(["manager"]), getManagerDashboard);

export default router;
