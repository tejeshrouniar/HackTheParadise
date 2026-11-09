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
      howToWriteBody: chapter.howToWriteBody,
      codeExample: chapter.codeExample,
      taskObjective: chapter.objective,
      initialCode: "# Write your spell below\n",
      stageConfig: { ...example.stageConfig, target: chapter.target },
    };
  });
}
