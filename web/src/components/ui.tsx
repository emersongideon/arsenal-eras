import type { ReactNode } from "react";
import type { Category, Season } from "../types";
import { useReveal } from "../hooks/useReveal";

export const SEASON_COLOR: Record<Season, string> = {
  "2003/04": "#c8971f",
  "2025/26": "#ef0107",
};
export const seasonClass = (s: Season) => (s === "2003/04" ? "s0304" : "s2526");

export const REPO_URL = "https://github.com/emersongideon/arsenal-eras";

export function GitHubIcon({ size = 16 }: { size?: number }) {
  return (
    <svg viewBox="0 0 16 16" width={size} height={size} fill="currentColor" aria-hidden="true">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.6 7.6 0 012-.27c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
}

/** "View source on GitHub" link, used in the fixed header and the footer. */
export function GitHubLink({ variant }: { variant: "header" | "footer" }) {
  return (
    <a
      className={`gh-link gh-${variant}`}
      href={REPO_URL}
      target="_blank"
      rel="noopener noreferrer"
    >
      <GitHubIcon size={variant === "header" ? 16 : 15} />
      <span className="gh-text">View source on GitHub</span>
    </a>
  );
}

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
