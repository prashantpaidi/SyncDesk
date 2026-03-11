import { Activity, Users, ShieldAlert, Server } from "lucide-react";

// Mock data until API is implemented
const summaryMetrics = [
    { label: "Total System Users", value: "1,248", icon: Users, color: "text-brand-accent", bg: "bg-blue-500/10" },
    { label: "Active Agents", value: "24", icon: Activity, color: "text-green-500", bg: "bg-green-500/10" },
    { label: "System Health", value: "99.9%", icon: Server, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Escalated Incidents", value: "5", icon: ShieldAlert, color: "text-red-500", bg: "bg-red-500/10" },
];

export function AdminDashboard() {
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
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {summaryMetrics.map((metric) => {
                    const Icon = metric.icon;
                    return (
                        <div key={metric.label} className="bg-surface-card p-5 sm:p-6 rounded-[20px] shadow-sm border border-border flex flex-col gap-4 group hover:border-border-focus transition-colors">
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
            <div className="bg-surface-card rounded-[24px] shadow-sm border border-border overflow-hidden">
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
