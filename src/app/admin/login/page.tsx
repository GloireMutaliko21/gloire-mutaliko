import { Suspense } from "react";
import { LoginForm } from "./login-form";

export const metadata = { title: "Connexion" };

export default function LoginPage() {
  return (
    <main className="grid min-h-dvh place-items-center px-5">
      <div className="w-full max-w-[22rem]">
        <h1 className="font-display text-3xl font-semibold tracking-tight">Administration</h1>
        <p className="mt-2 text-sm text-muted">Connectez-vous pour gérer le contenu du site.</p>
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
