import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";
import { getUserDashboard } from "../controllers/user.controller";

const router = Router();

router.get("/dashboard", authMiddleware, requireRole(["client"]), getUserDashboard);

export default router;
