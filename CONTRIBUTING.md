# Contributing to Task Management App

Thank you for your interest in contributing to our Task Management App! This document provides guidelines and information for contributors.

## Development Setup

### Prerequisites
- Node.js (v18 or higher)
- Yarn package manager
- Git

### Getting Started
1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/task-mange.git`
3. Install dependencies: `yarn install`
4. Start development server: `yarn dev`

## Development Workflow

### Branch Naming
- `feature/description` - for new features
- `fix/description` - for bug fixes
- `docs/description` - for documentation updates
- `refactor/description` - for code refactoring

### Commit Messages
We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>: <description>

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Code Style
- Use TypeScript for all new code
- Follow the existing code style (enforced by ESLint and Prettier)
- Use meaningful variable and function names
- Add comments for complex logic
- Write tests for new features

### Testing
- Write unit tests for new components and utilities
- Ensure all tests pass before submitting a PR
- Run tests with: `yarn test`

### Pull Request Process
1. Create a feature branch from `main`
2. Make your changes
3. Add tests for new functionality
4. Ensure all tests pass
5. Update documentation if needed
6. Submit a pull request with a clear description

## Project Structure

```
src/
├── components/         # Reusable UI components
│   └── ui/            # Basic UI components
├── features/          # Feature-specific code
│   └── tasks/         # Task management feature
├── hooks/             # Custom React hooks
├── lib/               # Utility libraries
├── pages/             # Page components
├── utils/             # Utility functions
└── contexts/          # React contexts
```

## Available Scripts

- `yarn dev` - Start development server
- `yarn build` - Build for production
- `yarn preview` - Preview production build
- `yarn lint` - Run ESLint
- `yarn lint:fix` - Fix ESLint issues
- `yarn test` - Run tests
- `yarn type-check` - Run TypeScript type checking

## Getting Help

If you have questions or need help:
1. Check existing issues and documentation
2. Create a new issue with a clear description
3. Join our community discussions

## Code of Conduct

Please be respectful and inclusive in all interactions. We aim to create a welcoming environment for all contributors.

Thank you for contributing!
