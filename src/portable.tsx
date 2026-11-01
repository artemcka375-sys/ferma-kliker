import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { FarmApp } from "@/components/farm/farm-app";
import "./styles.css";

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(
    <StrictMode>
      <FarmApp />
    </StrictMode>,
  );
}
