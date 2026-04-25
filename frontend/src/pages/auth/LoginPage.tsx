import { LoginForm } from "../../features/auth/components/LoginForm";

/**
 * Render the login page layout with a centered authentication form and decorative background.
 *
 * @returns A React element containing a full-height container, a non-interactive fixed radial-gradient background, and a centered `LoginForm` constrained to a small max width.
 */
export default function LoginPage() {
  return (
    <div className="min-h-screen bg-surface-input flex items-center justify-center p-4 font-sans antialiased">
      {/* Subtle bg gradient */}
      <div className="fixed inset-0 pointer-events-none bg-glow" />
      <div className="w-full max-w-sm relative z-10">
        <LoginForm />
      </div>
    </div>
  );
}
