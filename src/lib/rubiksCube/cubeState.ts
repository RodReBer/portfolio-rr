export type Axis = "x" | "y" | "z";

export type GridVector = [number, number, number];

/**
 * The three columns of a cubie's local-to-cube rotation matrix. Values stay
 * discrete (-1, 0 or 1), so turns cannot accumulate floating-point drift.
 */
export type CubieOrientation = [GridVector, GridVector, GridVector];

export interface Cubie {
  /** Stable identity of the physical cubie/mesh; never changes. */
  id: number;
  /** Current logical grid position, each component in {-1, 0, 1}. */
  position: GridVector;
  /** Current local X/Y/Z axes expressed in cube coordinates. */
  orientation: CubieOrientation;
}

export type CubeState = Cubie[];

export interface CubeMove {
  axis: Axis;
  layerIndex: number;
  quarterTurns: number;
}

/**
 * A deterministic presentation frame for the scroll-driven cube story.
 * `state` contains only completed quarter turns; `activeMove` and
 * `moveProgress` describe the reversible in-between turn rendered by Three.
 */
export interface CubeNarrativeFrame {
  state: CubeState;
  activeMove: CubeMove | null;
  moveProgress: number;
  explosion: number;
}

const AXIS_INDEX: Record<Axis, 0 | 1 | 2> = { x: 0, y: 1, z: 2 };
const IDENTITY_ORIENTATION: CubieOrientation = [
  [1, 0, 0],
  [0, 1, 0],
  [0, 0, 1],
];

const NARRATIVE_SCRAMBLE_START = 0.06;
const NARRATIVE_SCRAMBLE_END = 0.38;
const NARRATIVE_SOLVE_START = 0.48;
const NARRATIVE_SOLVE_END = 0.92;
const NARRATIVE_EXPLODE_START = 0.12;
const NARRATIVE_EXPLODE_END = 0.34;
const NARRATIVE_ASSEMBLE_START = 0.52;
const NARRATIVE_ASSEMBLE_END = 0.9;

/**
 * Fixed choreography used by the portfolio journey. Keeping this sequence
 * deterministic makes the visual state reversible when the user scrolls up.
 * The second half is generated from its exact inverse, so it always resolves
 * without needing a solver.
 */
export const CUBE_NARRATIVE_MOVES: readonly CubeMove[] = [
  { axis: "x", layerIndex: 1, quarterTurns: 1 },
  { axis: "y", layerIndex: -1, quarterTurns: -1 },
  { axis: "z", layerIndex: 1, quarterTurns: 1 },
  { axis: "x", layerIndex: -1, quarterTurns: -1 },
  { axis: "y", layerIndex: 1, quarterTurns: 1 },
  { axis: "z", layerIndex: -1, quarterTurns: -1 },
  { axis: "x", layerIndex: 1, quarterTurns: -1 },
  { axis: "z", layerIndex: 1, quarterTurns: 1 },
];

function createIdentityOrientation(): CubieOrientation {
  return IDENTITY_ORIENTATION.map((axis) => [...axis]) as CubieOrientation;
}

/** 27 cubies, including the fully-internal center (which has no mesh). */
export function createSolvedState(): CubeState {
  const cubies: Cubie[] = [];
  let id = 0;
  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      for (let z = -1; z <= 1; z++) {
        cubies.push({
          id: id++,
          position: [x, y, z],
          orientation: createIdentityOrientation(),
        });
      }
    }
  }
  return cubies;
}

export function getCubiesInLayer(
  state: CubeState,
  axis: Axis,
  layerIndex: number,
): number[] {
  const idx = AXIS_INDEX[axis];
  return state
    .filter((cubie) => cubie.position[idx] === layerIndex)
    .map((cubie) => cubie.id);
}

export function getCubiePosition(
  state: CubeState,
  cubieId: number,
): GridVector {
  const cubie = state.find((candidate) => candidate.id === cubieId);
  if (!cubie) throw new Error(`Unknown cubie id: ${cubieId}`);
  return cubie.position;
}

/** Rotate a grid vector by one quarter turn around `axis`. */
function rotateVectorQuarter(
  [x, y, z]: GridVector,
  axis: Axis,
  direction: 1 | -1,
): GridVector {
  if (axis === "x") return direction === 1 ? [x, -z, y] : [x, z, -y];
  if (axis === "y") return direction === 1 ? [z, y, -x] : [-z, y, x];
  return direction === 1 ? [-y, x, z] : [y, -x, z];
}

/** Canonical turn count: 0, 1, 2 or -1. */
export function normalizeQuarterTurns(quarterTurns: number): 0 | 1 | 2 | -1 {
  if (!Number.isInteger(quarterTurns)) {
    throw new TypeError("quarterTurns must be an integer");
  }
  const positive = ((quarterTurns % 4) + 4) % 4;
  return positive === 3 ? -1 : (positive as 0 | 1 | 2);
}

/**
 * Returns a new state with the requested layer rotated. Position and
 * orientation are transformed by the same exact integer rotation.
 */
export function applyTurn(
  state: CubeState,
  axis: Axis,
  layerIndex: number,
  quarterTurns: number,
): CubeState {
  const normalizedTurns = normalizeQuarterTurns(quarterTurns);
  if (normalizedTurns === 0) return state;

  const direction: 1 | -1 = normalizedTurns > 0 ? 1 : -1;
  const turns = Math.abs(normalizedTurns);
  const idx = AXIS_INDEX[axis];

  return state.map((cubie) => {
    if (cubie.position[idx] !== layerIndex) return cubie;

    let position: GridVector = cubie.position;
    let orientation: CubieOrientation = cubie.orientation;
    for (let turn = 0; turn < turns; turn++) {
      position = rotateVectorQuarter(position, axis, direction);
      orientation = orientation.map((basis) =>
        rotateVectorQuarter(basis, axis, direction),
      ) as CubieOrientation;
    }

    return { ...cubie, position, orientation };
  });
}

export function applyMoves(state: CubeState, moves: readonly CubeMove[]): CubeState {
  return moves.reduce(
    (nextState, move) =>
      applyTurn(nextState, move.axis, move.layerIndex, move.quarterTurns),
    state,
  );
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function smoothstep(value: number): number {
  const t = clamp01(value);
  return t * t * (3 - 2 * t);
}

function narrativeExplosion(progress: number): number {
  if (progress <= NARRATIVE_EXPLODE_START) return 0;
  if (progress < NARRATIVE_EXPLODE_END) {
    return smoothstep(
      (progress - NARRATIVE_EXPLODE_START) /
        (NARRATIVE_EXPLODE_END - NARRATIVE_EXPLODE_START),
    );
  }
  if (progress <= NARRATIVE_ASSEMBLE_START) return 1;
  if (progress < NARRATIVE_ASSEMBLE_END) {
    return (
      1 -
      smoothstep(
        (progress - NARRATIVE_ASSEMBLE_START) /
          (NARRATIVE_ASSEMBLE_END - NARRATIVE_ASSEMBLE_START),
      )
    );
  }
  return 0;
}

interface NarrativeMoveFrame {
  state: CubeState;
  activeMove: CubeMove | null;
  moveProgress: number;
}

function movesAtProgress(
  baseState: CubeState,
  moves: readonly CubeMove[],
  progress: number,
  start: number,
  end: number,
): NarrativeMoveFrame {
  const segmentProgress = clamp01((progress - start) / (end - start));
  const exactMoveProgress = segmentProgress * moves.length;
  const completedMoves =
    segmentProgress >= 1 ? moves.length : Math.floor(exactMoveProgress);
  const moveProgress =
    completedMoves >= moves.length ? 0 : exactMoveProgress - completedMoves;

  return {
    state: applyMoves(baseState, moves.slice(0, completedMoves)),
    activeMove:
      moveProgress > 0 && completedMoves < moves.length
        ? { ...moves[completedMoves]! }
        : null,
    moveProgress,
  };
}

/**
 * Maps any finite scroll progress to an exact, reversible cube presentation.
 * Values outside the normalised range are clamped for resilient scroll code.
 */
export function getCubeNarrativeFrame(progress: number): CubeNarrativeFrame {
  if (!Number.isFinite(progress)) {
    throw new TypeError("Narrative progress must be a finite number");
  }

  const normalizedProgress = clamp01(progress);
  const solvedState = createSolvedState();
  let moveFrame: NarrativeMoveFrame;

  if (normalizedProgress < NARRATIVE_SCRAMBLE_START) {
    moveFrame = { state: solvedState, activeMove: null, moveProgress: 0 };
  } else if (normalizedProgress <= NARRATIVE_SCRAMBLE_END) {
    moveFrame = movesAtProgress(
      solvedState,
      CUBE_NARRATIVE_MOVES,
      normalizedProgress,
      NARRATIVE_SCRAMBLE_START,
      NARRATIVE_SCRAMBLE_END,
    );
  } else {
    const scrambledState = applyMoves(solvedState, CUBE_NARRATIVE_MOVES);
    if (normalizedProgress < NARRATIVE_SOLVE_START) {
      moveFrame = {
        state: scrambledState,
        activeMove: null,
        moveProgress: 0,
      };
    } else {
      moveFrame = movesAtProgress(
        scrambledState,
        invertMoves(CUBE_NARRATIVE_MOVES),
        normalizedProgress,
        NARRATIVE_SOLVE_START,
        NARRATIVE_SOLVE_END,
      );
    }
  }

  return {
    ...moveFrame,
    explosion: narrativeExplosion(normalizedProgress),
  };
}

export function invertMove(move: CubeMove): CubeMove {
  return {
    ...move,
    quarterTurns: normalizeQuarterTurns(-move.quarterTurns),
  };
}

export function invertMoves(moves: readonly CubeMove[]): CubeMove[] {
  return [...moves].reverse().map(invertMove);
}

/** Aliases for callers that use "inverse" terminology. */
export const inverseMove = invertMove;
export const inverseMoves = invertMoves;

/** The solved grid position for a cubie id, per `createSolvedState`'s encoding. */
export function solvedPositionForId(id: number): GridVector {
  const x = Math.floor(id / 9) - 1;
  const y = (Math.floor(id / 3) % 3) - 1;
  const z = (id % 3) - 1;
  return [x, y, z];
}

function isIdentityOrientation(orientation: CubieOrientation): boolean {
  return orientation.every((axis, axisIndex) =>
    axis.every((component, componentIndex) =>
      component === IDENTITY_ORIENTATION[axisIndex]?.[componentIndex],
    ),
  );
}

export function isSolved(state: CubeState): boolean {
  if (state.length !== 27) return false;
  const seenIds = new Set<number>();
  return state.every((cubie) => {
    if (cubie.id < 0 || cubie.id > 26 || seenIds.has(cubie.id)) return false;
    seenIds.add(cubie.id);
    const solvedPosition = solvedPositionForId(cubie.id);
    return (
      cubie.position.every(
        (component, index) => component === solvedPosition[index],
      ) && isIdentityOrientation(cubie.orientation)
    );
  });
}
