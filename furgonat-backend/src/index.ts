import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import managerRoutes from "./routes/manager.routes";
import { errorHandler } from "./middleware/errorHandler";
import os from "os";
import { setupSwagger } from "./config/swagger";  // 👈 import swagger

dotenv.config();

const app = express();
app.use(express.json());

// Swagger docs
setupSwagger(app);

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/manager", managerRoutes);

app.use(errorHandler);

const PORT = Number(process.env.PORT) || 5000;
const HOST = "0.0.0.0";

app.listen(PORT, HOST, () => {
  const network = Object.values(os.networkInterfaces())
    .flat()
    .find((net) => net?.family === "IPv4" && !net.internal);

  console.log("🚀 Server running:");
  console.log(`   Local:   http://localhost:${PORT}`);
  if (network) {
    console.log(`   Network: http://${network.address}:${PORT}`);
  }
  console.log(`📚 API Docs: http://localhost:${PORT}/docs`);
});
