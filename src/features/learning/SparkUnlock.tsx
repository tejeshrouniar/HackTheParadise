import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";
import { useHintWallet } from "./useHintWallet";

type UnlockKind = "hint" | "solution";

export function SparkUnlock({
  bookId = "cinder",
  id,
  kind,
  onUse,
}: {
  bookId?: string;
  id: number;
  kind: UnlockKind;
  onUse?: (code: string) => void;
}) {
  const wallet = useHintWallet();
  const price = kind === "hint" ? 10 : 20;
  const { user } = useAuth();
  const owned = wallet.owns(id, kind, bookId);
  const [content, setContent] = useState<{
    owner: string;
    bookId: string;
    id: number;
    kind: UnlockKind;
    text: string;
  } | null>(null);
  const [error, setError] = useState("");
  const [attempt, retry] = useState(0);

  useEffect(() => {
    setContent(null);
    setError("");
    if (!owned || !user || !supabase) return;

    let active = true;
    void supabase.rpc("get_spark_content", { book_key: bookId, lesson: id, item: kind }).then(({ data, error: requestError }) => {
      if (!active) return;
      if (requestError || typeof data !== "string") {
        setError("Your unlock is saved, but its content could not load.");
      } else {
        setContent({ owner: user.id, bookId, id, kind, text: data });
      }
    });
    return () => {
      active = false;
    };
  }, [owned, user?.id, bookId, id, kind, attempt]);

  const text =
    content && content.owner === user?.id && content.bookId === bookId && content.id === id && content.kind === kind
      ? content.text
      : null;

  return (
    <div className="sc-spark-unlock">
      <p>
        {wallet.signedIn
          ? wallet.unlimited
            ? "Unlimited test access"
            : `Account wallet · ${wallet.balance ?? "…"} sparks`
          : "Sign in to save and spend sparks."}
      </p>
      {owned ? (
        text !== null ? (
          <>
            {kind === "hint" ? <p>{text}</p> : <pre><code>{text}</code></pre>}
            {onUse && (
              <button className="sc-button secondary" onClick={() => onUse(text)}>
                Use this code
              </button>
            )}
          </>
        ) : (
          <p role="status">
            {error || "Loading your unlock…"}
            {error && (
              <button className="sc-link" onClick={() => retry((count) => count + 1)}>
                Retry
              </button>
            )}
          </p>
        )
      ) : (
        <>
          <button
            className="sc-button"
            disabled={wallet.busy || wallet.balance === null || (!wallet.unlimited && wallet.balance < price)}
            onClick={() => void wallet.buy(bookId, id, kind)}
          >
            {wallet.busy
              ? "Opening…"
              : wallet.unlimited
                ? `Open ${kind} · unlimited`
                : `Unlock ${kind} · ${price} sparks`}
          </button>
          {!wallet.unlimited && wallet.balance !== null && wallet.balance < price && (
            <small>Not enough sparks. Your balance has not changed.</small>
          )}
        </>
      )}
      <small>One-time unlock · saved to your account</small>
      {wallet.error && <p role="status">{wallet.error}</p>}
      {wallet.signedIn && (
        <button className="sc-link" onClick={wallet.refresh}>
          Refresh wallet
        </button>
      )}
    </div>
  );
}
