import { defineConfig, envField } from 'astro/config';
import node from "@astrojs/node";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  site: 'https://rodrigorey.info',
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
  },
  vite: {
    plugins: [tailwindcss()],
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("node_modules/three")) return "three";
            if (id.includes("node_modules/gsap")) return "gsap";
          },
        },
      },
    },
  },
  adapter: node({
    mode: "standalone",
  }),
});
