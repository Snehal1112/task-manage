# Demo Data Guide

## Overview

The application automatically loads demo data when no tasks exist in localStorage. This provides new users with a comprehensive example of how the Eisenhower Matrix works.

## Demo Data Structure

The demo data includes **11 realistic tasks** distributed across all sections:

### Task Panel (UNASSIGNED) - 3 tasks
- **Review quarterly budget report** - Important but not yet categorized
- **Fix critical login bug** - Urgent and important, ready to move to DO quadrant
- **Plan team building event** - Low priority, could be eliminated

### DO Quadrant (Urgent + Important) - 2 tasks  
- **Handle client emergency** - Active crisis requiring immediate attention
- **Submit tax documents** ✅ - Completed urgent task (shows completion state)

### SCHEDULE Quadrant (Not Urgent + Important) - 2 tasks
- **Complete project planning** - Important strategic work for next quarter
- **Update team documentation** - Important but not time-sensitive

### DELEGATE Quadrant (Urgent + Not Important) - 2 tasks
- **Schedule vendor meetings** - Time-sensitive but can be delegated  
- **Order office supplies** - Urgent operational task for delegation

### DELETE Quadrant (Not Urgent + Not Important) - 2 tasks
- **Watch industry webinar** - Optional, low-value activity
- **Organize desk drawer** ✅ - Completed low-priority task

## Features Demonstrated

### 1. **Realistic Due Dates**
- Today's tasks for urgency demonstration
- Tomorrow and next week for planning examples  
- Next month for low-priority items

### 2. **Task States**
- Mix of completed and incomplete tasks
- Various priority combinations
- Detailed descriptions showing context

### 3. **Drag & Drop Workflow**
- Tasks start in Task Panel (UNASSIGNED)
- Can be dragged to appropriate quadrants
- Priority flags update automatically based on quadrant

### 4. **Search & Filter Testing**
- Tasks contain searchable keywords
- Mix of completed/incomplete for filter testing
- Various priority combinations for filter demonstration

## Demo Data Behavior

### **Automatic Loading**
- Loads automatically for new users (empty localStorage)
- Loads as fallback if localStorage is corrupted
- Maintains user data if tasks already exist

### **User Control**  
- Users can delete demo tasks like any other task
- Once deleted, tasks don't automatically regenerate
- Users can add their own tasks normally

### **Development Reset**
- Demo data can be reloaded via `loadDemoTasks` Redux action
- Useful for testing and development
- Overwrites existing tasks (use carefully)

## Usage for Testing

The demo data is perfect for:
- **UI Testing**: Seeing all quadrants populated
- **Drag & Drop**: Moving tasks between quadrants  
- **Search & Filter**: Testing filter functionality
- **Performance**: Testing with realistic data volume
- **UX Demo**: Showing stakeholders the complete workflow

## Demo Script

For presentations or demos, follow this flow:

1. **Start** - Show populated matrix with realistic tasks
2. **Task Panel** - Explain how new tasks start here
3. **Drag & Drop** - Move "Fix critical login bug" to DO quadrant  
4. **Search** - Search for "meeting" or "budget"
5. **Filters** - Toggle completed tasks, urgent tasks
6. **Add Task** - Create a new task to show the workflow
7. **Edit** - Double-click any task to show edit functionality

This provides a comprehensive demonstration of all application features with realistic, professional examples.