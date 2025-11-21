import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

// MongoDB connection string
const getMongoUri = (): string => {
  const mongoUri = process.env.MONGODB_URI;
  if (mongoUri) {
    return mongoUri;
  }

  // Build connection string from individual components
  const host = process.env.DB_HOST || "localhost";
  const port = process.env.DB_PORT || "27017";
  const database = process.env.DB_NAME || "furgonat";
  const user = process.env.DB_USER;
  const password = process.env.DB_PASS;

  if (user && password) {
    return `mongodb://${user}:${password}@${host}:${port}/${database}?authSource=admin`;
  }

  return `mongodb://${host}:${port}/${database}`;
};

/**
 * Initialize MongoDB connection
 * @returns true if connected successfully, false otherwise
 */
export async function initializeDatabase(): Promise<boolean> {
  try {
    const mongoUri = getMongoUri();
    
    await mongoose.connect(mongoUri);
    
    console.log("✅ MongoDB connected successfully");
    return true;
  } catch (err: any) {
    console.error("\n❌ MongoDB connection failed!");
    console.error(`   Error: ${err.message}\n`);
    
    // Provide specific solutions
    if (err.message.includes("ECONNREFUSED") || err.message.includes("connect")) {
      printConnectionRefusedSolution();
    } else if (err.message.includes("authentication failed")) {
      printAuthFailedSolution();
    } else {
      printGenericSolution();
    }
    
    return false;
  }
}

function printConnectionRefusedSolution() {
  console.log("💡 SOLUTION - Connection refused:");
  console.log("");
  console.log("   MongoDB nuk po funksionon. Starto:");
  console.log("      sudo systemctl start mongod");
  console.log("      sudo systemctl status mongod");
  console.log("");
  console.log("   Ose nëse nuk është instaluar:");
  console.log("      sudo apt-get install mongodb");
  console.log("");
}

function printAuthFailedSolution() {
  console.log("💡 SOLUTION - Authentication failed:");
  console.log("");
  console.log("   Kontrollo .env file ka credentials të sakta:");
  console.log("      MONGODB_URI=mongodb://user:password@localhost:27017/furgonat");
  console.log("");
  console.log("   Ose përdor connection string pa authentication:");
  console.log("      MONGODB_URI=mongodb://localhost:27017/furgonat");
  console.log("");
}

function printGenericSolution() {
  console.log("💡 SOLUTION:");
  console.log("");
  console.log("   1. Kontrollo që MongoDB po funksionon:");
  console.log("      sudo systemctl status mongod");
  console.log("");
  console.log("   2. Verifiko .env file ka MONGODB_URI ose DB_HOST, DB_NAME");
  console.log("   3. MongoDB krijo database automatikisht kur të lidhesh");
  console.log("");
}

// Handle connection events
mongoose.connection.on("error", (err) => {
  console.error("❌ MongoDB connection error:", err.message);
});

mongoose.connection.on("disconnected", () => {
  console.warn("⚠️  MongoDB disconnected");
});
