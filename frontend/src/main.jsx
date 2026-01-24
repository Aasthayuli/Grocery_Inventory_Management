import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { router } from "./router";
import { RouterProvider } from "react-router-dom";

const Root = () => {
  useEffect(() => {
    fetch(import.meta.env.VITE_API_URL + "/api/health")
      .then(() => console.log("Backend warmed up"))
      .catch(() => {});
  }, []);

  return <RouterProvider router={router} />;
};

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
