import React from "react";
import ReactDOM from "react-dom/client";
import { Toaster } from "react-hot-toast";
import { App } from "./App";
import { ErrorBoundary } from "./components/ui/ErrorBoundary";
import { AuthProvider } from "./contexts/AuthContext";
import "./index.css";
import "./styles/tokens.css";
import "./styles/shell.css";
import "./styles/features.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </AuthProvider>
    {/* Global toast notification system — use toast() from 'react-hot-toast' anywhere */}
    <Toaster
      position="bottom-right"
      toastOptions={{
        duration: 3500,
        style: {
          background: "#1c1530",
          color: "#FFF2D8",
          border: "1px solid rgba(146, 116, 216, 0.4)",
          borderRadius: "12px",
          fontSize: "0.875rem",
          fontFamily: "'Nunito Sans', sans-serif",
          backdropFilter: "blur(12px)",
        },
        success: {
          iconTheme: { primary: "#68edd1", secondary: "#1c1530" },
        },
        error: {
          iconTheme: { primary: "#FF5964", secondary: "#1c1530" },
        },
      }}
    />
  </React.StrictMode>,
);
