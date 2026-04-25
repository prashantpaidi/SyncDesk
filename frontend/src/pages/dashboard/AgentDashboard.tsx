import { LayoutDashboard, TicketIcon, Clock, CheckCircle, MoreHorizontal, Plus } from "lucide-react";
import { StatusBadge } from "../../features/tickets/components/StatusBadge";
import { Link } from "react-router";
import { useAuth } from "../../features/auth/context/AuthContext";
import { useGetTickets } from "../../features/tickets/hooks/useGetTickets";
import { TicketActionsMenu } from "../../features/tickets/components/TicketActionsMenu";

export function AgentDashboard() {
    const { userId } = useAuth();
    const { data: tickets, isLoading: ticketsLoading } = useGetTickets();

    const t = tickets || [];
    const unassignedTickets = t.filter(x => x.assignedToId === null).length;

    // My tickets
    const myTickets = t.filter(x => x.assignedToId === userId);
    const myOpenTickets = myTickets.filter(x => x.status === 'OPEN' || x.status === 'IN_PROGRESS').length;
    const dueToday = myTickets.filter(x => (x.priority === 'HIGH' || x.priority === 'CRITICAL') && x.status !== 'RESOLVED' && x.status !== 'CLOSED').length;
    const resolvedThisWeek = myTickets.filter(x => x.status === 'RESOLVED' || x.status === 'CLOSED').length;

    const myActionQueue = myTickets.filter(x => x.status === 'OPEN' || x.status === 'IN_PROGRESS');

    const summaryMetrics = [
        { label: "Unassigned Tickets", value: ticketsLoading ? "..." : unassignedTickets.toString(), icon: LayoutDashboard, color: "text-info", bg: "bg-info-bg" },
        { label: "My Open Tickets", value: ticketsLoading ? "..." : myOpenTickets.toString(), icon: TicketIcon, color: "text-error", bg: "bg-error-bg" },
        { label: "High Priority Active", value: ticketsLoading ? "..." : dueToday.toString(), icon: Clock, color: "text-warning", bg: "bg-warning-bg" },
        { label: "Resolved Total", value: ticketsLoading ? "..." : resolvedThisWeek.toString(), icon: CheckCircle, color: "text-success", bg: "bg-success-bg" },
    ];

    return (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-text-main mb-1">
                        Agent Workspace
                    </h1>
                    <p className="text-sm text-text-muted">
                        Manage your assigned incidents and queues.
                    </p>
                </div>

                <Link
                    to="/tickets/new"
                    className="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-xl shadow-button hover:opacity-90 transition-all font-semibold text-sm active:scale-95"
                >
                    <Plus className="w-4 h-4" />
                    New Incident
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

            {/* Queue Section */}
            <div className="bg-surface-card rounded-card shadow-logo border border-border overflow-hidden">
                <div className="px-6 py-5 border-b border-border flex justify-between items-center bg-surface-card/50">
                    <h2 className="text-lg font-bold text-text-main">My Action Queue</h2>
                    <button className="text-sm font-semibold text-brand-accent hover:opacity-80 transition-opacity">
                        View queue
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-surface-input/50 text-text-subtle text-[11px] uppercase tracking-wider font-bold">
                            <tr>
                                <th className="px-6 py-3">ID</th>
                                <th className="px-6 py-3 w-full">Title</th>
                                <th className="px-6 py-3">Customer</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Priority</th>
                                <th className="px-6 py-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {ticketsLoading && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-4 text-center text-sm text-text-muted">Loading queue...</td>
                                </tr>
                            )}
                            {!ticketsLoading && myActionQueue.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-4 text-center text-sm text-text-muted">No action items in queue.</td>
                                </tr>
                            )}
                            {!ticketsLoading && myActionQueue.map((incident) => (
                                <tr key={incident.id} className="hover:bg-surface-input/30 transition-colors group">
                                    <td className="px-6 py-4 font-mono text-xs font-semibold text-text-muted">
                                        <Link to={`/tickets/${incident.id}`} className="hover:underline">#{incident.id}</Link>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-text-main group-hover:text-brand-accent transition-colors cursor-pointer">
                                        <Link to={`/tickets/${incident.id}`}>{incident.title}</Link>
                                    </td>
                                    <td className="px-6 py-4 text-text-muted text-xs">
                                        {incident.createdByName}
                                    </td>
                                    <td className="px-6 py-4">
                                        <StatusBadge status={incident.status} />
                                    </td>
                                    <td className="px-6 py-4">
                                        <StatusBadge status={incident.priority} />
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <TicketActionsMenu
                                            ticketId={incident.id}
                                            currentStatus={incident.status}
                                            role="AGENT"
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
    );
}
