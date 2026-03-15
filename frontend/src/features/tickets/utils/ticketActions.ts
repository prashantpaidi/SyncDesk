import { CheckCircle, RotateCcw, XCircle, type LucideIcon } from 'lucide-react';

export interface TicketAction {
    id: string;
    label: string;
    icon: LucideIcon;
    status: string;
    color: string;
    hoverBg: string;
}

export const getActions = (status: string, role: string): TicketAction[] => {
    if (!status || !role) {
        return [];
    }
    
    const s = status.toUpperCase();
    const r = role.toUpperCase();
    const actions: TicketAction[] = [];

    if (r === 'AGENT' || r === 'MANAGER') {
        if (s === 'OPEN' || s === 'IN_PROGRESS' || s === 'REOPENED') {
            actions.push({ 
                id: 'resolve', 
                label: 'Mark as Resolved', 
                icon: CheckCircle, 
                status: 'RESOLVED', 
                color: 'text-green-600', 
                hoverBg: 'hover:bg-green-500/10' 
            });
        }
        if (s === 'RESOLVED') {
            actions.push({ 
                id: 'reopen', 
                label: 'Reopen Ticket', 
                icon: RotateCcw, 
                status: 'OPEN', 
                color: 'text-amber-600', 
                hoverBg: 'hover:bg-amber-500/10' 
            });
        }
    }
    if (r === 'CUSTOMER') {
        if (s === 'RESOLVED') {
            actions.push({ 
                id: 'close', 
                label: 'Confirm & Close', 
                icon: XCircle, 
                status: 'CLOSED', 
                color: 'text-red-600', 
                hoverBg: 'hover:bg-red-500/10' 
            });
        }
    }

    return actions;
};
