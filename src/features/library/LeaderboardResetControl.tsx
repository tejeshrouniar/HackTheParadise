import { useRef, useState } from "react";
import { Modal } from "../../components/ui/Modal";
import { ErrorNotice } from "../../components/ui/Status";
import { supabase } from "../../lib/supabase";
import { errorMessage } from "../../lib/validation";
import type { LeaderboardExport } from "./leaderboardWorkbook";

export function LeaderboardResetControl() {
  const [confirmation, setConfirmation] = useState<{ previousReset: string | null }>();
  const [busy, setBusy] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const resetButton = useRef<HTMLButtonElement>(null);

  async function download() {
    if (!supabase || busy || exporting) return;
    setExporting(true);
    setError("");
    setNotice("");
    try {
      const { data, error } = await supabase.rpc("export_library_leaderboard");
      if (error) throw error;
      const { createLeaderboardWorkbook } = await import("./leaderboardWorkbook");
      const bytes = createLeaderboardWorkbook(data as LeaderboardExport);
      const file = new Blob([new Uint8Array(bytes)], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(file);
      const link = document.createElement("a");
      link.href = url;
      link.download = `library-leaderboard-${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.append(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setNotice("Excel export prepared.");
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setExporting(false);
    }
  }

  function closeConfirmation() {
    setConfirmation(undefined);
    requestAnimationFrame(() => resetButton.current?.focus());
  }

  async function prepareReset() {
    if (!supabase || busy) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const { data, error } = await supabase.rpc("get_library_leaderboard");
      if (error) throw error;
      if (!data || !("reset_at" in data)) throw new Error("Apply the leaderboard reset migration first.");
      setConfirmation({ previousReset: data.reset_at });
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  async function reset() {
    if (!confirmation || busy || !supabase) return;
    setBusy(true);
    setError("");
    try {
      const { error } = await supabase.rpc("reset_library_leaderboard", {
        p_previous_reset: confirmation.previousReset,
      });
      if (error) throw error;
      closeConfirmation();
      setNotice("Previous rankings archived. The new round is open for players to join.");
    } catch (error) {
      closeConfirmation();
      setError(errorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section>
      <h3>Leaderboard</h3>
      <p>The Excel file includes rankings and student contact details.</p>
      <div className="sc-form">
        <button className="sc-button secondary" type="button" disabled={busy || exporting} onClick={() => void download()}>
          {exporting ? "Preparing Excel file…" : "Download leaderboard (.xlsx)"}
        </button>
        <button ref={resetButton} className="sc-button secondary" type="button" disabled={busy || exporting} onClick={() => void prepareReset()}>
          Reset leaderboard
        </button>
      </div>
      {notice && <p className="sc-spark-admin-notice success" role="status">{notice}</p>}
      {error && <ErrorNotice message={error} />}
      <Modal
        open={!!confirmation}
        onClose={closeConfirmation}
        title="Reset the leaderboard?"
        description="Archive the current standings and open a new round. Players keep their levels and Sparks and need to join again. Only levels cleared after this reset count."
        required={busy}
      >
        <div className="sc-form">
          <button className="sc-button secondary" type="button" disabled={busy} onClick={closeConfirmation}>
            Cancel
          </button>
          <button className="sc-button" type="button" disabled={busy} onClick={() => void reset()}>
            {busy ? "Resetting…" : "Reset rankings"}
          </button>
        </div>
      </Modal>
    </section>
  );
}
