import * as THREE from "three";
import { gsap } from "gsap";
import type { Axis, CubeMove, CubeState } from "./cubeState";
import {
  applyTurn,
  createSolvedState,
  getCubeNarrativeFrame,
  getCubiesInLayer,
  invertMove,
  isSolved,
  normalizeQuarterTurns,
} from "./cubeState";
import {
  beginLayerTurn,
  buildCubies,
  createCubeAssets,
  endLayerTurn,
  syncCubieTransforms,
} from "./cubeGeometry";
import type { CubeAssets } from "./cubeGeometry";
import { createScene } from "./scene";
import { createInteraction } from "./interaction";
import type { CubeInteraction } from "./interaction";
import { prefersReducedMotion } from "../../utils/motion";
import { getQualitySettings, getQualityTier } from "./quality";
import type { QualityTier } from "./quality";
import {
  CUBE_CAMERA_VIEW_DIRECTION,
  writeCubeSectionFocusQuaternion,
} from "./presentation";
import type { CubeSectionFocus } from "./presentation";

export type { CubeSectionFocus } from "./presentation";

const TURN_DURATION = 0.34;
const SNAP_DURATION = 0.18;
const RESET_VIEW_DURATION = 0.36;
const DEFAULT_SCRAMBLE_MOVES = 12;
const DEMO_MOVES = 6;
const DEMO_ENTRANCE_DELAY_MS = 900;
const DEMO_ORBIT_MS = 1200;
const DEMO_PAUSE_MS = 500;
const IDLE_SPIN_SPEED = 0.65;
const NARRATIVE_ORBIT_SPEED = 0.28;
// Keeps the furthest separated corner inside the scene camera's safe sphere.
// Keep the fully separated cube inside the square camera frustum even while
// the ambient orbit presents a corner-on silhouette.
const NARRATIVE_EXPLOSION_DISTANCE = 0.3;
const NARRATIVE_CUBIE_SCALE_REDUCTION = 0.07;
const AXES: Axis[] = ["x", "y", "z"];
const OUTER_LAYERS = [-1, 1] as const;

export type CubePhase =
  | "idle"
  | "demo"
  | "scrambling"
  | "solving"
  | "paused"
  | "error";

export interface CubeStatus {
  phase: CubePhase;
  paused: boolean;
  solved: boolean;
  busy: boolean;
}

export interface CubeStartOptions {
  quality?: QualityTier;
  /** Runs one short scramble/solve demonstration. */
  autoplay?: boolean;
  onStatusChange?: (status: CubeStatus) => void;
}

export interface CubeController {
  start(options?: CubeStartOptions): void;
  pause(): void;
  resume(): void;
  scramble(moveCount?: number): Promise<void>;
  solve(): Promise<void>;
  /** Rotates the view in radians without mutating the logical puzzle. */
  orbitBy(horizontalRadians: number, verticalRadians: number): Promise<void>;
  resetView(): Promise<void>;
  /**
   * Scrubs the deterministic disassemble/reassemble presentation. The value
   * is clamped to 0..1 and remains fully reversible when scroll direction
   * changes. Calling it also enables the gentle ambient orbit.
   */
  setNarrativeProgress(progress: number): void;
  /**
   * Chooses the dominant Rubik face for a semantic page section. Both
   * endpoints and the blend are explicit so reverse scrolling is exact.
   */
  setSectionFocus(
    from: CubeSectionFocus,
    to: CubeSectionFocus,
    blend: number,
  ): void;
  getStatus(): CubeStatus;
  dispose(): void;
  isBusy(): boolean;
  requestRender(): void;
}

type OperationPhase = "idle" | "demo" | "scrambling" | "solving";
type Tween = ReturnType<typeof gsap.to>;
type TweenTarget = Parameters<typeof gsap.to>[0];
type TweenVars = Parameters<typeof gsap.to>[1];

interface ManualTurn {
  axis: Axis;
  layerIndex: number;
  turnGroup: THREE.Group;
}

interface QueueJob {
  phase: OperationPhase;
  controller: AbortController;
  task: (signal: AbortSignal) => Promise<void>;
  resolve: () => void;
  reject: (reason?: unknown) => void;
  cleanupSignals: () => void;
}

function createAbortError(): DOMException {
  return new DOMException("Cube operation was cancelled", "AbortError");
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

function wait(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(createAbortError());
      return;
    }
    const timeout = window.setTimeout(() => {
      signal.removeEventListener("abort", handleAbort);
      resolve();
    }, ms);
    const handleAbort = () => {
      window.clearTimeout(timeout);
      reject(createAbortError());
    };
    signal.addEventListener("abort", handleAbort, { once: true });
  });
}

export function createController(container: HTMLElement): CubeController {
  let state: CubeState = createSolvedState();
  const history: CubeMove[] = [];
  let assets: CubeAssets | null = null;
  let sceneApi: ReturnType<typeof createScene> | null = null;
  let cubeGroup: THREE.Group | null = null;
  let cubieMap: Map<number, THREE.Group> | null = null;
  let interaction: CubeInteraction | null = null;

  let started = false;
  let disposed = false;
  let running = false;
  let fatalError = false;
  let contextLost = false;
  let dirty = true;
  let rafId = 0;
  let previousFrameTime = 0;
  let idleRotateActive = false;
  let manualTurn: ManualTurn | null = null;
  let automatedTurnGroup: THREE.Group | null = null;
  let narrativeTurn: ManualTurn | null = null;
  let narrativeActive = false;
  let narrativeExplosionAmount = 0;
  let narrativeAmbientAngle = 0;
  const narrativeFocusQuaternion = new THREE.Quaternion();
  const narrativeAmbientQuaternion = new THREE.Quaternion();
  const narrativeViewAxis = new THREE.Vector3(
    ...CUBE_CAMERA_VIEW_DIRECTION,
  ).normalize();
  let basePhase: OperationPhase = "idle";
  let statusListener: ((status: CubeStatus) => void) | undefined;
  let lastStatusKey = "";
  let visibilityListenerInstalled = false;
  let intersectionObserver: IntersectionObserver | null = null;

  const pauseReasons = new Set<"manual" | "visibility" | "offscreen" | "context">();
  const activeTweens = new Set<Tween>();
  const queue: QueueJob[] = [];
  const lifecycleController = new AbortController();
  let activeJob: QueueJob | null = null;
  let drainingQueue = false;
  let demoController: AbortController | null = null;

  function isPaused(): boolean {
    return pauseReasons.size > 0;
  }

  function isBusy(): boolean {
    return Boolean(
      activeJob ||
        queue.length > 0 ||
        manualTurn ||
        automatedTurnGroup ||
        narrativeActive,
    );
  }

  function getStatus(): CubeStatus {
    const paused = isPaused() || fatalError || contextLost;
    const phase: CubePhase =
      fatalError || contextLost
        ? "error"
        : paused
          ? "paused"
          : basePhase;
    return {
      phase,
      paused,
      solved:
        isSolved(state) && !narrativeTurn && narrativeExplosionAmount === 0,
      busy: isBusy(),
    };
  }

  function refreshInteraction() {
    interaction?.setEnabled(
      running && !disposed && !fatalError && !contextLost && !isPaused() && !isBusy(),
    );
  }

  function emitStatus(force = false) {
    // A queued operation may settle in a microtask after teardown. Never let
    // that stale completion recreate DOM state or notify listeners on a route
    // that has already been swapped out.
    if (disposed) return;
    const status = getStatus();
    const key = `${status.phase}:${status.paused}:${status.solved}:${status.busy}`;
    refreshInteraction();
    if (!force && key === lastStatusKey) return;
    lastStatusKey = key;
    container.dataset.cubeState = status.phase;
    try {
      statusListener?.({ ...status });
    } catch (error) {
      console.error("Rubik cube status listener failed", error);
    }
    container.dispatchEvent(
      new CustomEvent<CubeStatus>("rubikstatuschange", { detail: status }),
    );
  }

  function frame(time: number) {
    rafId = 0;
    if (!running || isPaused() || fatalError || contextLost) return;

    const deltaSeconds = previousFrameTime
      ? Math.min((time - previousFrameTime) / 1000, 0.05)
      : 0;
    previousFrameTime = time;
    const ambientRotationActive = idleRotateActive || narrativeActive;
    if (narrativeActive && cubeGroup) {
      narrativeAmbientAngle =
        (narrativeAmbientAngle + NARRATIVE_ORBIT_SPEED * deltaSeconds)
        % (Math.PI * 2);
      narrativeAmbientQuaternion.setFromAxisAngle(
        narrativeViewAxis,
        narrativeAmbientAngle,
      );
      /*
       * The focus quaternion is absolute and scroll-driven. Applying the
       * ambient roll on its left keeps the featured normal on a shallow cone
       * around the camera axis: the cube never drifts away from its section
       * face, yet it remains visibly alive while scrolling is idle.
       */
      cubeGroup.quaternion
        .copy(narrativeAmbientQuaternion)
        .multiply(narrativeFocusQuaternion);
      dirty = true;
    } else if (idleRotateActive && cubeGroup) {
      cubeGroup.rotation.y += IDLE_SPIN_SPEED * deltaSeconds;
      cubeGroup.rotation.x += IDLE_SPIN_SPEED * 0.28 * deltaSeconds;
      dirty = true;
    }

    if (dirty) {
      dirty = false;
      sceneApi?.render();
    }
    if (ambientRotationActive) rafId = requestAnimationFrame(frame);
  }

  function requestRender() {
    dirty = true;
    if (
      running &&
      !rafId &&
      !isPaused() &&
      !fatalError &&
      !contextLost
    ) {
      rafId = requestAnimationFrame(frame);
    }
  }

  function rollbackManualTurn() {
    if (!manualTurn || !cubeGroup) return;
    manualTurn.turnGroup.rotation[manualTurn.axis] = 0;
    endLayerTurn(cubeGroup, manualTurn.turnGroup);
    if (cubieMap) syncCubieTransforms(state, cubieMap);
    manualTurn = null;
    requestRender();
    emitStatus();
  }

  function rollbackAutomatedTurn() {
    const turnGroup = automatedTurnGroup;
    if (!turnGroup || !cubeGroup) return;
    turnGroup.rotation.set(0, 0, 0);
    if (turnGroup.parent === cubeGroup) endLayerTurn(cubeGroup, turnGroup);
    automatedTurnGroup = null;
    if (cubieMap) syncCubieTransforms(state, cubieMap);
    requestRender();
  }

  function clearNarrativeTurn() {
    const current = narrativeTurn;
    if (!current || !cubeGroup) {
      narrativeTurn = null;
      return;
    }
    if (current.turnGroup.parent === cubeGroup) {
      endLayerTurn(cubeGroup, current.turnGroup);
    }
    narrativeTurn = null;
  }

  function applyNarrativeExplosion(amount: number) {
    if (!cubieMap) return;
    const direction = new THREE.Vector3();
    const scale = 1 - amount * NARRATIVE_CUBIE_SCALE_REDUCTION;

    for (const cubie of state) {
      const mesh = cubieMap.get(cubie.id);
      if (!mesh) continue;
      direction.set(...cubie.position);
      if (direction.lengthSq() > 0) {
        // A stable per-cubie variation breaks the perfect lattice just enough
        // to read as separate pieces without introducing random scroll drift.
        const variation = 0.88 + ((cubie.id * 7) % 9) * 0.025;
        mesh.position.addScaledVector(
          direction.normalize(),
          amount * NARRATIVE_EXPLOSION_DISTANCE * variation,
        );
      }
      mesh.scale.setScalar(scale);
    }
  }

  function deactivateNarrative(resetPuzzle = true) {
    if (!narrativeActive && !narrativeTurn) return;
    clearNarrativeTurn();
    narrativeActive = false;
    narrativeExplosionAmount = 0;
    narrativeAmbientAngle = 0;
    narrativeFocusQuaternion.identity();
    narrativeAmbientQuaternion.identity();
    cubeGroup?.quaternion.identity();
    if (resetPuzzle && cubieMap) {
      state = createSolvedState();
      history.length = 0;
      syncCubieTransforms(state, cubieMap);
    }
    requestRender();
    emitStatus();
  }

  function setNarrativeProgress(progress: number) {
    // Resolve and validate the pure frame before changing live controller
    // state. This leaves the scene untouched for invalid input.
    const frameState = getCubeNarrativeFrame(progress);
    if (!started || !running || disposed || fatalError || contextLost) return;
    if (!cubeGroup || !cubieMap) return;

    if (!narrativeActive) {
      // Mark presentation ownership first so asynchronous cancellation paths
      // cannot re-sync an obsolete operation over the freshly scrubbed frame.
      narrativeActive = true;
      cancelAllOperations();
      history.length = 0;
    }

    clearNarrativeTurn();
    state = frameState.state;
    narrativeExplosionAmount = frameState.explosion;
    syncCubieTransforms(state, cubieMap);
    applyNarrativeExplosion(frameState.explosion);

    if (frameState.activeMove && frameState.moveProgress > 0) {
      const { axis, layerIndex, quarterTurns } = frameState.activeMove;
      const cubieIds = getCubiesInLayer(state, axis, layerIndex);
      const turnGroup = beginLayerTurn(cubeGroup, cubieMap, cubieIds);
      const t = frameState.moveProgress;
      const easedProgress = t * t * (3 - 2 * t);
      turnGroup.rotation[axis] =
        quarterTurns * (Math.PI / 2) * easedProgress;
      narrativeTurn = { axis, layerIndex, turnGroup };
    }

    requestRender();
    emitStatus();
  }

  function setSectionFocus(
    from: CubeSectionFocus,
    to: CubeSectionFocus,
    blend: number,
  ) {
    // Validate into a temporary value first; invalid runtime data must not
    // partially alter the live presentation.
    const nextFocus = writeCubeSectionFocusQuaternion(
      new THREE.Quaternion(),
      from,
      to,
      blend,
    );
    if (!started || !running || disposed || fatalError || contextLost) return;

    narrativeFocusQuaternion.copy(nextFocus);
    if (narrativeActive && cubeGroup) {
      narrativeAmbientQuaternion.setFromAxisAngle(
        narrativeViewAxis,
        narrativeAmbientAngle,
      );
      cubeGroup.quaternion
        .copy(narrativeAmbientQuaternion)
        .multiply(narrativeFocusQuaternion);
    }
    requestRender();
  }

  function setPauseReason(
    reason: "manual" | "visibility" | "offscreen" | "context",
    paused: boolean,
  ) {
    const wasPaused = isPaused();
    if (paused) pauseReasons.add(reason);
    else pauseReasons.delete(reason);
    const nowPaused = isPaused();
    if (wasPaused === nowPaused) {
      emitStatus();
      return;
    }

    if (nowPaused) {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = 0;
      previousFrameTime = 0;
      activeTweens.forEach((tween) => tween.pause());
      rollbackManualTurn();
    } else {
      activeTweens.forEach((tween) => tween.resume());
      requestRender();
    }
    emitStatus();
  }

  function animate(
    target: TweenTarget,
    vars: TweenVars,
    signal: AbortSignal,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      if (signal.aborted || disposed) {
        reject(createAbortError());
        return;
      }

      let settled = false;
      let tween: Tween | null = null;
      const userOnUpdate = vars.onUpdate as (() => void) | undefined;

      const cleanup = () => {
        signal.removeEventListener("abort", handleAbort);
        if (tween) activeTweens.delete(tween);
      };
      const complete = () => {
        if (settled) return;
        settled = true;
        cleanup();
        resolve();
      };
      const interrupt = () => {
        if (settled) return;
        settled = true;
        cleanup();
        reject(createAbortError());
      };
      const handleAbort = () => {
        tween?.kill();
        interrupt();
      };

      signal.addEventListener("abort", handleAbort, { once: true });
      tween = gsap.to(target, {
        ...vars,
        onUpdate: () => {
          userOnUpdate?.();
          requestRender();
        },
        onComplete: complete,
        onInterrupt: interrupt,
      });
      activeTweens.add(tween);
      if (isPaused()) tween.pause();
    });
  }

  async function waitUntilRunnable(signal: AbortSignal) {
    while (isPaused() && !signal.aborted) await wait(80, signal);
    if (signal.aborted) throw createAbortError();
  }

  async function activeDelay(ms: number, signal: AbortSignal) {
    let remaining = ms;
    while (remaining > 0) {
      await waitUntilRunnable(signal);
      const slice = Math.min(remaining, 50);
      const before = performance.now();
      await wait(slice, signal);
      if (!isPaused()) remaining -= performance.now() - before;
    }
  }

  function connectSignal(
    source: AbortSignal,
    destination: AbortController,
  ): () => void {
    const abort = () => destination.abort();
    if (source.aborted) destination.abort();
    else source.addEventListener("abort", abort, { once: true });
    return () => source.removeEventListener("abort", abort);
  }

  function enqueue(
    phase: OperationPhase,
    task: (signal: AbortSignal) => Promise<void>,
    externalSignal?: AbortSignal,
  ): Promise<void> {
    if (!started || disposed || fatalError || contextLost) {
      return Promise.reject(new Error("The Rubik cube is not available"));
    }

    const controller = new AbortController();
    const cleanups = [
      connectSignal(lifecycleController.signal, controller),
      ...(externalSignal
        ? [connectSignal(externalSignal, controller)]
        : []),
    ];

    return new Promise((resolve, reject) => {
      queue.push({
        phase,
        controller,
        task,
        resolve,
        reject,
        cleanupSignals: () => cleanups.forEach((cleanup) => cleanup()),
      });
      emitStatus();
      void drainQueue();
    });
  }

  async function drainQueue() {
    if (drainingQueue) return;
    drainingQueue = true;

    while (queue.length > 0 && !disposed) {
      const job = queue.shift()!;
      activeJob = job;
      basePhase = job.phase;
      emitStatus();

      try {
        await waitUntilRunnable(job.controller.signal);
        await job.task(job.controller.signal);
        job.resolve();
      } catch (error) {
        job.reject(error);
      } finally {
        job.cleanupSignals();
        activeJob = null;
        basePhase = "idle";
        emitStatus();
      }
    }

    drainingQueue = false;
    emitStatus();
  }

  function cancelDemo() {
    demoController?.abort();
    demoController = null;
    idleRotateActive = false;
  }

  function cancelAllOperations() {
    activeJob?.controller.abort();
    const pendingJobs = queue.splice(0);
    pendingJobs.forEach((job) => {
      job.controller.abort();
      job.cleanupSignals();
      job.reject(createAbortError());
    });
    [...activeTweens].forEach((tween) => tween.kill());
    cancelDemo();
    rollbackAutomatedTurn();
    rollbackManualTurn();
    emitStatus();
  }

  async function performTurn(
    move: CubeMove,
    duration: number,
    recordHistory: boolean,
    signal: AbortSignal,
  ) {
    if (!cubeGroup || !cubieMap) throw new Error("Cube is not initialized");
    const quarterTurns = normalizeQuarterTurns(move.quarterTurns);
    if (quarterTurns === 0) return;

    const group = cubeGroup;
    const map = cubieMap;
    const cubieIds = getCubiesInLayer(state, move.axis, move.layerIndex);
    const turnGroup = beginLayerTurn(group, map, cubieIds);
    automatedTurnGroup = turnGroup;

    try {
      await animate(
        turnGroup.rotation,
        {
          [move.axis]: quarterTurns * (Math.PI / 2),
          duration,
          ease: "power2.inOut",
        },
        signal,
      );
    } catch (error) {
      turnGroup.rotation[move.axis] = 0;
      if (turnGroup.parent === group) endLayerTurn(group, turnGroup);
      if (automatedTurnGroup === turnGroup) automatedTurnGroup = null;
      if (!narrativeActive) syncCubieTransforms(state, map);
      requestRender();
      throw error;
    }

    if (signal.aborted || narrativeActive) {
      if (turnGroup.parent === group) endLayerTurn(group, turnGroup);
      if (automatedTurnGroup === turnGroup) automatedTurnGroup = null;
      throw createAbortError();
    }

    if (turnGroup.parent === group) endLayerTurn(group, turnGroup);
    if (automatedTurnGroup === turnGroup) automatedTurnGroup = null;
    state = applyTurn(state, move.axis, move.layerIndex, quarterTurns);
    syncCubieTransforms(state, map);
    if (recordHistory) {
      history.push({ ...move, quarterTurns });
    }
    requestRender();
    emitStatus();
  }

  function pickRandomMove(previous: CubeMove | null): CubeMove {
    let axis: Axis;
    let layerIndex: number;
    do {
      axis = AXES[Math.floor(Math.random() * AXES.length)]!;
      layerIndex = OUTER_LAYERS[Math.floor(Math.random() * OUTER_LAYERS.length)]!;
    } while (
      previous &&
      axis === previous.axis &&
      layerIndex === previous.layerIndex
    );
    return {
      axis,
      layerIndex,
      quarterTurns: Math.random() < 0.5 ? 1 : -1,
    };
  }

  async function performScramble(
    moveCount: number,
    signal: AbortSignal,
  ) {
    let previous: CubeMove | null = null;
    for (let index = 0; index < moveCount; index++) {
      await waitUntilRunnable(signal);
      const move = pickRandomMove(previous);
      await performTurn(move, TURN_DURATION, true, signal);
      previous = move;
    }
  }

  async function performSolve(signal: AbortSignal) {
    while (history.length > 0) {
      await waitUntilRunnable(signal);
      const move = history[history.length - 1]!;
      await performTurn(invertMove(move), TURN_DURATION, false, signal);
      history.pop();
    }
  }

  function beginManualTurn(axis: Axis, layerIndex: number): boolean {
    if (
      !running ||
      !cubeGroup ||
      !cubieMap ||
      manualTurn ||
      isBusy() ||
      isPaused() ||
      fatalError ||
      contextLost
    ) {
      return false;
    }
    const cubieIds = getCubiesInLayer(state, axis, layerIndex);
    manualTurn = {
      axis,
      layerIndex,
      turnGroup: beginLayerTurn(cubeGroup, cubieMap, cubieIds),
    };
    emitStatus();
    return true;
  }

  function previewManualTurn(angle: number) {
    if (!manualTurn || !Number.isFinite(angle)) return;
    manualTurn.turnGroup.rotation[manualTurn.axis] = THREE.MathUtils.clamp(
      angle,
      -Math.PI * 0.7,
      Math.PI * 0.7,
    );
    requestRender();
  }

  async function finishManualTurn(angle: number, cancel: boolean) {
    const current = manualTurn;
    const group = cubeGroup;
    const map = cubieMap;
    if (!current || !group || !map) return;

    const rounded = cancel
      ? 0
      : THREE.MathUtils.clamp(Math.round(angle / (Math.PI / 2)), -1, 1);
    try {
      await animate(
        current.turnGroup.rotation,
        {
          [current.axis]: rounded * (Math.PI / 2),
          duration: SNAP_DURATION,
          ease: "power2.out",
        },
        lifecycleController.signal,
      );
    } catch (error) {
      current.turnGroup.rotation[current.axis] = 0;
      if (current.turnGroup.parent === group) {
        endLayerTurn(group, current.turnGroup);
      }
      if (!narrativeActive) syncCubieTransforms(state, map);
      if (manualTurn === current) manualTurn = null;
      requestRender();
      emitStatus();
      throw error;
    }

    // Visibility/pause teardown may have already rolled this preview back
    // while its snap tween was suspended. A detached snap must never commit a
    // logical move when that tween eventually settles.
    if (manualTurn !== current || current.turnGroup.parent !== group) return;

    if (narrativeActive) {
      if (current.turnGroup.parent === group) {
        endLayerTurn(group, current.turnGroup);
      }
      if (manualTurn === current) manualTurn = null;
      throw createAbortError();
    }

    if (current.turnGroup.parent === group) {
      endLayerTurn(group, current.turnGroup);
    }
    if (rounded !== 0) {
      state = applyTurn(state, current.axis, current.layerIndex, rounded);
      history.push({
        axis: current.axis,
        layerIndex: current.layerIndex,
        quarterTurns: rounded,
      });
    }
    syncCubieTransforms(state, map);
    if (manualTurn === current) manualTurn = null;
    requestRender();
    emitStatus();
  }

  function applyOrbit(horizontalRadians: number, verticalRadians: number) {
    if (!cubeGroup || !sceneApi) return;
    if (horizontalRadians) {
      cubeGroup.rotateOnWorldAxis(
        new THREE.Vector3(0, 1, 0),
        horizontalRadians,
      );
    }
    if (verticalRadians) {
      const cameraRight = new THREE.Vector3()
        .setFromMatrixColumn(sceneApi.camera.matrixWorld, 0)
        .normalize();
      cubeGroup.rotateOnWorldAxis(cameraRight, verticalRadians);
    }
    requestRender();
  }

  async function runDemo(signal: AbortSignal) {
    try {
      await activeDelay(DEMO_ENTRANCE_DELAY_MS, signal);
      idleRotateActive = true;
      requestRender();
      await activeDelay(DEMO_ORBIT_MS, signal);
      idleRotateActive = false;
      await performScramble(DEMO_MOVES, signal);
      await activeDelay(DEMO_PAUSE_MS, signal);
      await performSolve(signal);
    } finally {
      idleRotateActive = false;
      requestRender();
      demoController = null;
    }
  }

  function reportSceneError(error: unknown) {
    fatalError = true;
    running = false;
    container.dataset.cubeFallback = "true";
    container.dispatchEvent(
      new CustomEvent("rubikerror", {
        detail: error instanceof Error ? error.message : "WebGL unavailable",
      }),
    );
    emitStatus(true);
  }

  function handleContextLost() {
    contextLost = true;
    container.dataset.cubeFallback = "true";
    setPauseReason("context", true);
    cancelAllOperations();
    emitStatus(true);
  }

  function handleContextRestored() {
    contextLost = false;
    delete container.dataset.cubeFallback;
    setPauseReason("context", false);
    sceneApi?.resize();
    requestRender();
    emitStatus(true);
  }

  function handleVisibilityChange() {
    setPauseReason("visibility", document.hidden);
  }

  return {
    start(options: CubeStartOptions = {}) {
      if (started || disposed) return;
      started = true;
      statusListener = options.onStatusChange;

      try {
        const tier = options.quality ?? getQualityTier();
        const settings = getQualitySettings(tier);

        assets = createCubeAssets();
        const built = buildCubies(state, assets);
        cubeGroup = built.cubeGroup;
        cubieMap = built.cubieMap;

        sceneApi = createScene(
          container,
          {
            ...settings,
            onContextLost: handleContextLost,
            onContextRestored: handleContextRestored,
          },
          requestRender,
        );
        sceneApi.scene.add(cubeGroup);

        interaction = createInteraction({
          container: sceneApi.renderer.domElement,
          camera: sceneApi.camera,
          cubeGroup,
          stickerMeshes: built.stickerMeshes,
          getState: () => state,
          canInteract: () => !isBusy() && !isPaused(),
          onInteractionIntent: cancelDemo,
          onTurnBegin: beginManualTurn,
          onTurnPreview: previewManualTurn,
          onTurnCommit: (angle) => finishManualTurn(angle, false),
          onTurnCancel: () => finishManualTurn(0, true),
          onOrbit: applyOrbit,
          requestRender,
        });

        running = true;
        document.addEventListener("visibilitychange", handleVisibilityChange);
        visibilityListenerInstalled = true;
        setPauseReason("visibility", document.hidden);

        if ("IntersectionObserver" in window) {
          intersectionObserver = new IntersectionObserver(
            ([entry]) => setPauseReason("offscreen", !entry?.isIntersecting),
            { threshold: 0.01 },
          );
          intersectionObserver.observe(container);
        }

        requestRender();
        emitStatus(true);

        const autoplay = options.autoplay !== false && !prefersReducedMotion();
        if (autoplay) {
          demoController = new AbortController();
          void enqueue("demo", runDemo, demoController.signal).catch((error) => {
            if (!isAbortError(error)) {
              container.dispatchEvent(
                new CustomEvent("rubikerror", { detail: String(error) }),
              );
            }
          });
        }
      } catch (error) {
        interaction?.dispose();
        interaction = null;
        sceneApi?.dispose();
        sceneApi = null;
        assets?.dispose();
        assets = null;
        cubeGroup = null;
        cubieMap = null;
        reportSceneError(error);
      }
    },

    pause() {
      if (!started || disposed) return;
      setPauseReason("manual", true);
    },

    resume() {
      if (!started || disposed) return;
      setPauseReason("manual", false);
    },

    scramble(moveCount = DEFAULT_SCRAMBLE_MOVES) {
      deactivateNarrative();
      cancelDemo();
      if (!Number.isInteger(moveCount) || moveCount < 1 || moveCount > 30) {
        return Promise.reject(
          new RangeError("moveCount must be an integer between 1 and 30"),
        );
      }
      return enqueue("scrambling", (signal) =>
        performScramble(moveCount, signal),
      );
    },

    solve() {
      deactivateNarrative();
      cancelDemo();
      return enqueue("solving", performSolve);
    },

    orbitBy(horizontalRadians: number, verticalRadians: number) {
      cancelDemo();
      if (!Number.isFinite(horizontalRadians) || !Number.isFinite(verticalRadians)) {
        return Promise.reject(new TypeError("Orbit values must be finite radians"));
      }
      if (!running || disposed || fatalError || contextLost) {
        return Promise.reject(new Error("The Rubik cube is not available"));
      }
      applyOrbit(horizontalRadians, verticalRadians);
      return Promise.resolve();
    },

    resetView() {
      deactivateNarrative();
      cancelDemo();
      return enqueue("idle", async (signal) => {
        if (!cubeGroup) throw new Error("Cube is not initialized");
        const group = cubeGroup;
        const start = group.quaternion.clone();
        const target = new THREE.Quaternion();
        const progress = { value: 0 };
        await animate(
          progress,
          {
            value: 1,
            duration: RESET_VIEW_DURATION,
            ease: "power2.inOut",
            onUpdate: () => {
              group.quaternion.slerpQuaternions(start, target, progress.value);
            },
          },
          signal,
        );
        group.quaternion.copy(target);
        requestRender();
      });
    },

    setNarrativeProgress,
    setSectionFocus,

    getStatus,

    dispose() {
      if (disposed) return;
      disposed = true;
      running = false;
      lifecycleController.abort();
      cancelAllOperations();
      clearNarrativeTurn();
      narrativeActive = false;
      narrativeExplosionAmount = 0;
      narrativeAmbientAngle = 0;
      narrativeFocusQuaternion.identity();
      narrativeAmbientQuaternion.identity();

      if (rafId) cancelAnimationFrame(rafId);
      rafId = 0;
      if (visibilityListenerInstalled) {
        document.removeEventListener("visibilitychange", handleVisibilityChange);
      }
      intersectionObserver?.disconnect();
      intersectionObserver = null;

      interaction?.dispose();
      interaction = null;
      activeTweens.forEach((tween) => tween.kill());
      activeTweens.clear();

      sceneApi?.dispose();
      sceneApi = null;
      assets?.dispose();
      assets = null;
      cubieMap = null;
      cubeGroup = null;
      pauseReasons.clear();
      delete container.dataset.cubeState;
    },

    isBusy,
    requestRender,
  };
}
