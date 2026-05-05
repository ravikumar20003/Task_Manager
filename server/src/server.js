const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.resolve(__dirname, "../.env") });
const app = require("./app");
const { connectDB } = require("./config/db");
const { connectRedis } = require("./config/redis");

const port = Number(process.env.PORT) || 8080;

const start = async () => {
  try {
    await connectDB();
    connectRedis().catch((error) => {
      if (process.env.REQUIRE_REDIS === "true") {
        console.error("Redis startup failed", error);
        process.exit(1);
      }
    });

    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error("Server startup failed", error);
    process.exit(1);
  }
};

start();
