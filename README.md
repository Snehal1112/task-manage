# Task Management - Eisenhower Matrix

A modern React-based task management application implementing the **Eisenhower Matrix** method for task prioritization. Features an intuitive drag-and-drop interface with enhanced visual feedback and smooth animations.

## 🚀 Quick Development Start

```bash
# Complete development environment (recommended)
yarn install && yarn dev:full
# → http://localhost:3000

# Simple frontend only
yarn install && yarn dev  
# → http://localhost:5173
```

![Task Management Screenshot](https://via.placeholder.com/800x400/f3f4f6/374151?text=Task+Management+-+Eisenhower+Matrix)

## ✨ Features

- **📝 Task Management**: Create, edit, and delete tasks with rich details
- **🎯 Eisenhower Matrix**: Categorize tasks by urgency and importance
- **🖱️ Drag & Drop**: Smooth drag-and-drop task organization with visual feedback
- **📱 Responsive Design**: Works seamlessly on desktop and mobile devices
- **💾 Local Storage**: Automatic persistence of your tasks
- **🎨 Modern UI**: Clean, accessible interface built with Tailwind CSS
- **⚡ Enhanced UX**: Custom scrollbars, smooth animations, and contextual feedback

## 🚀 Detailed Setup Instructions

### Development Environment Options

#### Option 1: Complete Development Environment (Recommended)
Full-stack development with backend API, Caddy proxy, and frontend - matches production setup.

**Prerequisites:**
- Node.js 18+
- Yarn package manager
- Go 1.19+
- [Caddy web server](https://caddyserver.com/docs/install)

**Setup:**
1. Clone and install:
   ```bash
   git clone <repository-url>
   cd task-manage
   yarn install
   ```

2. Start complete development environment:
   ```bash
   yarn dev:full
   # or
   ./dev-start.sh
   ```

3. Access the application:
   - **Primary Development**: http://localhost:3000 (recommended)
   - **Production-like**: http://localhost:8090
   - **Direct Frontend**: http://localhost:5173
   - **Direct API**: http://localhost:8080/api

4. Stop when done:
   ```bash
   yarn dev:stop
   # or
   ./dev-stop.sh
   ```

#### Option 2: Frontend Only (Simple Setup)
Traditional React development without backend features.

**Prerequisites:**
- Node.js 16+
- Yarn or npm

**Setup:**
1. Clone and install:
   ```bash
   git clone <repository-url>
   cd task-manage
   yarn install
   ```

2. Start frontend only:
   ```bash
   yarn dev
   ```

3. Open [http://localhost:5173](http://localhost:5173)

### Feature Comparison

| Feature | Complete Environment | Frontend Only |
|---------|---------------------|---------------|
| Task Persistence | ✅ Encrypted file storage | ❌ Browser only (localStorage) |
| Backend API | ✅ Go REST API | ❌ Mock/local data |
| Production Simulation | ✅ Matches deployment | ❌ Development only |
| Caddy Proxy | ✅ Unified access | ❌ Direct Vite |
| Hot Reload | ✅ Frontend + Backend | ✅ Frontend only |
| CORS Handling | ✅ Automatic | ❌ Browser restrictions |
| Setup Complexity | Medium (4 deps) | Low (2 deps) |

> **💡 Recommendation**: Use Option 1 for the complete experience with task persistence, encryption, and production-like environment. See [DEVELOPMENT.md](./DEVELOPMENT.md) for detailed development guide.

## 🛠️ Development Commands

### Complete Development Environment
```bash
# Start full development stack (Caddy + Backend + Frontend)
yarn dev:full
./dev-start.sh

# Stop all development services
yarn dev:stop
./dev-stop.sh

# Create production deployment package
yarn deploy
./deploy.sh
```

### Frontend Development
```bash
# Start frontend only (Vite dev server)
yarn dev

# Build for production
yarn build

# Preview production build
yarn preview
```

### Code Quality
```bash
# Type checking
yarn type-check

# Lint code
yarn lint

# Auto-fix lint issues
yarn lint:fix

# Clean build artifacts
yarn clean
```

### Backend Development
```bash
# Start backend only (from task-api directory)
cd task-api && go run .

# With hot reload (requires air: go install github.com/cosmtrek/air@latest)
cd task-api && air
```

## 🏗️ Tech Stack

### Frontend
- **React 18** + **TypeScript** - Core framework with strict mode
- **Redux Toolkit** - State management with async thunks
- **@dnd-kit** - Modern, accessible drag-and-drop
- **Tailwind CSS** + **shadcn/ui** - Styling and components
- **Vite** - Build tool and development server

### Backend (Full Development Environment)
- **Go** + **Gin** - REST API framework
- **AES-256-GCM** - Encrypted file storage
- **CORS** - Cross-origin resource sharing
- **File-based** - No database required

### Development Infrastructure
- **Caddy** - Web server and reverse proxy
- **Hot Reload** - Frontend and backend development
- **ESLint** + **TypeScript** - Code quality and type checking

## ⚙️ Configuration

### Development Environment
The complete development environment requires minimal configuration:

1. **Caddy Installation**: Follow [Caddy installation guide](https://caddyserver.com/docs/install)
2. **Go Installation**: Download from [golang.org](https://golang.org/downloads)
3. **No additional setup required** - all configuration is included

### Environment Details
- **Frontend**: Runs on Vite dev server (http://localhost:5173)
- **Backend API**: Go server with debug mode (http://localhost:8080)
- **Caddy Proxy**: Unified access on ports 3000 and 8090
- **Data Storage**: Encrypted files in `task-api/dev-data/`
- **Logs**: Development logs in `*dev*.log` files

### Production Deployment
For production deployment:
```bash
yarn deploy  # Creates deployment-package/
```
See the generated `deployment-package/README.md` for client deployment instructions.

## 🔧 Troubleshooting

### Development Environment Issues

**Port conflicts:**
```bash
# Check what's using ports
lsof -i :3000 :5173 :8080 :8090

# Stop all development services
yarn dev:stop
```

**Services not starting:**
```bash
# Check logs
tail -f dev-*.log task-api/dev-backend.log

# Restart environment
yarn dev:stop && yarn dev:full
```

**Caddy not installed:**
```bash
# Install Caddy (macOS)
brew install caddy

# Install Caddy (Ubuntu/Debian)
sudo apt install caddy
```

**CORS issues in development:**
- Use the Caddy-proxied URLs (http://localhost:3000)
- Development Caddy config allows all origins

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