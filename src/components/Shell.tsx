import type { ReactNode } from "react";

function Hourglass() {
  const rows = ["gggggggg", ".c....c.", ".cssssc.", "..cssc..", "...cc...", "..c..c..", ".c.ss.c.", ".cssssc.", "gggggggg"];
  return (
    <svg className="logo__glyph" viewBox="0 0 8 9" width="16" height="18" shapeRendering="crispEdges" aria-hidden="true">
      {rows.flatMap((r, y) =>
        r.split("").map((ch, x) =>
          ch === "." ? null : (
            <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={ch === "g" ? "#e3cb85" : ch === "s" ? "#c9a74a" : "#efe6c8"} />
          ),
        ),
      )}
    </svg>
  );
}

export function Shell({ children, demo }: { children: ReactNode; demo: boolean }) {
  return (
    <div className="console">
      <header className="shell-top">
        <p className="logo">
          <Hourglass />
          WHEN AM I?
        </p>
        {demo && <span className="chip chip--gold">Demo edition</span>}
      </header>
      <main className="screen">{children}</main>
      <footer className="shell-bottom">
        <span className="label">A daily mystery through time</span>
      </footer>
    </div>
  );
}
