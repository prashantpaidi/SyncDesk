import { CreateTicketForm } from "../../features/tickets/components/CreateTicketForm";

export default function CreateTicketPage() {
    return (
        <div className="min-h-screen bg-surface-input flex items-center justify-center p-4 font-sans antialiased">
            {/* Subtle bg gradient */}
            <div className="fixed inset-0 pointer-events-none bg-glow" />
            <div className="w-full max-w-sm relative z-10">
                <CreateTicketForm />
            </div>
        </div>
    );
}
