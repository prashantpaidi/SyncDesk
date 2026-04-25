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
import { StatusBadge } from "./StatusBadge";

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
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-accent"></div>
            </div>
        );
    }

    if (isError || !ticket) {
        return (
            <div className="bg-red-50 text-red-600 p-4 rounded-card shadow-button">
                <p>Error loading incident details: {error?.message || "Unknown error"}</p>
            </div>
        );
    }



    return (
        <div className="bg-surface-card rounded-card shadow-logo p-8 max-w-4xl mx-auto border border-border">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8 border-b border-border pb-8">
                <div>
                    <h1 className="text-3xl font-sans tracking-tight text-text-main font-bold mb-3">
                        {ticket.title}
                    </h1>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-text-muted font-mono">
                        <span>ID: #{ticket.id}</span>
                        <span className="text-text-subtle">•</span>
                        <span>Opened on {format(new Date(ticket.createdAt), 'MMM dd, yyyy HH:mm')}</span>
                        <span className="text-text-subtle">•</span>
                        <div className="flex items-center gap-2">
                            <span>Assignee:</span>
                            {isManager ? (
                                <div className="flex items-center gap-2">
                                    <select
                                        value={selectedAssignee || ""}
                                        onChange={(e) => setSelectedAssignee(Number(e.target.value))}
                                        disabled={isAssigning || usersLoading}
                                        className="bg-surface-input border border-border rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent text-text-main max-w-[180px] truncate transition-all"
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
                                <span className="font-semibold text-text-main">
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
                            className="px-4 py-2 text-sm font-bold bg-brand text-white rounded-xl shadow-button hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center min-w-[120px] active:scale-95"
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
                    <div className="h-8 w-px bg-border mx-1 hidden sm:block"></div>
                    
                    <div className="flex items-center gap-2">
                        {getActions(ticket.status, role || '').map((action) => {
                            const Icon = action.icon;
                            return (
                                <button
                                    key={action.id}
                                    onClick={() => updateStatus({ ticketId: Number(ticketId), status: action.status })}
                                    disabled={isUpdatingStatus}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold border transition-all ${action.color} ${action.hoverBg} border-current opacity-80 hover:opacity-100 disabled:opacity-50 active:scale-95`}
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

                    <div className="h-8 w-px bg-border mx-1 hidden sm:block"></div>
                    <StatusBadge status={ticket.status} />
                    <StatusBadge status={ticket.priority} />
                </div>
            </div>

            <div className="prose prose-slate max-w-none">
                <h3 className="text-lg font-semibold text-text-main mb-4 font-sans border-l-4 border-brand-accent pl-3">
                    Description
                </h3>
                <div className="bg-surface-input p-6 rounded-card text-text-main whitespace-pre-wrap leading-relaxed shadow-input border border-border">
                    {ticket.description}
                </div>
            </div>

            {/* Comments Section */}
            <div className="mt-12 pt-8 border-t border-border">
                <CommentSection ticketId={ticketId} role={role || ''} />
            </div>
        </div>
    );
}
