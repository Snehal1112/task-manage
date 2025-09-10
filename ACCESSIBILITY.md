# Accessibility Guide

## Overview
This application follows WCAG 2.1 AA standards for accessibility compliance.

## Keyboard Navigation
- **Tab**: Navigate through interactive elements
- **Enter/Space**: Activate buttons and links
- **Escape**: Close modals and dialogs
- **Ctrl/Cmd + N**: Add new task
- **Ctrl/Cmd + K**: Focus search input
- **Ctrl/Cmd + /**: Show keyboard shortcuts help

## Screen Reader Support
- All interactive elements have appropriate ARIA labels
- Form fields include descriptive labels
- Status updates use `aria-live` regions
- Icons are marked with `aria-hidden="true"` when decorative
- Modal dialogs are properly announced with `role="dialog"` and `aria-modal`

## Focus Management
- Focus is trapped within modal dialogs
- Skip link available to jump to main content
- Focus indicators are visible with `focus-visible` rings
- Previous focus is restored when modals close

## Color and Contrast
- All text meets WCAG contrast requirements
- Color is not used as the only means of conveying information
- Design tokens support both light and dark themes

## Component Accessibility Features

### TaskCard
- Expandable with keyboard navigation
- Action buttons have descriptive `aria-label` attributes
- Status indicators are announced to screen readers

### TaskForm
- Form validation errors are announced
- Character counter for description field
- Required fields are clearly marked

### Dialog/Modal
- Focus trapping prevents navigation outside modal
- Escape key closes modal
- Proper ARIA attributes for screen reader announcement

## Testing
- Manual keyboard navigation testing completed
- Screen reader testing with NVDA and JAWS recommended
- Color contrast verified with automated tools

## Known Limitations
- Some icons may need alt text in certain contexts
- Complex drag-and-drop interactions may need additional screen reader support
