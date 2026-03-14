import { BrowserRouter, Routes, Route } from "react-router";
import { ProtectedRoute } from "../features/auth/components/ProtectedRoute";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import DashboardPage from "../pages/dashboard/DashboardPage";
import CreateTicketPage from "../pages/tickets/CreateTicketPage";
import ViewTicketPage from "../pages/tickets/ViewTicketPage";

export default function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<ProtectedRoute requireAuth={false} />}>
                    <Route path="/" element={<LoginPage />} />
                    <Route path="/sign-up" element={<RegisterPage />} />
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
