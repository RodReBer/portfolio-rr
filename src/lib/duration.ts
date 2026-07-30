// Duración de una experiencia en años/meses. Se usa en el servidor (valor
// inicial, la home es estática) y en el cliente, para que el conteo se
// actualice solo con el paso del tiempo sin tener que editar nada.
//
// El import de `Lang` es solo de tipo: se borra al compilar, así que este
// módulo puede entrar al bundle del navegador sin arrastrar todo `site.ts`.
import type { Lang } from "../data/site";

type YearMonth = { year: number; month: number };

const DURATION_UNITS: Record<Lang, { year: [string, string]; month: [string, string] }> = {
  es: { year: ["año", "años"], month: ["mes", "meses"] },
  en: { year: ["year", "years"], month: ["month", "months"] },
};

function parseYearMonth(value: string): YearMonth {
  const [year, month] = value.split("-");
  return { year: Number(year), month: Number(month) };
}

// Meses entre inicio y fin (o "ahora" si sigue vigente). Julio 2025 a julio 2026
// da 12 meses = 1 año, que es como se cuenta la antigüedad en un CV.
function monthsElapsed(start: string, end: string | null, now: Date): number {
  const from = parseYearMonth(start);
  const to = end ? parseYearMonth(end) : { year: now.getFullYear(), month: now.getMonth() + 1 };
  return (to.year - from.year) * 12 + (to.month - from.month);
}

// "1 año", "2 años 3 meses", "5 meses". Vacío si todavía no cumplió un mes (por
// ejemplo, un puesto que arranca el mes que viene): ahí solo se muestra el rango.
export function formatDuration(
  start: string,
  end: string | null,
  lang: Lang,
  now: Date = new Date(),
): string {
  const total = monthsElapsed(start, end, now);
  if (total < 1) return "";

  const years = Math.floor(total / 12);
  const months = total % 12;
  const units = DURATION_UNITS[lang];
  const parts: string[] = [];
  if (years > 0) parts.push(`${years} ${units.year[years === 1 ? 0 : 1]}`);
  if (months > 0) parts.push(`${months} ${units.month[months === 1 ? 0 : 1]}`);
  return parts.join(" ");
}

// "jul 2025" / "Jul 2025" según el idioma. Intl resuelve el nombre del mes, así
// que no hace falta mantener tablas de meses a mano.
export function formatMonthYear(value: string, lang: Lang): string {
  const { year, month } = parseYearMonth(value);
  return new Intl.DateTimeFormat(lang, { month: "short", year: "numeric" }).format(
    new Date(year, month - 1, 1),
  );
}
