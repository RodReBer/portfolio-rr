/**
 * Cheap device heuristics used to pick a rendering quality tier for the
 * cube. There's no perfect signal for "this GPU is slow", so we combine a
 * few weak ones and only drop to a lower tier when more than one agrees.
 */

export type QualityTier = "high" | "medium" | "low";

export type LightPreset = "full" | "reduced" | "minimal";

export interface QualitySettings {
  pixelRatio: number;
  antialias: boolean;
  lightPreset: LightPreset;
}

export function getQualityTier(): QualityTier {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return "high";
  }

  const deviceMemory = (navigator as Navigator & { deviceMemory?: number })
    .deviceMemory;
  const cores = navigator.hardwareConcurrency ?? 8;
  const coarsePointer =
    window.matchMedia?.("(pointer: coarse)").matches ?? false;
  const smallScreen = (window.screen?.width ?? 1024) < 480;

  let weakSignals = 0;
  if (deviceMemory !== undefined && deviceMemory < 4) weakSignals++;
  if (cores <= 4) weakSignals++;
  if (coarsePointer) weakSignals++;
  if (smallScreen) weakSignals++;

  if (weakSignals >= 3) return "low";
  if (weakSignals >= 1) return "medium";
  return "high";
}

export function getQualitySettings(tier: QualityTier): QualitySettings {
  const dpr = typeof window === "undefined" ? 1 : window.devicePixelRatio || 1;

  switch (tier) {
    case "low":
      return { pixelRatio: 1, antialias: false, lightPreset: "minimal" };
    case "medium":
      return {
        pixelRatio: Math.min(dpr, 1.5),
        antialias: true,
        lightPreset: "reduced",
      };
    default:
      return {
        pixelRatio: Math.min(dpr, 2),
        antialias: true,
        lightPreset: "full",
      };
  }
}
