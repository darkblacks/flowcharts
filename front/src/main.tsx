import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Homepage from "./homepage";
import App from "./app";
import "./index.css";
import Pages from "./pages/pages";
import Access from "./Access";
import Teste from "./filter_lab/Teste";
import Filterlab from "./filter_lab/Filterlab";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="" element={<App />} />
        <Route path="/access" element={<Access />} />
        <Route path="/homepage" element={<Homepage />} />
        <Route path="/pages" element={<Pages />} />
        <Route path="/teste" element={<Teste />} />
        <Route path="/filterlab" element={<Filterlab />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
