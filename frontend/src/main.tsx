import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { LanguageProvider } from "./i18n/LanguageContext";
import { CartProvider } from "./context/CartContext";
import { getTelegramWebApp } from "./telegram";
import "./styles/index.css";

const webApp = getTelegramWebApp();
webApp?.ready();
webApp?.expand();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <LanguageProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </LanguageProvider>
    </BrowserRouter>
  </React.StrictMode>
);
