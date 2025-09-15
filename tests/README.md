# Playwright E2E Tests

This directory contains end-to-end tests for the Task Management Application using Playwright.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Install Playwright browsers:
   ```bash
   npx playwright install
   ```

## Running Tests

### Prerequisites

The development environment must be running before executing tests:

1. Start the development environment:
   ```bash
   ./dev-start.sh
   ```

2. Wait for the application to be fully loaded on `http://localhost:3000`

### Run Tests

```bash
# Run all tests
npm test

# Run tests in UI mode (interactive)
npm run test:ui

# Run tests in debug mode
npm run test:debug

# Run specific test file
npx playwright test app.spec.ts

# Run tests in a specific browser
npx playwright test --project=chromium
```

## Test Coverage

The E2E test suite covers:

- **Application Loading**: Verifies the app loads correctly with all main elements
- **Task Creation**: Tests creating tasks with rich text descriptions using the WYSIWYG editor
- **Task Details**: Verifies task detail modals display formatted content correctly
- **Task Editing**: Tests updating existing tasks and quadrant movement
- **Search & Filtering**: Tests task search functionality
- **Task Deletion**: Tests task deletion with confirmation
- **Drag & Drop**: Tests moving tasks between Eisenhower Matrix quadrants
- **Keyboard Shortcuts**: Tests keyboard navigation and shortcuts
- **Form Validation**: Tests input validation and error handling
- **Persistence**: Verifies tasks persist across page reloads

## Test Structure

- `app.spec.ts`: Main test suite covering the entire application workflow

## Configuration

- `playwright.config.ts`: Playwright configuration with browser settings and test options
- Tests run against `http://localhost:3000` (development server)
- Supports Chromium, Firefox, and WebKit browsers
- Includes mobile viewport testing

## CI/CD

Tests are configured to work in CI environments with:
- Automatic browser installation
- Parallel test execution
- Screenshot capture on failures
- HTML test reports

## Troubleshooting

### Tests Fail Due to Missing Dev Server

Ensure the development environment is running:
```bash
./dev-start.sh
```

Wait for the message indicating the server is ready on port 3000.

### Browser Issues

If browsers fail to launch, reinstall them:
```bash
npx playwright install --force
```

### Flaky Tests

If tests are flaky, especially drag-and-drop tests, consider:
- Adding longer timeouts for animations
- Using more specific selectors
- Waiting for elements to be fully loaded
