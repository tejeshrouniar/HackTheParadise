import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";

type WalletSnapshot = {
  balance: number;
  unlimited?: boolean;
  unlocks: { book_id?: string; lesson_id: number; kind: string }[];
};

/** Wallet state comes from authenticated RPCs; currency is never calculated or persisted in the browser. */
export function useHintWallet() {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<WalletSnapshot | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [attempt, retry] = useState(0);
  const loadedOwner = useRef<string>();
  const owner = useRef(user?.id);
  owner.current = user?.id;

  useEffect(() => {
    setWallet(null);
    setError("");
    setBusy(false);
    if (!user || !supabase) return;

    let active = true;
    const refresh = async () => {
      const { data, error: requestError } = await supabase!.rpc("spark_wallet");
      if (!active) return;
      if (requestError) {
        setWallet(null);
        setError("Wallet unavailable. Check the Spark database migrations, then refresh.");
        return;
      }
      loadedOwner.current = user.id;
      setWallet(data as WalletSnapshot);
      setError("");
    };

    void refresh();
    window.addEventListener("focus", refresh);
    window.addEventListener("sparks-changed", refresh);
    return () => {
      active = false;
      window.removeEventListener("focus", refresh);
      window.removeEventListener("sparks-changed", refresh);
    };
  }, [user?.id, attempt]);

  async function buy(bookId: string, lesson: number, item: "hint" | "solution") {
    if (!user || !supabase || busy) return;
    const client = supabase;
    const id = user.id;
    setBusy(true);
    setError("");
    try {
      const { data, error: requestError } = await client.rpc("spend_sparks", {
        book_key: bookId,
        lesson,
        item,
      });
      if (owner.current !== id) return;
      if (requestError) throw requestError;
      setWallet(data as WalletSnapshot);
      window.dispatchEvent(new Event("sparks-changed"));
    } catch (requestError) {
      if (owner.current !== id) return;
      const detail =
        typeof requestError === "object" &&
        requestError !== null &&
        "message" in requestError
          ? String(requestError.message)
          : "";
      setError(
        detail === "Not enough sparks"
          ? "Not enough sparks. Refresh your balance."
          : "Purchase unconfirmed. Retry safely; each unlock is charged only once.",
      );
    } finally {
      if (owner.current === id) setBusy(false);
    }
  }

  const current = loadedOwner.current === user?.id ? wallet : null;
  return {
    balance: current?.balance ?? null,
    unlimited: current?.unlimited === true,
    busy,
    error,
    signedIn: !!user,
    buy,
    refresh: () => retry((count) => count + 1),
    owns: (id: number, kind: string, bookId = "cinder") =>
      !!current?.unlocks.some((unlock) => (unlock.book_id ?? "cinder") === bookId && unlock.lesson_id === id && unlock.kind === kind),
  };
}
