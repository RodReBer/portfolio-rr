# Portfolio de Rodrigo Rey

Portfolio bilingüe construido con Astro 6, Tailwind CSS, GSAP y Three.js. La interfaz utiliza una identidad oscura inspirada en el cubo de Rubik, rutas prerenderizadas por idioma y casos internos para cada proyecto.

## Desarrollo

Requiere Node 24 y pnpm 11 (`npm install -g pnpm@11.4.0`; la versión exacta está en `package.json`).

```bash
pnpm install
pnpm dev
```

Variables de entorno disponibles:

```dotenv
RESEND_API_KEY=
PUBLIC_RECAPTCHA_SITE_KEY=
RECAPTCHA_SECRET_KEY=
```

## Calidad

```bash
pnpm check
pnpm lint
pnpm test
pnpm test:e2e
pnpm build
```

Antes de la primera ejecución E2E, instalar los navegadores con `pnpm exec playwright install`.

Las imágenes Open Graph se regeneran con `pnpm generate:og`.

## Deploy

Corre en Coolify, y se despliega solo al mergear a `main` si el CI pasó. Cómo está armado, las variables y cómo probar la imagen: [docs/deploy.md](docs/deploy.md).
