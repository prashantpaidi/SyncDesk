import { BrowserRouter, Routes, Route } from "react-router";
import { ProtectedRoute } from "../features/auth/components/ProtectedRoute";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import DashboardPage from "../pages/dashboard/DashboardPage";
import CreateTicketPage from "../pages/tickets/CreateTicketPage";
import ViewTicketPage from "../pages/tickets/ViewTicketPage";

/**
 * Defines the application's route structure with groups guarded by authentication requirements.
 *
 * The returned JSX contains an unauthenticated group exposing `/` (login) and `/register`, and
 * an authenticated group exposing `/dashboard`, each wrapped with `ProtectedRoute` configured
 * for the appropriate `requireAuth` value.
 *
 * @returns The routing JSX for the application
 */
export default function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<ProtectedRoute requireAuth={false} />}>
                    <Route path="/" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                </Route>

                <Route element={<ProtectedRoute requireAuth={true} />}>
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/tickets/new" element={<CreateTicketPage />} />
                    <Route path="/tickets/:id" element={<ViewTicketPage />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}
