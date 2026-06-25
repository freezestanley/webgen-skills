import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import Providers from "./app/providers.jsx";
import App from "./app/App.jsx";
import "./styles/main.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Providers>
        <App />
      </Providers>
    </BrowserRouter>
  </React.StrictMode>
);
