# Development Guide - Task Management Application

This guide covers the development environment setup and workflows for the Task Management Application with Eisenhower Matrix functionality.

## 🚀 Quick Start

### Prerequisites

1. **Node.js** (v18+ recommended)
2. **Yarn** package manager
3. **Go** (v1.19+ recommended)  
4. **Caddy** web server (for full development environment)

### Development Environment Options

#### Option 1: Full Development Environment (Recommended)
Complete setup with Caddy proxy, backend API, and frontend - matches production closely.

```bash
# Start all services (Caddy + Backend + Frontend)
yarn dev:full
# or
./dev-start.sh

# Stop all services
yarn dev:stop
# or
./dev-stop.sh
```

**Access Points:**
- **Primary Development**: http://localhost:3000 (Caddy proxy)
- **Production-like**: http://localhost:8090 (Caddy proxy)
- **Direct Vite**: http://localhost:5173 (direct frontend)
- **Direct API**: http://localhost:8080/api (direct backend)

#### Option 2: Frontend Only
Traditional Vite development server only.

```bash
# Frontend only (requires backend running separately)
yarn dev

# In separate terminal, start backend:
cd task-api && go run .
```

## 🏗️ Architecture Overview

### Development Stack
- **Frontend**: React 18 + TypeScript + Vite (Hot reload)
- **Backend**: Go + Gin framework (Debug mode)
- **Proxy**: Caddy (Development configuration)
- **State**: Redux Toolkit + Async thunks
- **Styling**: Tailwind CSS + shadcn/ui
- **Drag & Drop**: @dnd-kit

### Service Architecture (Full Dev Environment)
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Caddy Proxy   │    │   Vite Dev      │    │   Go Backend    │
│   :3000, :8090  │◄──►│   :5173         │    │   :8080         │  
└─────────────────┘    └─────────────────┘    └─────────────────┘
        │                                              │
        └──────────────── /api/* ─────────────────────┘
```

## 📁 Project Structure

```
/
├── src/                    # React frontend source
│   ├── components/         # React components
│   ├── features/tasks/     # Redux task management
│   ├── services/          # API client
│   └── ...
├── task-api/              # Go backend source
│   ├── handlers/          # API handlers
│   ├── models/            # Data models
│   ├── storage/           # Encrypted storage
│   └── ...
├── dev-config/            # Development configuration
│   ├── Caddyfile.dev     # Caddy development config
│   └── .env.development  # Backend dev environment
├── dev-start.sh          # Full dev environment startup
├── dev-stop.sh           # Development shutdown
├── deploy.sh             # Production deployment script
└── ...
```

## ⚙️ Configuration

### Development Environment Variables

#### Frontend (.env)
```bash
# Development API Configuration
# VITE_API_BASE_URL=http://localhost:8080/api
# Commented out to use relative URLs for production builds
```

#### Backend (dev-config/.env.development)
```bash
TASK_ENCRYPTION_KEY=development-32-character-test-key
PORT=8080
GIN_MODE=debug
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,http://localhost:8090
LOG_LEVEL=debug
```

### Caddy Development Configuration

The development Caddy setup provides:
- **Automatic proxy** to Vite dev server
- **API reverse proxy** to Go backend  
- **CORS handling** for all origins
- **Development-friendly CSP** policies
- **Hot reload support** via WebSocket proxying

## 🔧 Development Workflows

### Daily Development

1. **Start full environment:**
   ```bash
   yarn dev:full
   ```

2. **Access application:** http://localhost:3000

3. **Make changes** - all services support hot reload:
   - Frontend: Vite hot module replacement
   - Backend: Manual restart (or use `air` for auto-reload)

4. **Stop when done:**
   ```bash
   yarn dev:stop
   ```

### Backend Development

#### Go Backend Features in Development
- **Debug mode** with verbose logging
- **CORS enabled** for all localhost origins  
- **Demo data endpoints** available
- **Debug endpoints** enabled
- **Separate dev data directory** (`dev-data/`)

#### Running Backend Separately
```bash
cd task-api
# Load development environment
export $(cat ../dev-config/.env.development | xargs)
go run .

# Or with hot reload (install air first: go install github.com/cosmtrek/air@latest)
air
```

### Frontend Development

#### React Development Features
- **Hot module replacement** via Vite
- **TypeScript checking** on save
- **ESLint integration** with auto-fix
- **Tailwind CSS** with IntelliSense

#### Frontend-only Development
```bash
# Start just frontend (backend must run separately)
yarn dev
```

### Testing Changes

#### API Testing
```bash
# Health check
curl http://localhost:3000/api/health

# Test CORS
curl -H "Origin: http://localhost:3000" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS http://localhost:3000/api/tasks
```

#### Frontend Testing
- **Manual testing**: http://localhost:3000
- **Production preview**: `yarn preview` (after `yarn build`)

## 🔍 Debugging

### Logs in Development

**Full development environment logs:**
```bash
# Backend logs
tail -f task-api/dev-backend.log

# Frontend logs  
tail -f dev-frontend.log

# Caddy logs
tail -f dev-caddy.log
```

**Direct service logs:**
```bash
# Backend (when run directly)
cd task-api && go run .

# Frontend (when run directly)
yarn dev
```

### Common Issues

#### Port Conflicts
```bash
# Check what's using ports
lsof -i :3000
lsof -i :5173
lsof -i :8080

# Kill conflicting processes
yarn dev:stop
```

#### CORS Issues in Development
The development Caddy configuration allows all origins. If you see CORS errors:

1. Check if Caddy is running: http://localhost:3000
2. Verify backend is accessible: http://localhost:8080/api/health
3. Use the Caddy-proxied URL: http://localhost:3000/api instead of direct API

#### Backend Connection Issues
```bash
# Verify backend is running
curl http://localhost:8080/api/health

# Check backend logs
tail -f task-api/dev-backend.log

# Restart backend
cd task-api && go run .
```

## 📝 Development Scripts Reference

| Command | Description |
|---------|-------------|
| `yarn dev:full` | Start complete development environment |
| `yarn dev:stop` | Stop all development services |
| `yarn dev` | Start frontend only (Vite dev server) |
| `yarn build` | Build for production |
| `yarn deploy` | Create deployment package |
| `yarn type-check` | TypeScript type checking |
| `yarn lint` | ESLint code checking |
| `yarn lint:fix` | Auto-fix ESLint issues |
| `yarn clean` | Clean build artifacts |

## 🎯 Best Practices

### Development Workflow
1. **Always use `yarn dev:full`** for consistent environment
2. **Access via Caddy proxy** (http://localhost:3000) for CORS handling
3. **Check logs regularly** for errors and warnings
4. **Type-check before committing**: `yarn type-check`
5. **Lint code regularly**: `yarn lint:fix`

### Code Quality
1. **Follow TypeScript strict mode** requirements
2. **Use conventional commits** for git messages
3. **Test manually** before pushing changes
4. **Run `yarn build`** to verify production builds work

### Performance
1. **Monitor hot reload performance** - restart if slow
2. **Use Chrome DevTools** for frontend debugging
3. **Check backend logs** for API performance
4. **Test with production builds** periodically

---

**Need Help?** 
- Check logs in the respective service directories
- Verify all prerequisites are installed
- Use `yarn dev:stop` to reset the environment
- Restart individual services if needed