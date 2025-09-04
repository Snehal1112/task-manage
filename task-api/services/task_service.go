package services

import (
	"errors"
	"fmt"
	"sort"
	"strings"
	"task-api/models"
	"task-api/storage"
)

// TaskService handles business logic for task operations
type TaskService struct {
	storage *storage.EncryptedStorage
}

// NewTaskService creates a new task service instance
func NewTaskService(encryptedStorage *storage.EncryptedStorage) *TaskService {
	return &TaskService{
		storage: encryptedStorage,
	}
}

// GetAllTasks retrieves all tasks from storage
func (s *TaskService) GetAllTasks() ([]models.Task, error) {
	data, err := s.storage.LoadData()
	if err != nil {
		return nil, fmt.Errorf("failed to load tasks from storage: %w", err)
	}

	tasks, err := models.TasksFromJSON(data)
	if err != nil {
		return nil, fmt.Errorf("failed to parse tasks from storage: %w", err)
	}

	return tasks, nil
}

// GetTaskByID retrieves a specific task by ID
func (s *TaskService) GetTaskByID(id string) (*models.Task, error) {
	if strings.TrimSpace(id) == "" {
		return nil, errors.New("task ID cannot be empty")
	}

	tasks, err := s.GetAllTasks()
	if err != nil {
		return nil, err
	}

	for _, task := range tasks {
		if task.ID == id {
			return &task, nil
		}
	}

	return nil, errors.New("task not found")
}

// CreateTask creates a new task and saves it to storage
func (s *TaskService) CreateTask(formData models.TaskFormData) (*models.Task, error) {
	// Create new task from form data
	newTask, err := models.NewTask(formData)
	if err != nil {
		return nil, fmt.Errorf("failed to create task: %w", err)
	}

	// Load existing tasks
	tasks, err := s.GetAllTasks()
	if err != nil {
		return nil, err
	}

	// Check for duplicate IDs (though UUID collision is extremely unlikely)
	for _, task := range tasks {
		if task.ID == newTask.ID {
			return nil, errors.New("task ID already exists")
		}
	}

	// Add new task to list
	tasks = append(tasks, *newTask)

	// Save updated tasks
	if err := s.saveTasks(tasks); err != nil {
		return nil, fmt.Errorf("failed to save new task: %w", err)
	}

	return newTask, nil
}

// UpdateTask updates an existing task
func (s *TaskService) UpdateTask(update models.TaskUpdate) (*models.Task, error) {
	if strings.TrimSpace(update.ID) == "" {
		return nil, errors.New("task ID cannot be empty")
	}

	// Load existing tasks
	tasks, err := s.GetAllTasks()
	if err != nil {
		return nil, err
	}

	// Find and update the task
	var updatedTask *models.Task
	for i, task := range tasks {
		if task.ID == update.ID {
			if err := task.Update(update); err != nil {
				return nil, fmt.Errorf("failed to apply task updates: %w", err)
			}
			tasks[i] = task
			updatedTask = &tasks[i]
			break
		}
	}

	if updatedTask == nil {
		return nil, errors.New("task not found")
	}

	// Save updated tasks
	if err := s.saveTasks(tasks); err != nil {
		return nil, fmt.Errorf("failed to save updated task: %w", err)
	}

	return updatedTask, nil
}

// DeleteTask removes a task from storage
func (s *TaskService) DeleteTask(id string) error {
	if strings.TrimSpace(id) == "" {
		return errors.New("task ID cannot be empty")
	}

	// Load existing tasks
	tasks, err := s.GetAllTasks()
	if err != nil {
		return err
	}

	// Find and remove the task
	found := false
	filteredTasks := make([]models.Task, 0, len(tasks))
	for _, task := range tasks {
		if task.ID != id {
			filteredTasks = append(filteredTasks, task)
		} else {
			found = true
		}
	}

	if !found {
		return errors.New("task not found")
	}

	// Save updated tasks
	if err := s.saveTasks(filteredTasks); err != nil {
		return fmt.Errorf("failed to save after deleting task: %w", err)
	}

	return nil
}

// MoveTaskToQuadrant moves a task to a specific quadrant
func (s *TaskService) MoveTaskToQuadrant(id string, quadrant models.TaskQuadrant) (*models.Task, error) {
	if strings.TrimSpace(id) == "" {
		return nil, errors.New("task ID cannot be empty")
	}

	// Validate quadrant
	validQuadrants := []models.TaskQuadrant{
		models.QuadrantDo,
		models.QuadrantSchedule,
		models.QuadrantDelegate,
		models.QuadrantDelete,
		models.QuadrantUnassigned,
	}
	
	valid := false
	for _, vq := range validQuadrants {
		if quadrant == vq {
			valid = true
			break
		}
	}
	
	if !valid {
		return nil, errors.New("invalid quadrant")
	}

	// Load existing tasks
	tasks, err := s.GetAllTasks()
	if err != nil {
		return nil, err
	}

	// Find and update the task
	var updatedTask *models.Task
	for i, task := range tasks {
		if task.ID == id {
			task.MoveToQuadrant(quadrant)
			tasks[i] = task
			updatedTask = &tasks[i]
			break
		}
	}

	if updatedTask == nil {
		return nil, errors.New("task not found")
	}

	// Save updated tasks
	if err := s.saveTasks(tasks); err != nil {
		return nil, fmt.Errorf("failed to save task after quadrant move: %w", err)
	}

	return updatedTask, nil
}

// ToggleTaskCompletion toggles the completion status of a task
func (s *TaskService) ToggleTaskCompletion(id string) (*models.Task, error) {
	if strings.TrimSpace(id) == "" {
		return nil, errors.New("task ID cannot be empty")
	}

	// Load existing tasks
	tasks, err := s.GetAllTasks()
	if err != nil {
		return nil, err
	}

	// Find and toggle the task
	var updatedTask *models.Task
	for i, task := range tasks {
		if task.ID == id {
			task.ToggleCompletion()
			tasks[i] = task
			updatedTask = &tasks[i]
			break
		}
	}

	if updatedTask == nil {
		return nil, errors.New("task not found")
	}

	// Save updated tasks
	if err := s.saveTasks(tasks); err != nil {
		return nil, fmt.Errorf("failed to save task after completion toggle: %w", err)
	}

	return updatedTask, nil
}

// SetTaskCompletion sets the completion status of a task
func (s *TaskService) SetTaskCompletion(id string, completed bool) (*models.Task, error) {
	if strings.TrimSpace(id) == "" {
		return nil, errors.New("task ID cannot be empty")
	}

	// Load existing tasks
	tasks, err := s.GetAllTasks()
	if err != nil {
		return nil, err
	}

	// Find and update the task
	var updatedTask *models.Task
	for i, task := range tasks {
		if task.ID == id {
			task.SetCompletion(completed)
			tasks[i] = task
			updatedTask = &tasks[i]
			break
		}
	}

	if updatedTask == nil {
		return nil, errors.New("task not found")
	}

	// Save updated tasks
	if err := s.saveTasks(tasks); err != nil {
		return nil, fmt.Errorf("failed to save task after completion update: %w", err)
	}

	return updatedTask, nil
}

// ClearAllTasks removes all tasks from storage
func (s *TaskService) ClearAllTasks() (int, error) {
	tasks, err := s.GetAllTasks()
	if err != nil {
		return 0, err
	}

	deletedCount := len(tasks)
	
	// Save empty task list
	if err := s.saveTasks([]models.Task{}); err != nil {
		return 0, fmt.Errorf("failed to clear all tasks: %w", err)
	}

	return deletedCount, nil
}

// GetTasksByQuadrant retrieves tasks filtered by quadrant
func (s *TaskService) GetTasksByQuadrant(quadrant models.TaskQuadrant) ([]models.Task, error) {
	tasks, err := s.GetAllTasks()
	if err != nil {
		return nil, err
	}

	var filteredTasks []models.Task
	for _, task := range tasks {
		if task.Quadrant == quadrant {
			filteredTasks = append(filteredTasks, task)
		}
	}

	return filteredTasks, nil
}

// GetCompletedTasks retrieves all completed tasks
func (s *TaskService) GetCompletedTasks() ([]models.Task, error) {
	tasks, err := s.GetAllTasks()
	if err != nil {
		return nil, err
	}

	var completedTasks []models.Task
	for _, task := range tasks {
		if task.Completed {
			completedTasks = append(completedTasks, task)
		}
	}

	return completedTasks, nil
}

// GetOverdueTasks retrieves all overdue tasks
func (s *TaskService) GetOverdueTasks() ([]models.Task, error) {
	tasks, err := s.GetAllTasks()
	if err != nil {
		return nil, err
	}

	var overdueTasks []models.Task
	for _, task := range tasks {
		if task.IsOverdue() {
			overdueTasks = append(overdueTasks, task)
		}
	}

	return overdueTasks, nil
}

// GetTasksSorted retrieves all tasks sorted by priority and creation date
func (s *TaskService) GetTasksSorted() ([]models.Task, error) {
	tasks, err := s.GetAllTasks()
	if err != nil {
		return nil, err
	}

	// Sort by priority level (high to low), then by creation date (newest first)
	sort.Slice(tasks, func(i, j int) bool {
		// First sort by priority level
		levelI := tasks[i].GetPriorityLevel()
		levelJ := tasks[j].GetPriorityLevel()
		
		if levelI != levelJ {
			return levelI > levelJ // Higher priority first
		}
		
		// If same priority, sort by creation date (newest first)
		return tasks[i].CreatedAt > tasks[j].CreatedAt
	})

	return tasks, nil
}

// LoadDemoTasks loads demo tasks into storage
func (s *TaskService) LoadDemoTasks() ([]models.Task, error) {
	demoTasks := s.createDemoTasks()
	
	// Save demo tasks
	if err := s.saveTasks(demoTasks); err != nil {
		return nil, fmt.Errorf("failed to save demo tasks: %w", err)
	}

	return demoTasks, nil
}

// CreateBackup creates a backup of current tasks
func (s *TaskService) CreateBackup() (string, error) {
	return s.storage.CreateManualBackup()
}

// ListBackups returns a list of available backups
func (s *TaskService) ListBackups() ([]string, error) {
	return s.storage.ListBackups()
}

// RestoreFromBackup restores tasks from a backup
func (s *TaskService) RestoreFromBackup(backupName string) error {
	return s.storage.RestoreFromBackup(backupName)
}

// GetStorageInfo returns information about the storage system
func (s *TaskService) GetStorageInfo() map[string]interface{} {
	return s.storage.GetStorageInfo()
}

// saveTasks is a helper method to save tasks to storage
func (s *TaskService) saveTasks(tasks []models.Task) error {
	data, err := models.TasksToJSON(tasks)
	if err != nil {
		return fmt.Errorf("failed to serialize tasks: %w", err)
	}

	if err := s.storage.SaveData(data); err != nil {
		return fmt.Errorf("failed to save tasks to storage: %w", err)
	}

	return nil
}

// createDemoTasks creates a set of demo tasks for testing
func (s *TaskService) createDemoTasks() []models.Task {
	var demoTasks []models.Task
	
	// Sample tasks for different quadrants
	taskData := []struct {
		title       string
		description string
		quadrant    models.TaskQuadrant
		urgent      bool
		important   bool
	}{
		{"Fix critical security vulnerability", "Patch the authentication system", models.QuadrantDo, true, true},
		{"Plan quarterly goals", "Set objectives for next quarter", models.QuadrantSchedule, false, true},
		{"Review and approve timesheets", "Process team timesheets for payroll", models.QuadrantDelegate, true, false},
		{"Organize desk drawer", "Clean up cluttered workspace", models.QuadrantDelete, false, false},
		{"Review project proposal", "Evaluate new client project requirements", models.QuadrantUnassigned, false, true},
	}

	for _, data := range taskData {
		desc := &data.description
		task, err := models.NewTask(models.TaskFormData{
			Title:       data.title,
			Description: desc,
			Urgent:      data.urgent,
			Important:   data.important,
		})
		
		if err == nil {
			task.MoveToQuadrant(data.quadrant)
			demoTasks = append(demoTasks, *task)
		}
	}

	return demoTasks
}