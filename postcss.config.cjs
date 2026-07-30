// Tailwind ahora lo procesa el plugin @tailwindcss/vite (ver astro.config.mjs).
// PostCSS queda solo con autoprefixer para prefijar el CSS escrito a mano
// (p. ej. -webkit-backdrop-filter / -webkit-mask-image en Safari).
module.exports = { plugins: { autoprefixer: {} } };
