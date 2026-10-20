import {
  type Color,
  CylinderGeometry,
  DirectionalLight,
  Group,
  HemisphereLight,
  Mesh,
  MeshStandardMaterial,
  SphereGeometry,
  type Sprite,
  Vector3,
} from 'three';
import { disposeLabel, makeLabel } from './labels';
import type { Stage } from './stage';
import type { Palette, Token } from './theme';

// A binary search tree drawn in 3D: one sphere per key, rods for the edges and a badge with each
// node's balance factor. Nodes glide to their new places between frames, so a rotation reads as
// a rotation; with reduced motion they jump.

export interface TreeNodeView {
  key: number;
  /** In-order rank: the column. */
  x: number;
  depth: number;
  balance: number;
  parent: number | null;
}

export type TreeTone = 'accent' | 'coral' | 'violet';

const SPACING = 1.25;
const LEVEL = 1.55;
const RADIUS = 0.42;
const EASE = 9;
const UP = new Vector3(0, 1, 0);

interface NodeObject {
  group: Group;
  sphere: Mesh;
  badge: Sprite;
  balance: number;
  target: Vector3;
  scale: number;
  targetScale: number;
}

const signed = (b: number) => (b > 0 ? `+${b}` : b < 0 ? `−${-b}` : '0');
const badgeToken = (b: number): Token => (b === 0 ? 'emerald' : Math.abs(b) === 1 ? 'amber' : 'coral');

export class TreeWorld {
  private readonly root = new Group();
  private readonly nodes = new Map<number, NodeObject>();
  private readonly edges = new Map<number, { rod: Mesh; parent: number }>();
  private readonly sphereGeometry = new SphereGeometry(RADIUS, 32, 20);
  private readonly rodGeometry = new CylinderGeometry(0.045, 0.045, 1, 10);
  private readonly plain: MeshStandardMaterial;
  private readonly rodMaterial: MeshStandardMaterial;
  private readonly focusMaterials: Record<TreeTone, MeshStandardMaterial>;
  private readonly stopAnimating: () => void;
  private extent = '';
  private built = false;

  constructor(
    private readonly stage: Stage,
    private readonly palette: Palette,
  ) {
    const { swatch } = palette;
    const plainColor = swatch['surface-3'].color.clone().lerp(swatch.ink.color, palette.dark ? 0.16 : 0.08);
    this.plain = new MeshStandardMaterial({ color: plainColor, roughness: 0.55, metalness: 0.05 });
    this.rodMaterial = new MeshStandardMaterial({ color: swatch.faint.color, roughness: 0.8 });
    const focus = (c: Color) => new MeshStandardMaterial({ color: c, roughness: 0.4, emissive: c, emissiveIntensity: palette.dark ? 0.25 : 0.08 });
    this.focusMaterials = { accent: focus(swatch.accent.color), coral: focus(swatch.coral.color), violet: focus(swatch.violet.color) };

    const sky = new HemisphereLight(0xffffff, swatch.canvas.color, palette.dark ? 1.6 : 2.2);
    const sun = new DirectionalLight(0xffffff, palette.dark ? 1.6 : 1.2);
    sun.position.set(3, 6, 8);
    this.root.add(sky, sun);
    stage.scene.add(this.root);
    this.stopAnimating = stage.animate((dt) => this.step(dt));
  }

  update(nodes: readonly TreeNodeView[], focus: readonly number[], tone: TreeTone) {
    const snap = !this.built || this.stage.reducedMotion;
    this.built = true;
    const maxDepth = nodes.reduce((m, n) => Math.max(m, n.depth), 0);
    const place = (n: TreeNodeView) => new Vector3((n.x - (nodes.length - 1) / 2) * SPACING, (maxDepth / 2 - n.depth) * LEVEL, 0);
    const focused = new Set(focus);
    const present = new Set(nodes.map((n) => n.key));

    for (const n of nodes) {
      const target = place(n);
      let o = this.nodes.get(n.key);
      if (!o) {
        // A new key grows out of its parent's current spot.
        const from = n.parent === null ? target : (this.nodes.get(n.parent)?.group.position ?? target);
        o = this.createNode(n.key, n.balance, from.clone());
        if (snap) {
          o.scale = 1;
          o.group.scale.setScalar(1);
        }
      }
      o.target.copy(target);
      o.targetScale = 1;
      if (snap) o.group.position.copy(target);
      o.sphere.material = focused.has(n.key) ? this.focusMaterials[tone] : this.plain;
      if (o.balance !== n.balance) this.setBadge(o, n.balance);
    }
    for (const [key, o] of this.nodes) if (!present.has(key)) o.targetScale = 0;

    for (const [child, edge] of this.edges) {
      const parent = nodes.find((n) => n.key === child)?.parent;
      if (parent === undefined || parent === null) {
        this.edges.delete(child);
        edge.rod.removeFromParent();
      } else edge.parent = parent;
    }
    for (const n of nodes) {
      if (n.parent === null || this.edges.has(n.key)) continue;
      const rod = new Mesh(this.rodGeometry, this.rodMaterial);
      this.root.add(rod);
      this.edges.set(n.key, { rod, parent: n.parent });
    }
    this.placeEdges();

    const width = Math.max(nodes.length - 1, 2) * SPACING + RADIUS * 4;
    const height = maxDepth * LEVEL + RADIUS * 4;
    const extent = `${width}x${height}`;
    if (extent !== this.extent) {
      this.extent = extent;
      this.stage.fit(width, height, new Vector3(0, 0, 0));
    }
    this.stage.invalidate();
  }

  private createNode(key: number, balance: number, at: Vector3): NodeObject {
    const group = new Group();
    group.position.copy(at);
    group.scale.setScalar(0.001);
    const sphere = new Mesh(this.sphereGeometry, this.plain);
    const label = makeLabel(String(key), { color: this.palette.swatch.ink.css, background: this.palette.swatch.surface.css, family: this.palette.mono, height: 0.36 });
    const badge = this.makeBadge(balance);
    group.add(sphere, label, badge);
    const o: NodeObject = { group, sphere, badge, balance, target: at.clone(), scale: 0.001, targetScale: 1 };
    this.root.add(group);
    this.nodes.set(key, o);
    return o;
  }

  private makeBadge(balance: number) {
    const { swatch, mono } = this.palette;
    const badge = makeLabel(signed(balance), { color: swatch[badgeToken(balance)].css, background: swatch.surface.css, family: mono, height: 0.26 });
    badge.position.set(RADIUS * 1.05, RADIUS * 1.05, 0);
    return badge;
  }

  private setBadge(o: NodeObject, balance: number) {
    disposeLabel(o.badge);
    o.badge = this.makeBadge(balance);
    o.group.add(o.badge);
    o.balance = balance;
  }

  private placeEdges() {
    for (const [child, { rod, parent }] of this.edges) {
      const a = this.nodes.get(parent)?.group.position;
      const b = this.nodes.get(child)?.group.position;
      if (!a || !b) continue;
      const dir = b.clone().sub(a);
      rod.position.copy(a).addScaledVector(dir, 0.5);
      rod.scale.set(1, Math.max(dir.length(), 1e-3), 1);
      rod.quaternion.setFromUnitVectors(UP, dir.normalize());
    }
  }

  private step(dt: number): boolean {
    const k = this.stage.reducedMotion ? 1 : 1 - Math.exp(-dt * EASE);
    let moved = false;
    for (const [key, o] of this.nodes) {
      if (o.group.position.distanceToSquared(o.target) > 1e-6) {
        o.group.position.lerp(o.target, k);
        moved = true;
      } else if (!o.group.position.equals(o.target)) {
        o.group.position.copy(o.target);
        moved = true;
      }
      if (Math.abs(o.scale - o.targetScale) > 1e-3) {
        o.scale += (o.targetScale - o.scale) * k;
        o.group.scale.setScalar(Math.max(o.scale, 0.001));
        moved = true;
      } else if (o.scale !== o.targetScale) {
        o.scale = o.targetScale;
        o.group.scale.setScalar(Math.max(o.scale, 0.001));
        moved = true;
      }
      if (o.targetScale === 0 && o.scale === 0) this.removeNode(key, o);
    }
    if (moved) this.placeEdges();
    return moved;
  }

  private removeNode(key: number, o: NodeObject) {
    for (const child of o.group.children) if (child !== o.sphere) disposeLabel(child as Sprite);
    o.group.removeFromParent();
    this.nodes.delete(key);
  }

  dispose() {
    this.stopAnimating();
    for (const [key, o] of this.nodes) this.removeNode(key, o);
    this.root.removeFromParent();
    this.sphereGeometry.dispose();
    this.rodGeometry.dispose();
    this.plain.dispose();
    this.rodMaterial.dispose();
    for (const m of Object.values(this.focusMaterials)) m.dispose();
    this.stage.invalidate();
  }
}
