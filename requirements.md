Create a **React application** for **task prioritization** using the **Eisenhower Matrix** method (see: [Eisenhower Matrix – Asana](https://asana.com/resources/eisenhower-matrix)).

---

### Tech Stack

- **React.js**
- **shadcn/ui** (modern UI components)
- **Redux Toolkit** (state management)
- **React Router** (navigation if needed)
- **react-beautiful-dnd** (drag-and-drop support)

---

### Features & Requirements

#### 1. Two-Column Layout

- **Left Column (Task Panel):**

  - Display tasks in **card format**.
  - Users can **create, update, and delete** tasks.
  - Each task includes: `id`, `title`, `description?`, `dueDate?`, `urgent`, `important`, `quadrant`.

- **Right Column (Eisenhower Matrix – 2×2 grid):**

  - Quadrants labeled:

    - **Do (Urgent + Important)**
    - **Schedule (Not Urgent + Important)**
    - **Delegate (Urgent + Not Important)**
    - **Delete (Not Urgent + Not Important)**

  - Tasks can be **dragged into quadrants** from the Task Panel.
  - Moving a task into a quadrant updates urgency/importance flags automatically.

---

#### 2. Task Categorization Rules

- Quadrant → Action:

  - **Do** → urgent + important
  - **Schedule** → not urgent + important
  - **Delegate** → urgent + not important
  - **Delete** → not urgent + not important

---

#### 3. Persistence

- Persist tasks and quadrant state using **localStorage or IndexedDB** (`utils/storage.ts`).

---

#### 4. UI/UX

- Use **shadcn/ui** for forms, cards, modals, and buttons.
- Smooth drag-and-drop with `react-beautiful-dnd`.
- Responsive layout (desktop + mobile).
- Optional tooltip/help explaining Eisenhower method.

---

### Suggested Project Structure

```
src/
├── app/
│   ├── store.ts
│   └── hooks.ts
├── features/tasks/
│   ├── tasksSlice.ts
│   ├── tasksSelectors.ts
│   ├── TaskTypes.ts
│   └── __tests__/
├── components/
│   ├── TaskCard.tsx
│   ├── TaskForm.tsx
│   ├── TaskList.tsx
│   ├── EisenhowerMatrix.tsx
│   ├── Quadrant.tsx
│   └── DragDropWrapper.tsx
├── pages/Dashboard.tsx
├── utils/
│   ├── storage.ts
│   └── constants.ts
├── routes/AppRouter.tsx
├── main.tsx
└── index.html
```

---

### Wireframe Mockups

#### Dashboard Layout

```
 ---------------------------------------------------------
|  TASK PANEL (LEFT)      |  EISENHOWER MATRIX (RIGHT)   |
|                         |   ------------------------   |
|  + Add Task Button      |  |   DO        |  SCHEDULE | |
|  [ Task Card 1 ]        |  |-------------|-----------| |
|  [ Task Card 2 ]        |  | DELEGATE    |  DELETE   | |
 ---------------------------------------------------------
```

#### Task Card

```
 --------------------------
|  Task Title              |
|  Due: 2025-09-05         |
|  [Edit]  [Delete]        |
 --------------------------
```

---

### Redux Slice (`tasksSlice.ts`)

Reducers:

- `addTask(Task)`
- `updateTask(Task)`
- `deleteTask(id)`
- `moveTaskToQuadrant({ id, quadrant })` → auto-updates urgency/importance

---

### Drag-and-Drop Workflow (`react-beautiful-dnd`)

1. **Wrap** main layout with `<DragDropContext onDragEnd={handleDragEnd}>`.
2. **Task Panel** is a `Droppable` list for unassigned tasks.
3. **Each Quadrant** is a `Droppable` zone.
4. **Task Cards** are `Draggable` items.
5. On `onDragEnd(result)` in `handleDragEnd`:

   - If `destination.droppableId` is a quadrant → dispatch `moveTaskToQuadrant({ id, quadrant })`.
   - If dropped in Task Panel → keep `quadrant: "UNASSIGNED"`.

**Example `onDragEnd`:**

```ts
const handleDragEnd = (result: DropResult) => {
  const { source, destination, draggableId } = result;
  if (!destination) return;

  const taskId = draggableId;

  if (destination.droppableId === "TASK_PANEL") {
    dispatch(moveTaskToQuadrant({ id: taskId, quadrant: "UNASSIGNED" }));
  } else {
    dispatch(
      moveTaskToQuadrant({
        id: taskId,
        quadrant: destination.droppableId as Task["quadrant"],
      })
    );
  }
};
```

---

### Goal

Build a **production-ready React app** that:

- Provides a **task panel + Eisenhower Matrix** in a 2-column layout
- Supports **drag-and-drop prioritization** with `react-beautiful-dnd`
- Uses **Redux Toolkit** for task state
- Persists tasks locally
- Has a polished, responsive **UI with shadcn/ui**
- Implements clean code structure with the suggested layout
