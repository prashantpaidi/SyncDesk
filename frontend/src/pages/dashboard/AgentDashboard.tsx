import { LayoutDashboard, TicketIcon, Clock, CheckCircle, MoreHorizontal } from "lucide-react";
import { StatusBadge } from "./CustomerDashboard";

// Mock data until API is implemented
const summaryMetrics = [
    { label: "Unassigned Tickets", value: "8", icon: LayoutDashboard, color: "text-brand-accent", bg: "bg-blue-500/10" },
    { label: "My Open Tickets", value: "12", icon: TicketIcon, color: "text-red-500", bg: "bg-red-500/10" },
    { label: "Due Today", value: "3", icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10" },
    { label: "Resolved This Week", value: "45", icon: CheckCircle, color: "text-green-500", bg: "bg-green-500/10" },
];

const mockIncidents = [
    { id: "INC-890", title: "Cannot access internal wiki", status: "Open", priority: "High", date: "2 hours ago", customer: "John Doe" },
    { id: "INC-889", title: "Email sync failing on mobile", status: "In Progress", priority: "Medium", date: "5 hours ago", customer: "Jane Smith" },
];

export function AgentDashboard() {
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

            {/* Queue Section */}
            <div className="bg-surface-card rounded-[24px] shadow-sm border border-border overflow-hidden">
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
                            {mockIncidents.map((incident) => (
                                <tr key={incident.id} className="hover:bg-surface-input/30 transition-colors group">
                                    <td className="px-6 py-4 font-mono text-xs font-semibold text-text-muted">
                                        {incident.id}
                                    </td>
                                    <td className="px-6 py-4 font-medium text-text-main group-hover:text-brand-accent transition-colors cursor-pointer">
                                        {incident.title}
                                    </td>
                                    <td className="px-6 py-4 text-text-muted text-xs">
                                        {incident.customer}
                                    </td>
                                    <td className="px-6 py-4">
                                        <StatusBadge status={incident.status} />
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-xs font-semibold ${incident.priority === "High" ? "text-red-500" :
                                                incident.priority === "Medium" ? "text-amber-500" :
                                                    "text-green-500"
                                            }`}>
                                            {incident.priority}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button className="text-text-subtle hover:text-text-main transition-colors p-1 rounded-lg hover:bg-surface-input inline-flex">
                                            <MoreHorizontal className="w-4 h-4" />
                                        </button>
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
