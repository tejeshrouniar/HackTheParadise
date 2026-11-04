import { ArrowRight, Check, Code2, Sparkles } from "lucide-react";
import { useProgress } from "./ProgressContext";
import { useProfile } from "../profile/ProfileContext";
import { useAuth } from "../../contexts/AuthContext";
import { CODEDEX_LESSONS } from "../../data/codedexLessons";
import { StoryArtwork, AETHER_PORTRAIT } from "../story/StoryArtwork";

export default function Dashboard({
  onQuest,
  onCompanion,
  onTerminal,
  catalog = false,
}: {
  onQuest: (id: number) => void;
  onCompanion: () => void;
  onTerminal: () => void;
  catalog?: boolean;
}) {
  const { completed, status, retry } = useProgress();
  const { profile } = useProfile();
  const { user } = useAuth();
  const next =
    CODEDEX_LESSONS.find((l) => !completed.includes(l.id)) ??
    CODEDEX_LESSONS[0];
  const displayName =
    profile?.display_name ||
    user?.user_metadata?.full_name ||
    user?.user_metadata?.display_name;
  const shortName = displayName ? String(displayName).split(" ")[0] : "";
  return (
    <div className="sc-page sc-dashboard sc-simple-dashboard">
      <div className="sc-page-heading">
        <div>
          <h1>
            {catalog
              ? "Choose a quest."
              : shortName
                ? `Welcome back, ${shortName}.`
                : "Your adventure starts here."}
          </h1>
          {catalog && (
            <p>
              Eight small steps from curious beginner to confident spellcaster.
            </p>
          )}
        </div>
      </div>
      {catalog ? (
        <div className="sc-simple-catalog">
          {CODEDEX_LESSONS.map((lesson) => (
            <button
              className="sc-quest-card sc-illustrated-quest sc-simple-quest-card"
              key={lesson.id}
              onClick={() => onQuest(lesson.id)}
            >
              <StoryArtwork
                lesson={lesson.id}
                className="sc-quest-cover"
                decorative
                compact
              />
              <div className="sc-simple-card-meta">
                <span>{String(lesson.id).padStart(2, "0")}</span>
                {completed.includes(lesson.id) ? (
                  <span className="sc-quest-status done">
                    <Check size={13} />
                    Complete
                  </span>
                ) : lesson.id === next.id ? (
                  <span className="sc-quest-status">Up next</span>
                ) : null}
              </div>
              <h2>{lesson.title}</h2>
              <p>{lesson.conceptName}</p>
              <ArrowRight
                className="sc-card-arrow"
                size={18}
                aria-hidden="true"
              />
            </button>
          ))}
        </div>
      ) : (
        <>
          <section className="sc-hero sc-eldoria-hero">
            <StoryArtwork className="sc-eldoria-cover" decorative priority />
            <div className="sc-hero-copy">
              <span className="sc-pill">
                <Sparkles size={13} />
                THE FRAGMENTS OF ELDORIA
              </span>
              <h2>
                A world in pieces.
                <br />
                <em>A spell at a time.</em>
              </h2>
              <p>Help Aether bring magic back to Eldoria.</p>
              <button
                className="sc-button mint"
                onClick={() => onQuest(next.id)}
              >
                {completed.length === 8
                  ? "Play again"
                  : completed.length
                    ? "Continue adventure"
                    : "Begin adventure"}
                <ArrowRight size={18} />
              </button>
              <small>
                Quest {String(next.id).padStart(2, "0")} · {next.title}
              </small>
            </div>
          </section>
          <section
            className="sc-journey-summary"
            aria-label="Your quest progress"
          >
            <div>
              <strong>
                {completed.length}
                <span> / 8 quests</span>
              </strong>
              <div className="sc-journey-steps" aria-hidden="true">
                {CODEDEX_LESSONS.map((l) => (
                  <span
                    key={l.id}
                    className={completed.includes(l.id) ? "complete" : ""}
                  />
                ))}
              </div>
            </div>
            <span className="sc-journey-xp">
              {completed.length * 150}
              <small> XP earned</small>
            </span>
          </section>
          <div className="sc-home-extras">
            <button onClick={onCompanion}>
              <img src={AETHER_PORTRAIT} alt="" width={335} height={640} />
              Meet Aether
            </button>
            <button onClick={onTerminal}>
              <Code2 size={18} />
              Code playground
            </button>
          </div>
        </>
      )}
      {user && status.startsWith("Saved on this device.") && (
        <p className="sc-sync-notice">
          Progress is saved on this device.{" "}
          <button className="sc-link" onClick={retry}>
            Retry cloud sync
          </button>
        </p>
      )}
    </div>
  );
}
