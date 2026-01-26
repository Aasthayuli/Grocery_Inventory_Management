import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { router } from "./router";
import { RouterProvider } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

if (API_URL) {
  fetch(API_URL + "/api/health", {
    method: "GET",
    cache: "no-cache",
  })
    .then(() => console.log("Backend warmed up"))
    .catch((err) => console.warn("Warmup failed:", err.message));
}
const Root = () => {
  return <RouterProvider router={router} />;
};

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
