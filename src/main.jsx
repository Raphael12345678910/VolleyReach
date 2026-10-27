import React from "react";
import { MotionConfig } from "framer-motion";
import { createRoot } from "react-dom/client";
import RecruitApp from "./RecruitApp";
import "./recruit.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <MotionConfig reducedMotion="user"><RecruitApp /></MotionConfig>
  </React.StrictMode>
);
