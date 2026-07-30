import React from "react";
import ReactDOM from "react-dom/client";
import App from "@/App.jsx";
import "@/index.css";

import { ThemeProvider } from "@/lib/ThemeProvider";

ReactDOM.createRoot(document.getElementById("root")).render(
  <ThemeProvider defaultTheme="system" storageKey="app-ui-theme">
    <App />
  </ThemeProvider>
);
