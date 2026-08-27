"use client";
import { useActionState } from "react";
import { signIn, type SignInState } from "./actions";
import { Input, Label } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  const initialState: SignInState = { error: null };
  const [state, formAction, pending] = useActionState(signIn, initialState);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] px-4">
      <div className="w-full max-w-[380px]">
        <div className="mb-8 text-center">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent)] text-white font-semibold text-sm mb-4">
            E
          </div>
          <h1 className="text-lg font-semibold tracking-tight">EMSOFT CRM</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Sign in to your internal workspace</p>
        </div>

        <form action={formAction} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required autoComplete="email" placeholder="you@emsoftmn.com" />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required autoComplete="current-password" placeholder="••••••••" />
          </div>

          {state?.error && (
            <div className="rounded-lg bg-[var(--danger-soft)] border border-[var(--danger)]/20 px-3 py-2 text-[13px] text-[var(--danger)]">
              {state.error}
            </div>
          )}

          <Button type="submit" variant="primary" size="lg" className="w-full" disabled={pending}>
            {pending ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </div>
    </div>
  );
}
