# syntax=docker/dockerfile:1
#
# Imagen de producción del portfolio (build pack "Dockerfile" en Coolify).
# server.mjs sirve el sitio que arma Astro y la API del formulario.
# Guía de despliegue: docs/deploy.md

# ---------- base: Node y el pnpm que fija package.json ----------
FROM node:24-alpine AS base
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN npm install --global --ignore-scripts "$(node -p "require('./package.json').packageManager")"

# ---------- deps: todas las dependencias, para armar el sitio ----------
FROM base AS deps
RUN pnpm install --frozen-lockfile

# ---------- prod-deps: sólo las de producción ----------
# La imagen final no lleva Playwright, Lighthouse, ESLint ni el resto de
# herramientas de desarrollo.
FROM base AS prod-deps
RUN pnpm install --frozen-lockfile --prod

# ---------- build ----------
FROM deps AS build
COPY . .
# Variable pública que Astro mete en el HTML (el captcha del formulario).
ARG PUBLIC_RECAPTCHA_SITE_KEY
RUN pnpm run build

# ---------- runtime ----------
FROM node:24-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=8080

COPY --from=prod-deps --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist
COPY --chown=node:node package.json server.mjs ./

USER node
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:' + process.env.PORT + '/api/health').then((r) => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["node", "server.mjs"]
