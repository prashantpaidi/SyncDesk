

type StatusType = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' | 'CRITICAL' | string;

interface StatusBadgeProps {
    status: StatusType;
    className?: string;
}

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
    const s = status.toUpperCase();
    
    const getStyle = () => {
        switch (s) {
            case 'OPEN':
            case 'MEDIUM':
                return 'bg-warning-bg text-warning border-warning-border';
            case 'IN_PROGRESS':
                return 'bg-info-bg text-info border-info-border';
            case 'RESOLVED':
            case 'CLOSED':
            case 'LOW':
                return 'bg-success-bg text-success border-success-border';
            case 'HIGH':
            case 'CRITICAL':
                return 'bg-error-bg text-error border-error-border';
            case 'URGENT':
                return 'bg-urgent-bg text-urgent border-urgent-border';
            default:
                return 'bg-surface-input text-text-muted border-border';
        }
    };

    return (
        <span className={`px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-pill border transition-colors ${getStyle()} ${className}`}>
            {status}
        </span>
    );
}
