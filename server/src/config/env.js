import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

let loaded = false;

export const getEnvPath = () => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const serverRoot = path.resolve(__dirname, "../..");
  const envFile =
    process.env.NODE_ENV === "production" ? ".env.production" : ".env.development";
  return path.join(serverRoot, envFile);
};

export const loadEnv = () => {
  if (loaded) return;

  const envPath = process.env.DOTENV_PATH || getEnvPath();
  const isProd = process.env.NODE_ENV === "production";
  const isTest = process.env.NODE_ENV === "test";

  // In tests (especially CI), we want env vars to be explicit and not depend on a local .env file.
  // Allow opting in via LOAD_DOTENV_TEST=1 for local debugging.
  if (isTest && process.env.LOAD_DOTENV_TEST !== "1") {
    console.log("Environment loaded", {
      node_env: process.env.NODE_ENV || "undefined",
      dotenv: false,
      reason: "test env vars expected",
    });
    loaded = true;
    return;
  }

  // Production platforms (Render/Fly/Railway/etc.) usually inject env vars already.
  // We only load dotenv in production if explicitly requested, or if key DB env vars
  // are missing AND an env file exists (self-hosted production).
  const shouldLoadInProd =
    process.env.LOAD_DOTENV === "1" ||
    (!process.env.SUPABASE_DB_URL && !process.env.MONGODB_URI && fs.existsSync(envPath));

  if (!isProd || shouldLoadInProd) {
    const result = dotenv.config({ path: envPath, override: false });
    const injectedCount = result?.parsed ? Object.keys(result.parsed).length : 0;
    console.log("Environment loaded", {
      node_env: process.env.NODE_ENV || "undefined",
      dotenv: true,
      env_path: envPath,
      injected: injectedCount,
    });
  } else {
    console.log("Environment loaded", {
      node_env: process.env.NODE_ENV || "undefined",
      dotenv: false,
      reason: "production env vars expected",
    });
  }

  loaded = true;
};
