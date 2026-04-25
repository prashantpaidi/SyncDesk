import { Plus, LayoutDashboard, TicketIcon, Clock, CheckCircle, MoreHorizontal } from "lucide-react";
import { Link } from "react-router";
import { useGetTickets } from "../../features/tickets/hooks/useGetTickets";
import { TicketActionsMenu } from "../../features/tickets/components/TicketActionsMenu";



import { StatusBadge } from "../../features/tickets/components/StatusBadge";

export function CustomerDashboard() {
    const { data: tickets, isLoading, isError } = useGetTickets();

    const t = tickets || [];
    const total = t.length;
    const open = t.filter(x => x.status === 'OPEN').length;
    const inProgress = t.filter(x => x.status === 'IN_PROGRESS').length;
    const resolved = t.filter(x => x.status === 'RESOLVED' || x.status === 'CLOSED').length;

    const summaryMetrics = [
        { label: "Total Incidents", value: total.toString(), icon: LayoutDashboard, color: "text-info", bg: "bg-info-bg" },
        { label: "Open", value: open.toString(), icon: TicketIcon, color: "text-error", bg: "bg-error-bg" },
        { label: "In Progress", value: inProgress.toString(), icon: Clock, color: "text-warning", bg: "bg-warning-bg" },
        { label: "Resolved", value: resolved.toString(), icon: CheckCircle, color: "text-success", bg: "bg-success-bg" },
    ];

    return (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            {/* Header & Mobile Action */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-text-main mb-1">
                        Customer Dashboard
                    </h1>
                    <p className="text-sm text-text-muted">
                        Here is an overview of your support incidents.
                    </p>
                </div>
                <Link
                    to="/tickets/new"
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-brand text-white text-sm font-semibold rounded-xl shadow-button hover:opacity-90 active:scale-95 transition-all"
                >
                    <Plus className="w-4 h-4" />
                    Create Incident
                </Link>
            </div>

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

            {/* Recent Tickets Section */}
            <div className="bg-surface-card rounded-card shadow-logo border border-border overflow-hidden">
                <div className="px-6 py-5 border-b border-border flex justify-between items-center bg-surface-card/50">
                    <h2 className="text-lg font-bold text-text-main">My Recent Incidents</h2>
                    <button className="text-sm font-semibold text-brand-accent hover:opacity-80 transition-opacity">
                        View all
                    </button>
                </div>

                <div className="overflow-x-auto">
                    {isLoading && <p className="p-6 text-sm text-text-muted">Loading incidents...</p>}
                    {isError && <p className="p-6 text-sm text-red-500">Failed to load incidents.</p>}
                    {!isLoading && !isError && t.length === 0 && (
                        <p className="p-6 text-sm text-text-muted">No incidents found.</p>
                    )}
                    {!isLoading && !isError && t.length > 0 && (
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-surface-input/50 text-text-subtle text-[11px] uppercase tracking-wider font-bold">
                                <tr>
                                    <th className="px-6 py-3">ID</th>
                                    <th className="px-6 py-3 w-full">Title</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3">Priority</th>
                                    <th className="px-6 py-3">Date</th>
                                    <th className="px-6 py-3 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {t.map((incident) => (
                                    <tr key={incident.id} className="hover:bg-surface-input/30 transition-colors group">
                                        <td className="px-6 py-4 font-mono text-xs font-semibold text-text-muted">
                                            <Link to={`/tickets/${incident.id}`} className="hover:underline">#{incident.id}</Link>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-text-main group-hover:text-brand-accent transition-colors cursor-pointer">
                                            <Link to={`/tickets/${incident.id}`}>{incident.title}</Link>
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={incident.status} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={incident.priority} />
                                        </td>
                                        <td className="px-6 py-4 text-text-muted text-xs">
                                            {new Date(incident.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <TicketActionsMenu
                                                ticketId={incident.id}
                                                currentStatus={incident.status}
                                                role="CUSTOMER"
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </main>
    );
}
