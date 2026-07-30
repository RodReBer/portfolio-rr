import { z } from "zod";

/**
 * Validación del formulario de contacto, en un solo lugar: esta es la fuente
 * de verdad del server. El cliente además usa la validación nativa del
 * navegador (required / minlength / type="email") para dar feedback inmediato.
 */

/**
 * Rechaza caracteres de control ASCII (códigos 0–31 y 127). Sirve para que
 * nadie pueda inyectar saltos de línea en el nombre o el asunto y colar
 * headers falsos en el email. El cuerpo del mensaje sí puede tener saltos de
 * línea y tabulaciones, así que ahí los permitimos (allowLineBreaks).
 */
function hasControlChars(value: string, allowLineBreaks = false): boolean {
  for (const char of value) {
    const code = char.codePointAt(0) ?? 0;
    const isControl = code <= 31 || code === 127;
    const isAllowedBreak =
      allowLineBreaks && (code === 9 || code === 10 || code === 13); // tab, LF, CR
    if (isControl && !isAllowedBreak) return true;
  }
  return false;
}

export const contactSchema = z.object({
  name: z.string().trim().min(2).max(80).refine((v) => !hasControlChars(v)),
  email: z.string().trim().min(3).max(254).email(),
  subject: z.string().trim().min(3).max(120).refine((v) => !hasControlChars(v)),
  message: z
    .string()
    .trim()
    .min(10)
    .max(5000)
    .refine((v) => !hasControlChars(v, true)),
});

export type ContactData = z.infer<typeof contactSchema>;

/** Escapa HTML para interpolar el contenido del visitante de forma segura en los emails. */
export function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
