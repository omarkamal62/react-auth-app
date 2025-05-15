import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Spinner from "react-bootstrap/Spinner";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, checkTokenExpiration, authChecked } = useAuth();

  // Wait until auth state is checked before making any decisions
  if (!authChecked) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "100vh" }}
      >
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  // Once auth is checked, we can safely make routing decisions
  const isTokenValid = checkTokenExpiration();

  if (!isAuthenticated || !isTokenValid) {
    // console.log("Auth requirements not met, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
