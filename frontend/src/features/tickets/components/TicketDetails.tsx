import { useGetTicket } from "../hooks/useGetTicket";
import { format } from "date-fns";

interface TicketDetailsProps {
    ticketId: string;
}

export function TicketDetails({ ticketId }: TicketDetailsProps) {
    const { data: ticket, isLoading, isError, error } = useGetTicket(ticketId);

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
                    </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
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

            {/* This is a placeholder for future comments section */}
            <div className="mt-12 pt-8 border-t border-[var(--color-border)]">
                <h3 className="text-lg font-semibold text-[var(--color-text-main)] mb-6 font-sans">
                    Activity & Comments
                </h3>
                <div className="text-center py-8 bg-gray-50 rounded-[var(--radius-card)] text-[var(--color-text-muted)] border border-dashed border-[var(--color-border)]">
                    Comments section coming soon
                </div>
            </div>
        </div>
    );
}
