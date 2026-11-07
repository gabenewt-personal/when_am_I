import { Bands, Chain, Dots, R, Sprite, type SceneDef } from "../pixels";

/*
 * U.S.-decade scenes. Period-specific details are held back until their clue.
 * Placeholder art — replace with commissioned pixel art using the same layer contract.
 */

const PERSON = [".hh.", "hffh", ".ff.", "bbbb", "bbbb", "bbbb", ".ll.", ".l.l"];

// ---------------------------------------------------------------- 1920s city night
const NEWSBOY = [".cccc", "cffc.", ".ff..", "bbbbp", "bbbbp", "bbbb.", ".l.l.", ".l.l."];
const FLAPPER = ["..ccc.", ".ccccc", "..hff.", "..ff..", ".dddd.", ".dddd.", "dddddd", "..l.l."];

export const jazzNight: SceneDef = {
  dim: 0.04,
  layers: [
    {
      from: 1,
      node: (
        <g>
          <Bands colors={["#141a2c", "#1b2238", "#232b45"]} h={14} />
          {/* indistinct downtown */}
          {[[0, 14, 22], [20, 8, 18], [36, 20, 26], [60, 4, 20], [78, 16, 24], [100, 10, 18], [116, 22, 22], [136, 6, 24]].map(([x, y, w]) => (
            <R key={x} x={x} y={y} w={w} h={62 - y} c="#2a3150" />
          ))}
          <Dots seed={7} n={22} box={{ x: 2, y: 12, w: 156, h: 40 }} c="#d9b25c" size={2} o={0.55} />
          {/* wet pavement */}
          <R x={0} y={62} w={160} h={28} c="#2d3346" />
          {[[8, 66], [40, 72], [86, 68], [120, 76], [60, 82], [140, 70]].map(([x, y]) => (
            <R key={x} x={x} y={y} w={14} h={1} c="#56628a" />
          ))}
          {/* glowing basement window, low at street level */}
          <R x={70} y={60} w={14} h={5} c="#3a3020" />
          <R x={71} y={61} w={12} h={3} c="#e3b45a" />
          <R x={66} y={66} w={22} h={2} c="#e3b45a" o={0.25} />
          {/* rain */}
          <Dots seed={13} n={50} box={{ x: 0, y: 0, w: 160, h: 62 }} c="#8a9ac0" o={0.4} />
        </g>
      ),
    },
    {
      from: 2,
      node: (
        <g>
          {/* streetcar + overhead wire */}
          <R x={0} y={30} w={160} h={1} c="#4a5272" />
          <R x={112} y={30} w={1} h={14} c="#4a5272" />
          <R x={98} y={44} w={40} h={14} c="#7d3a2e" />
          <R x={98} y={42} w={40} h={2} c="#5a2a22" />
          {[101, 109, 117, 125].map((x) => (
            <R key={x} x={x} y={46} w={6} h={5} c="#e8c878" />
          ))}
          <R x={102} y={58} w={4} h={3} c="#1d1f1c" />
          <R x={130} y={58} w={4} h={3} c="#1d1f1c" />
          {/* motorcar */}
          <R x={30} y={52} w={22} h={6} c="#1d1f1c" />
          <R x={36} y={46} w={11} h={6} c="#1d1f1c" />
          <R x={38} y={47} w={7} h={3} c="#56628a" />
          <R x={32} y={57} w={5} h={5} c="#0d0f0d" />
          <R x={46} y={57} w={5} h={5} c="#0d0f0d" />
          <R x={51} y={53} w={2} h={2} c="#f0d890" />
          <Sprite x={12} y={56} rows={NEWSBOY} palette={{ c: "#4a3a2a", f: "#d9a878", b: "#5d6a7a", p: "#e8e0c8", l: "#2a2a2a" }} />
        </g>
      ),
    },
    {
      from: 3,
      node: (
        <g>
          {/* shop window with a radio */}
          <R x={58} y={36} w={26} h={20} c="#4a3a24" />
          <R x={60} y={38} w={22} h={16} c="#c9a464" o={0.85} />
          <Sprite x={65} y={42} rows={["..bbbbbb..", ".bbggggbb.", "bbggggggbb", "bbgdgdgdbb", "bbggggggbb", "bbbkbbkbbb", "bbbbbbbbbb"]} palette={{ b: "#6a4020", g: "#e0c070", d: "#8a5a2a", k: "#2a1a0a" }} />
          <Sprite x={88} y={52} rows={FLAPPER} palette={{ c: "#6a2a3a", h: "#1d1f1c", f: "#e0b890", d: "#2a6a6a", l: "#2a2a2a" }} />
        </g>
      ),
    },
    {
      from: 4,
      node: (
        <g>
          {/* unmarked door down a few steps, peephole lit */}
          <R x={70} y={56} w={14} h={8} c="#1d1f1c" />
          <R x={72} y={57} w={10} h={7} c="#4a3220" />
          <R x={75} y={58} w={4} h={1} c="#ffd27a" />
          <R x={68} y={64} w={18} h={1} c="#44474f" />
          <R x={69} y={66} w={16} h={1} c="#44474f" />
          {/* notes drifting up */}
          {[[88, 50], [92, 44], [86, 38]].map(([x, y]) => (
            <Sprite key={y} x={x} y={y} rows={[".nn", ".n.", ".n.", "nn."]} palette={{ n: "#f0d890" }} />
          ))}
        </g>
      ),
    },
    {
      from: 5,
      node: (
        <g>
          {/* glimpse inside: a horn and quietly poured glasses */}
          <R x={0} y={74} w={56} h={16} c="#2a1c14" />
          <R x={0} y={74} w={56} h={1} c="#e3b45a" />
          <R x={4} y={76} w={48} h={12} c="#4a2e1c" />
          <Sprite x={8} y={78} rows={[".hh.", "hffh", ".ff.", "bbbb", "bbbb"]} palette={{ h: "#1d1f1c", f: "#7a5034", b: "#2a2a3a" }} />
          <Sprite x={13} y={79} rows={["......gg", "ggggggg.", "......gg"]} palette={{ g: "#e8c050" }} />
          {[30, 36, 42].map((x) => (
            <Sprite key={x} x={x} y={80} rows={["ggg", ".g.", ".g.", "ggg"]} palette={{ g: "#d8e8e8" }} />
          ))}
        </g>
      ),
    },
    {
      from: 6,
      node: (
        <g>
          {/* the whole street lights up */}
          {Array.from({ length: 16 }, (_, i) => (
            <R key={i} x={4 + i * 10} y={33 + (i % 2)} w={2} h={2} c={i % 3 ? "#ffd27a" : "#ff8a6a"} />
          ))}
          <R x={0} y={0} w={160} h={62} c="#e3b45a" o={0.06} />
        </g>
      ),
    },
  ],
};

// ---------------------------------------------------------------- July 1969 living room
export const moonNight: SceneDef = {
  dim: 0.05,
  layers: [
    {
      from: 1,
      node: (
        <g>
          {/* wall + floor */}
          <R x={0} y={0} w={160} h={64} c="#7a6a48" />
          {Array.from({ length: 16 }, (_, i) => (
            <R key={i} x={i * 10 + 4} y={0} w={1} h={64} c="#6e5e3e" />
          ))}
          <R x={0} y={64} w={160} h={26} c="#5a4a34" />
          <R x={0} y={64} w={160} h={2} c="#3e3224" />
          {/* window: summer lawns */}
          <R x={14} y={10} w={40} h={28} c="#3e3224" />
          <R x={16} y={12} w={36} h={14} c="#9cc6da" />
          <R x={16} y={26} w={36} h={10} c="#6a9a4a" />
          <R x={16} y={26} w={36} h={1} c="#8ab85a" />
          <R x={33} y={12} w={2} h={24} c="#3e3224" />
          <R x={22} y={20} w={8} h={6} c="#c9a070" />
          <R x={21} y={18} w={10} h={2} c="#8a3a2a" />
          {/* television: humming, screen blank */}
          <R x={100} y={34} w={40} h={30} c="#5a3a20" />
          <R x={104} y={38} w={24} h={18} c="#2a2e2c" />
          <R x={105} y={39} w={22} h={16} c="#7a8a84" />
          <Dots seed={17} n={40} box={{ x: 105, y: 39, w: 22, h: 16 }} c="#c8d4ce" />
          <R x={131} y={40} w={5} h={2} c="#c9a74a" />
          <R x={131} y={45} w={5} h={2} c="#c9a74a" />
          <R x={102} y={64} w={3} h={6} c="#3e2a16" />
          <R x={135} y={64} w={3} h={6} c="#3e2a16" />
        </g>
      ),
    },
    {
      from: 2,
      node: (
        <g>
          {/* transistor radio + newspaper */}
          <R x={60} y={56} w={22} h={2} c="#3e2a16" />
          <R x={62} y={58} w={2} h={8} c="#3e2a16" />
          <R x={78} y={58} w={2} h={8} c="#3e2a16" />
          <Sprite x={64} y={48} rows={["......a", "rrrrrra", "rgggrr.", "rgdgrr.", "rgggrr.", "rrrrrr.", "rrrrrr."]} palette={{ r: "#b4483f", g: "#d9d0b0", d: "#4a4a4a", a: "#c0c0c0" }} />
          <R x={20} y={72} w={26} h={10} c="#e4ddc8" />
          {[74, 76, 78, 80].map((y) => (
            <R key={y} x={22} y={y} w={y === 74 ? 22 : 10} h={1} c="#5a5a5a" />
          ))}
          <R x={34} y={76} w={10} h={5} c="#8a8a80" />
        </g>
      ),
    },
    {
      from: 3,
      node: (
        <g>
          {/* rocket-and-planets diagram on the wall */}
          <R x={62} y={8} w={30} h={30} c="#efe6c8" />
          <R x={62} y={8} w={30} h={1} c="#3e3224" />
          <Sprite x={66} y={12} rows={[".w.", "www", "wrw", "www", "www", "fwf", "f.f"]} palette={{ w: "#e8e8e8", r: "#3f6db0", f: "#b4483f" }} />
          <R x={66} y={11} w={3} h={1} c="#b4483f" />
          {[[76, 14, 4, "#e0a040"], [82, 22, 3, "#3f6db0"], [74, 28, 2, "#b4483f"], [84, 30, 5, "#c9a74a"]].map(([x, y, s, c]) => (
            <R key={String(x) + y} x={x as number} y={y as number} w={s as number} h={s as number} c={c as string} />
          ))}
        </g>
      ),
    },
    {
      from: 4,
      node: (
        <g>
          {/* grown-ups at the dinner table */}
          <R x={0} y={70} w={70} h={4} c="#8a5a30" />
          <R x={4} y={74} w={3} h={12} c="#5a3a20" />
          <R x={60} y={74} w={3} h={12} c="#5a3a20" />
          {[14, 34, 50].map((x) => (
            <R key={x} x={x} y={68} w={8} h={2} c="#f0ece0" />
          ))}
          <Sprite x={2} y={56} s={2} rows={PERSON.slice(0, 6)} palette={{ h: "#3a2a1a", f: "#d9a878", b: "#3f6db0" }} />
          <Sprite x={54} y={56} s={2} rows={PERSON.slice(0, 6)} palette={{ h: "#c9a060", f: "#e0b890", b: "#b4483f" }} />
        </g>
      ),
    },
    {
      from: 5,
      node: (
        <g>
          {/* the screen now shows a grey world drawing closer */}
          <R x={105} y={39} w={22} h={16} c="#1a1c1c" />
          <R x={105} y={49} w={22} h={6} c="#9a9c98" />
          <R x={108} y={48} w={8} h={1} c="#9a9c98" />
          <R x={120} y={47} w={5} h={2} c="#9a9c98" />
          <Dots seed={19} n={12} box={{ x: 105, y: 49, w: 22, h: 6 }} c="#6a6c68" />
          {/* family gathered in front */}
          <Sprite x={96} y={70} s={2} rows={PERSON.slice(0, 5)} palette={{ h: "#2a1a10", f: "#2a1a10", b: "#2a1a10" }} />
          <Sprite x={110} y={74} s={2} rows={PERSON.slice(0, 4)} palette={{ h: "#2a1a10", f: "#2a1a10", b: "#2a1a10" }} />
          <Sprite x={124} y={70} s={2} rows={PERSON.slice(0, 5)} palette={{ h: "#2a1a10", f: "#2a1a10", b: "#2a1a10" }} />
        </g>
      ),
    },
    {
      from: 6,
      node: (
        <g>
          {/* a tiny lander on the grey surface */}
          <Sprite x={113} y={44} rows={[".ggg.", "ggggg", "f.g.f", "f...f"]} palette={{ g: "#d8d8c8", f: "#b0b0a0" }} />
          <R x={122} y={41} w={2} h={2} c="#7aa0d0" />
          <R x={100} y={34} w={40} h={30} c="#c8d4ce" o={0.08} />
        </g>
      ),
    },
  ],
};

// ---------------------------------------------------------------- Plains farmhouse, dust
export const dustWindow: SceneDef = {
  dim: 0.03,
  layers: [
    {
      from: 1,
      node: (
        <g>
          <Bands colors={["#c9783e", "#d68a48", "#dd9a56", "#e2aa66", "#e6b878"]} h={12} />
          <R x={0} y={60} w={160} h={30} c="#b08a5c" />
          <R x={0} y={60} w={160} h={1} c="#8a6a44" />
          <Dots seed={23} n={60} box={{ x: 0, y: 0, w: 160, h: 62 }} c="#f0c890" o={0.4} />
          {/* window frame (we look out) */}
          <R x={0} y={0} w={160} h={5} c="#4a3220" />
          <R x={0} y={0} w={8} h={90} c="#4a3220" />
          <R x={152} y={0} w={8} h={90} c="#4a3220" />
          <R x={78} y={0} w={4} h={76} c="#4a3220" />
          <R x={8} y={40} w={144} h={3} c="#4a3220" />
          <R x={0} y={76} w={160} h={14} c="#5a3e26" />
          <R x={0} y={76} w={160} h={2} c="#6e4c30" />
        </g>
      ),
    },
    {
      from: 2,
      node: (
        <g>
          {/* bare, cracked field */}
          {[[12, 64, 10], [30, 68, 14], [56, 63, 8], [90, 66, 12], [116, 70, 10], [136, 64, 9]].map(([x, y, w]) => (
            <g key={x}>
              <R x={x} y={y} w={w} h={1} c="#6a4e30" />
              <R x={x + 3} y={y + 1} w={1} h={2} c="#6a4e30" />
            </g>
          ))}
          {/* fence with drifts like snow */}
          {[18, 34, 50, 66, 90, 106, 122, 138].map((x) => (
            <R key={x} x={x} y={52} w={2} h={10} c="#5a3e26" />
          ))}
          <R x={8} y={55} w={144} h={1} c="#5a3e26" />
          {[[14, 58, 12], [44, 57, 16], [96, 58, 14], [130, 57, 18]].map(([x, y, w]) => (
            <g key={x}>
              <R x={x} y={y} w={w} h={2} c="#d8b080" />
              <R x={x + 2} y={y - 1} w={w - 4} h={1} c="#d8b080" />
            </g>
          ))}
        </g>
      ),
    },
    {
      from: 3,
      node: (
        <g>
          {/* rags stuffed at the sill; dust on the table */}
          <R x={8} y={74} w={144} h={2} c="#9a8a74" />
          {[14, 40, 96, 128].map((x) => (
            <R key={x} x={x} y={73} w={10} h={3} c="#b8a68a" />
          ))}
          <Dots seed={29} n={40} box={{ x: 0, y: 78, w: 160, h: 12 }} c="#c9a070" />
          <R x={110} y={80} w={10} h={6} c="#e0d8c8" />
          <R x={111} y={80} w={8} h={1} c="#c9a070" />
        </g>
      ),
    },
    {
      from: 4,
      node: (
        <g>
          {/* a loaded truck on the far road, heading west */}
          <R x={84} y={46} w={66} h={1} c="#8a6a44" />
          <R x={100} y={36} w={14} h={6} c="#3a3a3a" />
          <R x={112} y={38} w={8} h={5} c="#3a3a3a" />
          <R x={113} y={39} w={4} h={2} c="#c9a070" />
          <R x={98} y={30} w={14} h={6} c="#6a5038" />
          <R x={100} y={27} w={6} h={3} c="#8a6a44" />
          <R x={106} y={28} w={4} h={2} c="#b4483f" />
          <R x={101} y={42} w={3} h={3} c="#1d1f1c" />
          <R x={115} y={42} w={3} h={3} c="#1d1f1c" />
        </g>
      ),
    },
    {
      from: 5,
      node: (
        <g>
          {/* black blizzard rising across the plains */}
          <R x={8} y={20} w={144} h={20} c="#2a2220" />
          {[8, 26, 44, 62, 82, 100, 118, 136].map((x, i) => (
            <R key={x} x={x} y={12 + (i % 3) * 3} w={18} h={10} c="#2a2220" />
          ))}
          <R x={8} y={40} w={70} h={10} c="#3a2e28" o={0.9} />
          <R x={82} y={43} w={70} h={8} c="#3a2e28" o={0.9} />
        </g>
      ),
    },
    {
      from: 6,
      node: (
        <g>
          <R x={8} y={5} w={70} h={35} c="#1d1816" o={0.6} />
          <R x={82} y={5} w={70} h={35} c="#1d1816" o={0.6} />
          <Dots seed={31} n={30} box={{ x: 10, y: 6, w: 140, h: 50 }} c="#7a5a40" size={2} o={0.6} />
        </g>
      ),
    },
  ],
};

// ---------------------------------------------------------------- neutral placeholder
export const placeholder: SceneDef = {
  dim: 0.06,
  layers: [
    {
      from: 1,
      node: (
        <g>
          <Bands colors={["#3c6b46", "#5a8a5e", "#93b083", "#c8d5a5"]} h={14} />
          <R x={0} y={56} w={160} h={34} c="#2f5238" />
          <Chain x0={0} y0={60} x1={160} y1={54} t0={2} c="#46704f" />
          <Dots seed={1} n={30} box={{ x: 0, y: 20, w: 160, h: 30 }} c="#efe6c8" o={0.35} size={2} />
        </g>
      ),
    },
  ],
};
