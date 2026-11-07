import type { APIRoute } from "astro";

// Lo consulta el HEALTHCHECK del Dockerfile (y sirve para monitoreo externo).
export const prerender = false;

export const GET: APIRoute = () =>
  new Response(JSON.stringify({ ok: true }), {
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "application/json; charset=utf-8",
    },
  });
