import type { Category } from "@/lib/content/types";
import { timelineModel, type Segment } from "@/lib/timeline";

/** Compact post-solve timeline: where the answer sits within its category (and, for deep time, Earth's history). */
export function Timeline({ category, answerId }: { category: Category; answerId: string }) {
  const m = timelineModel(category, answerId);
  if (!m) return null;
  const centre = m.answer.left + m.answer.width / 2;

  const strip = (segments: Segment[], short?: boolean) => (
    <div className="tl-bar tl-bar--zoom">
      {segments.map((s, i) => (
        <span
          key={s.id}
          className={`tl-seg${s.isAnswer ? " is-answer" : ""}${i % 2 ? " is-alt" : ""}`}
          style={{ left: `${s.left}%`, width: `${s.width}%` }}
          title={s.label}
        >
          {short && <span className="tl-seg__txt">{s.label.slice(2, 4)}</span>}
        </span>
      ))}
      <span className="tl-marker" style={{ left: `${centre}%` }}>
        ▼
      </span>
    </div>
  );

  return (
    <div className="card timeline">
      <span className="label">Where you landed</span>

      <div className="tl-visual" aria-hidden="true">
        {m.overview && (
          <>
            <span className="tl-cap">Earth&rsquo;s history · 4.6 billion years</span>
            <div className="tl-bar tl-bar--earth">
              <span className="tl-pre" style={{ width: `${m.overview.spanLeft}%` }}>
                Precambrian
              </span>
              <span className="tl-span" style={{ left: `${m.overview.spanLeft}%` }} />
              <span className="tl-marker" style={{ left: `${m.overview.marker}%` }}>
                ▼
              </span>
            </div>
            <div className="tl-ends">
              <span>4.6 billion yrs ago</span>
              <span>Today</span>
            </div>
            <svg className="tl-zoom" viewBox="0 0 100 10" preserveAspectRatio="none">
              <line x1={m.overview.spanLeft} y1="0" x2="0.5" y2="10" vectorEffect="non-scaling-stroke" />
              <line x1="99.5" y1="0" x2="99.5" y2="10" vectorEffect="non-scaling-stroke" />
            </svg>
          </>
        )}

        {m.groups.length > 0 && (
          <div className="tl-groups">
            {m.groups.map((g) => (
              <span key={g.id} style={{ left: `${g.left}%`, width: `${g.width}%` }}>
                {g.label}
              </span>
            ))}
          </div>
        )}
        {strip(m.segments, m.kind === "decades")}
        <div className="tl-ends">
          <span>{m.startLabel}</span>
          <span>{m.endLabel}</span>
        </div>
      </div>

      <p className="tl-caption">
        <b>{m.answer.label}</b> · {m.range}
      </p>
      {m.overview && (
        <p className="tl-clock muted">
          If all of Earth&rsquo;s history were a single day, the {m.answer.label} would begin at {m.overview.clock}.
        </p>
      )}
    </div>
  );
}
