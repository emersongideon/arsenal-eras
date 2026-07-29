import { content } from "../content";
import { Reveal } from "../components/ui";

const t = content.hero;

export function Hero() {
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
                <span className="y">{t.cap0304Year}</span>
                <span className="l">{t.cap0304Line}</span>
              </figcaption>
            </figure>
            <span className="mid-vs">{t.vs}</span>
            <figure className="hero-photo r">
              <img
                src="teams/2526.webp"
                alt="Arsenal players lifting the 2025/26 Premier League trophy"
              />
              <figcaption className="cap">
                <span className="y">{t.cap2526Year}</span>
                <span className="l">{t.cap2526Line}</span>
              </figcaption>
            </figure>
          </div>
        </Reveal>
        <Reveal delay={80}>
          <h1>{t.title}</h1>
        </Reveal>
        <Reveal delay={160}>
          <p className="lead">{t.subline}</p>
        </Reveal>
        <Reveal delay={240}>
          <p className="scroll-hint">{t.scrollHint}</p>
        </Reveal>
      </div>
    </section>
  );
}
