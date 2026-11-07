import { defineConfig, envField } from 'astro/config';
import node from "@astrojs/node";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  site: 'https://rodrigorey.info',
  // Astro 7 cambió el default a 'jsx', que borra los espacios entre elementos
  // inline (p. ej. los links del menú). `true` mantiene el HTML como en Astro 6.
  compressHTML: true,
  i18n: {
    locales: ["es", "en"],
    defaultLocale: "es",
    routing: {
      prefixDefaultLocale: true,
      // La raíz `/` la maneja src/pages/index.astro (redirección inteligente por
      // cookie + Accept-Language), así que Astro no debe instalar su propio redirect.
      redirectToDefaultLocale: false,
    },
  },
  integrations: [
    sitemap({
      filter: (page) => page !== "https://rodrigorey.info/",
      i18n: {
        defaultLocale: "es",
        locales: {
          es: "es-UY",
          en: "en-US",
        },
      },
    }),
  ],
  env: {
    schema: {
      RESEND_API_KEY: envField.string({ context: "server", access: "secret", optional: true }),
      RECAPTCHA_SECRET_KEY: envField.string({ context: "server", access: "secret", optional: true }),
      PUBLIC_RECAPTCHA_SITE_KEY: envField.string({ context: "client", access: "public", optional: true }),
    },
  },
  security: {
    checkOrigin: true,
    // El adaptador de Node sólo confía en las cabeceras Host / X-Forwarded-*
    // (las que manda Traefik en Coolify) si el dominio está en esta lista; si no,
    // las rutas SSR ven `http://localhost:3000` como URL de la petición.
    allowedDomains: [{ protocol: "https", hostname: "rodrigorey.info" }],
  },
  vite: {
    plugins: [tailwindcss()],
    build: {
      // Vite 8 empaqueta con Rolldown: `rollupOptions` pasó a `rolldownOptions`
      // y `manualChunks` quedó obsoleto en favor de `codeSplitting.groups`.
      // three y gsap van en chunks propios para que se cacheen aparte.
      rolldownOptions: {
        output: {
          codeSplitting: {
            groups: [
              { name: "three", test: /node_modules[\\/]three[\\/]/ },
              { name: "gsap", test: /node_modules[\\/]gsap[\\/]/ },
            ],
          },
        },
      },
    },
  },
  adapter: node({
    mode: "standalone",
  }),
});
