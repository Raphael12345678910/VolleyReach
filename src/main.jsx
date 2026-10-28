import React from "react";
import { MotionConfig } from "framer-motion";
import { createRoot } from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./auth";
import { loadConfig } from "./config";
import { initializeAnalytics } from "./analytics";
import "./recruit.css";

loadConfig().then((config) => {
  initializeAnalytics(config);
  createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <MotionConfig reducedMotion="user"><AuthProvider config={config}><App config={config} /></AuthProvider></MotionConfig>
  </React.StrictMode>
  );
});
