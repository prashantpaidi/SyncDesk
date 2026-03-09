import { Navigate, Outlet } from "react-router";
import { useAuth } from "../context/AuthContext";

interface ProtectedRouteProps {
    requireAuth?: boolean;
    redirectPath?: string;
}

export function ProtectedRoute({ requireAuth = true, redirectPath = "/" }: ProtectedRouteProps) {
    const { isAuthenticated } = useAuth();

    if (requireAuth && !isAuthenticated) {
        return <Navigate to={redirectPath} replace />;
    }

    if (!requireAuth && isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
}
