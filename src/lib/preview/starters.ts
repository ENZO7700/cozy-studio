export type Starter = {
  id: string;
  label: string;
  prompt: string;
};

export const STARTERS: Starter[] = [
  {
    id: "kanban",
    label: "Kanban",
    prompt:
      "Personal kanban for a digital assistant. Columns Inbox, Doing, Done. Cards with priority chips, add-card form, and move buttons. Warm paper canvas, ink type, terracotta primary.",
  },
  {
    id: "chat",
    label: "Chat",
    prompt:
      "A calm AI chat. Conversation list on the left, message thread in the center, composer at the bottom. Assistant bubbles on paper, user bubbles in terracotta. No streaming chrome.",
  },
  {
    id: "habits",
    label: "Habits",
    prompt:
      "Habits dashboard with a 7-day grid. Habits: water, movement, reading, sleep. Toggle cells, streak count, and a weekly progress bar. Editorial, not gamified.",
  },
  {
    id: "calendar",
    label: "Calendar",
    prompt:
      "Month calendar with click-to-add events and a side list of today's notes. Quiet typography, terracotta for today, paper background.",
  },
  {
    id: "notes",
    label: "Notes",
    prompt:
      "Notes tool: searchable list on the left, editor on the right, new-note action. Persist notes in the page. Warm paper, ink text, terracotta accent.",
  },
];
