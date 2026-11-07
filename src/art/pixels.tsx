import type { ReactNode } from "react";

/**
 * Tiny pixel-art toolkit for SVG scenes on a 160×90 canvas.
 * Everything is axis-aligned rects with crispEdges, so it scales like sprite art.
 */

export const W = 160;
export const H = 90;

export function R({ x, y, w, h, c, o }: { x: number; y: number; w: number; h: number; c: string; o?: number }) {
  return <rect x={x} y={y} width={w} height={h} fill={c} opacity={o} />;
}

/** Stacked horizontal bands (stepped "gradient", the pixel-art way). */
export function Bands({ y = 0, colors, h }: { y?: number; colors: string[]; h: number }) {
  return (
    <g>
      {colors.map((c, i) => (
        <rect key={i} x={0} y={y + i * h} width={W} height={h + 0.5} fill={c} />
      ))}
    </g>
  );
}

/**
 * Sprite from text rows. '.' or ' ' is transparent; other characters look up `palette`.
 * Horizontal runs are merged into single rects.
 */
export function Sprite({
  rows,
  palette,
  x,
  y,
  s = 1,
  flip = false,
}: {
  rows: string[];
  palette: Record<string, string>;
  x: number;
  y: number;
  s?: number;
  flip?: boolean;
}) {
  const rects: ReactNode[] = [];
  const width = Math.max(...rows.map((r) => r.length));
  rows.forEach((row, ry) => {
    const line = flip ? row.padEnd(width, ".").split("").reverse().join("") : row;
    let start = 0;
    while (start < line.length) {
      const ch = line[start];
      let end = start + 1;
      while (end < line.length && line[end] === ch) end++;
      if (ch !== "." && ch !== " " && palette[ch]) {
        rects.push(
          <rect key={`${ry}-${start}`} x={x + start * s} y={y + ry * s} width={(end - start) * s} height={s} fill={palette[ch]} />,
        );
      }
      start = end;
    }
  });
  return <g>{rects}</g>;
}

/** A chunky pixel line from (x0,y0) to (x1,y1) whose thickness tapers from t0 to t1. */
export function Chain({
  x0,
  y0,
  x1,
  y1,
  t0,
  t1 = t0,
  c,
}: {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  t0: number;
  t1?: number;
  c: string;
}) {
  const steps = Math.max(1, Math.ceil(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) / 1.5));
  const rects: ReactNode[] = [];
  for (let i = 0; i <= steps; i++) {
    const f = i / steps;
    const t = Math.max(1, Math.round(t0 + (t1 - t0) * f));
    const x = Math.round(x0 + (x1 - x0) * f - t / 2);
    const y = Math.round(y0 + (y1 - y0) * f - t / 2);
    rects.push(<rect key={i} x={x} y={y} width={t} height={t} fill={c} />);
  }
  return <g>{rects}</g>;
}

/** Deterministic pseudo-random scatter (same every render; no hydration drift). */
export function scatter(seed: number, n: number, box: { x: number; y: number; w: number; h: number }) {
  let s = seed >>> 0;
  const rnd = () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
  return Array.from({ length: n }, () => ({
    x: Math.floor(box.x + rnd() * box.w),
    y: Math.floor(box.y + rnd() * box.h),
    r: rnd(),
  }));
}

export function Dots({
  seed,
  n,
  box,
  c,
  size = 1,
  o,
}: {
  seed: number;
  n: number;
  box: { x: number; y: number; w: number; h: number };
  c: string;
  size?: number;
  o?: number;
}) {
  return (
    <g opacity={o}>
      {scatter(seed, n, box).map((p, i) => (
        <rect key={i} x={p.x} y={p.y} width={size} height={size} fill={c} />
      ))}
    </g>
  );
}

export interface SceneLayer {
  /** Clue number at which this layer first appears (1..6). */
  from: number;
  node: ReactNode;
}

export interface SceneDef {
  layers: SceneLayer[];
  /** Darkness overlay per hidden stage (scene brightens as clues arrive). */
  dim?: number;
}
