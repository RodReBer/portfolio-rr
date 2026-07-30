// @ts-nocheck -- Node 22 executes this suite with --experimental-strip-types.
import assert from "node:assert/strict";
import test from "node:test";
import { contactSchema, escapeHtml } from "../src/services/contactValidate.ts";

const CR = String.fromCharCode(13);
const LF = String.fromCharCode(10);

function validInput(overrides = {}) {
  return {
    name: "  Ada Lovelace  ",
    email: "ada@example.com",
    subject: "New website",
    message: "I would like to discuss a new website.",
    ...overrides,
  };
}

test("valida y normaliza (trim) un formulario completo", () => {
  const result = contactSchema.safeParse(validInput());
  assert.equal(result.success, true);
  assert.equal(result.data.name, "Ada Lovelace");
});

test("rechaza campos vacíos, cortos y email inválido", () => {
  const result = contactSchema.safeParse(
    validInput({ name: " ", email: "not-an-email", subject: "x", message: "short" }),
  );
  assert.equal(result.success, false);
  const fieldErrors = result.error.flatten().fieldErrors;
  assert.ok(fieldErrors.name);
  assert.ok(fieldErrors.email);
  assert.ok(fieldErrors.subject);
  assert.ok(fieldErrors.message);
});

test("no convierte archivos (File) a string", () => {
  const result = contactSchema.safeParse(validInput({ name: new Blob(["Ada"]) }));
  assert.equal(result.success, false);
  assert.ok(result.error.flatten().fieldErrors.name);
});

test("rechaza saltos de línea en el asunto (anti-inyección de headers)", () => {
  const result = contactSchema.safeParse(
    validInput({ subject: "Hello" + CR + LF + "Bcc: victim@example.com" }),
  );
  assert.equal(result.success, false);
  assert.ok(result.error.flatten().fieldErrors.subject);
});

test("permite saltos de línea dentro del cuerpo del mensaje", () => {
  const result = contactSchema.safeParse(
    validInput({ message: "Primera línea" + LF + "Segunda línea, ya bastante larga." }),
  );
  assert.equal(result.success, true);
});

test("escapa el HTML interpolado en los emails", () => {
  assert.equal(
    escapeHtml(`<script data-name="O'Reilly">&</script>`),
    "&lt;script data-name=&quot;O&#039;Reilly&quot;&gt;&amp;&lt;/script&gt;",
  );
});
