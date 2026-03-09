import { BrowserRouter, Routes, Route } from "react-router";
import { ProtectedRoute } from "../features/auth/components/ProtectedRoute";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import DashboardPage from "../pages/dashboard/DashboardPage";

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
                </Route>
            </Routes>
        </BrowserRouter>
    );
}
