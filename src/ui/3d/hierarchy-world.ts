import {
  BoxGeometry,
  DirectionalLight,
  EdgesGeometry,
  Group,
  HemisphereLight,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  SphereGeometry,
  type Sprite,
  Vector3,
} from 'three';
import { disposeLabel, makeLabel } from './labels';
import type { Stage } from './stage';
import type { Palette, Token } from './theme';

// The memory hierarchy as a stepped pyramid: small fast levels on top, big slow ones below. A
// burst of requests falls from the CPU, and each request stops at the level that serves it.

export interface HierarchyLevelView {
  name: string;
  detail: string;
}

const SLAB = 0.55;
const GAP = 0.5;
const BASE = 1.5;
const GROWTH = 1.05;
const FALL = 5.5;
const HOLD = 0.4;
const FADE = 0.3;
const LEVEL_TOKENS: Token[] = ['accent', 'violet', 'amber', 'emerald', 'coral'];

/** The theme colour of level i, shared with the HTML panels so both name a level the same way. */
export const levelToken = (i: number) => LEVEL_TOKENS[i % LEVEL_TOKENS.length];

interface Slab {
  mesh: Mesh<BoxGeometry, MeshStandardMaterial>;
  edges: LineSegments<EdgesGeometry, LineBasicMaterial>;
  labels: Sprite[];
  y: number;
  flash: number;
}

interface Particle {
  mesh: Mesh;
  level: number;
  delay: number;
  age: number;
  /** Seconds since it reached its level; negative while falling. */
  landed: number;
}

export class HierarchyWorld {
  private readonly root = new Group();
  private readonly build = new Group();
  private slabs: Slab[] = [];
  private particles: Particle[] = [];
  private readonly particleGeometry = new SphereGeometry(0.075, 12, 8);
  private readonly particleMaterials: MeshBasicMaterial[];
  private readonly cpuGeometry = new BoxGeometry(0.9, 0.28, 0.9);
  private readonly cpuMaterial: MeshStandardMaterial;
  private cpuY = 0;
  private cpuLabel: Sprite | null = null;
  private signature = '';
  private selected = -1;
  private readonly stopAnimating: () => void;
  private readonly stopTaps: () => void;

  constructor(
    private readonly stage: Stage,
    private readonly palette: Palette,
    onSelect: (level: number) => void,
  ) {
    const { swatch } = palette;
    this.particleMaterials = LEVEL_TOKENS.map((t) => new MeshBasicMaterial({ color: swatch[t].color }));
    this.cpuMaterial = new MeshStandardMaterial({ color: swatch.ink.color, roughness: 0.5 });
    const sky = new HemisphereLight(0xffffff, swatch.canvas.color, palette.dark ? 1.5 : 2.2);
    const sun = new DirectionalLight(0xffffff, palette.dark ? 1.4 : 1.1);
    sun.position.set(4, 8, 6);
    this.root.add(sky, sun, this.build);
    stage.scene.add(this.root);
    this.stopAnimating = stage.animate((dt) => this.step(dt));
    this.stopTaps = stage.onTap(
      (hits) => {
        const level = hits.map((h) => h.object.userData.level).find((l) => typeof l === 'number');
        if (typeof level === 'number') onSelect(level);
      },
      () => this.slabs.map((s) => s.mesh),
    );
  }

  setLevels(levels: readonly HierarchyLevelView[], selected: number) {
    const signature = JSON.stringify(levels);
    if (signature !== this.signature) {
      this.signature = signature;
      this.rebuild(levels);
      this.selected = -1;
    }
    if (selected !== this.selected) {
      this.selected = selected;
      this.slabs.forEach((s, i) => {
        const on = i === selected;
        s.mesh.material.opacity = on ? 0.6 : 0.3;
        s.mesh.material.emissiveIntensity = on ? 0.35 : 0;
        s.edges.material.opacity = on ? 1 : 0.6;
      });
    }
    this.stage.invalidate();
  }

  /** Sends one request per entry; each entry is the level that serves it. */
  burst(served: readonly number[]) {
    this.clearParticles();
    if (this.stage.reducedMotion) {
      for (const level of new Set(served)) if (this.slabs[level]) this.slabs[level].flash = 1;
      return;
    }
    const spread = Math.min(2.4, served.length * 0.012);
    served.forEach((level, i) => {
      if (!this.slabs[level]) return;
      const mesh = new Mesh(this.particleGeometry, this.particleMaterials[level % this.particleMaterials.length]);
      mesh.position.set((Math.random() - 0.5) * BASE * 0.7, this.cpuY, (Math.random() - 0.5) * BASE * 0.7);
      mesh.visible = false;
      this.build.add(mesh);
      this.particles.push({ mesh, level, delay: (i / served.length) * spread, age: 0, landed: -1 });
    });
  }

  private rebuild(levels: readonly HierarchyLevelView[]) {
    this.clearParticles();
    for (const s of this.slabs) this.disposeSlab(s);
    if (this.cpuLabel) disposeLabel(this.cpuLabel);
    this.build.clear();
    const { swatch, sans, mono } = this.palette;
    const total = levels.length * SLAB + (levels.length - 1) * GAP;
    const top = total / 2;

    this.slabs = levels.map((l, i) => {
      const width = BASE + i * GROWTH;
      const y = top - SLAB / 2 - i * (SLAB + GAP);
      const color = swatch[levelToken(i)].color;
      const geometry = new BoxGeometry(width, SLAB, width);
      const mesh = new Mesh(geometry, new MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0, transparent: true, opacity: 0.3, depthWrite: false, roughness: 0.6 }));
      mesh.position.y = y;
      mesh.userData.level = i;
      const edges = new LineSegments(new EdgesGeometry(geometry), new LineBasicMaterial({ color, transparent: true, opacity: 0.6 }));
      edges.position.y = y;
      const name = makeLabel(l.name, { color: swatch.ink.css, background: swatch.surface.css, family: sans, height: 0.3 });
      const detail = makeLabel(l.detail, { color: swatch.ink.css, background: swatch.surface.css, family: mono, height: 0.22, weight: 500 });
      const x = width / 2 + 0.35;
      name.position.set(x + name.scale.x / 2, y + 0.16, width / 2);
      detail.position.set(x + detail.scale.x / 2, y - 0.2, width / 2);
      this.build.add(mesh, edges, name, detail);
      return { mesh, edges, labels: [name, detail], y, flash: 0 };
    });

    this.cpuY = top + 0.6;
    const cpu = new Mesh(this.cpuGeometry, this.cpuMaterial);
    cpu.position.y = this.cpuY;
    this.cpuLabel = makeLabel('CPU', { color: swatch.ink.css, background: swatch.surface.css, family: mono, height: 0.26 });
    this.cpuLabel.position.set(0.7 + this.cpuLabel.scale.x / 2, this.cpuY, 0.45);
    this.build.add(cpu, this.cpuLabel);

    const widest = BASE + (levels.length - 1) * GROWTH;
    // Room below the last slab so its detail label never meets the canvas edge.
    this.stage.fit(widest * 1.3 + 3.6, total + 3, new Vector3(1.3, 0.25, 0));
  }

  private step(dt: number): boolean {
    let changed = false;
    this.slabs.forEach((s, i) => {
      if (s.flash <= 0) return;
      s.flash = Math.max(0, s.flash - dt * 2.4);
      s.mesh.material.emissiveIntensity = (i === this.selected ? 0.35 : 0) + s.flash * 0.6;
      changed = true;
    });
    if (!this.particles.length) return changed;
    for (const p of this.particles) {
      p.age += dt;
      if (p.age < p.delay) continue;
      p.mesh.visible = true;
      const slab = this.slabs[p.level];
      if (p.landed < 0) {
        p.mesh.position.y -= FALL * dt;
        if (p.mesh.position.y <= slab.y) {
          p.mesh.position.y = slab.y;
          p.landed = 0;
          slab.flash = Math.max(slab.flash, 0.6);
        }
      } else {
        p.landed += dt;
        if (p.landed > HOLD) p.mesh.scale.setScalar(Math.max(0, 1 - (p.landed - HOLD) / FADE));
      }
    }
    const done = this.particles.filter((p) => p.landed > HOLD + FADE);
    for (const p of done) p.mesh.removeFromParent();
    if (done.length) this.particles = this.particles.filter((p) => p.landed <= HOLD + FADE);
    return true;
  }

  private clearParticles() {
    for (const p of this.particles) p.mesh.removeFromParent();
    this.particles = [];
  }

  private disposeSlab(s: Slab) {
    s.mesh.geometry.dispose();
    s.mesh.material.dispose();
    s.edges.geometry.dispose();
    s.edges.material.dispose();
    for (const l of s.labels) disposeLabel(l);
  }

  dispose() {
    this.stopAnimating();
    this.stopTaps();
    this.clearParticles();
    for (const s of this.slabs) this.disposeSlab(s);
    if (this.cpuLabel) disposeLabel(this.cpuLabel);
    this.root.removeFromParent();
    this.particleGeometry.dispose();
    for (const m of this.particleMaterials) m.dispose();
    this.cpuGeometry.dispose();
    this.cpuMaterial.dispose();
    this.stage.invalidate();
  }
}
