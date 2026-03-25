import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { TooltipProvider } from "./components/ui/tooltip.jsx";
import AppProvider from "./context/AppProvider.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <TooltipProvider>
      <AppProvider>
        <App />
      </AppProvider>
    </TooltipProvider>
  </StrictMode>,
);
