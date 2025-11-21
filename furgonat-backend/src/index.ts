import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import managerRoutes from "./routes/manager.routes";
import { errorHandler } from "./middleware/errorHandler";
import os from "os";
import { setupSwagger } from "./config/swagger";
import { getNetworkIP } from "./utils/getNetworkIP";
import { initializeDatabase } from "./config/db";
import { setupDatabase } from "./config/setupDatabase";
import { setDbConnected, getDbStatus } from "./middleware/dbCheck.middleware";

dotenv.config();

const app = express();

// CORS configuration
app.use(cors({
  origin: true,
  credentials: true,
}));

// Increase body size limit for image uploads (base64 images can be large)
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Swagger docs
setupSwagger(app);

// Root endpoint - API information
app.get("/", (req, res) => {
  res.json({
    name: "Furgonat API",
    version: "1.0.0",
    status: "running",
    database: getDbStatus() ? "connected" : "disconnected",
    endpoints: {
      health: "GET /health",
      config: "GET /api/config/ip",
      docs: "GET /docs",
      auth: {
        register: "POST /api/auth/register",
        login: "POST /api/auth/login"
      },
      user: {
        dashboard: "GET /api/user/dashboard (requires auth)"
      },
      manager: {
        dashboard: "GET /api/manager/dashboard (requires auth)"
      }
    }
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ 
    status: "ok", 
    database: getDbStatus() ? "connected" : "disconnected",
    timestamp: new Date().toISOString() 
  });
});

// Endpoint për të marrë IP-në e kompjuterit (për frontend)
app.get("/api/config/ip", (req, res) => {
  const ip = getNetworkIP();
  res.json({ ip, port: Number(process.env.PORT) || 5000 });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/manager", managerRoutes);

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({ 
    error: "Not Found",
    message: `Route ${req.method} ${req.path} not found`,
    availableEndpoints: {
      health: "GET /health",
      config: "GET /api/config/ip",
      auth: {
        register: "POST /api/auth/register",
        login: "POST /api/auth/login"
      },
      user: {
        dashboard: "GET /api/user/dashboard (requires auth)"
      },
      manager: {
        dashboard: "GET /api/manager/dashboard (requires auth)"
      },
      docs: "GET /docs"
    }
  });
});

// Error handler (must be last)
app.use(errorHandler);

const PORT = Number(process.env.PORT) || 5000;
const HOST = "0.0.0.0";

/**
 * Initialize database and start server
 */
async function startServer() {
  console.log("🔧 Initializing server...\n");

  // Initialize database connection
  const dbConnected = await initializeDatabase();
  setDbConnected(dbConnected);
  
  if (dbConnected) {
    // Setup database tables automatically
    try {
      await setupDatabase();
      console.log("");
    } catch (error: any) {
      console.error("⚠️  Database setup failed:", error.message);
      console.error("   Server will start, but database features may not work\n");
      setDbConnected(false);
    }
  } else {
    console.log("⚠️  Server will start without database connection\n");
    console.log("   Fix .env configuration and restart to enable database features\n");
  }

  // Start server
  app.listen(PORT, HOST, () => {
    const network = Object.values(os.networkInterfaces())
      .flat()
      .find((net) => net?.family === "IPv4" && !net.internal);

    console.log("🚀 Server started successfully!");
    console.log("");
    console.log("📍 Endpoints:");
    console.log(`   Local:   http://localhost:${PORT}`);
    if (network) {
      console.log(`   Network: http://${network.address}:${PORT}`);
    }
    console.log(`   API Docs: http://localhost:${PORT}/docs`);
    console.log(`   Health:   http://localhost:${PORT}/health`);
    console.log("");
    
    if (!dbConnected) {
      console.log("⚠️  WARNING: Database not connected");
      console.log("   API endpoints that require database will not work");
      console.log("   Fix .env and restart server to enable full functionality");
      console.log("");
    }
  });
}

// Start server
startServer().catch((error) => {
  console.error("\n❌ Failed to start server:", error);
  process.exit(1);
});
