import { Bands, Chain, Dots, R, Sprite, type SceneDef } from "../pixels";

/*
 * Geologic-period scenes. Each layer appears only at the clue that describes it
 * (see each scenario's visualBrief). Placeholder art — replace with commissioned
 * pixel art by swapping these definitions; the layer/clue contract stays the same.
 */

// ---------------------------------------------------------------- Carboniferous
function lycopsid(x: number, top: number, key: number) {
  // tall trunk with diamond leaf-scar pattern
  const cells = [];
  for (let y = top + 2; y < 76; y += 3) {
    cells.push(<rect key={`a${y}`} x={x + ((y / 3) % 2 === 0 ? 1 : 3)} y={y} width={1} height={1} fill="#8ea067" />);
  }
  return (
    <g key={key}>
      <R x={x} y={top} w={5} h={76 - top} c="#4d5b37" />
      <R x={x + 4} y={top} w={1} h={76 - top} c="#3a462a" />
      {cells}
      <R x={x - 3} y={top - 2} w={11} h={3} c="#355a33" />
      <R x={x - 1} y={top - 4} w={7} h={2} c="#3f6a3a" />
    </g>
  );
}

function horsetail(x: number, top: number, key: number) {
  const nodes = [];
  for (let y = top; y < 78; y += 4) {
    nodes.push(<rect key={y} x={x - 2} y={y} width={5} height={1} fill="#4d7a35" />);
  }
  return (
    <g key={key}>
      <R x={x} y={top} w={1} h={78 - top} c="#7aa94d" />
      {nodes}
    </g>
  );
}

const DRAGONFLY = [
  "......ww.......ww...",
  "....wwwww....wwwww..",
  "bbbbbbbbbbbbbbbbbbhh",
  "....wwwww....wwwww..",
  "......ww.......ww...",
];

const MILLIPEDE = [
  "..ssssssssssssssssssssss..",
  ".sdsdsdsdsdsdsdsdsdsdsdsse",
  "..l.l.l.l.l.l.l.l.l.l.l...",
];

const AMPHIBIAN = [
  "......gggggg......",
  "..ggggGGGGGGgggge.",
  "gg..l....l...l..l.",
];

export const carboniferous: SceneDef = {
  dim: 0.06,
  layers: [
    {
      from: 1,
      node: (
        <g>
          <Bands colors={["#1d3a29", "#244532", "#2f5a3c", "#4a7a58", "#6f9b78", "#8bb293"]} h={12} />
          <Bands y={72} colors={["#3b4f2c", "#33452a", "#2b3a24"]} h={6} />
          {/* canopy ceiling */}
          {[0, 18, 34, 52, 70, 90, 108, 126, 144].map((x, i) => (
            <R key={i} x={x} y={0} w={22} h={6 + (i % 3) * 3} c={i % 2 ? "#163021" : "#1a3826"} />
          ))}
          {/* faint indistinct trunks in mist */}
          {[22, 61, 99, 137].map((x) => (
            <R key={x} x={x} y={10} w={3} h={62} c="#4f7a5a" o={0.5} />
          ))}
          <Dots seed={3} n={40} box={{ x: 0, y: 30, w: 160, h: 40 }} c="#d6e8d6" o={0.35} size={2} />
          <Dots seed={9} n={30} box={{ x: 0, y: 74, w: 160, h: 16 }} c="#55703c" />
        </g>
      ),
    },
    {
      from: 2,
      node: (
        <g>
          {/* water threads */}
          <R x={0} y={77} w={70} h={4} c="#2f5d57" />
          <R x={84} y={80} w={76} h={3} c="#2f5d57" />
          <R x={10} y={78} w={14} h={1} c="#7fb3a6" />
          <R x={100} y={81} w={10} h={1} c="#7fb3a6" />
          {/* splash ripple */}
          <R x={48} y={76} w={7} h={1} c="#a7d0c4" />
          <R x={46} y={78} w={2} h={1} c="#a7d0c4" />
          <R x={55} y={78} w={2} h={1} c="#a7d0c4" />
          {[14, 44, 92, 126].map((x, i) => lycopsid(x, 8 + (i % 2) * 6, i))}
        </g>
      ),
    },
    {
      from: 3,
      node: (
        <g>
          {[6, 32, 37, 70, 76, 112, 118, 150].map((x, i) => horsetail(x, 46 + (i % 3) * 6, i))}
          {/* clubmoss tufts, no flowers anywhere */}
          {[0, 26, 58, 84, 106, 140].map((x, i) => (
            <Sprite
              key={i}
              x={x}
              y={68}
              rows={["..g.g..", ".gGgGg.", "gGgGgGg", "GgGgGgG"]}
              palette={{ g: "#5f9440", G: "#3e6b2c" }}
            />
          ))}
        </g>
      ),
    },
    {
      from: 4,
      node: (
        <g className="art-hover">
          <Sprite x={88} y={30} s={2} rows={DRAGONFLY} palette={{ w: "#d3ece6", b: "#2f6a5b", h: "#8f3d2a" }} />
        </g>
      ),
    },
    {
      from: 5,
      node: (
        <g>
          {/* fallen log */}
          <R x={58} y={70} w={44} h={4} c="#5b4630" />
          <R x={58} y={70} w={44} h={1} c="#7a6142" />
          <Sprite x={62} y={66} s={1} rows={MILLIPEDE} palette={{ s: "#7b5a3a", d: "#4a3420", l: "#3a2a1a", e: "#c9a14a" }} />
          <Sprite x={8} y={73} s={1} rows={AMPHIBIAN} palette={{ g: "#5d6e3a", G: "#738a46", l: "#3b4a24", e: "#e0c060" }} />
          <Sprite x={120} y={76} s={1} rows={AMPHIBIAN} palette={{ g: "#5d6e3a", G: "#738a46", l: "#3b4a24", e: "#e0c060" }} flip />
        </g>
      ),
    },
    {
      from: 6,
      node: (
        <g>
          {/* cut-away: future coal seams beneath the swamp */}
          <R x={0} y={84} w={160} h={6} c="#5a4a36" />
          <R x={0} y={85} w={160} h={2} c="#141414" />
          <R x={0} y={88} w={160} h={1} c="#1e1e1e" />
          <Dots seed={21} n={18} box={{ x: 0, y: 85, w: 160, h: 2 }} c="#4c4c4c" />
        </g>
      ),
    },
  ],
};

// ---------------------------------------------------------------- Jurassic
function conifer(x: number, base: number, h: number, key: number) {
  const tiers = [];
  for (let i = 0; i < 4; i++) {
    const w = 4 + i * 3;
    tiers.push(<R key={i} x={x - w / 2 + 1} y={base - h + i * (h / 4)} w={w} h={h / 5} c={i % 2 ? "#2f5a35" : "#376a3d"} />);
  }
  return (
    <g key={key}>
      <R x={x} y={base - h} w={2} h={h} c="#5a4430" />
      {tiers}
    </g>
  );
}

function cycad(x: number, y: number, key: number) {
  return (
    <Sprite
      key={key}
      x={x}
      y={y}
      rows={["f..f..f", ".f.f.f.", "..fff..", "fffffff", "..btb..", "..btb..", "..btb.."]}
      palette={{ f: "#4f8a3c", b: "#7a5a32", t: "#9a7848" }}
    />
  );
}

export const jurassic: SceneDef = {
  dim: 0.05,
  layers: [
    {
      from: 1,
      node: (
        <g>
          <Bands colors={["#5f7f98", "#7593a8", "#8fa8b6", "#a9bcc0", "#c3cfc6"]} h={11} />
          {/* storm clouds */}
          <R x={104} y={4} w={56} h={8} c="#4d6276" />
          <R x={116} y={12} w={44} h={5} c="#58708a" />
          <R x={0} y={8} w={30} h={5} c="#6d889e" />
          {/* flat horizon + banks */}
          <R x={0} y={55} w={160} h={6} c="#5d7d4c" />
          <R x={0} y={61} w={160} h={29} c="#6b5a3a" />
          {/* river */}
          <R x={0} y={66} w={160} h={10} c="#4e7f8c" />
          <R x={0} y={66} w={160} h={1} c="#88b6bd" />
          <Dots seed={5} n={16} box={{ x: 0, y: 68, w: 160, h: 7 }} c="#8fc0c4" size={2} />
          <R x={0} y={80} w={160} h={10} c="#57683a" />
        </g>
      ),
    },
    {
      from: 2,
      node: (
        <g>
          {[8, 20, 36, 120, 134, 150].map((x, i) => conifer(x, 58, 22 + (i % 3) * 5, i))}
          {[52, 70, 98].map((x, i) => conifer(x, 57, 14, 10 + i))}
          {[14, 44, 92, 128].map((x, i) => cycad(x, 79, i))}
        </g>
      ),
    },
    {
      from: 3,
      node: (
        <g>
          {/* something tall, far off, above the treeline (indistinct) */}
          <Chain x0={84} y0={50} x1={92} y1={26} t0={4} t1={3} c="#7f93a0" />
          <R x={91} y={24} w={5} h={3} c="#7f93a0" />
          <R x={74} y={46} w={14} h={7} c="#7f93a0" />
          {/* bending branches */}
          <R x={95} y={30} w={5} h={1} c="#3b6a40" />
          {/* tremor ripples */}
          <R x={30} y={70} w={10} h={1} c="#b7d8da" />
          <R x={108} y={72} w={12} h={1} c="#b7d8da" />
        </g>
      ),
    },
    {
      from: 4,
      node: (
        <g>
          {/* sauropod at the water */}
          <Chain x0={58} y0={62} x1={22} y1={70} t0={6} t1={1} c="#6a7457" />
          <R x={58} y={54} w={30} h={12} c="#6a7457" />
          <R x={60} y={51} w={26} h={3} c="#6a7457" />
          <R x={60} y={64} w={26} h={2} c="#4f573f" />
          <R x={61} y={66} w={5} h={9} c="#4f573f" />
          <R x={68} y={66} w={4} h={8} c="#6a7457" />
          <R x={78} y={66} w={5} h={9} c="#4f573f" />
          <R x={84} y={66} w={4} h={8} c="#6a7457" />
          <Chain x0={86} y0={55} x1={110} y1={24} t0={6} t1={3} c="#6a7457" />
          <R x={108} y={21} w={8} h={4} c="#6a7457" />
          <R x={114} y={22} w={1} h={1} c="#1d1f1c" />
          <R x={60} y={51} w={26} h={1} c="#8a9474" />
        </g>
      ),
    },
    {
      from: 5,
      node: (
        <g>
          {/* plated dinosaur crossing a sunlit patch */}
          <R x={116} y={78} w={36} h={5} c="#d8c48c" o={0.5} />
          <Chain x0={124} y0={74} x1={110} y1={78} t0={4} t1={1} c="#7a6a3a" />
          <R x={110} y={77} w={3} h={1} c="#e0d6b0" />
          <R x={124} y={70} w={20} h={7} c="#7a6a3a" />
          <R x={144} y={73} w={6} h={3} c="#7a6a3a" />
          <R x={126} y={77} w={3} h={5} c="#5a4e2a" />
          <R x={139} y={77} w={3} h={5} c="#5a4e2a" />
          {[125, 129, 133, 137, 141].map((x, i) => (
            <g key={x}>
              <R x={x + 1} y={63 + (i === 2 ? -1 : 0)} w={2} h={2} c="#b0603c" />
              <R x={x} y={65 + (i === 2 ? -1 : 0)} w={4} h={5} c="#b0603c" />
            </g>
          ))}
        </g>
      ),
    },
    {
      from: 6,
      node: (
        <g>
          {/* clouds part */}
          <R x={18} y={6} w={8} h={8} c="#f3dc8a" />
          <R x={16} y={8} w={12} h={4} c="#f3dc8a" />
          <R x={0} y={0} w={160} h={55} c="#fff2c8" o={0.08} />
        </g>
      ),
    },
  ],
};

// ---------------------------------------------------------------- Devonian
function archaeopteris(x: number, base: number, h: number, key: number) {
  return (
    <g key={key}>
      <R x={x} y={base - h} w={2} h={h} c="#5a4632" />
      {[0, 1, 2].map((i) => (
        <R key={i} x={x - 5 + i} y={base - h + i * 5} w={12 - i * 2} h={3} c={i % 2 ? "#3f6a3e" : "#4f7d46"} />
      ))}
    </g>
  );
}

const PLACODERM = [
  "....pppp.......",
  "..ppPPPPpfffff.",
  "pPPePPPPfffffff",
  ".pjjPPPPpffff.t",
  "..jj.pp.......t",
];

const TETRAPOD = [
  "........gggggggg...",
  "ttttggggGGGGGGGGgge",
  "......f.....f...gg.",
  ".....ff....ff......",
];

export const devonian: SceneDef = {
  dim: 0.05,
  layers: [
    {
      from: 1,
      node: (
        <g>
          <Bands colors={["#a9bfc4", "#b9cccc", "#c9d8d2", "#d6e0d6"]} h={12} />
          <R x={0} y={48} w={60} h={10} c="#5d8c96" />
          <R x={0} y={48} w={60} h={1} c="#9cc4c6" />
          <R x={60} y={48} w={100} h={10} c="#8a6a4e" />
          <R x={0} y={58} w={160} h={32} c="#6e5a44" />
          {/* shining tidal pools */}
          {[[8, 62, 18], [40, 66, 12], [96, 63, 22], [128, 70, 14]].map(([x, y, w]) => (
            <g key={x}>
              <R x={x} y={y} w={w} h={3} c="#93b9bb" />
              <R x={x + 2} y={y} w={w / 3} h={1} c="#e6f2ee" />
            </g>
          ))}
          <Dots seed={11} n={36} box={{ x: 0, y: 36, w: 160, h: 20 }} c="#ffffff" o={0.3} size={2} />
          <R x={0} y={76} w={160} h={14} c="#4f7f8a" />
          <R x={0} y={76} w={160} h={1} c="#9cc4c6" />
        </g>
      ),
    },
    {
      from: 2,
      node: (
        <g>
          {/* raw, reddish new soil + a few early trees */}
          <R x={70} y={50} w={60} h={3} c="#9a6a4a" />
          {[76, 92, 112].map((x, i) => archaeopteris(x, 52, 18 + i * 3, i))}
        </g>
      ),
    },
    {
      from: 3,
      node: (
        <g>
          {/* water cut-away in the foreground: armored fish */}
          <R x={0} y={77} w={160} h={13} c="#3f6f7c" />
          <Sprite x={18} y={80} rows={PLACODERM} palette={{ p: "#7d8c8e", P: "#5f6e72", e: "#e8d070", j: "#2a3436", f: "#4e6468", t: "#4e6468" }} />
          <Sprite x={96} y={83} rows={PLACODERM} palette={{ p: "#8a8a76", P: "#6e6e5a", e: "#e8d070", j: "#2a3436", f: "#59594a", t: "#59594a" }} flip />
          <Sprite x={64} y={80} rows={["..ff.", "fffff", "..ff."]} palette={{ f: "#a3b8a8" }} />
          <Sprite x={136} y={79} rows={["..ff.", "fffff", "..ff."]} palette={{ f: "#a3b8a8" }} />
        </g>
      ),
    },
    {
      from: 4,
      node: <Sprite x={50} y={70} s={1} rows={TETRAPOD} palette={{ g: "#6b7a4a", G: "#84935a", e: "#e0c060", t: "#5a6a3c", f: "#4a5a30" }} />,
    },
    {
      from: 5,
      node: (
        <g>
          {/* forest spreading inland */}
          {[132, 140, 148, 156, 124].map((x, i) => archaeopteris(x, 52, 14 + (i % 2) * 4, 10 + i))}
          <Sprite x={30} y={60} rows={["..gg.", "ggggg", "f.f.f"]} palette={{ g: "#6b7a4a", f: "#4a5a30" }} />
        </g>
      ),
    },
    {
      from: 6,
      node: <R x={0} y={0} w={160} h={50} c="#fff8e0" o={0.12} />,
    },
  ],
};

// ---------------------------------------------------------------- Cretaceous
function broadleaf(x: number, base: number, h: number, key: number) {
  return (
    <g key={key}>
      <R x={x} y={base - h} w={2} h={h} c="#5a4430" />
      <R x={x - 6} y={base - h - 6} w={14} h={8} c="#3f7a40" />
      <R x={x - 4} y={base - h - 9} w={10} h={3} c="#4b8a48" />
    </g>
  );
}

const MAGNOLIA = [".w.", "wpw", ".w."];

const TRICERATOPS = [
  "..ffff..................",
  ".fFFFFf....bbbbbbbbb....",
  "hfFFFFfbbbbbbbbbbbbbbb..",
  "hhkFFFbbbbbbbbbbbbbbbbbt",
  ".hkkbbbbbbbbbbbbbbbbbb.t",
  "..kk.bbbBbbbbbbBbbbbb...",
  ".....ll..ll.....ll..ll..",
  ".....ll..ll.....ll..ll..",
];

export const cretaceous: SceneDef = {
  dim: 0.05,
  layers: [
    {
      from: 1,
      node: (
        <g>
          <Bands colors={["#8fb4c4", "#a5c4c8", "#bcd3c8", "#cfdcc0"]} h={12} />
          <R x={0} y={48} w={160} h={42} c="#4f7a42" />
          {[4, 24, 46, 104, 128, 150].map((x, i) => broadleaf(x, 54, 14 + (i % 3) * 4, i))}
          <R x={0} y={62} w={160} h={10} c="#4b7f8c" />
          <R x={0} y={62} w={160} h={1} c="#9cc6c6" />
          <R x={0} y={72} w={160} h={18} c="#5a6a3a" />
          {/* small flyers */}
          {[[30, 14], [38, 18], [118, 10], [126, 16]].map(([x, y]) => (
            <Sprite key={x} x={x} y={y} rows={["c...c", ".c.c.", "..c.."]} palette={{ c: "#3a4248" }} />
          ))}
        </g>
      ),
    },
    {
      from: 2,
      node: (
        <g>
          {[[10, 74], [26, 78], [60, 76], [92, 80], [140, 75], [150, 82], [72, 52], [116, 50]].map(([x, y], i) => (
            <Sprite key={i} x={x} y={y} rows={MAGNOLIA} palette={{ w: i % 2 ? "#f2e6ee" : "#f6f0e0", p: "#d97aa4" }} />
          ))}
          {[[0, 82], [40, 84], [104, 83]].map(([x, y]) => (
            <Sprite key={x} x={x} y={y} rows={["f.f.f.f", ".fffff.", "fffffff"]} palette={{ f: "#3f6a2c" }} />
          ))}
        </g>
      ),
    },
    {
      from: 3,
      node: (
        <g>
          {/* large shapes across the water; a beaked head through foliage */}
          <R x={96} y={50} w={22} h={10} c="#5d6a4e" o={0.85} />
          <R x={124} y={52} w={16} h={8} c="#5d6a4e" o={0.7} />
          <Sprite
            x={82}
            y={44}
            rows={["..hhhh..", ".hhhhhhh", "hhhehhhh", "bbhhhh..", "bb.hh..."]}
            palette={{ h: "#7a7a52", e: "#1d1f1c", b: "#c2a46a" }}
            flip
          />
        </g>
      ),
    },
    {
      from: 4,
      node: <Sprite x={8} y={50} s={2} rows={TRICERATOPS} palette={{ f: "#a0703e", F: "#b8844a", h: "#e8dcc0", k: "#c9b48a", b: "#8a6a3e", B: "#6e5230", l: "#5a4428", t: "#8a6a3e" }} />,
    },
    {
      from: 5,
      node: (
        <g>
          {/* tyrannosaur */}
          <Chain x0={118} y0={52} x1={146} y1={62} t0={7} t1={1} c="#5e5444" />
          <R x={100} y={46} w={22} h={12} c="#5e5444" />
          <R x={88} y={36} w={18} h={9} c="#5e5444" />
          <R x={88} y={45} w={14} h={3} c="#4a4236" />
          <R x={89} y={44} w={12} h={1} c="#e8dcc0" />
          <R x={96} y={38} w={2} h={2} c="#e0a030" />
          <R x={102} y={42} w={6} h={6} c="#5e5444" />
          <R x={104} y={54} w={3} h={2} c="#4a4236" />
          <R x={108} y={56} w={6} h={10} c="#4a4236" />
          <R x={116} y={56} w={5} h={9} c="#5e5444" />
          <R x={106} y={66} w={9} h={2} c="#3a3428" />
          <R x={114} y={65} w={8} h={2} c="#3a3428" />
        </g>
      ),
    },
    {
      from: 6,
      node: (
        <g>
          {/* a far, bright streak in the sky */}
          <Chain x0={150} y0={2} x1={128} y1={14} t0={1} c="#fff4c8" />
          <R x={126} y={13} w={3} h={3} c="#ffffff" />
        </g>
      ),
    },
  ],
};
