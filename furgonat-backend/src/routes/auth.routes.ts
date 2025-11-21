import { Router } from "express";
import { login, register } from "../controllers/auth.controller";
import { requireDatabase } from "../middleware/dbCheck.middleware";

const router = Router();

// Auth routes require database
router.post("/register", requireDatabase, register);
router.post("/login", requireDatabase, login);

export default router;
