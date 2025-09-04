package models

import (
	"encoding/json"
	"errors"
	"fmt"
	"strings"
	"time"
	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
)

// TaskQuadrant represents the Eisenhower Matrix quadrant
type TaskQuadrant string

const (
	QuadrantDo         TaskQuadrant = "DO"
	QuadrantSchedule   TaskQuadrant = "SCHEDULE"
	QuadrantDelegate   TaskQuadrant = "DELEGATE"
	QuadrantDelete     TaskQuadrant = "DELETE"
	QuadrantUnassigned TaskQuadrant = "UNASSIGNED"
)

// Task represents a task in the Eisenhower Matrix system
// Matches the TypeScript interface exactly
type Task struct {
	ID          string       `json:"id" validate:"required"`
	Title       string       `json:"title" validate:"required,max=100"`
	Description *string      `json:"description,omitempty" validate:"omitempty,max=500"`
	DueDate     *string      `json:"dueDate,omitempty" validate:"omitempty,datetime=2006-01-02T15:04:05.000Z"`
	Urgent      bool         `json:"urgent"`
	Important   bool         `json:"important"`
	Quadrant    TaskQuadrant `json:"quadrant" validate:"required,oneof=DO SCHEDULE DELEGATE DELETE UNASSIGNED"`
	Completed   bool         `json:"completed"`
	CompletedAt *string      `json:"completedAt,omitempty" validate:"omitempty,datetime=2006-01-02T15:04:05.000Z"`
	CreatedAt   string       `json:"createdAt" validate:"required,datetime=2006-01-02T15:04:05.000Z"`
	UpdatedAt   string       `json:"updatedAt" validate:"required,datetime=2006-01-02T15:04:05.000Z"`
}

// TaskFormData represents the data needed to create or update a task
// Matches the TypeScript TaskFormData interface
type TaskFormData struct {
	Title       string  `json:"title" validate:"required,max=100"`
	Description *string `json:"description,omitempty" validate:"omitempty,max=500"`
	DueDate     *string `json:"dueDate,omitempty" validate:"omitempty,datetime=2006-01-02T15:04:05.000Z"`
	Urgent      bool    `json:"urgent"`
	Important   bool    `json:"important"`
	Completed   bool    `json:"completed"`
}

// TaskUpdate represents partial updates to a task
type TaskUpdate struct {
	ID          string       `json:"id" validate:"required"`
	Title       *string      `json:"title,omitempty" validate:"omitempty,max=100"`
	Description *string      `json:"description,omitempty" validate:"omitempty,max=500"`
	DueDate     *string      `json:"dueDate,omitempty" validate:"omitempty,datetime=2006-01-02T15:04:05.000Z"`
	Urgent      *bool        `json:"urgent,omitempty"`
	Important   *bool        `json:"important,omitempty"`
	Quadrant    *TaskQuadrant `json:"quadrant,omitempty" validate:"omitempty,oneof=DO SCHEDULE DELEGATE DELETE UNASSIGNED"`
	Completed   *bool        `json:"completed,omitempty"`
}

// QuadrantMoveRequest represents a request to move a task to a different quadrant
type QuadrantMoveRequest struct {
	Quadrant TaskQuadrant `json:"quadrant" validate:"required,oneof=DO SCHEDULE DELEGATE DELETE UNASSIGNED"`
}

// CompletionToggleRequest represents a request to toggle task completion
type CompletionToggleRequest struct {
	Completed *bool `json:"completed,omitempty"`
}

// TaskCollection represents a collection of tasks with metadata
type TaskCollection struct {
	Tasks []Task `json:"tasks"`
	Total int    `json:"total"`
}

// Global validator instance
var validate *validator.Validate

func init() {
	validate = validator.New()
	
	// Register custom validation for ISO8601 datetime
	validate.RegisterValidation("datetime", validateISO8601DateTime)
}

// validateISO8601DateTime validates ISO8601 datetime format
func validateISO8601DateTime(fl validator.FieldLevel) bool {
	dateStr := fl.Field().String()
	if dateStr == "" {
		return true // Optional field
	}
	
	// Try parsing as RFC3339 (ISO8601)
	_, err := time.Parse(time.RFC3339, dateStr)
	return err == nil
}

// NewTask creates a new task from form data
func NewTask(formData TaskFormData) (*Task, error) {
	// Validate form data
	if err := validate.Struct(formData); err != nil {
		return nil, fmt.Errorf("validation failed: %w", err)
	}
	
	// Validate and trim title
	title := strings.TrimSpace(formData.Title)
	if title == "" {
		return nil, errors.New("task title is required")
	}
	
	// Validate description if provided
	var description *string
	if formData.Description != nil {
		desc := strings.TrimSpace(*formData.Description)
		if desc != "" {
			description = &desc
		}
	}
	
	// Validate due date if provided
	if formData.DueDate != nil && *formData.DueDate != "" {
		if _, err := time.Parse(time.RFC3339, *formData.DueDate); err != nil {
			return nil, errors.New("invalid due date format, expected ISO8601")
		}
	}
	
	now := time.Now().UTC().Format(time.RFC3339)
	taskID := uuid.New().String()
	
	task := &Task{
		ID:          taskID,
		Title:       title,
		Description: description,
		DueDate:     formData.DueDate,
		Urgent:      formData.Urgent,
		Important:   formData.Important,
		Quadrant:    QuadrantUnassigned, // Always start new tasks in unassigned
		Completed:   false, // New tasks always start as incomplete
		CompletedAt: nil,
		CreatedAt:   now,
		UpdatedAt:   now,
	}
	
	return task, nil
}

// Update applies partial updates to a task
func (t *Task) Update(updates TaskUpdate) error {
	// Validate the update request
	if err := validate.Struct(updates); err != nil {
		return fmt.Errorf("validation failed: %w", err)
	}
	
	now := time.Now().UTC().Format(time.RFC3339)
	
	// Apply updates
	if updates.Title != nil {
		title := strings.TrimSpace(*updates.Title)
		if title == "" {
			return errors.New("task title cannot be empty")
		}
		t.Title = title
	}
	
	if updates.Description != nil {
		desc := strings.TrimSpace(*updates.Description)
		if desc == "" {
			t.Description = nil
		} else {
			t.Description = &desc
		}
	}
	
	if updates.DueDate != nil {
		if *updates.DueDate == "" {
			t.DueDate = nil
		} else {
			if _, err := time.Parse(time.RFC3339, *updates.DueDate); err != nil {
				return errors.New("invalid due date format, expected ISO8601")
			}
			t.DueDate = updates.DueDate
		}
	}
	
	if updates.Urgent != nil {
		t.Urgent = *updates.Urgent
	}
	
	if updates.Important != nil {
		t.Important = *updates.Important
	}
	
	if updates.Quadrant != nil {
		t.Quadrant = *updates.Quadrant
	}
	
	if updates.Completed != nil {
		wasCompleted := t.Completed
		t.Completed = *updates.Completed
		
		// Update completion timestamp
		if t.Completed && !wasCompleted {
			t.CompletedAt = &now
		} else if !t.Completed && wasCompleted {
			t.CompletedAt = nil
		}
	}
	
	t.UpdatedAt = now
	return nil
}

// MoveToQuadrant moves the task to a specific quadrant and updates priority flags
func (t *Task) MoveToQuadrant(quadrant TaskQuadrant) {
	t.Quadrant = quadrant
	
	// Update urgent/important flags based on quadrant
	// This matches the logic in the React Redux slice
	switch quadrant {
	case QuadrantDo:
		t.Urgent = true
		t.Important = true
	case QuadrantSchedule:
		t.Urgent = false
		t.Important = true
	case QuadrantDelegate:
		t.Urgent = true
		t.Important = false
	case QuadrantDelete:
		t.Urgent = false
		t.Important = false
	case QuadrantUnassigned:
		// Keep existing flags for unassigned tasks
	}
	
	t.UpdatedAt = time.Now().UTC().Format(time.RFC3339)
}

// ToggleCompletion toggles the task completion status
func (t *Task) ToggleCompletion() {
	t.Completed = !t.Completed
	now := time.Now().UTC().Format(time.RFC3339)
	
	if t.Completed {
		t.CompletedAt = &now
	} else {
		t.CompletedAt = nil
	}
	
	t.UpdatedAt = now
}

// SetCompletion explicitly sets the task completion status
func (t *Task) SetCompletion(completed bool) {
	if t.Completed == completed {
		return // No change needed
	}
	
	t.Completed = completed
	now := time.Now().UTC().Format(time.RFC3339)
	
	if t.Completed {
		t.CompletedAt = &now
	} else {
		t.CompletedAt = nil
	}
	
	t.UpdatedAt = now
}

// Validate checks if the task data is valid
func (t *Task) Validate() error {
	return validate.Struct(t)
}

// IsOverdue checks if the task is overdue based on due date
func (t *Task) IsOverdue() bool {
	if t.DueDate == nil || t.Completed {
		return false
	}
	
	dueTime, err := time.Parse(time.RFC3339, *t.DueDate)
	if err != nil {
		return false
	}
	
	return time.Now().UTC().After(dueTime)
}

// GetPriorityLevel returns a numeric priority level for sorting
// Higher numbers indicate higher priority
func (t *Task) GetPriorityLevel() int {
	switch t.Quadrant {
	case QuadrantDo:
		return 4 // Urgent and Important
	case QuadrantSchedule:
		return 3 // Important but not Urgent
	case QuadrantDelegate:
		return 2 // Urgent but not Important
	case QuadrantDelete:
		return 1 // Neither Urgent nor Important
	default:
		return 0 // Unassigned
	}
}

// ToJSON converts the task to JSON bytes
func (t *Task) ToJSON() ([]byte, error) {
	return json.Marshal(t)
}

// FromJSON creates a task from JSON bytes
func FromJSON(data []byte) (*Task, error) {
	var task Task
	if err := json.Unmarshal(data, &task); err != nil {
		return nil, fmt.Errorf("failed to unmarshal task: %w", err)
	}
	
	if err := task.Validate(); err != nil {
		return nil, fmt.Errorf("invalid task data: %w", err)
	}
	
	return &task, nil
}

// TasksFromJSON creates a slice of tasks from JSON bytes
func TasksFromJSON(data []byte) ([]Task, error) {
	var tasks []Task
	if err := json.Unmarshal(data, &tasks); err != nil {
		return nil, fmt.Errorf("failed to unmarshal tasks: %w", err)
	}
	
	// Validate each task
	for i, task := range tasks {
		if err := task.Validate(); err != nil {
			return nil, fmt.Errorf("invalid task at index %d: %w", i, err)
		}
	}
	
	return tasks, nil
}

// TasksToJSON converts a slice of tasks to JSON bytes
func TasksToJSON(tasks []Task) ([]byte, error) {
	return json.Marshal(tasks)
}