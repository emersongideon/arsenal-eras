import { useEffect, useState } from "react";
import { loadDataset } from "./data";
import type { Dataset } from "./types";
import { TopBar } from "./components/TopBar";
import { ReportView } from "./ReportView";

export default function App() {
  const [data, setData] = useState<Dataset | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDataset()
      .then(setData)
      .catch((e) => setError(String(e)));
  }, []);

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
      <TopBar />
      <ReportView data={data} />
    </>
  );
}
