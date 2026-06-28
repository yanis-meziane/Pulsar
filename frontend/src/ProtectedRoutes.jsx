import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, requiredRole }) {
    const type = localStorage.getItem("type");

    if (!type) {
        return <Navigate to="/login" />;
    }

    if (requiredRole && type !== requiredRole) {
        return <Navigate to="/error" />; 
    }

    return children;
}