import { useAuth } from "../../features/auth/context/AuthContext";
import { LogOut } from "lucide-react";

export default function DashboardPage() {
    const { logout } = useAuth();

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
            <div className="bg-surface-main p-8 rounded-card max-w-md w-full shadow-card text-center">
                <h1 className="text-3xl font-bold text-text-main mb-4">Dashboard</h1>
                <p className="text-text-muted mb-8">You have successfully authenticated and accessed the protected dashboard.</p>

                <button
                    onClick={logout}
                    className="flex items-center justify-center gap-2 mx-auto px-6 py-3 bg-red-500/10 text-red-500 rounded-pill hover:bg-red-500/20 transition-colors font-medium"
                >
                    <LogOut className="w-4 h-4" />
                    Logout
                </button>
            </div>
        </div>
    );
}
