import { CanvasTexture, SRGBColorSpace, Sprite, SpriteMaterial } from 'three';

// Text in a 3D scene: drawn once on a 2D canvas at a large size and shown as a camera-facing sprite,
// which stays crisp at any zoom the stage allows.

const PX = 64;

export interface LabelStyle {
  /** A CSS colour a 2D canvas understands; see Swatch.css. */
  color: string;
  /** A CSS font-family list. */
  family: string;
  /** Height in world units. */
  height: number;
  weight?: number;
  background?: string;
}

export function makeLabel(text: string, { color, family, height, weight = 600, background }: LabelStyle): Sprite {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const font = `${weight} ${PX}px ${family}`;
  const pad = background ? PX * 0.35 : PX * 0.1;
  if (ctx) {
    ctx.font = font;
    canvas.width = Math.ceil(ctx.measureText(text).width + pad * 2);
    canvas.height = Math.ceil(PX * 1.35);
    // Resizing a canvas resets its context state.
    ctx.font = font;
    if (background) {
      ctx.fillStyle = background;
      ctx.beginPath();
      ctx.roundRect(0, 0, canvas.width, canvas.height, canvas.height * 0.3);
      ctx.fill();
    }
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, canvas.width / 2, canvas.height / 2 + PX * 0.04);
  }
  const map = new CanvasTexture(canvas);
  map.colorSpace = SRGBColorSpace;
  // Drawn over the geometry, so turning a model around never hides its own text.
  const sprite = new Sprite(new SpriteMaterial({ map, transparent: true, depthWrite: false, depthTest: false }));
  sprite.scale.set((height * canvas.width) / Math.max(canvas.height, 1), height, 1);
  sprite.renderOrder = 2;
  return sprite;
}

/** Frees a label's texture and material; sprites share their geometry, so it stays. */
export function disposeLabel(sprite: Sprite) {
  sprite.material.map?.dispose();
  sprite.material.dispose();
  sprite.removeFromParent();
}
