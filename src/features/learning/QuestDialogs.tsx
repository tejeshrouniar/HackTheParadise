import { Check, ChevronRight } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { CODEDEX_LESSONS } from "../../data/codedexLessons";
import type { useQuestEngine } from "./useQuestEngine";
export function QuestDialogs({
  state,
}: {
  state: ReturnType<typeof useQuestEngine>;
}) {
  const {
    lesson,
    completedLessons,
    currentLessonId,
    setCurrentLessonId,
    isChapterDrawerOpen,
    setIsChapterDrawerOpen,
    isTutorialOpen,
    setIsTutorialOpen,
    setCode,
  } = state;
  return (
    <>
      <Modal
        open={isChapterDrawerOpen}
        onClose={() => setIsChapterDrawerOpen(false)}
        title="Choose your next quest"
        description="Explore at your own pace. Completed quests are always available to practice."
      >
        <div className="sc-search-results">
          {CODEDEX_LESSONS.map((l) => (
            <button
              key={l.id}
              aria-current={l.id === currentLessonId ? "page" : undefined}
              onClick={() => {
                setIsChapterDrawerOpen(false);
                setCurrentLessonId(l.id);
              }}
            >
              <span className="sc-search-number">
                {completedLessons.includes(l.id) ? <Check size={15} /> : l.id}
              </span>
              <span>
                <strong>{l.title}</strong>
                <small>{l.conceptName}</small>
              </span>
              <ChevronRight size={16} />
            </button>
          ))}
        </div>
      </Modal>
      <Modal
        open={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
        title={lesson.title}
        description={lesson.conceptName}
        wide
      >
        <article className="sc-quest-guide">
          <h3>{lesson.whatIsThisTitle}</h3>
          <p>{lesson.whatIsThisBody.replace(/\*+/g, "")}</p>
          {lesson.whatIsThisCallout && (
            <aside>{lesson.whatIsThisCallout}</aside>
          )}
          <h3>{lesson.howToWriteTitle}</h3>
          <p>{lesson.howToWriteBody}</p>
          <pre>
            <code>{lesson.codeExample}</code>
          </pre>
          <button
            className="sc-button secondary"
            onClick={() => {
              setCode(lesson.codeExample);
              setIsTutorialOpen(false);
            }}
          >
            Insert example into editor
          </button>
          <h3>Your mission</h3>
          <p>{lesson.taskObjective}</p>
          <ol>
            {lesson.tasks.map((task) => (
              <li key={task.id}>
                {task.description}
                <code>{task.codeKeyword}</code>
              </li>
            ))}
          </ol>
          <button
            className="sc-button"
            onClick={() => setIsTutorialOpen(false)}
          >
            Got it. Let’s code.
          </button>
        </article>
      </Modal>
    </>
  );
}
