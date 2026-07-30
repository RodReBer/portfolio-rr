# Portfolio de Rodrigo Rey

Portfolio bilingüe construido con Astro 6, Tailwind CSS, GSAP y Three.js. La interfaz utiliza una identidad oscura inspirada en el cubo de Rubik, rutas prerenderizadas por idioma y casos internos para cada proyecto.

## Desarrollo

Requiere Node.js 22.12 o posterior y pnpm.

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
