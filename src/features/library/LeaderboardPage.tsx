import { useEffect, useRef, useState } from "react";
import { RefreshCw } from "lucide-react";
import { ErrorNotice, Loading } from "../../components/ui/Status";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";
import { errorMessage } from "../../lib/validation";
import { Grimoire } from "./Grimoire";
import { PixelJournalMark } from "./PixelJournalMark";

type Score = { username: string; display_name: string; cinder: number; harry: number; total: number };
type Leader = Score & { place: number };
type Standings = {
  reset_at?: string | null;
  leaders: Leader[];
  player: (Score & { visible: boolean; place: number | null }) | null;
};

export default function LeaderboardPage({ onSignIn }: { onSignIn: () => void }) {
  const { user, configured } = useAuth();
  const userId = user?.id;
  const heading = useRef<HTMLHeadingElement>(null);
  const [standings, setStandings] = useState<Standings>();
  const [loadError, setLoadError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [visibilityStatus, setVisibilityStatus] = useState("");
  const [loading, setLoading] = useState(!!userId);
  const [saving, setSaving] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const refresh = () => setAttempt(value => value + 1);

  useEffect(() => { heading.current?.focus({ preventScroll: true }); }, []);
  useEffect(() => {
    if (!userId || !supabase) return;
    const request = new AbortController();
    setLoading(true);
    setLoadError("");
    void Promise.resolve(supabase.rpc("get_library_leaderboard").abortSignal(request.signal)).then(({ data, error }) => {
      if (request.signal.aborted) return;
      if (error) setLoadError(errorMessage(error));
      else setStandings(data as Standings);
    }).catch(error => {
      if (!request.signal.aborted) setLoadError(errorMessage(error));
    }).finally(() => {
      if (request.signal.aborted) return;
      setLoading(false);
    });
    return () => request.abort();
  }, [userId, attempt]);

  const player = standings?.player;
  async function changeVisibility(visible: boolean) {
    if (!supabase || !userId || !player || loading || saving) return;
    setSaveError("");
    setVisibilityStatus("");
    setSaving(true);
    try {
      const { error } = await supabase.from("user_preferences")
        .update({ leaderboard_visible: visible }).eq("user_id", userId).select("leaderboard_visible").single();
      if (error) throw error;
      setStandings(current => current ? {
        leaders: current.leaders.filter(leader => leader.username !== player.username),
        player: { ...player, visible, place: null },
      } : current);
      setVisibilityStatus(visible ? "You’ve joined the leaderboard." : "Your ranking is now hidden from other players.");
      setLoading(true);
      refresh();
    } catch (error) {
      setSaveError(errorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  return <div className="sc-page sc-utility-book htp-leaderboard">
    <Grimoire label="Leaderboard" coverColor="#254e42" className="htp-pixel-journal" left={<>
      <div className="sc-utility-intro">
        <PixelJournalMark kind="leaderboard" />
        <div><h1 ref={heading} tabIndex={-1}>Leaderboard</h1><p>Library rankings</p></div>
      </div>
      <p>Each level you clear in order and sync across The Last Light and The Horcrux Code earns one point. Players with the same total share a place.</p>
      {standings?.reset_at && <p>Rankings count progress since <time dateTime={standings.reset_at}>{new Date(standings.reset_at).toLocaleDateString()}</time>.</p>}
      {!userId && (configured ? <button type="button" className="sc-button" onClick={onSignIn}>Sign in to view rankings</button> : <p>Rankings require a connection to the library database.</p>)}
      {player && <section className="htp-rank-card" aria-labelledby="htp-your-rank">
        <h2 id="htp-your-rank">Your standing</h2>
        <dl>
          <div><dt>Place</dt><dd>{loading ? "Updating…" : player.place ?? "Unranked"}</dd></div>
          <div><dt>Levels cleared</dt><dd>{player.total}</dd></div>
          <div><dt>The Last Light</dt><dd>{player.cinder}</dd></div>
          <div><dt>The Horcrux Code</dt><dd>{player.harry}</dd></div>
        </dl>
        <p>{player.visible
          ? player.total === 0 ? "You’ll appear after your first synced level." : <>You’ve joined as <bdi>{player.display_name}</bdi>.</>
          : "Join to share your display name and level count with other signed-in players."}</p>
        <p><a className="sc-link" href="#/library/profile">Edit your display name</a></p>
        <button type="button" className="sc-button" disabled={saving || loading} onClick={() => void changeVisibility(!player.visible)}>
          {saving ? "Saving…" : player.visible ? "Hide my ranking" : "Join the leaderboard"}
        </button>
        {visibilityStatus && <p className="htp-preference-status" role="status">{visibilityStatus}</p>}
        {saveError && <ErrorNotice message={saveError} />}
      </section>}
    </>} right={<>
      <div className="htp-rank-heading">
        <h2>Top players</h2>
        {userId && <button type="button" className="sc-button secondary" onClick={refresh} disabled={loading || saving}>
          <RefreshCw size={16} aria-hidden="true" /> Refresh
        </button>}
      </div>
      <p>The top 25 players, ranked by levels cleared. Equal scores share the same place.</p>
      {!userId && <p>Sign in to see who’s leading the library.</p>}
      {loading && <Loading label={standings ? "Updating rankings…" : "Loading rankings…"} />}
      {loadError && <ErrorNotice message={loadError} retry={refresh} />}
      {standings && !loadError && (standings.leaders.length ? <table className="htp-rank-table" aria-label="Library leaderboard rankings" aria-busy={loading}>
        <thead><tr><th scope="col">Place</th><th scope="col">Player</th><th scope="col">Levels</th></tr></thead>
        <tbody>{standings.leaders.map(leader => {
          const isPlayer = leader.username === player?.username;
          return <tr key={leader.username} data-player={isPlayer || undefined}>
            <td>{leader.place}</td><th scope="row"><bdi>{leader.display_name}</bdi>{isPlayer && <span> · You</span>}</th><td>{leader.total}</td>
          </tr>;
        })}</tbody>
      </table> : !loading && <p>No rankings yet. Clear a level and join to be listed.</p>)}
    </>} />
  </div>;
}
