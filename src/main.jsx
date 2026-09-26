import React from "react";
import { createRoot } from "react-dom/client";
import RecruitApp from "./RecruitApp";
import "./recruit.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RecruitApp />
  </React.StrictMode>
);
