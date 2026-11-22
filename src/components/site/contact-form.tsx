"use client";

import { useActionState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check } from "lucide-react";
import type { Dictionary } from "@/dictionaries";
import type { Locale } from "@/lib/i18n";
import { sendMessage, type ContactState } from "@/app/[locale]/contact/actions";
import { buttonStyles, cn } from "./ui";

type Props = { locale: Locale; dict: Dictionary["contact"] };

const field =
  "mt-2 block w-full rounded-[4px] border bg-surface px-3.5 py-3 text-[1rem] outline-none transition-colors placeholder:text-muted/70 focus:border-accent";

export function ContactForm({ locale, dict }: Props) {
  const [state, action, pending] = useActionState<ContactState, FormData>(sendMessage, { status: "idle" });
  const errors = state.fieldErrors ?? {};
  const v = state.values;

  if (state.status === "sent") {
    return (
      <motion.div
        initial={{ opacity: 0, rotateX: -20, y: 10 }}
        animate={{ opacity: 1, rotateX: 0, y: 0 }}
        className="flex items-start gap-3 rounded-[6px] border border-success/40 bg-surface p-6"
        role="status"
      >
        <Check className="mt-0.5 shrink-0 text-success" size={20} aria-hidden />
        <p>{dict.sent}</p>
      </motion.div>
    );
  }

  const banner =
    state.status === "invalid" ? dict.errors.invalid : state.status === "rate" ? dict.errors.rate : state.status === "server" ? dict.errors.server : null;

  return (
    <form key={state.attempt ?? 0} action={action} className="space-y-6" noValidate>
      <input type="hidden" name="locale" value={locale} />
      <div className="absolute -left-[9999px]" aria-hidden>
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <AnimatePresence>
        {banner && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            role="alert"
            className="rounded-[4px] border border-danger/40 px-4 py-3 text-sm text-danger"
          >
            {banner}
          </motion.p>
        )}
      </AnimatePresence>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="text-sm font-medium">
            {dict.name}
          </label>
          <input id="name" name="name" defaultValue={v?.name} required autoComplete="name" aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "name-error" : undefined} className={cn(field, errors.name ? "border-danger" : "border-line-strong")} />
          {errors.name && <FieldError id="name-error">{dict.errors.name}</FieldError>}
        </div>
        <div>
          <label htmlFor="email" className="text-sm font-medium">
            {dict.email}
          </label>
          <input id="email" name="email" type="email" defaultValue={v?.email} required autoComplete="email" aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined} className={cn(field, errors.email ? "border-danger" : "border-line-strong")} />
          {errors.email && <FieldError id="email-error">{dict.errors.email}</FieldError>}
        </div>
      </div>
      <div>
        <label htmlFor="company" className="text-sm font-medium">
          {dict.company}
        </label>
        <input id="company" name="company" defaultValue={v?.company} autoComplete="organization" className={cn(field, "border-line-strong")} />
      </div>
      <div>
        <label htmlFor="body" className="text-sm font-medium">
          {dict.message}
        </label>
        <textarea
          id="body"
          name="body"
          defaultValue={v?.body}
          required
          rows={6}
          placeholder={dict.messageHint}
          aria-invalid={!!errors.body}
            aria-describedby={errors.body ? "body-error" : undefined}
          className={cn(field, "resize-y", errors.body ? "border-danger" : "border-line-strong")}
        />
        {errors.body && <FieldError id="body-error">{dict.errors.body}</FieldError>}
      </div>
      <button type="submit" disabled={pending} className={buttonStyles.primary}>
        {pending ? dict.sending : dict.send}
      </button>
    </form>
  );
}

function FieldError({ id, children }: { id: string; children: string }) {
  return (
    <p id={id} className="mt-1.5 text-sm text-danger">
      {children}
    </p>
  );
}
