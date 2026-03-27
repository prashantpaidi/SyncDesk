import { useState, useRef, useEffect } from 'react';
import { MoreHorizontal, Loader2 } from 'lucide-react';
import { useUpdateTicketStatus } from '../hooks/useUpdateTicketStatus';
import { getActions } from '../utils/ticketActions';

interface Props {
    ticketId: number;
    currentStatus: string;
    role: 'AGENT' | 'MANAGER' | 'CUSTOMER';
}

export function TicketActionsMenu({ ticketId, currentStatus, role }: Props) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const { mutate, isPending } = useUpdateTicketStatus();

    // Close on outside click
    useEffect(() => {
        function handler(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        }
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const actions = getActions(currentStatus, role);

    if (actions.length === 0) return null;

    return (
        <div ref={ref} className="relative inline-flex">
            <button
                onClick={() => setOpen(v => !v)}
                disabled={isPending}
                className="text-text-subtle hover:text-text-main transition-colors p-1 rounded-lg hover:bg-surface-input inline-flex disabled:opacity-50"
            >
                {isPending
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <MoreHorizontal className="w-4 h-4" />
                }
            </button>

            {open && (
                <div className="absolute right-0 top-8 z-50 w-44 bg-surface-card border border-border rounded-xl shadow-lg overflow-hidden">
                    {actions.map((action) => {
                        const Icon = action.icon;
                        return (
                            <button
                                key={action.id}
                                onClick={() => {
                                    mutate({ ticketId, status: action.status });
                                    setOpen(false);
                                }}
                                className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm ${action.color} ${action.hoverBg} transition-colors`}
                            >
                                <Icon className="w-4 h-4" />
                                {action.label}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
