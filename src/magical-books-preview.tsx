import React from "react";
import { createRoot } from "react-dom/client";
import MagicalBookHome from "./features/learning/MagicalBookHome";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode><MagicalBookHome /></React.StrictMode>,
);
