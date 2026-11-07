import { H, R, W, type SceneDef } from "./pixels";
import { carboniferous, cretaceous, devonian, jurassic } from "./scenes/deepTime";
import { dustWindow, jazzNight, moonNight, placeholder } from "./scenes/americana";

/**
 * Neutral art key -> artwork. Keys are assigned server-side (src/art/assignments.ts)
 * so nothing shipped to the browser names a period or decade. Unknown keys fall back
 * to a neutral landscape. To ship commissioned art, replace a SceneDef (layers of
 * <image> elements with neutral filenames work too).
 */
const REGISTRY: Record<string, SceneDef> = {
  "scene-01": carboniferous,
  "scene-02": jazzNight,
  "scene-03": jurassic,
  "scene-04": moonNight,
  "scene-05": devonian,
  "scene-06": dustWindow,
  "scene-07": cretaceous,
};

export function SceneArt({ artId, stage }: { artId: string | null; stage: number }) {
  const def = (artId && REGISTRY[artId]) || placeholder;
  // Only layers up to the current clue are rendered at all: no hidden DOM to inspect.
  const visible = def.layers.filter((l) => l.from <= stage);
  const dim = Math.max(0, 6 - stage) * (def.dim ?? 0.05);
  return (
    <svg
      className="scene-art"
      viewBox={`0 0 ${W} ${H}`}
      shapeRendering="crispEdges"
      role="img"
      aria-label={`Scene illustration. ${stage} of 6 details revealed.`}
      preserveAspectRatio="xMidYMid slice"
    >
      {visible.map((l) => (
        <g key={l.from} className="art-layer">
          {l.node}
        </g>
      ))}
      {dim > 0 && <R x={0} y={0} w={W} h={H} c="#0c100d" o={dim} />}
    </svg>
  );
}
