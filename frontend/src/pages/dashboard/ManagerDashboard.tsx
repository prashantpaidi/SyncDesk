import { Users, Target, Clock, AlertTriangle } from "lucide-react";
import { useGetTickets } from "../../features/tickets/hooks/useGetTickets";

// Mock data until API is implemented
const summaryMetrics = [
    { label: "Team Productivity", value: "94%", icon: Target, color: "text-brand-accent", bg: "bg-blue-500/10" },
    { label: "Active Agents", value: "18", icon: Users, color: "text-green-500", bg: "bg-green-500/10" },
    { label: "Average SLA Time", value: "2.4 hrs", icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10" },
    { label: "Escalated Incidents", value: "3", icon: AlertTriangle, color: "text-red-500", bg: "bg-red-500/10" },
];

export function ManagerDashboard() {
    const { data: tickets, isLoading, isError } = useGetTickets();

    return (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-text-main mb-1">
                        Manager Overview
                    </h1>
                    <p className="text-sm text-text-muted">
                        Monitor team performance and incident SLAs.
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

            {/* SLA Breaches Section */}
            <div className="bg-surface-card rounded-[24px] shadow-sm border border-border overflow-hidden">
                <div className="px-6 py-5 border-b border-border flex justify-between items-center bg-surface-card/50">
                    <h2 className="text-lg font-bold text-text-main">At-Risk SLAs</h2>
                </div>
                <div className="p-6">
                    <p className="text-sm text-text-muted">
                        No immediate SLA breaches detected. This section will highlight tickets requiring manager intervention.
                    </p>
                </div>
            </div>

            {/* All Incidents Section */}
            <div className="bg-surface-card rounded-[24px] shadow-sm border border-border overflow-hidden">
                <div className="px-6 py-5 border-b border-border flex justify-between items-center bg-surface-card/50">
                    <h2 className="text-lg font-bold text-text-main">All Created Incidents</h2>
                </div>
                <div className="p-6">
                    {isLoading && <p className="text-sm text-text-muted">Loading incidents...</p>}
                    {isError && <p className="text-sm text-red-500">Failed to load incidents.</p>}
                    {!isLoading && !isError && (!tickets || tickets.length === 0) && (
                        <p className="text-sm text-text-muted">No incidents found.</p>
                    )}

                    {!isLoading && !isError && tickets && tickets.length > 0 && (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-border">
                                <thead className="bg-surface-card/50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-subtle uppercase tracking-wider">ID</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-subtle uppercase tracking-wider">Title</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-subtle uppercase tracking-wider">Status</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-subtle uppercase tracking-wider">Priority</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-subtle uppercase tracking-wider">Created</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-surface-card divide-y divide-border">
                                    {tickets.map((ticket) => (
                                        <tr key={ticket.id} className="hover:bg-surface-card/50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-main">#{ticket.id}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-main">{ticket.title}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-muted">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-brand-accent/10 text-brand-accent`}>
                                                    {ticket.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-muted">{ticket.priority}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-muted">
                                                {new Date(ticket.createdAt).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
