export type StarterAddon = {
  id: string;
  label: string;
  description: string;
  prompt: string;
};

export type Starter = {
  id: string;
  label: string;
  description: string;
  prompt: string;
  addons: StarterAddon[];
};

export const STARTERS: Starter[] = [
  {
    id: "kanban",
    label: "Kanban",
    description:
      "A personal board with Inbox, Doing, and Done columns — cards, priorities, and calm paper tones.",
    prompt:
      "Personal kanban for a digital assistant. Columns Inbox, Doing, Done. Cards with priority chips, add-card form, and move buttons. Warm paper canvas, ink type, terracotta primary.",
    addons: [
      {
        id: "wip-limits",
        label: "WIP limits",
        description: "Cap cards per column with a soft warning.",
        prompt: "Add WIP limits per column with a visible count and soft warning when exceeded.",
      },
      {
        id: "labels",
        label: "Labels & colors",
        description: "Color chips on cards for category or urgency.",
        prompt: "Add colored label chips on cards that can be toggled when creating or editing a card.",
      },
      {
        id: "due-dates",
        label: "Due dates",
        description: "Optional due date on each card.",
        prompt: "Add optional due dates on cards with subtle overdue styling.",
      },
      {
        id: "swimlanes",
        label: "Swimlanes",
        description: "Horizontal lanes grouped by project or owner.",
        prompt: "Add horizontal swimlanes so cards can belong to a lane as well as a column.",
      },
      {
        id: "archive",
        label: "Archive filter",
        description: "Hide done items or show an archive column.",
        prompt: "Add an archive/done filter to hide completed cards or move them to an Archive column.",
      },
      {
        id: "search",
        label: "Card search",
        description: "Filter cards by title across columns.",
        prompt: "Add a search field that filters cards by title across all columns.",
      },
    ],
  },
  {
    id: "chat",
    label: "Chat",
    description:
      "A calm assistant chat with conversation list, message thread, and a bottom composer.",
    prompt:
      "A calm AI chat. Conversation list on the left, message thread in the center, composer at the bottom. Assistant bubbles on paper, user bubbles in terracotta. No streaming chrome.",
    addons: [
      {
        id: "conv-list",
        label: "Conversation list",
        description: "Sidebar of past chats with titles.",
        prompt: "Include a conversation list sidebar with titled threads and new-chat action.",
      },
      {
        id: "msg-search",
        label: "Message search",
        description: "Find text inside the current thread.",
        prompt: "Add message search within the active conversation thread.",
      },
      {
        id: "markdown",
        label: "Markdown",
        description: "Render basic markdown in assistant replies.",
        prompt: "Render basic markdown (bold, lists, code spans) in assistant messages.",
      },
      {
        id: "pinned",
        label: "Pinned chats",
        description: "Pin important threads to the top.",
        prompt: "Allow pinning conversations to the top of the list.",
      },
      {
        id: "system-prompt",
        label: "System prompt",
        description: "Editable system instructions field.",
        prompt: "Add an editable system-prompt field stored per conversation.",
      },
      {
        id: "typing",
        label: "Typing indicator",
        description: "Subtle dots while the assistant is thinking.",
        prompt: "Show a subtle typing indicator while waiting for assistant replies.",
      },
    ],
  },
  {
    id: "habits",
    label: "Habits",
    description:
      "A weekly habits grid with toggles, streaks, and quiet editorial styling.",
    prompt:
      "Habits dashboard with a 7-day grid. Habits: water, movement, reading, sleep. Toggle cells, streak count, and a weekly progress bar. Editorial, not gamified.",
    addons: [
      {
        id: "heatmap",
        label: "Monthly heatmap",
        description: "Calendar heatmap of completion density.",
        prompt: "Add a monthly heatmap view showing habit completion density.",
      },
      {
        id: "skip-day",
        label: "Skip day",
        description: "Mark a day as intentionally skipped.",
        prompt: "Allow marking a day as skipped without breaking streak logic visibly.",
      },
      {
        id: "notes",
        label: "Habit notes",
        description: "Short note attached to a day cell.",
        prompt: "Add optional short notes on individual habit-day cells.",
      },
      {
        id: "categories",
        label: "Categories",
        description: "Group habits by morning, work, evening.",
        prompt: "Group habits into categories (e.g. morning, work, evening) with section headers.",
      },
      {
        id: "weekly-goal",
        label: "Weekly goal",
        description: "Target completions per habit per week.",
        prompt: "Add a weekly goal target per habit with progress toward the goal.",
      },
      {
        id: "export-week",
        label: "Export week",
        description: "Copy or download the current week summary.",
        prompt: "Add an export-week action that copies a text summary of the current week.",
      },
    ],
  },
  {
    id: "calendar",
    label: "Calendar",
    description:
      "Month view with quiet typography, today highlight, and a side agenda.",
    prompt:
      "Month calendar with click-to-add events and a side list of today's notes. Quiet typography, terracotta for today, paper background.",
    addons: [
      {
        id: "week-view",
        label: "Week view",
        description: "Switch between month and week layouts.",
        prompt: "Add a week view toggle alongside the month grid.",
      },
      {
        id: "recurring",
        label: "Recurring events",
        description: "Repeat daily, weekly, or monthly.",
        prompt: "Support recurring events (daily, weekly, monthly) with simple repeat rules.",
      },
      {
        id: "color-tags",
        label: "Color tags",
        description: "Terracotta-tinted tags on events.",
        prompt: "Add color tags on events using the warm terracotta palette variants.",
      },
      {
        id: "all-day",
        label: "All-day events",
        description: "Banner row for full-day items.",
        prompt: "Support all-day events shown in a dedicated banner row.",
      },
      {
        id: "drag-days",
        label: "Drag between days",
        description: "Move events across days in the grid.",
        prompt: "Allow dragging events between days in the calendar grid.",
      },
      {
        id: "side-agenda",
        label: "Side agenda",
        description: "Upcoming list beside the grid.",
        prompt: "Expand the side panel into an agenda list of upcoming events.",
      },
    ],
  },
  {
    id: "notes",
    label: "Notes",
    description:
      "Searchable note list with editor pane and local persistence.",
    prompt:
      "Notes tool: searchable list on the left, editor on the right, new-note action. Persist notes in the page. Warm paper, ink text, terracotta accent.",
    addons: [
      {
        id: "folders",
        label: "Folders",
        description: "Nest notes under named folders.",
        prompt: "Add folders to organize notes in the list sidebar.",
      },
      {
        id: "tags",
        label: "Tags",
        description: "Multi-tag filter chips on notes.",
        prompt: "Add tags on notes with filter chips in the sidebar.",
      },
      {
        id: "markdown-preview",
        label: "Markdown preview",
        description: "Split or toggle rendered markdown.",
        prompt: "Add a markdown preview toggle or split view in the editor.",
      },
      {
        id: "pin",
        label: "Pin note",
        description: "Keep important notes at the top.",
        prompt: "Allow pinning notes to the top of the list.",
      },
      {
        id: "trash",
        label: "Trash",
        description: "Soft-delete with restore.",
        prompt: "Add a trash folder for soft-deleted notes with restore.",
      },
      {
        id: "word-count",
        label: "Word count",
        description: "Live count under the editor.",
        prompt: "Show a live word and character count under the editor.",
      },
    ],
  },
];

export function getStarterById(id: string): Starter | undefined {
  return STARTERS.find((s) => s.id === id);
}

export function composeStarterPrompt(starter: Starter, selectedAddonIds: ReadonlySet<string>): string {
  const addons = starter.addons.filter((a) => selectedAddonIds.has(a.id));
  if (addons.length === 0) return starter.prompt;
  const extras = addons.map((a) => a.prompt).join(" ");
  return `${starter.prompt} ${extras}`;
}
