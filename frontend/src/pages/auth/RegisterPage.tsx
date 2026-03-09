import { RegisterForm } from "../../features/auth/components/RegisterForm";

export default function RegisterPage() {
    return (
        <div className="min-h-screen bg-surface-card flex items-center justify-center p-4 font-sans antialiased">
            {/* Subtle bg gradient */}
            <div
                className="fixed inset-0 pointer-events-none"
                style={{
                    backgroundImage:
                        "radial-gradient(circle at 20% 20%, color-mix(in oklch, var(--color-brand-accent) 5%, transparent) 0%, transparent 50%), radial-gradient(circle at 80% 80%, color-mix(in oklch, var(--color-brand-dark) 3%, transparent) 0%, transparent 50%)",
                }}
            />
            <div className="w-full max-w-sm relative z-10">
                <RegisterForm />
            </div>
        </div>
    );
}