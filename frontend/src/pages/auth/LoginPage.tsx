import { LoginForm } from "../../features/auth/components/LoginForm";

/**
 * Render the login page layout with a centered authentication form and decorative background.
 *
 * @returns A React element containing a full-height container, a non-interactive fixed radial-gradient background, and a centered `LoginForm` constrained to a small max width.
 */
export default function LoginPage() {
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
        <LoginForm />
      </div>
    </div>
  );
}
