"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { signUpWithEmail, signInWithGoogle } from "@/lib/supabase/auth";

export type AuthGateTrigger =
  | "deal_created"
  | "save_request"
  | "download_request";

interface AuthGateProps {
  trigger: AuthGateTrigger;
  sellerId: string | null;
  sessionToken: string | null;
  onSuccess: () => void;
  onDismiss: () => void;
}

const TRIGGER_COPY: Record<AuthGateTrigger, { title: string; subtitle: string }> = {
  deal_created: {
    title: "Your deal has been saved",
    subtitle: "Create a free account to access it later and download materials.",
  },
  save_request: {
    title: "Save your progress",
    subtitle: "Create a free account so you can come back anytime.",
  },
  download_request: {
    title: "Download your materials",
    subtitle: "Create a free account to download PDFs of your Teaser and Info Memo.",
  },
};

export function AuthGate({
  trigger,
  sellerId,
  sessionToken,
  onSuccess,
  onDismiss,
}: AuthGateProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"initial" | "email">("initial");

  const copy = TRIGGER_COPY[trigger];

  const handleGoogleAuth = async () => {
    // Set migration cookie before redirect
    if (sellerId && sessionToken) {
      await fetch("/api/session/mark-pending", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          anonymous_seller_id: sellerId,
          session_token: sessionToken,
        }),
      });
    }
    await signInWithGoogle();
  };

  const handleEmailSignup = async () => {
    if (!email || !password) return;
    setIsLoading(true);
    setError(null);

    const { error: signupError } = await signUpWithEmail(email, password);
    if (signupError) {
      setError(signupError.message);
      setIsLoading(false);
      return;
    }

    // Migrate anonymous seller to authenticated
    if (sellerId) {
      await fetch("/api/seller/migrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ anonymous_seller_id: sellerId }),
      }).catch(console.error);
    }

    setIsLoading(false);
    onSuccess();
  };

  return (
    <div className="bg-navy-light border border-gold/20 rounded-xl overflow-hidden">
      <div className="px-4 py-3 bg-gold/10 border-b border-gold/15 flex items-center gap-2">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-gold"
        >
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        <span className="text-sm font-medium text-gold">{copy.title}</span>
        <button
          onClick={onDismiss}
          className="ml-auto text-gray-text hover:text-foreground transition-colors"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <div className="p-4 space-y-3">
        <p className="text-sm text-gray-text">{copy.subtitle}</p>

        {mode === "initial" ? (
          <div className="space-y-2">
            <button
              onClick={handleGoogleAuth}
              className="w-full flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-navy-lighter px-4 py-2.5 text-sm font-medium text-foreground hover:bg-white/5 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </button>

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-xs text-gray-text">or</span>
              <div className="h-px flex-1 bg-white/10" />
            </div>

            <button
              onClick={() => setMode("email")}
              className="w-full rounded-lg bg-gold text-navy px-4 py-2.5 text-sm font-medium hover:bg-gold-light transition-colors"
            >
              Sign up with email
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-navy-lighter px-3 py-2 text-sm text-foreground placeholder:text-gray-text focus:outline-none focus:ring-2 focus:ring-gold/40"
            />
            <input
              type="password"
              placeholder="Password (min 6 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleEmailSignup()}
              className="w-full rounded-lg border border-white/10 bg-navy-lighter px-3 py-2 text-sm text-foreground placeholder:text-gray-text focus:outline-none focus:ring-2 focus:ring-gold/40"
            />

            {error && (
              <p className="text-xs text-red-400">{error}</p>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => setMode("initial")}
                className="rounded-lg border border-white/10 px-3 py-2 text-sm text-gray-text hover:text-foreground transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleEmailSignup}
                disabled={isLoading || !email || !password}
                className={cn(
                  "flex-1 rounded-lg bg-gold text-navy px-4 py-2 text-sm font-medium transition-colors",
                  "hover:bg-gold-light disabled:opacity-40 disabled:cursor-not-allowed"
                )}
              >
                {isLoading ? "Creating account..." : "Create account"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
