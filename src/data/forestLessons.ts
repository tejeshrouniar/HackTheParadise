import { FOREST_CHAPTERS } from "../content/forestCampaign.ts";
import type { CodedexLesson } from "./codedexLessons";
export function forestLessons(base: CodedexLesson[]): CodedexLesson[] {
  return FOREST_CHAPTERS.map((chapter) => {
    const example = base.find((lesson) => lesson.stageType === chapter.stage)!;
    return {
      ...example,
      id: chapter.id,
      title: chapter.title,
      chapter: chapter.chapter,
      conceptName: chapter.conceptName,
      whatIsThisTitle: chapter.conceptName,
      whatIsThisBody: chapter.story,
      howToWriteTitle: "Try this spell",
      howToWriteBody: chapter.hint,
      codeExample: chapter.solution,
      taskObjective: chapter.objective,
      tasks: [
        {
          id: `forest-${chapter.id}`,
          description: chapter.objective,
          codeKeyword: chapter.solution.split("\n")[0],
        },
      ],
      initialCode: "# Write your spell below\n",
      hint: chapter.hint,
      solutionCode: chapter.solution,
      stageConfig: { ...example.stageConfig, target: chapter.target },
    };
  });
}
