import type { ReactNode } from "react";
import type { Category, Season } from "../types";
import { useReveal } from "../hooks/useReveal";

export const SEASON_COLOR: Record<Season, string> = {
  "2003/04": "#c8971f",
  "2025/26": "#ef0107",
};
export const seasonClass = (s: Season) => (s === "2003/04" ? "s0304" : "s2526");

const CATEGORY_LABEL: Record<Category, string> = {
  fact: "Historical fact",
  measured: "Measured (model output)",
  speculative: "Speculative",
};

/** The recurring fact / measured / speculative label. This visual language is
 *  the whole point of the intellectual-honesty requirement. */
export function CategoryBadge({ category }: { category: Category }) {
  return (
    <span className={`badge ${category}`} title={CATEGORY_LABEL[category]}>
      <span className="tick" />
      {CATEGORY_LABEL[category]}
    </span>
  );
}

/** Wraps children in a scroll-reveal container. */
export function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const { ref, shown } = useReveal();
  return (
    <div
      ref={ref}
      className={`reveal ${shown ? "in" : ""} ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}

export function Section({
  id,
  eyebrow,
  children,
  style,
}: {
  id: string;
  eyebrow?: string;
  children: ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <section id={id} className="section" style={style}>
      <div className="wrap">
        {eyebrow && (
          <Reveal>
            <p className="eyebrow">{eyebrow}</p>
          </Reveal>
        )}
        {children}
      </div>
    </section>
  );
}
