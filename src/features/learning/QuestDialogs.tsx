import { Modal } from "../../components/ui/Modal";
import type { useQuestEngine } from "./useQuestEngine";
export function QuestDialogs({
  state,
}: {
  state: ReturnType<typeof useQuestEngine>;
}) {
  const { lesson, isTutorialOpen, setIsTutorialOpen, setCode } = state;
  return (
    <>
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
        </article>
      </Modal>
    </>
  );
}
