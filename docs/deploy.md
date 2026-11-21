# Deploy de portfolio

Portfolio de Rodrigo Rey en `https://rodrigorey.info`. [`server.mjs`](../server.mjs) sirve el sitio que arma Astro (con el adaptador de Node) y la API del formulario de contacto.

Sigue el [estándar de proyectos](https://claude.ai/artifact/XN3JdENyP7rAKpgGTiToqd). Lo que no cumple está en [Excepciones](#excepciones-al-estándar).

| | |
|---|---|
| Tipo | Sitio |
| Imagen | [`Dockerfile`](../Dockerfile): `base` → `deps` / `prod-deps` → `build` → `runtime` (`node:24-alpine`, usuario `node`) |
| Puerto | `8080` |
| Health | `GET /api/health` |
| Datos | No guarda datos |
| Mails | Resend + reCAPTCHA, desde el servidor |
| Coolify | proyecto `portfolio`, app `portfolio`, build pack Dockerfile, 512 MB y 1 CPU |
| Dominios | `https://rodrigorey.info` y `https://www.rodrigorey.info` |

## Cómo llega a producción

1. Cada cambio va en su rama y entra a `main` por PR. `main` está protegida: no acepta push directo y pide el CI en verde.
2. El CI ([`.github/workflows/ci.yml`](../.github/workflows/ci.yml)) revisa el código y prueba la imagen: la construye, la levanta y espera a que su `HEALTHCHECK` dé sano.
3. En `main`, si todo pasó, el job `deploy` le pide el deploy a Coolify y espera a que termine. Coolify no despliega solo: el auto-deploy está apagado.
4. Coolify construye la imagen, levanta el contenedor nuevo y le pasa el tráfico cuando el health responde. Si no responde, sigue el anterior.

- **Secrets del repo:** `COOLIFY_TOKEN` (token `ci-deploy` de Coolify, con permisos de deploy y lectura) y `COOLIFY_DEPLOY_URL`.
- **Volver atrás:** revertir el PR (el CI despliega la versión anterior) o, en un apuro, **Rollback** en el panel de Coolify.
- **Volver a desplegar sin cambios:** **Redeploy** en el panel de Coolify.

## Variables

Se cargan en Coolify, en **Environment Variables**. Los secretos van sólo en runtime; en build sólo lo público, que queda dentro de lo que descarga el navegador. Los nombres y ejemplos sin valores reales están en [`.env.example`](../.env.example).

| Variable | Build | Runtime | Para qué |
|---|---|---|---|
| `PUBLIC_RECAPTCHA_SITE_KEY` | sí | sí | Clave pública de reCAPTCHA, va en el HTML |
| `RECAPTCHA_SECRET_KEY` | no | sí | Clave privada de reCAPTCHA, para verificar el captcha en el servidor |
| `RESEND_API_KEY` | no | sí | Clave de Resend |

## Datos y backups

No hay nada que respaldar: todo el sitio sale del repo.

## Probar la imagen en local

```bash
docker build -t portfolio --build-arg PUBLIC_RECAPTCHA_SITE_KEY=... .
docker run --rm -p 8080:8080 --env-file .env portfolio
```

Y abrir http://localhost:8080.

## Excepciones al estándar

- Las variables de mails todavía no tienen los nombres del estándar (`MAIL_FROM`, `MAIL_TO`). Se unifican en la fase 4.
