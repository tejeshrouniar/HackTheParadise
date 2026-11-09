import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../contexts/AuthContext";

type CodeSource = "test" | "promotion" | "referral";

/** Admin-only controls call guarded RPCs; the browser never writes code or wallet tables directly. */
export function SparkCodeTools() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [amount, setAmount] = useState(100);
  const [count, setCount] = useState(1);
  const [uses, setUses] = useState(1);
  const [source, setSource] = useState<CodeSource>("test");
  const [campaign, setCampaign] = useState("");
  const [referrer, setReferrer] = useState("");
  const [expires, setExpires] = useState("");
  const [codes, setCodes] = useState<string[]>([]);
  const [accountEmail, setAccountEmail] = useState("");
  const [reason, setReason] = useState("Internal testing access");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [noticeKind, setNoticeKind] = useState<"success" | "error">("success");

  useEffect(() => {
    let active = true;
    setIsAdmin(false);
    if (!user || !supabase) return;
    void (async () => {
      try {
        const { data, error } = await supabase!.rpc("is_spark_admin");
        if (active && !error) setIsAdmin(data === true);
      } catch {
        if (active) setIsAdmin(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [user?.id]);

  function message(text: string, kind: "success" | "error" = "success") {
    setNotice(text);
    setNoticeKind(kind);
  }

  async function createCodes(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase || busy) return;
    setBusy(true);
    setCodes([]);
    setNotice("");
    try {
      const { data, error } = await supabase.rpc("create_spark_codes", {
        p_amount: amount,
        p_count: count,
        p_max_redemptions: uses,
        p_source: source,
        p_campaign_key: campaign.trim() || null,
        p_referrer_user_id: source === "referral" ? referrer.trim() || null : null,
        p_expires_at: expires ? new Date(expires).toISOString() : null,
      });
      if (error) throw error;
      const created = Array.isArray(data)
        ? data.flatMap((row) => typeof row.generated_code === "string" ? [row.generated_code] : [])
        : [];
      setCodes(created);
      message(created.length ? `${created.length} code${created.length === 1 ? "" : "s"} created. Copy them now; they are only shown once.` : "No codes were returned. Try again.", created.length ? "success" : "error");
    } catch {
      message("Could not create codes. Confirm this account is a Spark admin and the latest migration is applied.", "error");
    } finally {
      setBusy(false);
    }
  }

  async function copyCode(code: string) {
    try {
      await navigator.clipboard.writeText(code);
      message("Code copied.");
    } catch {
      message("Copy was blocked by the browser. Select and copy the code directly.", "error");
    }
  }

  async function revokeCode(code: string) {
    if (!supabase || busy) return;
    setBusy(true);
    try {
      const { error } = await supabase.rpc("revoke_spark_code", { p_code: code });
      if (error) throw error;
      setCodes((current) => current.filter((value) => value !== code));
      message("Code revoked. It can no longer be redeemed.");
    } catch {
      message("Could not revoke that code. It may already be redeemed or invalid.", "error");
    } finally {
      setBusy(false);
    }
  }

  async function setUnlimited(enabled: boolean) {
    if (!supabase || busy) return;
    setBusy(true);
    try {
      const { data, error } = await supabase.rpc("set_spark_unlimited_access", {
        p_email: accountEmail.trim(),
        p_enabled: enabled,
        p_reason: reason.trim() || "Internal testing access",
      });
      if (error) throw error;
      message(enabled
        ? `Unlimited test access granted to ${data.email}.`
        : `Unlimited test access removed from ${data.email}.`);
      window.dispatchEvent(new Event("sparks-changed"));
    } catch {
      message("Could not update access. Check the email and confirm this account is a Spark admin.", "error");
    } finally {
      setBusy(false);
    }
  }

  if (!isAdmin) return null;

  return (
    <details className="sc-spark-admin">
      <summary>Developer Sparks tools</summary>
      <div className="sc-spark-admin-content">
        <section>
          <h3>Mint redeemable codes</h3>
          <p>Codes are random, single-use by default, and stored as hashes. Copy them before leaving this screen.</p>
          <form onSubmit={(event) => void createCodes(event)}>
            <label>
              Sparks per code
              <select value={amount} onChange={(event) => setAmount(Number(event.target.value))}>
                <option value={100}>100 sparks</option>
                <option value={200}>200 sparks</option>
              </select>
            </label>
            <label>
              Number of codes
              <input type="number" min={1} max={50} value={count} onChange={(event) => setCount(Number(event.target.value))} />
            </label>
            <label>
              Redemptions per code
              <input type="number" min={1} max={10000} value={uses} onChange={(event) => setUses(Number(event.target.value))} />
            </label>
            <label>
              Code purpose
              <select value={source} onChange={(event) => setSource(event.target.value as CodeSource)}>
                <option value="test">Testing</option>
                <option value="promotion">Promotion</option>
                <option value="referral">Referral attribution</option>
              </select>
            </label>
            <label>
              Campaign name {source === "referral" && <span>(required)</span>}
              <input value={campaign} maxLength={80} onChange={(event) => setCampaign(event.target.value)} placeholder="e.g. early-access" />
            </label>
            {source === "referral" && (
              <label className="sc-spark-admin-wide">
                Referrer account ID
                <input value={referrer} onChange={(event) => setReferrer(event.target.value)} placeholder="Supabase user UUID" required />
              </label>
            )}
            <label>
              Expires (optional)
              <input type="datetime-local" value={expires} onChange={(event) => setExpires(event.target.value)} />
            </label>
            <button className="sc-button mint sc-spark-admin-wide" disabled={busy || (source === "referral" && !campaign.trim())}>
              {busy ? "Working…" : "Generate codes"}
            </button>
          </form>
          {codes.length > 0 && (
            <ul className="sc-spark-code-list">
              {codes.map((code) => (
                <li key={code}>
                  <code>{code}</code>
                  <button type="button" className="sc-button secondary" onClick={() => void copyCode(code)}>Copy</button>
                  <button type="button" className="sc-link" disabled={busy} onClick={() => void revokeCode(code)}>Revoke</button>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section>
          <h3>Unlimited test access</h3>
          <p>Grants free hints and solutions to one account. It does not create or alter a numeric Spark balance.</p>
          <form onSubmit={(event) => { event.preventDefault(); void setUnlimited(true); }}>
            <label>
              Account email
              <input type="email" value={accountEmail} onChange={(event) => setAccountEmail(event.target.value)} required />
            </label>
            <label>
              Admin note
              <input value={reason} maxLength={240} onChange={(event) => setReason(event.target.value)} />
            </label>
            <button className="sc-button mint" disabled={busy}>{busy ? "Working…" : "Grant test access"}</button>
            <button type="button" className="sc-button secondary" disabled={busy || !accountEmail.trim()} onClick={() => void setUnlimited(false)}>Remove access</button>
          </form>
        </section>
        {notice && <p className={`sc-spark-admin-notice ${noticeKind}`} role="status">{notice}</p>}
      </div>
    </details>
  );
}
