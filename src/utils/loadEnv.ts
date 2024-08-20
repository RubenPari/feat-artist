import { config as dotenv } from "dotenv";

const loadEnv = async () => {
  const envPath = new URL("../../.env", import.meta.url).pathname;

  try {
    await dotenv({ path: envPath });
    console.log("Environment variables loaded successfully");
  } catch (e) {
    console.log("Error loading .env file: " + e);
  }
};

await loadEnv();

export default loadEnv;
