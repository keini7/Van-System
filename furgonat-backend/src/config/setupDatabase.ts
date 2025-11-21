/**
 * Database setup - MongoDB krijo collections automatikisht
 * Nuk ka nevojë për setup manual, Mongoose e bën automatikisht
 */
import { User } from "../models/User";

export async function setupDatabase(): Promise<void> {
  try {
    console.log("🔧 Verifying database setup...");

    // MongoDB krijo collections automatikisht kur përdor models
    // Thjesht verifikojmë që modeli është i definuar
    // Indekset janë të definuara në User schema
    
    // Test query për të siguruar që collection ekziston
    await User.findOne().limit(1);
    
    console.log("✅ Database setup verified successfully");
  } catch (error: any) {
    // Nëse collection nuk ekziston, kjo është OK - do të krijohet automatikisht
    if (error.message.includes("collection") || error.message.includes("not found")) {
      console.log("✅ Database ready (collections will be created automatically)");
    } else {
      console.error("❌ Error verifying database:", error.message);
      throw error;
    }
  }
}
