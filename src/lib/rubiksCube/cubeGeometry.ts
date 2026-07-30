import * as THREE from "three";
import type { Axis, CubeState, CubieOrientation } from "./cubeState";
import { solvedPositionForId } from "./cubeState";

export const CUBIE_SIZE = 0.95;
export const STICKER_SIZE = CUBIE_SIZE * 0.82;
const SPACING = 1;

interface FaceDef {
  axis: Axis;
  dir: 1 | -1;
  normal: THREE.Vector3;
  color: number;
}

// Conventional Rubik opposite pairs, matched to the site's shared palette.
const STICKER_COLORS = {
  U: 0xf6f3ea,
  D: 0xffd500,
  R: 0xd72c2c,
  L: 0xff6b1a,
  F: 0x009b5a,
  B: 0x0057b8,
};

const FACES: FaceDef[] = [
  { axis: "x", dir: 1, normal: new THREE.Vector3(1, 0, 0), color: STICKER_COLORS.R },
  { axis: "x", dir: -1, normal: new THREE.Vector3(-1, 0, 0), color: STICKER_COLORS.L },
  { axis: "y", dir: 1, normal: new THREE.Vector3(0, 1, 0), color: STICKER_COLORS.U },
  { axis: "y", dir: -1, normal: new THREE.Vector3(0, -1, 0), color: STICKER_COLORS.D },
  { axis: "z", dir: 1, normal: new THREE.Vector3(0, 0, 1), color: STICKER_COLORS.F },
  { axis: "z", dir: -1, normal: new THREE.Vector3(0, 0, -1), color: STICKER_COLORS.B },
];

const AXIS_INDEX: Record<Axis, 0 | 1 | 2> = { x: 0, y: 1, z: 2 };

export interface StickerUserData {
  cubieId: number;
  axis: Axis;
  dir: 1 | -1;
}

export interface CubeAssets {
  bodyGeometry: THREE.BoxGeometry;
  bodyMaterial: THREE.MeshStandardMaterial;
  stickerGeometry: THREE.PlaneGeometry;
  stickerMaterials: Map<number, THREE.MeshStandardMaterial>;
  dispose(): void;
}

export function createCubeAssets(): CubeAssets {
  const bodyGeometry = new THREE.BoxGeometry(CUBIE_SIZE, CUBIE_SIZE, CUBIE_SIZE);
  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: 0x08090d,
    roughness: 0.5,
    metalness: 0.12,
  });

  const stickerGeometry = new THREE.PlaneGeometry(STICKER_SIZE, STICKER_SIZE);
  const stickerMaterials = new Map<number, THREE.MeshStandardMaterial>();
  for (const face of FACES) {
    if (!stickerMaterials.has(face.color)) {
      stickerMaterials.set(
        face.color,
        new THREE.MeshStandardMaterial({
          color: face.color,
          roughness: 0.3,
          metalness: 0.05,
        }),
      );
    }
  }

  return {
    bodyGeometry,
    bodyMaterial,
    stickerGeometry,
    stickerMaterials,
    dispose() {
      bodyGeometry.dispose();
      bodyMaterial.dispose();
      stickerGeometry.dispose();
      stickerMaterials.forEach((material) => material.dispose());
      stickerMaterials.clear();
    },
  };
}

export interface BuiltCube {
  cubeGroup: THREE.Group;
  cubieMap: Map<number, THREE.Group>;
  stickerMeshes: THREE.Mesh[];
}

function orientationMatrix(orientation: CubieOrientation): THREE.Matrix4 {
  const [xAxis, yAxis, zAxis] = orientation;
  return new THREE.Matrix4().makeBasis(
    new THREE.Vector3(...xAxis),
    new THREE.Vector3(...yAxis),
    new THREE.Vector3(...zAxis),
  );
}

/** Applies the exact logical transform, removing animation drift after turns. */
export function syncCubieTransforms(
  state: CubeState,
  cubieMap: Map<number, THREE.Group>,
): void {
  for (const cubie of state) {
    const mesh = cubieMap.get(cubie.id);
    if (!mesh) continue;
    mesh.position.set(...cubie.position).multiplyScalar(SPACING);
    mesh.quaternion.setFromRotationMatrix(orientationMatrix(cubie.orientation));
    mesh.scale.setScalar(1);
    mesh.updateMatrix();
  }
}

export function buildCubies(state: CubeState, assets: CubeAssets): BuiltCube {
  const cubeGroup = new THREE.Group();
  const cubieMap = new Map<number, THREE.Group>();
  const stickerMeshes: THREE.Mesh[] = [];

  for (const cubie of state) {
    const [x, y, z] = cubie.position;
    if (x === 0 && y === 0 && z === 0) continue; // fully-internal, no mesh

    const cubieGroup = new THREE.Group();
    cubieGroup.position.set(x * SPACING, y * SPACING, z * SPACING);
    cubieGroup.quaternion.setFromRotationMatrix(
      orientationMatrix(cubie.orientation),
    );

    const body = new THREE.Mesh(assets.bodyGeometry, assets.bodyMaterial);
    cubieGroup.add(body);

    const solvedPosition = solvedPositionForId(cubie.id);
    for (const face of FACES) {
      if (solvedPosition[AXIS_INDEX[face.axis]] !== face.dir) continue;

      const material = assets.stickerMaterials.get(face.color)!;
      const sticker = new THREE.Mesh(assets.stickerGeometry, material);
      sticker.position.copy(face.normal).multiplyScalar(CUBIE_SIZE / 2 + 0.001);
      sticker.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), face.normal);
      sticker.userData = {
        cubieId: cubie.id,
        axis: face.axis,
        dir: face.dir,
      } satisfies StickerUserData;

      cubieGroup.add(sticker);
      stickerMeshes.push(sticker);
    }

    cubeGroup.add(cubieGroup);
    cubieMap.set(cubie.id, cubieGroup);
  }

  return { cubeGroup, cubieMap, stickerMeshes };
}

/**
 * Reparents the given cubies into a fresh temporary group (preserving their
 * world transforms) so the group's rotation can be animated as one unit for
 * a layer turn. The group is added as a child of `cubeGroup`.
 */
export function beginLayerTurn(
  cubeGroup: THREE.Group,
  cubieMap: Map<number, THREE.Group>,
  cubieIds: number[],
): THREE.Group {
  const turnGroup = new THREE.Group();
  cubeGroup.add(turnGroup);
  for (const id of cubieIds) {
    const cubie = cubieMap.get(id);
    if (cubie) turnGroup.attach(cubie);
  }
  return turnGroup;
}

/**
 * Bakes the turn group's rotation into its children's transforms by
 * reparenting them back into `cubeGroup`, then discards the empty group.
 */
export function endLayerTurn(cubeGroup: THREE.Group, turnGroup: THREE.Group): void {
  for (const child of [...turnGroup.children]) {
    cubeGroup.attach(child);
  }
  cubeGroup.remove(turnGroup);
}
