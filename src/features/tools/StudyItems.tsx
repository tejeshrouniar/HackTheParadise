import { useEffect, useRef, useState } from "react";
import { Copy, Plus, Save, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";
import { errorMessage, readLocal, writeLocal } from "../../lib/validation";
import { ErrorNotice, Loading } from "../../components/ui/Status";
import { Modal } from "../../components/ui/Modal";
interface Item {
  id: string;
  kind: "note" | "snippet";
  title: string;
  body: string;
  language: string;
  updated_at: string;
}
export function StudyItems({ kind }: { kind: "note" | "snippet" }) {
  const { user } = useAuth();
  const key = `storicode_items_${user?.id ?? "guest"}_${kind}`;
  const [items, setItems] = useState<Item[]>(() =>
    user ? [] : readLocal(key, []),
  );
  const [draft, setDraft] = useState<Item | null>(null);
  const [dirty, setDirty] = useState(false);
  const [pending, setPending] = useState<Item | null>(null);
  const [confirm, setConfirm] = useState(false);
  const [loading, setLoading] = useState(!!user);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [loadError, setLoadError] = useState("");
  const [remove, setRemove] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const titleInput = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (draft && !items.some(item => item.id === draft.id)) titleInput.current?.focus();
  }, [draft?.id]);
  useEffect(() => {
    let active = true;
    if (user && supabase) {
      setLoading(true);
      void Promise.resolve(supabase
        .from("study_items")
        .select("id,kind,title,body,language,updated_at")
        .eq("user_id", user.id)
        .eq("kind", kind)
        .order("updated_at", { ascending: false }))
        .then(({ data, error }) => {
          if (!active) return;
          if (error) setLoadError(errorMessage(error));
          else {
            setItems(data ?? []);
            setLoadError("");
          }
        }).catch(error => {
          if (active) setLoadError(errorMessage(error));
        }).finally(() => {
          if (active) setLoading(false);
        });
    }
    return () => {
      active = false;
    };
  }, [user?.id, kind, attempt]);
  const choose = (item: Item) => {
    if (busy || draft?.id === item.id) return;
    setError("");
    if (dirty) {
      setPending(item);
      setConfirm(true);
    } else setDraft(item);
  };
  const create = () =>
    choose({
      id: crypto.randomUUID(),
      kind,
      title: "",
      body: "",
      language: kind === "snippet" ? "python" : "text",
      updated_at: new Date().toISOString(),
    });
  const edit = (patch: Partial<Item>) => {
    setDraft(draft ? { ...draft, ...patch } : null);
    setDirty(true);
  };
  async function save() {
    if (busy) return;
    if (!draft?.title.trim()) {
      setError("Give this a short title first.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const next = {
        ...draft,
        title: draft.title.trim(),
        updated_at: new Date().toISOString(),
      };
      if (user && supabase) {
        const { error } = await supabase
          .from("study_items")
          .upsert({ ...next, user_id: user.id }, { onConflict: "id" });
        if (error) throw error;
      }
      const updated = [next, ...items.filter((i) => i.id !== next.id)];
      if (!user && !writeLocal(key, updated))
        throw new Error(
          "Device storage is full or unavailable. Copy your work before closing.",
        );
      setItems(updated);
      setDraft(next);
      setDirty(false);
      toast.success(user ? "Saved to your account" : "Saved on this device");
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setBusy(false);
    }
  }
  async function destroy() {
    if (!draft || busy) return;
    setBusy(true);
    setError("");
    try {
      if (user && supabase) {
        const { error } = await supabase
          .from("study_items")
          .delete()
          .eq("id", draft.id)
          .eq("user_id", user.id);
        if (error) throw error;
      }
      const updated = items.filter((i) => i.id !== draft.id);
      if (!user && !writeLocal(key, updated))
        throw new Error("Unable to update device storage.");
      setItems(updated);
      setDraft(null);
      setDirty(false);
      setRemove(false);
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  return (
    <div className="sc-tool-content">
      <div className="sc-section-heading">
        <h3>{kind === "note" ? "Your notebook" : "Code worth keeping"}</h3>
        <button
          className="sc-icon-button"
          onClick={create}
          disabled={busy || loading}
          aria-label={`New ${kind}`}
        >
          <Plus size={20} />
        </button>
      </div>
      <p className="sc-muted sc-caption">
        {user
          ? "Private to your account. Save to sync across devices."
          : "Guest mode · saved on this device only."}
      </p>
      {loadError && (
        <ErrorNotice message={loadError} retry={() => setAttempt((n) => n + 1)} />
      )}
      {error && !remove && <ErrorNotice message={error} />}
      {loading ? (
        <Loading />
      ) : (
        <div className="sc-item-list">
          {items.map((item) => (
            <button
              key={item.id}
              className={draft?.id === item.id ? "active" : ""}
              aria-pressed={draft?.id === item.id}
              disabled={busy}
              onClick={() => choose(item)}
            >
              {item.title}
              <small>{new Date(item.updated_at).toLocaleDateString()}</small>
            </button>
          ))}
          {!items.length && !draft && !loadError && (
            <div className="sc-empty">
              <p>
                {kind === "note"
                  ? "A place for your lightbulb moments."
                  : "Keep a useful pattern close at hand."}
              </p>
              <button className="sc-button secondary" onClick={create}>
                <Plus size={16} />
                Create your first {kind}
              </button>
            </div>
          )}
        </div>
      )}
      {draft && (
        <form
          className="sc-form"
          aria-busy={busy}
          onSubmit={(e) => {
            e.preventDefault();
            void save();
          }}
        >
          <label>
            Title
            <input
              ref={titleInput}
              required
              disabled={busy}
              maxLength={100}
              value={draft.title}
              onChange={(e) => edit({ title: e.target.value })}
              placeholder={
                kind === "note"
                  ? "A thought to come back to…"
                  : "For loop pattern"
              }
            />
          </label>
          {kind === "snippet" && (
            <label>
              Language
              <select
                value={draft.language}
                disabled={busy}
                onChange={(e) => edit({ language: e.target.value })}
              >
                <option value="python">Python</option>
                <option value="javascript">JavaScript</option>
                <option value="text">Plain text</option>
              </select>
            </label>
          )}
          <label>
            {kind === "note" ? "Note" : "Code"}
            <textarea
              className={kind === "snippet" ? "font-code" : ""}
              rows={10}
              disabled={busy}
              maxLength={20000}
              value={draft.body}
              onChange={(e) => edit({ body: e.target.value })}
              spellCheck={kind === "note"}
            />
          </label>
          <small>
            {draft.body.length}/20,000 · <span role="status">{dirty ? "Unsaved changes" : items.some((item) => item.id === draft.id) ? "Saved" : "New draft"}</span>
          </small>
          <div className="sc-row">
            <button className="sc-button" disabled={busy}>
              <Save size={16} />
              {busy ? "Saving…" : "Save"}
            </button>
            <button
              className="sc-icon-button"
              type="button"
              aria-label="Copy content"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(draft.body);
                  toast.success("Copied");
                } catch {
                  setError("Copy was blocked by your browser. Select and copy the text instead.");
                }
              }}
            >
              <Copy size={18} />
            </button>
            <button
              className="sc-icon-button"
              type="button"
              aria-label={`Delete ${kind}`}
              disabled={busy}
              onClick={() => { setError(""); setRemove(true); }}
            >
              <Trash2 size={18} />
            </button>
          </div>
        </form>
      )}
      <Modal
        open={confirm}
        onClose={() => setConfirm(false)}
        title="Keep your changes?"
        description="Keep editing to save your draft, or discard its unsaved changes."
      >
        <div className="sc-row">
          <button
            className="sc-button secondary"
            onClick={() => {
              setConfirm(false);
            }}
          >
            Keep editing
          </button>
          <button
            className="sc-button danger"
            onClick={() => {
              setDraft(pending);
              setDirty(false);
              setConfirm(false);
            }}
          >
            Discard changes
          </button>
        </div>
      </Modal>
      <Modal
        open={remove}
        onClose={() => setRemove(false)}
        title={`Delete this ${kind}?`}
        description="This cannot be undone."
        required={busy}
      >
        {error && <ErrorNotice message={error} />}
        <button
          className="sc-button danger"
          disabled={busy}
          onClick={() => void destroy()}
        >
          {busy ? "Deleting…" : "Delete"}
        </button>
      </Modal>
    </div>
  );
}
