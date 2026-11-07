// Servidor de producción (lo usa el Dockerfile).
//
// Envuelve el handler del adaptador de Node de Astro, que sirve tanto las
// páginas pre-generadas como las rutas SSR y los archivos estáticos, para
// agregar las cabeceras de seguridad a TODAS las respuestas. El middleware de
// Astro no alcanza: las páginas pre-generadas no pasan por él.
import http from "node:http";

// Que dist/server/entry.mjs no levante su propio servidor al importarlo.
process.env.ASTRO_NODE_AUTOSTART = "disabled";
const { handler } = await import("./dist/server/entry.mjs");

const SECURITY_HEADERS = {
  "Strict-Transport-Security": "max-age=31536000",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Frame-Options": "SAMEORIGIN",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
};

const port = Number(process.env.PORT ?? 3000);
const host = process.env.HOST ?? "0.0.0.0";

http
  .createServer((req, res) => {
    for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
      res.setHeader(name, value);
    }
    handler(req, res);
  })
  .listen(port, host, () => {
    console.log(`Servidor escuchando en http://${host}:${port}`);
  });
