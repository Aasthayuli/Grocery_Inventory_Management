import { Navigate } from "react-router-dom";
import { isAuthenticated, getCurrentUser } from "../services/authService";

const ProtectedRoute = ({ children }) => {
  //check if user is logged in
  const isLoggedIn = isAuthenticated();

  //If not logged in, redirect to login page
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  //user is authenticated  render children
  return children;
};

export default ProtectedRoute;
