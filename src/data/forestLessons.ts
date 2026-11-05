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
      howToWriteTitle: "Practice the idea",
      howToWriteBody: "Try the small example below, then adapt the values and actions to your mission. The example demonstrates syntax; it does not finish the level.",
      codeExample: example.codeExample,
      taskObjective: chapter.objective,
      tasks: [
        {
          id: `forest-${chapter.id}`,
          description: chapter.objective,
          codeKeyword: example.tasks[0].codeKeyword,
        },
      ],
      initialCode: "# Write your spell below\n",
      stageConfig: { ...example.stageConfig, target: chapter.target },
    };
  });
}
