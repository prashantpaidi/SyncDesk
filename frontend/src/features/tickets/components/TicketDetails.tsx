import { useState, useEffect } from "react";
import { useGetTicket } from "../hooks/useGetTicket";
import { format } from "date-fns";
import { useAuth } from "../../auth/context/AuthContext";
import { useGetUsers } from "../../auth/hooks/useGetUsers";
import { useAssignTicket } from "../hooks/useAssignTicket";
import { useUpdateTicketStatus } from "../hooks/useUpdateTicketStatus";
import { getActions } from "../utils/ticketActions";
import { Loader2 } from "lucide-react";
import { CommentSection } from "./CommentSection";

interface TicketDetailsProps {
    ticketId: string;
}

export function TicketDetails({ ticketId }: TicketDetailsProps) {
    const { data: ticket, isLoading, isError, error } = useGetTicket(ticketId);
    const { role } = useAuth();
    const isManager = role === 'MANAGER';
    const { data: users, isLoading: usersLoading } = useGetUsers();
    const { mutate: assignTicket, isPending: isAssigning } = useAssignTicket();
    const { mutate: updateStatus, isPending: isUpdatingStatus } = useUpdateTicketStatus();

    const [selectedAssignee, setSelectedAssignee] = useState<number | null>(null);

    useEffect(() => {
        if (ticket) {
            setSelectedAssignee(ticket.assignedToId);
        }
    }, [ticket]);

    const handleAssign = () => {
        if (selectedAssignee !== null && selectedAssignee !== ticket?.assignedToId) {
            assignTicket({ ticketId, userId: selectedAssignee });
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-brand-accent)]"></div>
            </div>
        );
    }

    if (isError || !ticket) {
        return (
            <div className="bg-red-50 text-red-600 p-4 rounded-[var(--radius-card)] shadow-[var(--shadow-button)]">
                <p>Error loading incident details: {error?.message || "Unknown error"}</p>
            </div>
        );
    }

    const getStatusColor = (status: string) => {
        switch (status.toUpperCase()) {
            case 'OPEN': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'RESOLVED': return 'bg-green-100 text-green-800 border-green-200';
            case 'CLOSED': return 'bg-gray-100 text-gray-800 border-gray-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority.toUpperCase()) {
            case 'LOW': return 'bg-green-100 text-green-800 border-green-200';
            case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'URGENT': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <div className="bg-[var(--color-surface-card)] rounded-[var(--radius-card)] shadow-[var(--shadow-logo)] p-8 max-w-4xl mx-auto border border-[var(--color-border)]">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8 border-b border-[var(--color-border)] pb-8">
                <div>
                    <h1 className="text-3xl font-sans tracking-[var(--tracking-tight)] text-[var(--color-text-main)] font-bold mb-3">
                        {ticket.title}
                    </h1>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--color-text-muted)] font-mono">
                        <span>ID: #{ticket.id}</span>
                        <span className="text-[var(--color-text-subtle)]">•</span>
                        <span>Opened on {format(new Date(ticket.createdAt), 'MMM dd, yyyy HH:mm')}</span>
                        <span className="text-[var(--color-text-subtle)]">•</span>
                        <div className="flex items-center gap-2">
                            <span>Assignee:</span>
                            {isManager ? (
                                <div className="flex items-center gap-2">
                                    <select
                                        value={selectedAssignee || ""}
                                        onChange={(e) => setSelectedAssignee(Number(e.target.value))}
                                        disabled={isAssigning || usersLoading}
                                        className="bg-[var(--color-surface-input)] border border-[var(--color-border)] rounded-[var(--radius-sm)] px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-brand-accent)] text-[var(--color-text-main)] max-w-[150px] truncate"
                                    >
                                        <option value="" disabled>Unassigned</option>
                                        {users?.filter((u) => u.role === 'AGENT' || u.role === 'MANAGER').map((user) => (
                                            <option key={user.id} value={user.id}>
                                                {user.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            ) : (
                                <span className="font-semibold text-[var(--color-text-main)]">
                                    {ticket.assignedToName || "Unassigned"}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                    {selectedAssignee !== ticket.assignedToId && (
                        <button
                            onClick={handleAssign}
                            disabled={isAssigning}
                            className="px-4 py-2 text-sm font-semibold bg-[var(--color-brand-accent)] text-white rounded-[var(--radius-pill)] shadow-[var(--shadow-button)] hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center min-w-[100px]"
                        >
                            {isAssigning ? (
                                <>
                                    <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>
                                    Saving...
                                </>
                            ) : (
                                "Save Changes"
                            )}
                        </button>
                    )}
                    <div className="h-8 w-px bg-[var(--color-border)] mx-1 hidden sm:block"></div>
                    
                    <div className="flex items-center gap-2">
                        {getActions(ticket.status, role || '').map((action) => {
                            const Icon = action.icon;
                            return (
                                <button
                                    key={action.id}
                                    onClick={() => updateStatus({ ticketId: Number(ticketId), status: action.status })}
                                    disabled={isUpdatingStatus}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-pill)] text-sm font-medium border transition-all ${action.color} ${action.hoverBg} border-current opacity-80 hover:opacity-100 disabled:opacity-50`}
                                    title={action.label}
                                >
                                    {isUpdatingStatus ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Icon className="w-4 h-4" />
                                    )}
                                    <span className="hidden sm:inline">{action.label}</span>
                                </button>
                            );
                        })}
                    </div>

                    <div className="h-8 w-px bg-[var(--color-border)] mx-1 hidden sm:block"></div>
                    <span className={`px-3 py-1 rounded-[var(--radius-pill)] text-sm font-medium border ${getStatusColor(ticket.status)}`}>
                        {ticket.status}
                    </span>
                    <span className={`px-3 py-1 rounded-[var(--radius-pill)] text-sm font-medium border ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority}
                    </span>
                </div>
            </div>

            <div className="prose prose-slate max-w-none">
                <h3 className="text-lg font-semibold text-[var(--color-text-main)] mb-4 font-sans border-l-4 border-[var(--color-brand-accent)] pl-3">
                    Description
                </h3>
                <div className="bg-[var(--color-surface-input)] p-6 rounded-[var(--radius-card)] text-[var(--color-text-main)] whitespace-pre-wrap leading-relaxed shadow-[var(--shadow-input)] border border-[var(--color-border)]">
                    {ticket.description}
                </div>
            </div>

            {/* Comments Section */}
            <div className="mt-12 pt-8 border-t border-[var(--color-border)]">
                <CommentSection ticketId={ticketId} role={role || ''} />
            </div>
        </div>
    );
}
