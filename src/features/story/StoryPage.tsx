import React, { useState } from "react";
import { useProgress } from "../learning/ProgressContext";
import { canEnterLevel, journeyProgress } from "../learning/journeyProgress";
import { StoryCinema } from "./StoryCinema";
import {
  ALL_SAGAS,
  MagicalSaga,
  StoryChapterData,
} from "../../content/storySagas";
import { sound } from "../../utils/sound";
import {
  BookOpen,
  Sparkles,
  Swords,
  ChevronRight,
  Scroll,
  Layers,
  MapPin,
} from "lucide-react";

export default function StoryPage({
  onQuest,
}: {
  onQuest: (id: number) => void;
}) {
  const { completed } = useProgress();
  const [selectedSagaId, setSelectedSagaId] = useState<string>("eldoria");
  const [chapterIndex, setChapterIndex] = useState<number>(0);

  const activeSaga: MagicalSaga =
    ALL_SAGAS.find((s) => s.id === selectedSagaId) || ALL_SAGAS[0];
  const activeChapter: StoryChapterData =
    activeSaga.chapters[chapterIndex] || activeSaga.chapters[0];

  const handleSelectSaga = (sagaId: string) => {
    setSelectedSagaId(sagaId);
    setChapterIndex(0);
    sound.playWandCast();
  };

  const handleSelectChapter = (index: number) => {
    setChapterIndex(index);
    sound.playCrystalCollect();
  };

  return (
    <div className="sc-page sc-journey-reader max-w-5xl mx-auto px-4 py-6 space-y-8 animate-fade-in">
      {/* Page Heading */}
      <header className="sc-page-heading border-b border-slate-800 pb-4">
        <div>
          <span className="sc-eyebrow flex items-center gap-1.5 text-purple-400 font-semibold tracking-wider uppercase text-xs">
            <BookOpen size={14} /> THE ARCANE GRIMOIRE · 5 REALMS & 50 CHAPTERS
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-100 tracking-tight mt-1">
            The Chronicles of Arcane Code
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-2xl">
            Choose your magical saga. Each tale spans ten narrative chapters across five foundational programming languages—where every spell cast reshapes the living story.
          </p>
        </div>
      </header>

      {/* 5 Sagas Realm Selector Tabs */}
      <div className="space-y-3">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Layers size={13} /> Select Magical Saga:
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
          {ALL_SAGAS.map((saga) => {
            const isSelected = saga.id === activeSaga.id;
            return (
              <button
                key={saga.id}
                onClick={() => handleSelectSaga(saga.id)}
                className={`relative flex flex-col p-3 rounded-xl border text-left transition-all duration-200 ${
                  isSelected
                    ? "bg-purple-950/70 border-purple-500 shadow-lg shadow-purple-950/50 scale-[1.02]"
                    : "bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-850 opacity-80 hover:opacity-100"
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="text-2xl">{saga.bannerIcon}</span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      isSelected
                        ? "bg-purple-800/80 text-purple-200"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {saga.languageName.split(" ")[0]}
                  </span>
                </div>
                <strong className="text-xs font-bold text-slate-100 line-clamp-1">
                  {saga.title}
                </strong>
                <small className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                  {saga.subTitle}
                </small>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Saga Spotlight Banner */}
      <div
        className={`p-5 rounded-2xl border border-slate-700/80 bg-gradient-to-r ${activeSaga.gradient} shadow-2xl relative overflow-hidden`}
      >
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/10 text-slate-200 border border-white/20 backdrop-blur-md">
              <span>{activeSaga.bannerIcon}</span>
              <span>{activeSaga.languageBadge}</span>
              <span>· 10 Chapters</span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-wide">
              {activeSaga.title}: {activeSaga.subTitle}
            </h2>
            <p className="text-slate-300 text-xs md:text-sm leading-relaxed">
              {activeSaga.lore}
            </p>
          </div>

          <div className="shrink-0 flex md:flex-col items-center gap-2">
            <span className="text-xs text-slate-300 font-medium bg-black/40 px-3 py-1.5 rounded-lg border border-white/10">
              Vibe: {activeSaga.bgmTrack.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* 10 Chapters Horizontal Scroller / Selector */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Scroll size={13} /> Chapters (1 — 10)
          </label>
          <span className="text-xs text-purple-400 font-mono">
            Chapter {chapterIndex + 1} of {activeSaga.chapters.length}
          </span>
        </div>

        <nav
          className="flex overflow-x-auto gap-2 pb-2 scrollbar-thin scrollbar-thumb-slate-700"
          aria-label="Story chapters"
        >
          {activeSaga.chapters.map((ch, i) => {
            const isCurrent = chapterIndex === i;
            return (
              <button
                key={ch.id}
                onClick={() => handleSelectChapter(i)}
                className={`flex-shrink-0 px-3.5 py-2.5 rounded-xl border text-left text-xs transition-all ${
                  isCurrent
                    ? "bg-purple-600 text-white font-bold border-purple-400 shadow-md shadow-purple-900"
                    : "bg-slate-900/90 text-slate-300 border-slate-800 hover:border-slate-750 hover:bg-slate-850"
                }`}
              >
                <div className="font-mono text-[10px] opacity-75">
                  CH {ch.chapterNumber}
                </div>
                <div className="font-semibold line-clamp-1 max-w-[140px]">
                  {ch.title}
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Enhanced Story Cutscene Player */}
      <StoryCinema
        key={`${activeSaga.id}-${chapterIndex}`}
        sagaId={activeSaga.id}
        chapterIndex={chapterIndex}
        sagaChapter={activeChapter}
        onQuest={onQuest}
        onNextChapter={() => {
          if (chapterIndex < activeSaga.chapters.length - 1) {
            handleSelectChapter(chapterIndex + 1);
          }
        }}
      />

      {/* Chapter Mission Details & Launch Card */}
      <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
          <div>
            <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">
              CODING CHALLENGE · LEVEL {activeChapter.questLevelId}
            </span>
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <MapPin size={16} className="text-purple-400" />
              {activeChapter.subtitle}
            </h3>
          </div>

          <button
            onClick={() => onQuest(activeChapter.questLevelId)}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-sm shadow-xl shadow-emerald-950 transition-all hover:scale-[1.02]"
          >
            <Swords size={16} /> Enter Quest Sandbox →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1.5 p-3 rounded-lg bg-slate-950/70 border border-slate-800">
            <span className="font-semibold text-slate-300 uppercase tracking-wider">
              Objective:
            </span>
            <p className="text-slate-400 leading-relaxed">
              {activeChapter.taskObjective}
            </p>
          </div>

          <div className="space-y-1.5 p-3 rounded-lg bg-slate-950/70 border border-slate-800">
            <span className="font-semibold text-slate-300 uppercase tracking-wider">
              Concept Mastery:
            </span>
            <p className="text-slate-400 leading-relaxed">
              <strong className="text-purple-300">
                {activeChapter.conceptName}
              </strong>{" "}
              — Learn syntax, execution flow, and debug logic through interactive spell sandboxes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
