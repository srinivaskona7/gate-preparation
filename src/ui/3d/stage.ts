import { type Intersection, Line, type Material, Mesh, type Object3D, PerspectiveCamera, Raycaster, Scene, Sprite, Texture, Vector2, Vector3, WebGLRenderer } from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// The generic three.js stage behind every 3D model: one canvas, an orbit camera, and a render loop
// that runs only while the canvas is on screen and only draws when something changed.

/** Called every frame; returns true when it changed the scene, which asks for a redraw. */
export type FrameCallback = (dt: number) => boolean;

export interface StageView {
  /** Where the camera looks from, relative to the target. */
  direction: [number, number, number];
  target: [number, number, number];
  fov?: number;
}

export interface Stage {
  scene: Scene;
  camera: PerspectiveCamera;
  reducedMotion: boolean;
  /** Registers a per-frame callback; returns its remover. */
  animate(fn: FrameCallback): () => void;
  /** Redraws once after a change made outside a frame callback. */
  invalidate(): void;
  /** Sets the camera distance so a width × height region around the target fits the canvas. */
  fit(width: number, height: number, target?: Vector3): void;
  /** Calls `fn` with the objects under a click or tap that was not the end of a drag. */
  onTap(fn: (hits: Intersection[]) => void, targets: () => Object3D[]): () => void;
  dispose(): void;
}

let webgl2: boolean | undefined;

/** Whether the browser can create the WebGL 2 context three.js needs; probed once. */
export function hasWebGL2(): boolean {
  if (webgl2 === undefined) {
    try {
      const gl = document.createElement('canvas').getContext('webgl2');
      webgl2 = gl !== null;
      gl?.getExtension('WEBGL_lose_context')?.loseContext();
    } catch {
      webgl2 = false;
    }
  }
  return webgl2;
}

export const prefersReducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Frees the GPU side of every mesh, line and sprite under `root`. */
export function disposeTree(root: Object3D) {
  root.traverse((o) => {
    if (!(o instanceof Mesh || o instanceof Line || o instanceof Sprite)) return;
    // Every sprite draws the one quad three.js owns.
    if (!(o instanceof Sprite)) o.geometry.dispose();
    for (const m of ([] as Material[]).concat(o.material)) {
      if ('map' in m && m.map instanceof Texture) m.map.dispose();
      m.dispose();
    }
  });
}

const TAP_SLOP_PX = 6;

/** Mounts a canvas in `host`; null when no WebGL 2 context can be had, so the caller shows its fallback. */
export function createStage(host: HTMLElement, view: StageView): Stage | null {
  const canvas = document.createElement('canvas');
  // Taking the context here, not in three.js, keeps a failure quiet: three.js logs it as an error.
  const context = canvas.getContext('webgl2', { antialias: true, alpha: true });
  if (!context) return null;
  const renderer = new WebGLRenderer({ canvas, context, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  canvas.style.cssText = 'display:block;width:100%;height:100%;outline:none';
  host.append(canvas);

  const reducedMotion = prefersReducedMotion();
  const scene = new Scene();
  const camera = new PerspectiveCamera(view.fov ?? 38, 1, 0.1, 400);
  const direction = new Vector3(...view.direction).normalize();
  const controls = new OrbitControls(camera, canvas);
  // On a touch screen a vertical swipe still scrolls the page; a sideways drag turns the model.
  canvas.style.touchAction = 'pan-y';
  controls.target.set(...view.target);
  camera.position.copy(controls.target).addScaledVector(direction, 12);
  controls.enableDamping = !reducedMotion;
  controls.enablePan = false;
  controls.minPolarAngle = 0.15;
  controls.maxPolarAngle = Math.PI - 0.15;
  // Wheel zoom would swallow page scrolling, so it is armed only once the reader presses on the canvas.
  controls.enableZoom = false;
  controls.update();

  let dirty = true;
  const callbacks = new Set<FrameCallback>();
  controls.addEventListener('change', () => {
    dirty = true;
  });

  let last = 0;
  const tick = (time: number) => {
    const dt = last ? Math.min((time - last) / 1000, 0.1) : 0;
    last = time;
    let draw = dirty;
    dirty = false;
    if (controls.update(dt)) draw = true;
    for (const fn of callbacks) if (fn(dt)) draw = true;
    if (draw) renderer.render(scene, camera);
  };
  let running = false;
  const run = (on: boolean) => {
    if (on === running) return;
    running = on;
    last = 0;
    renderer.setAnimationLoop(on ? tick : null);
  };

  let fitted: { width: number; height: number; target?: Vector3 } | null = null;
  const applyFit = () => {
    if (!fitted) return;
    const { width, height, target } = fitted;
    if (target) controls.target.copy(target);
    const half = (camera.fov * Math.PI) / 360;
    const distance = Math.max(height / 2 / Math.tan(half), width / 2 / (Math.tan(half) * camera.aspect)) * 1.12;
    const dir = camera.position.clone().sub(controls.target).normalize();
    camera.position.copy(controls.target).addScaledVector(dir, distance);
    controls.minDistance = distance * 0.45;
    controls.maxDistance = distance * 2.2;
    controls.update();
    dirty = true;
  };

  const resize = () => {
    const w = host.clientWidth;
    const h = host.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    applyFit();
    dirty = true;
  };
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(host);
  resize();

  const visibility = new IntersectionObserver(([entry]) => run(entry.isIntersecting));
  visibility.observe(host);

  const arm = () => {
    controls.enableZoom = true;
  };
  const disarm = () => {
    controls.enableZoom = false;
  };
  canvas.addEventListener('pointerdown', arm);
  canvas.addEventListener('pointerleave', disarm);

  const raycaster = new Raycaster();
  const ndc = new Vector2();

  return {
    scene,
    camera,
    reducedMotion,
    animate(fn) {
      callbacks.add(fn);
      dirty = true;
      return () => callbacks.delete(fn);
    },
    invalidate() {
      dirty = true;
    },
    fit(width, height, target) {
      fitted = { width, height, target };
      applyFit();
    },
    onTap(fn, targets) {
      let down: { x: number; y: number } | null = null;
      const press = (e: PointerEvent) => {
        down = { x: e.clientX, y: e.clientY };
      };
      const release = (e: PointerEvent) => {
        if (!down || Math.hypot(e.clientX - down.x, e.clientY - down.y) > TAP_SLOP_PX) return;
        down = null;
        const rect = canvas.getBoundingClientRect();
        ndc.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
        raycaster.setFromCamera(ndc, camera);
        fn(raycaster.intersectObjects(targets(), true));
      };
      canvas.addEventListener('pointerdown', press);
      canvas.addEventListener('pointerup', release);
      return () => {
        canvas.removeEventListener('pointerdown', press);
        canvas.removeEventListener('pointerup', release);
      };
    },
    dispose() {
      run(false);
      resizeObserver.disconnect();
      visibility.disconnect();
      canvas.removeEventListener('pointerdown', arm);
      canvas.removeEventListener('pointerleave', disarm);
      callbacks.clear();
      controls.dispose();
      disposeTree(scene);
      renderer.dispose();
      // After dispose() three.js no longer listens for the loss, so this frees the context silently.
      renderer.forceContextLoss();
      canvas.remove();
    },
  };
}
