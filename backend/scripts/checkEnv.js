import dotenv from "dotenv";

dotenv.config();

console.log("🔍 Environment Variables:");
console.log("MONGODB_URI:", process.env.MONGODB_URI);
console.log("MONGODB_DB:", process.env.MONGODB_DB);
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("PORT:", process.env.PORT);
console.log("CLIENT_ORIGIN:", process.env.CLIENT_ORIGIN);

// Check if we're in the right directory
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log("\n🔍 File paths:");
console.log("Current script:", __filename);
console.log("Script directory:", __dirname);
console.log("Working directory:", process.cwd());
console.log("Parent directory:", path.dirname(__dirname));

// Test the exact connection logic that the backend server uses
console.log("\n🔍 Testing backend server connection logic:");
const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:5000";
const dbName = process.env.MONGODB_DB || "robobooks";

console.log("MongoDB URI:", mongoUri);
console.log("Database Name:", dbName);
console.log("Full connection string:", `${mongoUri}/${dbName}`);
