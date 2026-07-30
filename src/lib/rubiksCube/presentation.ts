import { Quaternion, Vector3 } from "three";

/**
 * Semantic stops in the home-page story. The names deliberately describe
 * content rather than colors so the visual mapping stays centralized here.
 */
export type CubeSectionFocus =
  | "hero"
  | "projects"
  | "experience"
  | "about"
  | "contact"
  | "footer";

export const CUBE_CAMERA_POSITION = [4.2, 3.8, 5.7] as const;

/**
 * Local normals of the face that represents each section:
 * projects/blue (B), experience/green (F), about/orange (L), contact/yellow
 * (D). Hero keeps the neutral isometric pose instead of privileging one face.
 */
export const CUBE_SECTION_FACE_NORMALS = {
  hero: null,
  projects: [0, 0, -1],
  experience: [0, 0, 1],
  about: [-1, 0, 0],
  contact: [0, -1, 0],
  footer: null,
} as const satisfies Record<
  CubeSectionFocus,
  readonly [number, number, number] | null
>;

const SECTION_FACE_UP = {
  projects: [0, 1, 0],
  experience: [0, 1, 0],
  about: [0, 1, 0],
  // On the down face, local +Z reads as "up" when viewed head-on.
  contact: [0, 0, 1],
} as const satisfies Record<
  Exclude<CubeSectionFocus, "hero" | "footer">,
  readonly [number, number, number]
>;

const WORLD_UP = new Vector3(0, 1, 0);
const CAMERA_VIEW_AXIS_VECTOR = new Vector3(...CUBE_CAMERA_POSITION).normalize();
const CAMERA_UP = WORLD_UP.clone()
  .addScaledVector(
    CAMERA_VIEW_AXIS_VECTOR,
    -WORLD_UP.dot(CAMERA_VIEW_AXIS_VECTOR),
  )
  .normalize();
const CAMERA_RIGHT = new Vector3()
  .crossVectors(CAMERA_UP, CAMERA_VIEW_AXIS_VECTOR)
  .normalize();

/*
 * Aim the featured face slightly off-axis. A perfectly head-on face would
 * flatten the cube into a square; this small cone keeps two adjacent faces
 * visible while still making the section color unmistakably dominant.
 */
const DOMINANT_VIEW_DIRECTION_VECTOR = CAMERA_VIEW_AXIS_VECTOR.clone()
  .addScaledVector(CAMERA_RIGHT, -0.26)
  .addScaledVector(CAMERA_UP, 0.18)
  .normalize();

export const CUBE_CAMERA_VIEW_DIRECTION = [
  CAMERA_VIEW_AXIS_VECTOR.x,
  CAMERA_VIEW_AXIS_VECTOR.y,
  CAMERA_VIEW_AXIS_VECTOR.z,
] as const;

export const CUBE_DOMINANT_VIEW_DIRECTION = [
  DOMINANT_VIEW_DIRECTION_VECTOR.x,
  DOMINANT_VIEW_DIRECTION_VECTOR.y,
  DOMINANT_VIEW_DIRECTION_VECTOR.z,
] as const;

const FOCUS_NAMES = new Set<CubeSectionFocus>([
  "hero",
  "projects",
  "experience",
  "about",
  "contact",
  "footer",
]);

function assertFocus(value: CubeSectionFocus): void {
  if (!FOCUS_NAMES.has(value)) {
    throw new RangeError(`Unknown cube section focus: ${String(value)}`);
  }
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function smoothstep(value: number): number {
  const t = clamp01(value);
  return t * t * (3 - 2 * t);
}

function quaternionForFace(
  normalTuple: readonly [number, number, number],
  upTuple: readonly [number, number, number],
): Quaternion {
  const normal = new Vector3(...normalTuple).normalize();
  const localUp = new Vector3(...upTuple).normalize();
  const alignment = new Quaternion().setFromUnitVectors(
    normal,
    DOMINANT_VIEW_DIRECTION_VECTOR,
  );

  // Remove roll introduced by setFromUnitVectors so every featured face has
  // a stable, editorially upright starting pose.
  const currentUp = localUp.applyQuaternion(alignment);
  currentUp
    .addScaledVector(
      DOMINANT_VIEW_DIRECTION_VECTOR,
      -currentUp.dot(DOMINANT_VIEW_DIRECTION_VECTOR),
    )
    .normalize();
  const desiredUp = CAMERA_UP.clone()
    .addScaledVector(
      DOMINANT_VIEW_DIRECTION_VECTOR,
      -CAMERA_UP.dot(DOMINANT_VIEW_DIRECTION_VECTOR),
    )
    .normalize();
  const cross = currentUp.clone().cross(desiredUp);
  const signedAngle =
    currentUp.angleTo(desiredUp)
    * Math.sign(cross.dot(DOMINANT_VIEW_DIRECTION_VECTOR) || 1);
  const rollCorrection = new Quaternion().setFromAxisAngle(
    DOMINANT_VIEW_DIRECTION_VECTOR,
    signedAngle,
  );

  return rollCorrection.multiply(alignment).normalize();
}

const SECTION_QUATERNIONS: Record<CubeSectionFocus, Quaternion> = {
  hero: new Quaternion(),
  projects: quaternionForFace(
    CUBE_SECTION_FACE_NORMALS.projects,
    SECTION_FACE_UP.projects,
  ),
  experience: quaternionForFace(
    CUBE_SECTION_FACE_NORMALS.experience,
    SECTION_FACE_UP.experience,
  ),
  about: quaternionForFace(
    CUBE_SECTION_FACE_NORMALS.about,
    SECTION_FACE_UP.about,
  ),
  contact: quaternionForFace(
    CUBE_SECTION_FACE_NORMALS.contact,
    SECTION_FACE_UP.contact,
  ),
  footer: new Quaternion(),
};

/**
 * Writes a deterministic section pose into `target`.
 *
 * Supplying both endpoints instead of retaining a "previous" orientation is
 * what makes reverse scrolling exact and prevents accumulated quaternion
 * drift. The blend is clamped and eased, while non-finite input is rejected
 * before the caller mutates live scene state.
 */
export function writeCubeSectionFocusQuaternion(
  target: Quaternion,
  from: CubeSectionFocus,
  to: CubeSectionFocus,
  blend: number,
): Quaternion {
  assertFocus(from);
  assertFocus(to);
  if (!Number.isFinite(blend)) {
    throw new TypeError("Cube section focus blend must be a finite number");
  }
  return target
    .copy(SECTION_QUATERNIONS[from])
    .slerp(SECTION_QUATERNIONS[to], smoothstep(blend))
    .normalize();
}
