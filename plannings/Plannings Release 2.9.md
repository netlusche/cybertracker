# Planning: Release 2.9 (Kanban Update)

## Core Feature: The Cyber-Kanban Board

The goal for Release 2.9 is to introduce an alternative view to the standard dashboard list: a **Kanban Board** that maps directly to the operative's task statuses.

In Release 2.8, the ability to define custom "Task Statuses" was introduced (e.g., "In Progress", "Under Review", "Blocked"). The Kanban Board will leverage this structure.

### 1. Board Structure & Columns
*   **Dynamic Columns:** The board will dynamically generate columns based on the user's defined statuses.
    *   **Column 1 (Fixed):** `OPEN` (Tasks with `completed = 0` and `status_id = NULL`).
    *   **Column 2...N (Dynamic):** Custom statuses pulled from `user_task_statuses` (e.g., `IN PROGRESS`, `QA`).
    *   **"Completed" Dropzone:** To save horizontal space and maintain performance, "Completed" tasks will NOT be a full column. Instead, a dedicated dropzone (e.g., at the bottom of the screen or a fixed area) will serve as the target for dragging tasks to completion.
*   **Visual Design:** Deeply integrated into the current theme system (`THEME_GUIDELINES.md`). Columns will represent "Data Streams" or "Execution Queues". Cards will be compact versions of the existing `TaskCard.jsx`. The board container will support horizontal scrolling (`overflow-x-auto`) to accommodate extensive custom status lists without crushing card widths.

### 2. Interactions (Drag & Drop)
*   **@dnd-kit Integration:** We already use `@dnd-kit/core` and `@dnd-kit/sortable` (v10) for sub-routine sorting (US-2.4.1). We will expand this implementation to support multi-container drag-and-drop.
*   **Moving Cards:** 
    *   Dragging a card from `OPEN` to `IN PROGRESS` makes an API call to assign that `status_id`.
    *   Dragging a card into the final `COMPLETED` dropzone triggers the existing completion logic (XP gain, Confetti, `completed = 1`), visually fading the card out of the active board.

### 3. UI/UX Integration (Focus Mode Pattern)
*   **Kanban Toggle Button:** Just like the `FOCUS` button introduced in Release 2.8, we will add a `KANBAN` button to the main dashboard header (likely next to Focus or Calendar).
*   **Overlay Panel & Navigation Hiding:** When toggled on, the Kanban Board mounts as a full-screen or prominent overlay. Crucially, all other navigation buttons (Profile, Calendar, Focus) will visually disappear.
*   **Exiting the View:** The top navigation will contain only one button: `EXIT KANBAN` (styled similarly to red `EXIT FOCUS`). Clicking this returns the user to the standard List View and restores the main navigation.
*   **State Management:** The active state (`isKanbanMode`) will be managed locally in the React state/Context, meaning we don't need to save a permanent preference in the database. It acts as a tactical overlay for when the operative needs a structured visual overview.

### 4. Technical Re-use
*   **Backend:** Minimal changes needed. The logic relies on existing endpoints.
*   **Frontend:** The main work is creating `KanbanBoard.jsx`, `KanbanColumn.jsx`, and a compact `KanbanCard.jsx`, wrapping them in `@dnd-kit` contexts.
