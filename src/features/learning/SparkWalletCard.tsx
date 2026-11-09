import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";
import { useHintWallet } from "./useHintWallet";
import { SparkCodeTools } from "./SparkCodeTools";

type LedgerEntry = { id: number; amount: number; created_at: string };

// Combines the server-backed balance, recent ledger activity, and one-time code redemption.
export function SparkWalletCard({ onSignIn }: { onSignIn: () => void }) {
  const wallet = useHintWallet();
  const { user } = useAuth();
  const [history, setHistory] = useState<LedgerEntry[]>([]);
  const [historyError, setHistoryError] = useState(false);
  const [code, setCode] = useState("");
  const [redeeming, setRedeeming] = useState(false);
  const [codeNotice, setCodeNotice] = useState("");
  const [codeError, setCodeError] = useState(false);

  useEffect(() => {
    setHistory([]);
    setHistoryError(false);
    if (!user || !supabase) return;

    let active = true;
    void supabase
      .from("spark_ledger")
      .select("id,amount,created_at")
      .eq("user_id", user.id)
      .order("id", { ascending: false })
      .limit(10)
      .then(({ data, error }) => {
        if (!active) return;
        setHistory((data ?? []) as LedgerEntry[]);
        setHistoryError(!!error);
      });
    return () => {
      active = false;
    };
  }, [user?.id, wallet.balance]);

  async function redeem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase || !user || redeeming || !code.trim()) return;

    setRedeeming(true);
    setCodeNotice("");
    setCodeError(false);
    try {
      const { data, error } = await supabase.rpc("redeem_spark_code", {
        p_code: code.trim(),
      });
      if (error) throw error;
      const result = data as { credited?: number; already_redeemed?: boolean };
      setCode("");
      setCodeNotice(
        result?.already_redeemed
          ? "You have already used this code; your balance is unchanged."
          : `${result?.credited ?? 0} sparks added to your account.`,
      );
      window.dispatchEvent(new Event("sparks-changed"));
    } catch (requestError) {
      const detail =
        typeof requestError === "object" && requestError !== null && "message" in requestError
          ? String(requestError.message)
          : "";
      setCodeError(true);
      setCodeNotice(
        detail.includes("expired") || detail.includes("fully redeemed") || detail.includes("revoked")
          ? "This code has expired, was revoked, or has reached its redemption limit."
          : detail.includes("already redeemed")
            ? "You have already used this code."
            : detail.includes("Invalid spark code")
              ? "That code was not found. Check it and try again."
              : "Code redemption failed. Sign in and retry.",
      );
    } finally {
      setRedeeming(false);
    }
  }

  return (
    <section className="sc-card sc-settings-card sc-wallet-card">
      <h2>Sparks</h2>
      {!user ? (
        <>
          <p>Your account keeps your sparks and unlocked help across devices.</p>
          <button className="sc-button" onClick={onSignIn}>Sign in</button>
        </>
      ) : (
        <>
          <p className="sc-wallet-balance">
            {wallet.unlimited ? "∞" : wallet.balance ?? "—"}
            <span>{wallet.unlimited ? "test access" : "sparks"}</span>
          </p>
          <p>
            {wallet.unlimited
              ? "Unlimited hints and solutions are enabled for this test account. Its stored Spark balance is unchanged."
              : "Hints cost 10. Solutions cost 20. Each unlock is yours to keep."}
          </p>
          {!wallet.unlimited && (
            <small>30 welcome sparks per account. Spark purchases are not available yet.</small>
          )}
          {wallet.error && <p role="status">{wallet.error}</p>}
          <button className="sc-button secondary" onClick={wallet.refresh}>
            Refresh balance
          </button>
          <form className="sc-redeem-code" onSubmit={(event) => void redeem(event)}>
            <label htmlFor="spark-redeem-code">Have a Spark code?</label>
            <div>
              <input
                id="spark-redeem-code"
                value={code}
                onChange={(event) => setCode(event.target.value.toUpperCase())}
                placeholder="STORI-…"
                autoComplete="off"
                spellCheck={false}
                required
              />
              <button className="sc-button mint" disabled={redeeming || !code.trim()}>
                {redeeming ? "Redeeming…" : "Redeem"}
              </button>
            </div>
            {codeNotice && (
              <p className={codeError ? "error" : "success"} role="status">
                {codeNotice}
              </p>
            )}
          </form>
          <details>
            <summary>Recent activity</summary>
            {historyError ? (
              <p role="status">Activity could not load. Refresh to retry.</p>
            ) : history.length ? (
              <ul>
                {history.map((entry) => (
                    <li key={entry.id}>
                    <time dateTime={entry.created_at}>
                      {new Date(entry.created_at).toLocaleString()}
                    </time>
                    <strong>{entry.amount > 0 ? "+" : ""}{entry.amount} sparks</strong>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No activity yet.</p>
            )}
          </details>
          <SparkCodeTools />
        </>
      )}
    </section>
  );
}
