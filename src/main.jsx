import React from "react";
import ReactDOM from "react-dom/client";
import { Analytics } from "@vercel/analytics/react";
import App from "@/App.jsx";
import "@/index.css";

import { ThemeProvider } from "@/lib/ThemeProvider";

ReactDOM.createRoot(document.getElementById("root")).render(
  <ThemeProvider defaultTheme="system" storageKey="app-ui-theme">
    <App />
    <Analytics />
  </ThemeProvider>
);

