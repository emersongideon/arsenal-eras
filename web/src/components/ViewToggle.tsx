export type View = "report" | "dashboard";

/** Fixed segmented control to switch the whole page between the story report and
 *  the metrics dashboard. The choice is persisted by the App (localStorage). */
export function ViewToggle({
  view,
  onChange,
}: {
  view: View;
  onChange: (v: View) => void;
}) {
  return (
    <div className="view-toggle" role="tablist" aria-label="View">
      <button
        role="tab"
        aria-selected={view === "report"}
        className={view === "report" ? "active" : ""}
        onClick={() => onChange("report")}
      >
        Report
      </button>
      <button
        role="tab"
        aria-selected={view === "dashboard"}
        className={view === "dashboard" ? "active" : ""}
        onClick={() => onChange("dashboard")}
      >
        Dashboard
      </button>
    </div>
  );
}
