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
                <span className="l">The Invincibles · 90 pts</span>
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
            One went unbeaten - 38 games, 90 points, the "Invincibles". The other, 22
            years later, took the title back with 85 points but five defeats. On the table
            they look close. But the two teams played almost different sports. This is an
            honest attempt to compare them: what the data can measure, what it can only
            estimate, and what is pure speculation - kept strictly apart the whole way
            down.
          </p>
        </Reveal>
        <Reveal delay={240}>
          <p className="scroll-hint">↓ Scroll to begin</p>
        </Reveal>
      </div>
    </section>
  );
}
