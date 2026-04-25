import { useParams, useNavigate } from "react-router";
import { TicketDetails } from "../../features/tickets/components/TicketDetails";

export default function ViewTicketPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    if (!id) {
        return <div>Invalid incident ID</div>;
    }

    return (
        <div className="min-h-screen bg-surface-input font-sans antialiased relative">
            {/* Subtle background gradient utility */}
            <div className="fixed inset-0 pointer-events-none bg-glow-variant" />

            <div className="relative z-10 container mx-auto px-4 py-8">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="mb-6 flex items-center text-text-muted hover:text-brand-accent transition-colors group px-4 py-2 rounded-pill hover:bg-surface-card shadow-button border border-transparent hover:border-border"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mr-2 group-hover:-translate-x-1 transition-transform"
                    >
                        <line x1="19" y1="12" x2="5" y2="12"></line>
                        <polyline points="12 19 5 12 12 5"></polyline>
                    </svg>
                    Back to Dashboard
                </button>

                <TicketDetails ticketId={id} />
            </div>
        </div>
    );
}
