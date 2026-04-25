import { useAuth } from "../../features/auth/context/AuthContext";
import { LogOut, Plus, Zap } from "lucide-react";
import { Link } from "react-router";
import { CustomerDashboard } from "./CustomerDashboard";
import { AgentDashboard } from "./AgentDashboard";
import { AdminDashboard } from "./AdminDashboard";
import { ManagerDashboard } from "./ManagerDashboard";

/**
 * Renders the protected Dashboard page, showing a heading, descriptive text, and a Logout button.
 *
 * The Logout button invokes the authentication context's logout handler when clicked.
 *
 * @returns The dashboard page's JSX element.
 */
export default function DashboardPage() {
    const { logout, role } = useAuth();

    return (
        <div className="min-h-screen bg-surface-input font-sans antialiased flex flex-col">
            {/* ── Navbar ── */}
            <header className="bg-surface-card border-b border-border sticky top-0 z-30 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-brand rounded-xl flex items-center justify-center shadow-logo relative overflow-hidden">
                                <Zap className="w-4 h-4 text-white" fill="currentColor" />
                                <div className="absolute inset-0 bg-white/10 pointer-events-none" />
                            </div>
                            <span className="text-xl font-bold tracking-tight text-text-main">
                                SyncDesk
                            </span>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-4">
                            {role !== "ADMIN" && (
                                <Link
                                    to="/tickets/new"
                                    className="hidden sm:flex items-center gap-2 px-4 py-2 bg-brand text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-all shadow-button hover:-translate-y-0.5 active:translate-y-0"
                                >
                                    <Plus className="w-4 h-4" />
                                    Create Incident
                                </Link>
                            )}

                            <div className="w-px h-6 bg-border mx-1 hidden sm:block"></div>

                            <button
                                onClick={logout}
                                className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-text-muted hover:text-text-main hover:bg-surface-input rounded-xl transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                                <span className="hidden sm:inline">Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* ── Main Content ── */}
            {role === "ADMIN" ? (
                <AdminDashboard />
            ) : role === "MANAGER" ? (
                <ManagerDashboard />
            ) : role === "AGENT" ? (
                <AgentDashboard />
            ) : (
                <CustomerDashboard />
            )}
        </div>
    );
}
