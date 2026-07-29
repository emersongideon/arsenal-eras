import { content, type FromRef } from "../content";
import { CategoryBadge, Reveal, Section } from "../components/ui";

const t = content.e;

function FromCell({ refs }: { refs: FromRef[] }) {
  return (
    <>
      {refs.map(([label, anchor], i) => (
        <span key={anchor}>
          {i > 0 && " / "}
          <a href={`#${anchor}`}>{label}</a>
        </span>
      ))}
    </>
  );
}

export function Conclusion() {
  return (
    <Section id="section-e" eyebrow={t.eyebrow}>
      <Reveal>
        <h2>{t.heading}</h2>
        <p className="lead narrow">{t.lead}</p>
      </Reveal>

      {/* E.1 - the contrast table */}
      <Reveal delay={70}>
        <div className="tbl-wrap" style={{ marginTop: 22 }}>
          <table className="cmp-table">
            <thead>
              <tr>
                <th>{t.tableColDim}</th>
                <th className="s0304">2003/04</th>
                <th className="s2526">2025/26</th>
                <th>{t.tableColFrom}</th>
              </tr>
            </thead>
            <tbody>
              {t.rows.map((r) => (
                <tr key={r.dim} className={r.hi ? "hi" : ""}>
                  <td>{r.dim}</td>
                  <td className="ta-c">{r.a}</td>
                  <td className="ta-c">{r.b}</td>
                  <td className="ta-c">
                    <FromCell refs={r.from} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="dim" style={{ fontSize: 13, marginTop: 8 }}>
            {t.tableNote}
          </p>
        </div>
      </Reveal>

      {/* E.2 - the model's even-handed result */}
      <Reveal delay={70}>
        <h3 style={{ marginTop: 30 }}>{t.e2Title}</h3>
        <p className="narrow">{t.e2Body}</p>
      </Reveal>

      {/* E.3 - the human verdict, clearly a view */}
      <Reveal delay={70}>
        <h3 style={{ marginTop: 30 }}>{t.e3Title}</h3>
        <div className="reading" style={{ marginTop: 10 }}>
          <CategoryBadge category="interpretation" />
          {t.e3.map((para, i) => (
            <p key={i} style={{ margin: i === 0 ? "8px 0 0" : "12px 0 0" }}>
              {para}
            </p>
          ))}
        </div>
      </Reveal>

      {/* E.4 - where this goes next */}
      <Reveal delay={80}>
        <div className="method narrow" style={{ marginTop: 30 }}>
          <strong>{t.e4Label}</strong>
          <ul style={{ margin: "10px 0 0", paddingLeft: 20 }}>
            {t.e4Bullets.map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
        </div>
      </Reveal>
    </Section>
  );
}
