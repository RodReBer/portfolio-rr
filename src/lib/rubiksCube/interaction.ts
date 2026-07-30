import * as THREE from "three";
import type { Axis, CubeState } from "./cubeState";

const DRAG_THRESHOLD_PX = 8;
const PIXELS_PER_QUARTER_TURN = 140;
const ORBIT_SPEED = 0.008;
const TOUCH_VERTICAL_BIAS = 1.1;

const AXIS_INDEX: Record<Axis, 0 | 1 | 2> = { x: 0, y: 1, z: 2 };
const ALL_AXES: Axis[] = ["x", "y", "z"];

type GestureMode =
  | "idle"
  | "pending-orbit"
  | "pending-turn"
  | "orbit"
  | "turning"
  | "snapping"
  | "passthrough";

interface PendingTurn {
  cubieId: number;
  /** Current face axis in cube space, not the sticker's original axis. */
  faceAxis: Axis;
  worldNormal: THREE.Vector3;
}

interface LockedTurn {
  axis: Axis;
  layerIndex: number;
  /** Positive screen projection maps to a positive right-hand-rule turn. */
  screenTangent: THREE.Vector2;
}

export interface InteractionOptions {
  container: HTMLElement;
  camera: THREE.PerspectiveCamera;
  cubeGroup: THREE.Group;
  stickerMeshes: THREE.Mesh[];
  getState: () => CubeState;
  canInteract?: () => boolean;
  onInteractionIntent?: () => void;
  onTurnBegin: (axis: Axis, layerIndex: number) => boolean;
  onTurnPreview: (angle: number) => void;
  onTurnCommit: (angle: number) => Promise<void>;
  onTurnCancel: () => Promise<void>;
  onOrbit: (horizontalRadians: number, verticalRadians: number) => void;
  onInteractionStart?: () => void;
  onInteractionEnd?: () => void;
  requestRender?: () => void;
}

export interface CubeInteraction {
  setEnabled(enabled: boolean): void;
  dispose(): void;
}

function localAxisVector(axis: Axis): THREE.Vector3 {
  if (axis === "x") return new THREE.Vector3(1, 0, 0);
  if (axis === "y") return new THREE.Vector3(0, 1, 0);
  return new THREE.Vector3(0, 0, 1);
}

function dominantAxis(vector: THREE.Vector3): Axis {
  const x = Math.abs(vector.x);
  const y = Math.abs(vector.y);
  const z = Math.abs(vector.z);
  if (x >= y && x >= z) return "x";
  return y >= z ? "y" : "z";
}

export function createInteraction(options: InteractionOptions): CubeInteraction {
  const {
    container,
    camera,
    cubeGroup,
    stickerMeshes,
    getState,
    canInteract,
    onInteractionIntent,
    onTurnBegin,
    onTurnPreview,
    onTurnCommit,
    onTurnCancel,
    onOrbit,
    onInteractionStart,
    onInteractionEnd,
    requestRender,
  } = options;

  const raycaster = new THREE.Raycaster();
  const pointerNdc = new THREE.Vector2();
  const previousTouchAction = container.style.touchAction;

  let disposed = false;
  let enabled = true;
  let mode: GestureMode = "idle";
  let activePointerId: number | null = null;
  let activePointerType = "";
  let interactionStarted = false;
  let startX = 0;
  let startY = 0;
  let lastX = 0;
  let lastY = 0;
  let pending: PendingTurn | null = null;
  let locked: LockedTurn | null = null;

  // Let the browser own vertical scrolling and pinch zoom. We only claim a
  // horizontal gesture after its intent is clear.
  container.style.touchAction = "pan-y pinch-zoom";

  function pickSticker(clientX: number, clientY: number): THREE.Mesh | null {
    const rect = container.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return null;
    pointerNdc.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    pointerNdc.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    cubeGroup.updateWorldMatrix(true, true);
    raycaster.setFromCamera(pointerNdc, camera);
    const hits = raycaster.intersectObjects(stickerMeshes, false);
    return hits.length > 0 ? (hits[0]!.object as THREE.Mesh) : null;
  }

  function currentStickerNormal(sticker: THREE.Mesh) {
    const stickerWorldQuaternion = sticker.getWorldQuaternion(
      new THREE.Quaternion(),
    );
    const cubeWorldQuaternion = cubeGroup.getWorldQuaternion(
      new THREE.Quaternion(),
    );
    const worldNormal = new THREE.Vector3(0, 0, 1)
      .applyQuaternion(stickerWorldQuaternion)
      .normalize();
    const cubeNormal = worldNormal
      .clone()
      .applyQuaternion(cubeWorldQuaternion.clone().invert())
      .normalize();
    return { faceAxis: dominantAxis(cubeNormal), worldNormal };
  }

  function cameraScreenBasis() {
    const right = new THREE.Vector3()
      .setFromMatrixColumn(camera.matrixWorld, 0)
      .normalize();
    const up = new THREE.Vector3()
      .setFromMatrixColumn(camera.matrixWorld, 1)
      .normalize();
    return { right, up };
  }

  function projectToScreen(
    direction: THREE.Vector3,
    right: THREE.Vector3,
    up: THREE.Vector3,
  ): THREE.Vector2 {
    return new THREE.Vector2(direction.dot(right), -direction.dot(up));
  }

  function lockTurnAxis(dxTotal: number, dyTotal: number): LockedTurn | null {
    if (!pending) return null;
    const cubie = getState().find((candidate) => candidate.id === pending!.cubieId);
    if (!cubie) return null;

    const { right, up } = cameraScreenBasis();
    const dragDirection = new THREE.Vector2(dxTotal, dyTotal);
    if (dragDirection.lengthSq() < 1e-6) return null;
    dragDirection.normalize();

    const cubeWorldQuaternion = cubeGroup.getWorldQuaternion(
      new THREE.Quaternion(),
    );
    let best: {
      axis: Axis;
      score: number;
      screenTangent: THREE.Vector2;
    } | null = null;

    for (const axis of ALL_AXES) {
      if (axis === pending.faceAxis) continue;
      const worldAxis = localAxisVector(axis)
        .applyQuaternion(cubeWorldQuaternion)
        .normalize();
      const tangentWorld = new THREE.Vector3()
        .crossVectors(worldAxis, pending.worldNormal)
        .normalize();
      const screenTangent = projectToScreen(tangentWorld, right, up);
      if (screenTangent.lengthSq() < 1e-6) continue;
      screenTangent.normalize();

      const score = screenTangent.dot(dragDirection);
      if (!best || Math.abs(score) > Math.abs(best.score)) {
        best = { axis, score, screenTangent };
      }
    }

    if (!best) return null;
    const layerIndex = cubie.position[AXIS_INDEX[best.axis]];
    if (!onTurnBegin(best.axis, layerIndex)) return null;
    return {
      axis: best.axis,
      layerIndex,
      screenTangent: best.screenTangent,
    };
  }

  function beginClaimedInteraction(pointerId: number) {
    interactionStarted = true;
    try {
      container.setPointerCapture(pointerId);
    } catch {
      // Capture may already have been released by native touch scrolling.
    }
    onInteractionStart?.();
  }

  function resetPointerState() {
    activePointerId = null;
    activePointerType = "";
    pending = null;
    locked = null;
  }

  function releasePointer(pointerId: number) {
    if (container.hasPointerCapture(pointerId)) {
      container.releasePointerCapture(pointerId);
    }
  }

  function onPointerDown(event: PointerEvent) {
    if (disposed || mode !== "idle" || activePointerId !== null || !enabled) {
      return;
    }

    onInteractionIntent?.();
    if (canInteract && !canInteract()) return;

    activePointerId = event.pointerId;
    activePointerType = event.pointerType;
    startX = lastX = event.clientX;
    startY = lastY = event.clientY;
    lastPointerX = event.clientX;
    lastPointerY = event.clientY;

    const hit = pickSticker(event.clientX, event.clientY);
    if (!hit) {
      mode = "pending-orbit";
      return;
    }

    const userData = hit.userData as { cubieId?: unknown };
    if (typeof userData.cubieId !== "number") {
      mode = "pending-orbit";
      return;
    }
    const { faceAxis, worldNormal } = currentStickerNormal(hit);
    pending = { cubieId: userData.cubieId, faceAxis, worldNormal };
    mode = "pending-turn";
  }

  function shouldYieldToVerticalScroll(dx: number, dy: number): boolean {
    return (
      activePointerType === "touch" &&
      Math.abs(dy) > DRAG_THRESHOLD_PX &&
      Math.abs(dy) > Math.abs(dx) * TOUCH_VERTICAL_BIAS
    );
  }

  function onPointerMove(event: PointerEvent) {
    if (activePointerId !== event.pointerId) return;

    const dxTotal = event.clientX - startX;
    const dyTotal = event.clientY - startY;

    if (mode === "pending-orbit" || mode === "pending-turn") {
      if (shouldYieldToVerticalScroll(dxTotal, dyTotal)) {
        mode = "passthrough";
        pending = null;
        return;
      }
      if (Math.hypot(dxTotal, dyTotal) < DRAG_THRESHOLD_PX) return;

      if (mode === "pending-turn") {
        const turn = lockTurnAxis(dxTotal, dyTotal);
        if (turn) {
          locked = turn;
          mode = "turning";
          beginClaimedInteraction(event.pointerId);
        } else {
          pending = null;
          mode = "orbit";
          beginClaimedInteraction(event.pointerId);
        }
      } else {
        mode = "orbit";
        beginClaimedInteraction(event.pointerId);
      }
      lastX = startX;
      lastY = startY;
    }

    if (mode === "orbit") {
      event.preventDefault();
      const dx = event.clientX - lastX;
      const dy = event.clientY - lastY;
      lastX = event.clientX;
      lastY = event.clientY;
      onOrbit(dx * ORBIT_SPEED, dy * ORBIT_SPEED);
      requestRender?.();
      return;
    }

    if (mode === "turning" && locked) {
      event.preventDefault();
      const signedDistance =
        dxTotal * locked.screenTangent.x +
        dyTotal * locked.screenTangent.y;
      onTurnPreview(
        (signedDistance / PIXELS_PER_QUARTER_TURN) * (Math.PI / 2),
      );
      requestRender?.();
    }
  }

  async function finishGesture(cancelTurn: boolean) {
    const wasTurning = mode === "turning" && locked !== null;
    const dxTotal = lastPointerX - startX;
    const dyTotal = lastPointerY - startY;
    const finalAngle =
      wasTurning && locked
        ? ((dxTotal * locked.screenTangent.x +
            dyTotal * locked.screenTangent.y) /
            PIXELS_PER_QUARTER_TURN) *
          (Math.PI / 2)
        : 0;

    mode = wasTurning ? "snapping" : "idle";
    resetPointerState();

    if (wasTurning) {
      try {
        await (cancelTurn ? onTurnCancel() : onTurnCommit(finalAngle));
      } catch {
        // Disposal/cancellation rejects in-flight work; interaction cleanup is
        // still identical and the controller owns restoring the layer.
      }
    }

    if (!disposed) mode = "idle";
    if (interactionStarted) onInteractionEnd?.();
    interactionStarted = false;
  }

  let lastPointerX = 0;
  let lastPointerY = 0;

  function onPointerPosition(event: PointerEvent) {
    lastPointerX = event.clientX;
    lastPointerY = event.clientY;
    onPointerMove(event);
  }

  function onPointerUp(event: PointerEvent) {
    if (activePointerId !== event.pointerId) return;
    lastPointerX = event.clientX;
    lastPointerY = event.clientY;
    releasePointer(event.pointerId);
    void finishGesture(event.type === "pointercancel");
  }

  container.addEventListener("pointerdown", onPointerDown);
  container.addEventListener("pointermove", onPointerPosition);
  container.addEventListener("pointerup", onPointerUp);
  container.addEventListener("pointercancel", onPointerUp);

  return {
    setEnabled(next: boolean) {
      enabled = next;
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      container.removeEventListener("pointerdown", onPointerDown);
      container.removeEventListener("pointermove", onPointerPosition);
      container.removeEventListener("pointerup", onPointerUp);
      container.removeEventListener("pointercancel", onPointerUp);
      container.style.touchAction = previousTouchAction;
      mode = "idle";
      resetPointerState();
    },
  };
}
