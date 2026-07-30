// @ts-nocheck -- Node 22 executes this suite with --experimental-strip-types.
import assert from "node:assert/strict";
import test from "node:test";
import {
  getAlternatePath,
  getProject,
  getProjects,
  resolvePreferredLang,
} from "../src/data/site.ts";

test("language resolution prefers cookie, then the first Accept-Language tag", () => {
  assert.equal(resolvePreferredLang("en", "es-UY,es;q=0.9"), "en"); // la cookie manda
  assert.equal(resolvePreferredLang(undefined, "en-US,en;q=0.9,es;q=0.8"), "en"); // primer tag: en
  assert.equal(resolvePreferredLang(undefined, "es-ES,es;q=0.9,en;q=0.8"), "es"); // primer tag: es
  assert.equal(resolvePreferredLang(undefined, "fr-FR"), "es"); // desconocido -> idioma por defecto
  assert.equal(resolvePreferredLang(undefined, null), "es");
});

test("alternate paths preserve project, query and hash", () => {
  assert.equal(
    getAlternatePath("/es/projects/capdi/?from=home#overview", "en"),
    "/en/projects/capdi/?from=home#overview",
  );
  assert.equal(getAlternatePath("/", "en"), "/en/");
});

test("the four verified projects exist in both languages", () => {
  assert.equal(getProjects("es").length, 4);
  assert.equal(getProjects("en").length, 4);
  assert.equal(getProject("es", "capdi")?.website, "https://capdi.com.uy");
  assert.equal(getProject("en", "unknown"), undefined);
});
