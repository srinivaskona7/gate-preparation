// AVL insertion and deletion, recorded one frame per visible change for the tree visualizer.
// Internally a leaf has height 1 and an empty tree 0; balance factors do not depend on that
// choice, and everything the reader sees counts height in edges, as GATE questions do.

export interface TreeNode {
  key: number;
  height: number;
  left: TreeNode | null;
  right: TreeNode | null;
}

export type Rotation = 'LL' | 'RR' | 'LR' | 'RL';
export type FrameKind = 'start' | 'insert' | 'delete' | 'imbalance' | 'rotate' | 'skip';
export type Op = { type: 'insert' | 'delete'; key: number };

export interface Frame {
  tree: TreeNode | null;
  kind: FrameKind;
  /** What just happened, in one or two sentences. */
  note: string;
  /** The keys the frame is about: a new node, an unbalanced node and its child, a new subtree root. */
  focus: number[];
  rotation?: Rotation;
}

interface Mut {
  key: number;
  height: number;
  left: Mut | null;
  right: Mut | null;
  parent: Mut | null;
}

const heightOf = (n: { height: number } | null) => (n ? n.height : 0);
export const balanceOf = (n: { height: number; left: { height: number } | null; right: { height: number } | null }) =>
  heightOf(n.left) - heightOf(n.right);
const signed = (b: number) => (b > 0 ? `+${b}` : b < 0 ? `−${-b}` : '0');

function snapshot(n: Mut | null): TreeNode | null {
  return n && { key: n.key, height: n.height, left: snapshot(n.left), right: snapshot(n.right) };
}

class Recorder {
  root: Mut | null = null;
  frames: Frame[] = [];
  private rotations = 0;

  private record(kind: FrameKind, note: string, focus: number[], rotation?: Rotation) {
    this.frames.push({ tree: snapshot(this.root), kind, note, focus, ...(rotation && { rotation }) });
  }

  private fixHeights(from: Mut | null) {
    for (let n = from; n; n = n.parent) n.height = 1 + Math.max(heightOf(n.left), heightOf(n.right));
  }

  /** Puts `next` where `old` hangs, from the parent's side; `old` keeps its own links. */
  private replace(old: Mut, next: Mut | null) {
    const p = old.parent;
    if (next) next.parent = p;
    if (!p) this.root = next;
    else if (p.left === old) p.left = next;
    else p.right = next;
  }

  private rotateRight(z: Mut): Mut {
    const y = z.left;
    if (!y) throw new Error(`rotateRight(${z.key}) needs a left child`);
    z.left = y.right;
    if (y.right) y.right.parent = z;
    this.replace(z, y);
    y.right = z;
    z.parent = y;
    this.fixHeights(z);
    return y;
  }

  private rotateLeft(z: Mut): Mut {
    const y = z.right;
    if (!y) throw new Error(`rotateLeft(${z.key}) needs a right child`);
    z.right = y.left;
    if (y.left) y.left.parent = z;
    this.replace(z, y);
    y.left = z;
    z.parent = y;
    this.fixHeights(z);
    return y;
  }

  /** Restores balance at z, whose balance is ±2; returns the subtree's new root. */
  private rebalance(z: Mut): Mut {
    const b = balanceOf(z);
    const child = b > 0 ? z.left : z.right;
    if (!child) throw new Error(`node ${z.key} is unbalanced without a child on its heavy side`);
    const cb = balanceOf(child);
    // An evenly balanced child happens only after a deletion; a single rotation fixes it.
    const rotation: Rotation = b > 0 ? (cb >= 0 ? 'LL' : 'LR') : cb <= 0 ? 'RR' : 'RL';
    const heavy = b > 0 ? 'left' : 'right';
    const grandchild = rotation === 'LR' ? child.right : rotation === 'RL' ? child.left : null;
    const single = `one ${heavy === 'left' ? 'right' : 'left'} rotation at ${z.key} fixes it`;
    const why =
      rotation === 'LR' || rotation === 'RL'
        ? `the ${heavy} child ${child.key} leans the other way, so rotate at ${child.key} first, then at ${z.key}`
        : cb === 0
          ? `the ${heavy} child ${child.key} is evenly balanced, which only a deletion leaves, and ${single}`
          : `the ${heavy} child ${child.key} leans the same way, so ${single}`;
    this.record('imbalance', `${z.key} has balance ${signed(b)}: its ${heavy} subtree is two levels taller. ${rotation} case: ${why}.`, [z.key, child.key, ...(grandchild ? [grandchild.key] : [])], rotation);

    let top: Mut;
    if (rotation === 'LL') top = this.rotateRight(z);
    else if (rotation === 'RR') top = this.rotateLeft(z);
    else {
      const first = rotation === 'LR' ? this.rotateLeft(child) : this.rotateRight(child);
      this.rotations++;
      this.record('rotate', `${rotation === 'LR' ? 'Left' : 'Right'} rotation at ${child.key}: ${first.key} moves up, turning the ${rotation} case into an ${rotation === 'LR' ? 'LL' : 'RR'} one.`, [first.key, child.key], rotation);
      top = rotation === 'LR' ? this.rotateRight(z) : this.rotateLeft(z);
    }
    this.rotations++;
    const side = rotation === 'LL' || rotation === 'LR' ? 'right' : 'left';
    this.record('rotate', `${side === 'right' ? 'Right' : 'Left'} rotation at ${z.key}: ${top.key} becomes the subtree root and ${z.key} its ${side} child.`, [top.key, z.key], rotation);
    return top;
  }

  /** Walks from `start` to the root, rotating at every node whose balance reached ±2. */
  private retrace(start: Mut | null) {
    this.fixHeights(start);
    let n = start;
    while (n) {
      if (Math.abs(balanceOf(n)) > 1) {
        const top = this.rebalance(n);
        n = top.parent;
      } else n = n.parent;
    }
  }

  /** Closes an operation's narration: whether it needed rotations. */
  private settle(opFrame: number) {
    if (!this.root) return;
    if (this.rotations === 0) this.frames[opFrame].note += ' Every node still has balance −1, 0 or +1, so no rotation is needed.';
    else this.frames[this.frames.length - 1].note += ' Every node is balanced again.';
  }

  insert(key: number) {
    this.rotations = 0;
    if (!this.root) {
      this.root = { key, height: 1, left: null, right: null, parent: null };
      this.record('insert', `Insert ${key}: the tree is empty, so ${key} becomes the root.`, [key]);
      return;
    }
    const path: number[] = [];
    let cur = this.root;
    for (;;) {
      if (key === cur.key) {
        this.record('skip', `${key} is already in the tree, so nothing changes: these AVL trees hold distinct keys.`, [key]);
        return;
      }
      path.push(cur.key);
      const next = key < cur.key ? cur.left : cur.right;
      if (!next) break;
      cur = next;
    }
    const leaf: Mut = { key, height: 1, left: null, right: null, parent: cur };
    const side = key < cur.key ? 'left' : 'right';
    if (side === 'left') cur.left = leaf;
    else cur.right = leaf;
    this.fixHeights(cur);
    this.record('insert', `Insert ${key}: compare down ${path.join(' → ')} and attach it as the ${side} child of ${cur.key}.`, [key]);
    const opFrame = this.frames.length - 1;
    this.retrace(cur);
    this.settle(opFrame);
  }

  delete(key: number) {
    this.rotations = 0;
    let d = this.root;
    while (d && d.key !== key) d = key < d.key ? d.left : d.right;
    if (!d) {
      this.record('skip', `${key} is not in the tree, so nothing changes.`, []);
      return;
    }
    let from: Mut | null;
    if (d.left && d.right) {
      // The in-order successor has no left child, so removing its node is the one-child case.
      let s = d.right;
      while (s.left) s = s.left;
      d.key = s.key;
      from = s.parent;
      this.replace(s, s.right);
      this.fixHeights(from);
      this.record('delete', `Delete ${key}: it has two children, so its in-order successor ${s.key} takes its place and the old ${s.key} node is removed.`, [s.key]);
    } else {
      const child = d.left ?? d.right;
      from = d.parent;
      this.replace(d, child);
      this.fixHeights(from);
      this.record(
        'delete',
        child ? `Delete ${key}: it has one child, ${child.key}, which moves up into its place.` : `Delete ${key}: it is a leaf, so it is simply removed.`,
        child ? [child.key] : from ? [from.key] : [],
      );
    }
    const opFrame = this.frames.length - 1;
    this.retrace(from);
    this.settle(opFrame);
  }
}

/** Every frame of a run of operations on an empty tree, starting with the empty tree itself. */
export function buildFrames(ops: readonly Op[]): Frame[] {
  const r = new Recorder();
  r.frames.push({ tree: null, kind: 'start', note: 'An empty AVL tree. Insert keys to build it.', focus: [] });
  for (const op of ops) {
    if (op.type === 'insert') r.insert(op.key);
    else r.delete(op.key);
  }
  return r.frames;
}

export interface PlacedNode {
  key: number;
  /** In-order rank, 0 to n − 1: no two nodes share a column. */
  x: number;
  depth: number;
  balance: number;
  parent: number | null;
}

export function layout(tree: TreeNode | null): PlacedNode[] {
  const out: PlacedNode[] = [];
  const walk = (n: TreeNode | null, depth: number, parent: number | null) => {
    if (!n) return;
    walk(n.left, depth + 1, n.key);
    out.push({ key: n.key, x: out.length, depth, balance: balanceOf(n), parent });
    walk(n.right, depth + 1, n.key);
  };
  walk(tree, 0, null);
  return out;
}

export const keysOf = (tree: TreeNode | null): number[] => layout(tree).map((n) => n.key);

/** Height in edges: −1 for the empty tree, 0 for a single node. */
export const edgeHeight = (tree: TreeNode | null) => heightOf(tree) - 1;

/** The fewest keys an AVL tree of height h (in edges) can hold: N(h) = N(h − 1) + N(h − 2) + 1. */
export function minNodes(h: number): number {
  let [a, b] = [0, 1]; // N(−1), N(0)
  for (let i = 0; i < h; i++) [a, b] = [b, a + b + 1];
  return h < 0 ? 0 : b;
}

/** The tallest an AVL tree with n keys can be, in edges: the largest h with N(h) ≤ n. */
export function maxHeight(n: number): number {
  if (n < 1) return -1;
  let h = 0;
  while (minNodes(h + 1) <= n) h++;
  return h;
}
