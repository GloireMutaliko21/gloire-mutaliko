"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { login } from "../actions";
import { inputClass, buttonClass } from "@/components/admin/styles";

export function LoginForm() {
  const next = useSearchParams().get("next") ?? "/admin";
  const [state, action, pending] = useActionState(login, {});
  return (
    <form action={action} className="mt-8 space-y-5">
      <input type="hidden" name="next" value={next} />
      {state.error && (
        <p role="alert" className="rounded-[4px] border border-danger/40 px-3 py-2 text-sm text-danger">
          {state.error}
        </p>
      )}
      <label className="block text-sm font-medium">
        E-mail
        <input name="email" type="email" required autoComplete="username" className={inputClass} />
      </label>
      <label className="block text-sm font-medium">
        Mot de passe
        <input name="password" type="password" required autoComplete="current-password" className={inputClass} />
      </label>
      <button type="submit" disabled={pending} className={`${buttonClass.primary} w-full`}>
        {pending ? "Connexion…" : "Se connecter"}
      </button>
    </form>
  );
}
