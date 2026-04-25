import { RegisterForm } from "../../features/auth/components/RegisterForm";

/**
 * Render the registration page containing a centered registration form and decorative background.
 *
 * The layout uses a full-viewport wrapper that centers content, a fixed radial-gradient overlay for subtle decoration, and a constrained content area that hosts the `RegisterForm` component.
 *
 * @returns A React element representing the registration page with a centered `RegisterForm` and background overlay.
 */
export default function RegisterPage() {
    return (
        <div className="min-h-screen bg-surface-input flex items-center justify-center p-4 font-sans antialiased">
            {/* Subtle bg gradient */}
            <div className="fixed inset-0 pointer-events-none bg-glow" />
            <div className="w-full max-w-sm relative z-10">
                <RegisterForm />
            </div>
        </div>
    );
}