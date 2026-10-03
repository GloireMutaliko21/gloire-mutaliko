"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { clientCountry, clientIp, rateLimit } from "@/lib/rate-limit";
import { contactInput } from "@/lib/schemas";
import { db } from "@/lib/supabase/server";

export type ContactState = {
  status: "idle" | "sent" | "invalid" | "rate" | "server";
  fieldErrors?: Partial<Record<"name" | "email" | "company" | "body", string[]>>;
  /** Echoed back so the form keeps what the visitor typed after an error. */
  values?: { name: string; email: string; company: string; body: string };
  attempt?: number;
};

export async function sendMessage(prev: ContactState, formData: FormData): Promise<ContactState> {
  const values = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    company: String(formData.get("company") ?? ""),
    body: String(formData.get("body") ?? ""),
  };
  const attempt = (prev.attempt ?? 0) + 1;
  // Honeypot: real visitors never see or fill this field.
  if (formData.get("website")) return { status: "sent" };

  const parsed = contactInput.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    company: formData.get("company") ?? "",
    body: formData.get("body"),
    locale: formData.get("locale"),
  });
  if (!parsed.success) {
    return { status: "invalid", fieldErrors: z.flattenError(parsed.error).fieldErrors, values, attempt };
  }

  const h = await headers();
  if (!rateLimit(`contact:${clientIp(h)}`, 5, 60 * 60 * 1000).ok) return { status: "rate", values, attempt };

  const { error } = await db().from("messages").insert({ ...parsed.data, country: clientCountry(h) });
  if (error) {
    console.error("contact: could not save message", error.message);
    return { status: "server", values, attempt };
  }
  return { status: "sent" };
}
