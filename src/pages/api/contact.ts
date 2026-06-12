import type { APIRoute } from "astro";
import { Resend } from "resend";
import { notificationEmail } from "../../emails/notification";
import { autoReplyEmail } from "../../emails/autoreply";

export const prerender = false;

const resend = new Resend(import.meta.env.RESEND_API_KEY);
const RECAPTCHA_SECRET = import.meta.env.RECAPTCHA_SECRET_KEY;
const RECAPTCHA_MIN_SCORE = 0.5;

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export const POST: APIRoute = async ({ request }) => {
  const formData = await request.formData();

  const name = formData.get("Name") as string;
  const email = formData.get("Email") as string;
  const subject = formData.get("Subject") as string;
  const message = formData.get("Message") as string;
  const honey = formData.get("_hp_trap") as string;
  const recaptchaToken = formData.get("recaptcha_token") as string;
  const lang = (formData.get("lang") as string) === "es" ? "es" : "en";

  console.log("[contact] fields received:", {
    name: !!name,
    email: !!email,
    subject: !!subject,
    message: !!message,
    honey: !!honey,
    recaptchaToken: recaptchaToken ? `${recaptchaToken.slice(0, 20)}...` : "EMPTY",
  });

  if (honey) {
    console.log("[contact] blocked: honeypot filled");
    return new Response(JSON.stringify({ message: "Spam detected" }), {
      status: 400,
    });
  }

  if (!import.meta.env.DEV) {
    if (!recaptchaToken) {
      console.log("[contact] blocked: recaptcha token missing");
      return new Response(
        JSON.stringify({ message: "reCAPTCHA token missing" }),
        { status: 400 },
      );
    }

    const verifyRes = await fetch(
      "https://www.google.com/recaptcha/api/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          secret: RECAPTCHA_SECRET,
          response: recaptchaToken,
        }),
      },
    );
    const verifyData = await verifyRes.json();
    console.log("[contact] recaptcha result:", verifyData);

    if (
      !verifyData.success ||
      verifyData.action !== "contact" ||
      verifyData.score < RECAPTCHA_MIN_SCORE
    ) {
      return new Response(
        JSON.stringify({ message: "reCAPTCHA verification failed" }),
        { status: 400 },
      );
    }
  } else {
    console.log("[contact] DEV mode: skipping reCAPTCHA verification");
  }

  if (!name || !email || !subject || !message) {
    return new Response(
      JSON.stringify({ message: "Missing required fields" }),
      { status: 400 },
    );
  }

  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeSubject = escapeHtml(subject);
  const safeMessage = escapeHtml(message);

  const notificationHtml = notificationEmail({ name: safeName, email: safeEmail, subject: safeSubject, message: safeMessage, lang });
  const autoReplyHtml = autoReplyEmail({ name: safeName, subject: safeSubject, lang });

  const [notifResult, autoReplyResult] = await Promise.all([
    resend.emails.send({
      from: "Portfolio Contact <hola@rodrigorey.info>",
      to: ["rodrigorey2005@gmail.com"],
      subject: `New Message: ${subject}`,
      html: notificationHtml,
    }),
    resend.emails.send({
      from: "Rodrigo Rey <hola@rodrigorey.info>",
      to: [email],
      subject: `Start of something great! - Re: ${subject}`,
      html: autoReplyHtml,
    }),
  ]);

  if (notifResult.error) {
    console.error("Resend error:", notifResult.error);
    return new Response(
      JSON.stringify({ message: "Failed to send email." }),
      { status: 500 },
    );
  }

  return new Response(
    JSON.stringify({ message: "Message sent successfully" }),
    { status: 200 },
  );
};
