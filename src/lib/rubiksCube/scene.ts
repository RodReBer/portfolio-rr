import * as THREE from "three";
import type { LightPreset } from "./quality";
import { CUBE_CAMERA_POSITION } from "./presentation";

function readCssColor(varName: string, fallback: number): number {
  if (typeof window === "undefined") return fallback;
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue(varName)
    .trim();
  if (!raw) return fallback;
  try {
    return new THREE.Color(raw).getHex();
  } catch {
    return fallback;
  }
}

export interface SceneOptions {
  pixelRatio?: number;
  antialias?: boolean;
  lightPreset?: LightPreset;
  onContextLost?: () => void;
  onContextRestored?: () => void;
}

export class WebGLUnavailableError extends Error {
  constructor(message = "WebGL is not available in this browser") {
    super(message);
    this.name = "WebGLUnavailableError";
  }
}

export interface CubeScene {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  render(): void;
  resize(): void;
  dispose(): void;
}

export function createScene(
  container: HTMLElement,
  options: SceneOptions = {},
  onResize?: () => void,
): CubeScene {
  const {
    pixelRatio = Math.min(window.devicePixelRatio, 2),
    antialias = true,
    lightPreset = "full",
    onContextLost,
    onContextRestored,
  } = options;

  const scene = new THREE.Scene();

  // The cube's circumscribed sphere (corner-to-center) has radius ~2.55.
  // fov/distance are chosen so that sphere always fits in frame with margin,
  // regardless of how the cube is oriented (orbited to a corner-on view,
  // mid face-turn, etc.). A tighter fit here previously let corners clip
  // out of the frustum at certain rotations.
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  camera.position.set(...CUBE_CAMERA_POSITION);
  camera.lookAt(0, 0, 0);

  if (
    !("WebGLRenderingContext" in window) &&
    !("WebGL2RenderingContext" in window)
  ) {
    throw new WebGLUnavailableError();
  }

  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({
      antialias,
      alpha: true,
      powerPreference: "low-power",
    });
  } catch (error) {
    throw new WebGLUnavailableError(
      error instanceof Error ? error.message : undefined,
    );
  }
  renderer.setPixelRatio(pixelRatio);
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.domElement.style.width = "100%";
  renderer.domElement.style.height = "100%";
  renderer.domElement.style.display = "block";
  container.appendChild(renderer.domElement);

  let disposing = false;
  const handleContextLost = (event: Event) => {
    event.preventDefault();
    if (!disposing) onContextLost?.();
  };
  const handleContextRestored = () => {
    if (!disposing) onContextRestored?.();
  };
  renderer.domElement.addEventListener("webglcontextlost", handleContextLost);
  renderer.domElement.addEventListener(
    "webglcontextrestored",
    handleContextRestored,
  );

  // Mostly neutral light so the sticker colors themselves read true. Only
  // the rim light carries a restrained Rubik blue accent.
  // `lightPreset` trims light count on lower quality tiers (each light is a
  // real shading cost, especially with shadows off but standard materials).
  const ambient = new THREE.AmbientLight(0xffffff, 0.7);
  scene.add(ambient);

  const key = new THREE.DirectionalLight(0xffffff, 1.05);
  key.position.set(4, 6, 5);
  scene.add(key);

  if (lightPreset !== "minimal") {
    const fill = new THREE.DirectionalLight(0xffffff, 0.35);
    fill.position.set(-5, -1.5, -3);
    scene.add(fill);
  }

  if (lightPreset === "full") {
    const rimColor = readCssColor("--rubik-blue", 0x0057b8);
    const rim = new THREE.DirectionalLight(rimColor, 0.4);
    rim.position.set(-2, 3, -5);
    scene.add(rim);
  }

  function resize() {
    const width = container.clientWidth;
    const height = container.clientHeight;
    if (width === 0 || height === 0) return;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    onResize?.();
  }

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(container);
  resize();

  return {
    scene,
    camera,
    renderer,
    render() {
      renderer.render(scene, camera);
    },
    resize,
    dispose() {
      disposing = true;
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener(
        "webglcontextlost",
        handleContextLost,
      );
      renderer.domElement.removeEventListener(
        "webglcontextrestored",
        handleContextRestored,
      );
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    },
  };
}
