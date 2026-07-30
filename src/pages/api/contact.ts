import type { APIRoute } from "astro";
import { RECAPTCHA_SECRET_KEY, RESEND_API_KEY } from "astro:env/server";
import { Resend } from "resend";
import { notificationEmail } from "../../emails/notification";
import { autoReplyEmail } from "../../emails/autoreply";
import { contactSchema, escapeHtml } from "../../services/contactValidate";

export const prerender = false;

type ContactErrorCode = "VALIDATION" | "SPAM" | "SEND_FAILED";

type ContactResponse =
  | { ok: true; code: "SENT" }
  | { ok: false; code: ContactErrorCode };

interface RecaptchaVerification {
  success?: boolean;
  action?: string;
  score?: number;
}

const resend = new Resend(RESEND_API_KEY);
const RECAPTCHA_MIN_SCORE = 0.5;

function json(body: ContactResponse, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}

async function verifyRecaptcha(token: string): Promise<boolean> {
  if (import.meta.env.DEV) return true;

  const secret = RECAPTCHA_SECRET_KEY;
  if (!token || !secret) return false;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5_000);

  try {
    const response = await fetch(
      "https://www.google.com/recaptcha/api/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ secret, response: token }),
        signal: controller.signal,
      },
    );

    if (!response.ok) return false;

    const result = (await response.json()) as RecaptchaVerification;
    return (
      result.success === true &&
      result.action === "contact" &&
      typeof result.score === "number" &&
      result.score >= RECAPTCHA_MIN_SCORE
    );
  } catch {
    return false;
  } finally {
    clearTimeout(timeout);
  }
}

export const POST: APIRoute = async ({ request }) => {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return json({ ok: false, code: "VALIDATION" }, 400);
  }

  // Fuente de verdad de la validación: el schema de Zod (src/services/contactValidate.ts).
  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    subject: formData.get("subject"),
    message: formData.get("message"),
  });
  if (!parsed.success) {
    return json({ ok: false, code: "VALIDATION" }, 400);
  }

  // Único anti-spam: reCAPTCHA v3. En desarrollo verifyRecaptcha() devuelve true.
  const token = formData.get("recaptcha_token");
  if (!(await verifyRecaptcha(typeof token === "string" ? token : ""))) {
    return json({ ok: false, code: "SPAM" }, 400);
  }

  const lang = formData.get("lang") === "en" ? "en" : "es";
  const data = parsed.data;
  const safe = {
    name: escapeHtml(data.name),
    email: escapeHtml(data.email),
    subject: escapeHtml(data.subject),
    message: escapeHtml(data.message),
  };

  try {
    const notification = await resend.emails.send({
      from: "Portfolio Contact <hola@rodrigorey.info>",
      to: ["rodrigorey2005@gmail.com"],
      replyTo: data.email,
      subject: `[Portfolio] ${data.subject}`,
      html: notificationEmail({ ...safe, lang }),
    });

    if (notification.error) {
      return json({ ok: false, code: "SEND_FAILED" }, 502);
    }
  } catch {
    return json({ ok: false, code: "SEND_FAILED" }, 502);
  }

  // La respuesta de cortesía es best-effort: si falla, no cambia el éxito.
  try {
    await resend.emails.send({
      from: "Rodrigo Rey <hola@rodrigorey.info>",
      to: [data.email],
      subject: `Re: ${data.subject}`,
      html: autoReplyEmail({ name: safe.name, subject: safe.subject, lang }),
    });
  } catch {
    // No exponer ni loguear payloads del proveedor, datos del destinatario ni tokens.
  }

  return json({ ok: true, code: "SENT" }, 200);
};
