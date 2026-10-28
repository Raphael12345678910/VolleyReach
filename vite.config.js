import { readFileSync } from "node:fs";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { normalizeConfig } from "./src/config.js";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  const runtime = JSON.parse(readFileSync(new URL("./public/site-config.json", import.meta.url), "utf8"));
  const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_PUBLISHABLE_KEY || runtime?.supabasePublishableKey;
  if (key && !normalizeConfig({ supabasePublishableKey: key }).supabasePublishableKey) {
    throw new Error("Use only a Supabase publishable or legacy anon key. Private/admin credentials must never be built into the website.");
  }
  return {
    base: "/VolleyReach/",
    plugins: [react()],
    server: {
      port: 3000,
      strictPort: false
    }
  };
});
