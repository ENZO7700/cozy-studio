const DEFAULT_FILES = ["index.html", "styles.css", "src/app.js"] as const;

const PACKS: { test: RegExp; files: readonly string[] }[] = [
  {
    test: /kanban|board|column|inbox/i,
    files: ["index.html", "styles.css", "src/board.js", "src/card.js"],
  },
  {
    test: /chat|message|thread|composer/i,
    files: ["index.html", "styles.css", "src/thread.js", "src/composer.js"],
  },
  {
    test: /habit|streak|grid/i,
    files: ["index.html", "styles.css", "src/habits.js", "src/streak.js"],
  },
  {
    test: /calendar|month|event/i,
    files: ["index.html", "styles.css", "src/month.js", "src/events.js"],
  },
  {
    test: /note|editor|search/i,
    files: ["index.html", "styles.css", "src/notes.js", "src/editor.js"],
  },
];

export function filesForBrief(brief: string): string[] {
  const pack = PACKS.find((p) => p.test.test(brief));
  return [...(pack?.files ?? DEFAULT_FILES)];
}
