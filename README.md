# Task Management - Eisenhower Matrix

A modern React-based task management application implementing the **Eisenhower Matrix** method for task prioritization. Features an intuitive drag-and-drop interface with enhanced visual feedback and smooth animations.

![Task Management Screenshot](https://via.placeholder.com/800x400/f3f4f6/374151?text=Task+Management+-+Eisenhower+Matrix)

## ✨ Features

- **📝 Task Management**: Create, edit, and delete tasks with rich details
- **🎯 Eisenhower Matrix**: Categorize tasks by urgency and importance
- **🖱️ Drag & Drop**: Smooth drag-and-drop task organization with visual feedback
- **📱 Responsive Design**: Works seamlessly on desktop and mobile devices
- **💾 Local Storage**: Automatic persistence of your tasks
- **🎨 Modern UI**: Clean, accessible interface built with Tailwind CSS
- **⚡ Enhanced UX**: Custom scrollbars, smooth animations, and contextual feedback

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ 
- Yarn or npm

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd task-manage
   ```

2. Install dependencies:
   ```bash
   yarn install
   # or
   npm install
   ```

3. Start the development server:
   ```bash
   yarn dev
   # or
   npm run dev
   ```

4. Open [http://localhost:5173](http://localhost:5173) in your browser

## 🛠️ Development Commands

```bash
# Start development server
yarn dev

# Build for production
yarn build

# Preview production build
yarn preview

# Type checking
yarn type-check

# Lint code
yarn lint

# Run all checks (build + lint)
yarn build && yarn lint
```

## 🏗️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **State Management**: Redux Toolkit with localStorage persistence
- **Drag & Drop**: @dnd-kit (modern, accessible)
- **Styling**: Tailwind CSS + shadcn/ui components
- **Build Tool**: Vite
- **Code Quality**: ESLint + TypeScript strict mode

## 📱 How to Use

1. **Create Tasks**: Click "Add Task" in the Task Panel to create new tasks
2. **Edit Tasks**: Click the edit icon on any task card to modify details
3. **Prioritize**: Drag tasks from the Task Panel into the appropriate quadrant:
   - **DO** (Urgent + Important): Critical tasks requiring immediate attention
   - **SCHEDULE** (Not Urgent + Important): Important tasks to plan for
   - **DELEGATE** (Urgent + Not Important): Tasks to delegate to others
   - **DELETE** (Not Urgent + Not Important): Tasks to eliminate
4. **Organize**: Tasks can be moved between quadrants anytime via drag and drop

## 🎯 Eisenhower Matrix

The Eisenhower Matrix helps you prioritize tasks by categorizing them based on urgency and importance:

| | **Urgent** | **Not Urgent** |
|---|---|---|
| **Important** | **DO** - Crisis, emergencies | **SCHEDULE** - Planning, development |
| **Not Important** | **DELEGATE** - Interruptions, some emails | **DELETE** - Time wasters, distractions |

## 🔧 Project Structure

```
src/
├── app/                    # Redux store configuration
├── features/tasks/         # Task-related logic (slice, selectors, types)
├── components/            # React components
│   ├── ui/               # shadcn/ui base components
│   ├── TaskCard.tsx      # Individual task display
│   ├── TaskForm.tsx      # Task creation/editing modal
│   ├── TaskList.tsx      # Task panel component
│   ├── Quadrant.tsx      # Matrix quadrant component
│   └── ...
├── contexts/              # React contexts
├── hooks/                # Custom hooks
├── utils/                # Utility functions
└── lib/                  # Library configurations
```

## 🎨 Design System

- **Colors**: Consistent color palette with semantic meanings
- **Typography**: Clear hierarchy with proper contrast ratios
- **Spacing**: 8px grid system for consistent layouts
- **Components**: Reusable shadcn/ui components with custom styling
- **Animations**: Smooth transitions with proper easing functions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 Development Guidelines

- Follow TypeScript strict mode
- Use ESLint configuration for code consistency
- Maintain 100% type safety
- Write descriptive commit messages
- Test drag-and-drop functionality across devices

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Eisenhower Matrix methodology by President Dwight D. Eisenhower
- shadcn/ui for beautiful, accessible components
- @dnd-kit for modern drag-and-drop functionality
- Tailwind CSS for utility-first styling

---

**Built with ❤️ using modern React and TypeScript**