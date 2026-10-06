import app from "./app.js";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 5000;
const prefix = process.env.API_PREFIX || "/api/v1";

app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`💎 Swariya Jewellery Backend API (Cloudflare Ready)`);
  console.log(`🍃 Database: MongoDB`);
  console.log(`💳 Payment Gateway: Cashfree`);
  console.log(`🚀 Server running on: http://localhost:${PORT}${prefix}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  console.log(`==================================================`);
});
