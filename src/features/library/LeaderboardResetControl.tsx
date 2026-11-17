import { useRef, useState } from "react";
import { Modal } from "../../components/ui/Modal";
import { ErrorNotice } from "../../components/ui/Status";
import { supabase } from "../../lib/supabase";
import { errorMessage } from "../../lib/validation";

export function LeaderboardResetControl() {
  const [confirmation, setConfirmation] = useState<{ previousReset: string | null }>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const resetButton = useRef<HTMLButtonElement>(null);

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
      setNotice("Leaderboard reset. Newly cleared levels now count toward the rankings.");
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
      <button ref={resetButton} className="sc-button secondary" type="button" disabled={busy} onClick={() => void prepareReset()}>
        Reset leaderboard
      </button>
      {notice && <p className="sc-spark-admin-notice success" role="status">{notice}</p>}
      {error && <ErrorNotice message={error} />}
      <Modal
        open={!!confirmation}
        onClose={closeConfirmation}
        title="Reset the leaderboard?"
        description="Everyone’s ranking starts at zero. Players keep their saved levels and Sparks. Only newly cleared levels count toward the next rankings."
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
