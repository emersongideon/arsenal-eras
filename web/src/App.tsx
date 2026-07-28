import { useEffect, useState } from "react";
import { loadDataset } from "./data";
import type { Dataset } from "./types";
import { TopBar } from "./components/TopBar";
import { type View } from "./components/ViewToggle";
import { ReportView } from "./ReportView";
import { DashboardView } from "./DashboardView";

const VIEW_KEY = "arsenal-view";

export default function App() {
  const [data, setData] = useState<Dataset | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<View>(() =>
    localStorage.getItem(VIEW_KEY) === "dashboard" ? "dashboard" : "report"
  );

  useEffect(() => {
    loadDataset()
      .then(setData)
      .catch((e) => setError(String(e)));
  }, []);

  // Persist the choice, and reset scroll when switching layouts.
  useEffect(() => {
    localStorage.setItem(VIEW_KEY, view);
    window.scrollTo(0, 0);
  }, [view]);

  if (error)
    return (
      <div className="section">
        <div className="wrap">Failed to load: {error}</div>
      </div>
    );
  if (!data)
    return (
      <div className="section">
        <div className="wrap dim">Loading...</div>
      </div>
    );

  return (
    <>
      <TopBar view={view} onChange={setView} />
      {view === "report" ? <ReportView data={data} /> : <DashboardView data={data} />}
    </>
  );
}
