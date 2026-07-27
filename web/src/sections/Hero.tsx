import { Reveal } from "../components/ui";
import type { Meta } from "../types";

export function Hero({ meta }: { meta: Meta }) {
  return (
    <section id="hook" className="section hero">
      <div className="wrap narrow">
        <Reveal>
          <div className="hero-photos">
            <figure className="hero-photo g">
              <img
                src="teams/0304.jpeg"
                alt="Arsenal players lifting the 2003/04 Premier League trophy"
              />
              <figcaption className="cap">
                <span className="y">2003/04</span>
                <span className="l">The Invincibles · 90 pts, unbeaten</span>
              </figcaption>
            </figure>
            <span className="mid-vs">vs</span>
            <figure className="hero-photo r">
              <img
                src="teams/2526.webp"
                alt="Arsenal players lifting the 2025/26 Premier League trophy"
              />
              <figcaption className="cap">
                <span className="y">2025/26</span>
                <span className="l">Champions · 85 pts</span>
              </figcaption>
            </figure>
          </div>
        </Reveal>
        <Reveal delay={80}>
          <h1>{meta.question}</h1>
        </Reveal>
        <Reveal delay={160}>
          <p className="lead">
            Be clear from the first whistle: on the raw table the{" "}
            <b>2003/04 Invincibles were the more dominant league campaign</b> - 90 points,
            not a single defeat. So this is not an argument about which squad was better.
            It is about the <b>difficulty of the task</b> each side was handed - the field
            they had to beat, and the state they were in to beat it - and how well each
            one met it. Every figure below is tagged fact, measured, or interpretation,
            and never blended.
          </p>
        </Reveal>
        <Reveal delay={240}>
          <p className="scroll-hint">↓ Start with where the data comes from</p>
        </Reveal>
      </div>
    </section>
  );
}
