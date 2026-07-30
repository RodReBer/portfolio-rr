import { mkdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUTPUT_DIRECTORY = path.join(ROOT, "public", "og");
const FONT_PATH = path.join(
  ROOT,
  "node_modules",
  "@fontsource-variable",
  "onest",
  "files",
  "onest-latin-wght-normal.woff2",
);
const PORTRAIT_PATH = path.join(ROOT, "src", "assets", "perfil.jpg");

const COLORS = {
  canvas: "#08090D",
  panel: "#12141A",
  elevated: "#1A1D24",
  border: "#2A2E37",
  ink: "#F6F3EA",
  muted: "#A9AFBA",
  white: "#F6F3EA",
  yellow: "#FFD500",
  red: "#D72C2C",
  orange: "#FF6B1A",
  blue: "#0057B8",
  green: "#009B5A",
};

const COPY = {
  es: {
    locale: "ES",
    eyebrow: "PORTFOLIO · 2026",
    lineOne: "Desarrollador web",
    lineTwo: "y de software",
    experience: "+4 años de experiencia",
  },
  en: {
    locale: "EN",
    eyebrow: "PORTFOLIO · 2026",
    lineOne: "Web & software",
    lineTwo: "developer",
    experience: "4+ years of experience",
  },
};

function escapeXml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function point([x, y]) {
  return `${x},${y}`;
}

function add([x1, y1], [x2, y2]) {
  return [x1 + x2, y1 + y2];
}

function scale([x, y], factor) {
  return [x * factor, y * factor];
}

function createFace(origin, horizontal, vertical, colors) {
  const tiles = [];

  for (let row = 0; row < 3; row += 1) {
    for (let column = 0; column < 3; column += 1) {
      const start = add(
        origin,
        add(scale(horizontal, column), scale(vertical, row)),
      );
      const corners = [
        start,
        add(start, horizontal),
        add(add(start, horizontal), vertical),
        add(start, vertical),
      ];
      const color = colors[row * 3 + column];

      tiles.push(
        `<polygon points="${corners.map(point).join(" ")}" fill="${color}" stroke="#050608" stroke-width="9" stroke-linejoin="round" />`,
      );
    }
  }

  return tiles.join("");
}

function createSmallMark() {
  const colors = [
    COLORS.yellow,
    COLORS.blue,
    COLORS.red,
    COLORS.green,
    COLORS.white,
    COLORS.orange,
    COLORS.blue,
    COLORS.yellow,
    COLORS.green,
  ];

  return colors
    .map((color, index) => {
      const column = index % 3;
      const row = Math.floor(index / 3);
      return `<rect x="${72 + column * 14}" y="${76 + row * 14}" width="11" height="11" rx="2" fill="${color}" />`;
    })
    .join("");
}

function createCube() {
  const top = createFace(
    [900, 72],
    [68, 39],
    [-68, 39],
    [
      COLORS.yellow,
      COLORS.blue,
      COLORS.red,
      COLORS.green,
      COLORS.white,
      COLORS.orange,
      COLORS.blue,
      COLORS.yellow,
      COLORS.green,
    ],
  );
  const left = createFace(
    [696, 189],
    [68, 39],
    [0, 78],
    [
      COLORS.green,
      COLORS.orange,
      COLORS.white,
      COLORS.red,
      COLORS.blue,
      COLORS.yellow,
      COLORS.orange,
      COLORS.white,
      COLORS.red,
    ],
  );
  const right = createFace(
    [900, 306],
    [68, -39],
    [0, 78],
    [
      COLORS.red,
      COLORS.blue,
      COLORS.yellow,
      COLORS.orange,
      COLORS.green,
      COLORS.white,
      COLORS.yellow,
      COLORS.red,
      COLORS.blue,
    ],
  );

  return `<g filter="url(#cube-shadow)">${top}${left}${right}</g>`;
}

function createSvg(lang, fontBase64, portraitBase64) {
  const copy = COPY[lang];

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
      <defs>
        <style>
          @font-face {
            font-family: "Onest";
            src: url("data:font/woff2;base64,${fontBase64}") format("woff2");
            font-weight: 100 900;
          }
          text { font-family: "Onest", "Segoe UI", sans-serif; }
        </style>
        <pattern id="grid" width="72" height="72" patternUnits="userSpaceOnUse">
          <path d="M72 0H0V72" fill="none" stroke="#F6F3EA" stroke-opacity="0.035" stroke-width="1" />
        </pattern>
        <radialGradient id="blue-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0" stop-color="${COLORS.blue}" stop-opacity="0.30" />
          <stop offset="1" stop-color="${COLORS.blue}" stop-opacity="0" />
        </radialGradient>
        <radialGradient id="green-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0" stop-color="${COLORS.green}" stop-opacity="0.18" />
          <stop offset="1" stop-color="${COLORS.green}" stop-opacity="0" />
        </radialGradient>
        <filter id="cube-shadow" x="-40%" y="-40%" width="180%" height="200%">
          <feDropShadow dx="0" dy="28" stdDeviation="24" flood-color="#000000" flood-opacity="0.55" />
        </filter>
        <filter id="soft-shadow" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="12" stdDeviation="14" flood-color="#000000" flood-opacity="0.42" />
        </filter>
        <clipPath id="portrait-clip"><rect x="137" y="67" width="58" height="58" rx="10" /></clipPath>
      </defs>

      <rect width="1200" height="630" fill="${COLORS.canvas}" />
      <rect width="1200" height="630" fill="url(#grid)" />
      <ellipse cx="916" cy="298" rx="330" ry="310" fill="url(#blue-glow)" />
      <ellipse cx="162" cy="620" rx="310" ry="215" fill="url(#green-glow)" />

      <g filter="url(#soft-shadow)">
        <rect x="63" y="67" width="59" height="59" rx="10" fill="#050608" stroke="${COLORS.border}" stroke-width="2" />
        ${createSmallMark()}
      </g>
      <image href="data:image/jpeg;base64,${portraitBase64}" x="137" y="67" width="58" height="58" preserveAspectRatio="xMidYMid slice" clip-path="url(#portrait-clip)" />
      <rect x="137" y="67" width="58" height="58" rx="10" fill="none" stroke="${COLORS.border}" stroke-width="2" />

      <text x="215" y="92" fill="${COLORS.ink}" font-size="24" font-weight="760">Rodrigo Rey</text>
      <text x="215" y="119" fill="${COLORS.muted}" font-size="16" font-weight="560">Montevideo · Uruguay</text>

      <rect x="72" y="181" width="13" height="13" rx="2" fill="${COLORS.yellow}" stroke="#050608" stroke-width="3" />
      <text x="98" y="193" fill="${COLORS.muted}" font-size="15" font-weight="720" letter-spacing="2.4">${escapeXml(copy.eyebrow)}</text>

      <text x="68" y="285" fill="${COLORS.ink}" font-size="58" font-weight="790" letter-spacing="-2.5">${escapeXml(copy.lineOne)}</text>
      <text x="68" y="353" fill="${COLORS.ink}" font-size="58" font-weight="790" letter-spacing="-2.5">${escapeXml(copy.lineTwo)}</text>

      <rect x="68" y="399" width="285" height="51" rx="10" fill="${COLORS.panel}" stroke="${COLORS.border}" stroke-width="2" />
      <rect x="84" y="416" width="17" height="17" rx="3" fill="${COLORS.green}" stroke="#050608" stroke-width="3" />
      <text x="116" y="432" fill="${COLORS.ink}" font-size="18" font-weight="680">${escapeXml(copy.experience)}</text>

      <line x1="68" y1="517" x2="580" y2="517" stroke="${COLORS.border}" stroke-width="2" />
      <text x="68" y="562" fill="${COLORS.ink}" font-size="21" font-weight="690">rodrigorey.info</text>
      <text x="546" y="562" fill="${COLORS.muted}" font-size="15" font-weight="720" text-anchor="end" letter-spacing="2">${copy.locale}</text>

      ${createCube()}
    </svg>
  `;
}

await mkdir(OUTPUT_DIRECTORY, { recursive: true });
const [fontBuffer, portraitBuffer] = await Promise.all([
  readFile(FONT_PATH),
  readFile(PORTRAIT_PATH),
]);
const fontBase64 = fontBuffer.toString("base64");
const portraitBase64 = portraitBuffer.toString("base64");

for (const lang of Object.keys(COPY)) {
  const outputPath = path.join(OUTPUT_DIRECTORY, `portfolio-${lang}.png`);
  await sharp(Buffer.from(createSvg(lang, fontBase64, portraitBase64)))
    .png({ compressionLevel: 9, palette: false })
    .toFile(outputPath);

  const metadata = await sharp(outputPath).metadata();
  if (metadata.format !== "png" || metadata.width !== 1200 || metadata.height !== 630) {
    throw new Error(`Invalid OG image generated at ${outputPath}`);
  }

  console.log(`Generated ${path.relative(ROOT, outputPath)} (1200x630)`);
}
