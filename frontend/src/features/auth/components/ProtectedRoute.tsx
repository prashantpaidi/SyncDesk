import { Navigate, Outlet } from "react-router";
import { useAuth } from "../context/AuthContext";

interface ProtectedRouteProps {
    requireAuth?: boolean;
    redirectPath?: string;
}

/**
 * Guards nested routes based on authentication, redirecting when access conditions are not met.
 *
 * @param requireAuth - When true, the route requires the user to be authenticated; when false, the route requires the user to be unauthenticated.
 * @param redirectPath - Path to redirect to when authentication is required but the user is not authenticated.
 * @returns A React element that either navigates to `redirectPath`, navigates to `/dashboard`, or renders the nested route via `<Outlet />`.
 */
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
