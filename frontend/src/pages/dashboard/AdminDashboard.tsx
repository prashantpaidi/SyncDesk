import { useState } from 'react';
import { Activity, Users, ShieldAlert, Server, Plus } from "lucide-react";
import { CreateManagerModal } from "../../features/auth/components/CreateManagerModal";
import { useGetUsers } from "../../features/auth/hooks/useGetUsers";
import { useGetTickets } from "../../features/tickets/hooks/useGetTickets";

export function AdminDashboard() {
    const [isCreateManagerOpen, setIsCreateManagerOpen] = useState(false);

    const { data: users, isLoading: usersLoading, isError: usersError } = useGetUsers();
    const { data: tickets, isLoading: ticketsLoading, isError: ticketsError } = useGetTickets();

    const totalUsers = users?.length || 0;
    const activeAgents = users?.filter(u => u.role === 'AGENT').length || 0;
    // CRITICAL priority is usually spelled as CRITICAL or URGENT, let's just check HIGH or CRITICAL or URGENT
    const escalatedIncidents = tickets?.filter(t => t.priority === 'HIGH' || t.priority === 'CRITICAL' || t.priority === 'URGENT').length || 0;

    const summaryMetrics = [
        { label: "Total System Users", value: usersLoading ? "..." : usersError ? "-" : totalUsers.toString(), icon: Users, color: "text-info", bg: "bg-info-bg" },
        { label: "Active Agents", value: usersLoading ? "..." : usersError ? "-" : activeAgents.toString(), icon: Activity, color: "text-success", bg: "bg-success-bg" },
        { label: "System Health", value: "99.9%", icon: Server, color: "text-success", bg: "bg-success-bg" },
        { label: "Escalated Incidents", value: ticketsLoading ? "..." : ticketsError ? "-" : escalatedIncidents.toString(), icon: ShieldAlert, color: "text-error", bg: "bg-error-bg" },
    ];

    return (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-text-main mb-1">
                        Admin Console
                    </h1>
                    <p className="text-sm text-text-muted">
                        System overview and administration.
                    </p>
                </div>

                <button
                    onClick={() => setIsCreateManagerOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-xl shadow-button hover:opacity-90 transition-all font-semibold text-sm active:scale-95"
                >
                    <Plus className="w-4 h-4" />
                    Add Member
                </button>
            </div>

            <CreateManagerModal
                isOpen={isCreateManagerOpen}
                onClose={() => setIsCreateManagerOpen(false)}
            />

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {summaryMetrics.map((metric) => {
                    const Icon = metric.icon;
                    return (
                        <div key={metric.label} className="bg-surface-card p-5 sm:p-6 rounded-card shadow-sm border border-border flex flex-col gap-4 group hover:border-brand-accent transition-colors">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${metric.bg}`}>
                                <Icon className={`w-6 h-6 ${metric.color}`} />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-text-subtle mb-1">
                                    {metric.label}
                                </p>
                                <h3 className="text-3xl font-bold tracking-tight text-text-main group-hover:scale-[1.02] transition-transform origin-left">
                                    {metric.value}
                                </h3>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* System Status Section */}
            <div className="bg-surface-card rounded-card shadow-logo border border-border overflow-hidden">
                <div className="px-6 py-5 border-b border-border flex justify-between items-center bg-surface-card/50">
                    <h2 className="text-lg font-bold text-text-main">System Status</h2>
                </div>
                <div className="p-6">
                    <p className="text-sm text-text-muted">
                        All systems operational. This area will contain admin specific charts and management tools.
                    </p>
                </div>
            </div>
        </main>
    );
}
