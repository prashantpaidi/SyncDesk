import { Users, Activity, AlertTriangle, Calendar } from "lucide-react";
import { StatusBadge } from "../../features/tickets/components/StatusBadge";
import { useGetTickets } from "../../features/tickets/hooks/useGetTickets";
import { TicketActionsMenu } from "../../features/tickets/components/TicketActionsMenu";
import { Link } from "react-router";
import { isThisWeek } from "date-fns";

export function ManagerDashboard() {
    const { data: tickets, isLoading: ticketsLoading, isError } = useGetTickets();

    const unassignedCount = tickets?.filter(t => !t.assignedToId).length || 0;
    const openCount = tickets?.filter(t => t.status === 'OPEN').length || 0;
    const openIncidentText = ticketsLoading ? "..." : openCount.toString();
    const criticalHighCount = tickets?.filter(t => t.priority === 'HIGH' || t.priority === 'CRITICAL').length || 0;
    
    const thisWeekCount = tickets?.filter(t => {
        return t.createdAt && isThisWeek(new Date(t.createdAt));
    }).length || 0;

    const summaryMetrics = [
        { label: "Unassigned Tickets", value: ticketsLoading ? "..." : unassignedCount.toString(), icon: Users, color: "text-info", bg: "bg-info-bg" },
        { label: "Open Incidents", value: openIncidentText, icon: Activity, color: "text-success", bg: "bg-success-bg" },
        { label: "Critical & High Priority", value: ticketsLoading ? "..." : criticalHighCount.toString(), icon: AlertTriangle, color: "text-error", bg: "bg-error-bg" },
        { label: "Created This Week", value: ticketsLoading ? "..." : thisWeekCount.toString(), icon: Calendar, color: "text-info", bg: "bg-info-bg" },
    ];

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

            {/* All Incidents Section */}
            <div className="bg-surface-card rounded-card shadow-logo border border-border overflow-hidden">
                <div className="px-6 py-5 border-b border-border flex justify-between items-center bg-surface-card/50">
                    <h2 className="text-lg font-bold text-text-main">All Created Incidents</h2>
                </div>
                <div className="p-6">
                    {ticketsLoading && <p className="text-sm text-text-muted">Loading incidents...</p>}
                    {isError && <p className="text-sm text-red-500">Failed to load incidents.</p>}
                    {!ticketsLoading && !isError && (!tickets || tickets.length === 0) && (
                        <p className="text-sm text-text-muted">No incidents found.</p>
                    )}

                    {!ticketsLoading && !isError && tickets && tickets.length > 0 && (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-border">
                                <thead className="bg-surface-card/50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-subtle uppercase tracking-wider">ID</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-subtle uppercase tracking-wider">Title</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-subtle uppercase tracking-wider">Status</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-subtle uppercase tracking-wider">Priority</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-subtle uppercase tracking-wider">Assigned To</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-subtle uppercase tracking-wider">Created</th>
                                        <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-text-subtle uppercase tracking-wider">Actions</th>
                                    </tr>
</thead>
                                <tbody className="bg-surface-card divide-y divide-border">
                                    {tickets.map((ticket) => (
                                        <tr key={ticket.id} className="hover:bg-surface-card/50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-main">
                                                <Link to={`/tickets/${ticket.id}`} className="hover:underline">#{ticket.id}</Link>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-main">
                                                <Link to={`/tickets/${ticket.id}`} className="hover:underline">{ticket.title}</Link>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-muted">
                                                <StatusBadge status={ticket.status} />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-muted">
                                                <StatusBadge status={ticket.priority} />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-muted">{ticket.assignedToName || "Unassigned"}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-muted">
                                                {new Date(ticket.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <TicketActionsMenu 
                                                    ticketId={ticket.id} 
                                                    currentStatus={ticket.status} 
                                                    role="MANAGER" 
                                                />
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
