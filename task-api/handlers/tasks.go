package handlers

import (
	"net/http"
	"strconv"
	"strings"
	
	"github.com/gin-gonic/gin"
	"task-api/models"
	"task-api/services"
	"task-api/utils"
)

// TaskHandler handles HTTP requests for task operations
type TaskHandler struct {
	taskService *services.TaskService
}

// NewTaskHandler creates a new task handler
func NewTaskHandler(taskService *services.TaskService) *TaskHandler {
	return &TaskHandler{
		taskService: taskService,
	}
}

// GetTasks handles GET /api/tasks
func (h *TaskHandler) GetTasks(c *gin.Context) {
	// Parse query parameters
	quadrant := c.Query("quadrant")
	completedStr := c.Query("completed")
	sortStr := c.Query("sort")
	limitStr := c.Query("limit")
	offsetStr := c.Query("offset")

	var tasks []models.Task
	var err error

	// Filter by quadrant if specified
	if quadrant != "" {
		if err := utils.ValidateQuadrant(quadrant); err != nil {
			utils.BadRequestResponse(c, "Invalid quadrant: "+err.Error())
			return
		}
		tasks, err = h.taskService.GetTasksByQuadrant(models.TaskQuadrant(quadrant))
	} else if completedStr == "true" {
		// Filter by completion status
		tasks, err = h.taskService.GetCompletedTasks()
	} else if completedStr == "false" {
		// Get incomplete tasks
		allTasks, e := h.taskService.GetAllTasks()
		if e != nil {
			utils.InternalErrorResponse(c, e)
			return
		}
		for _, task := range allTasks {
			if !task.Completed {
				tasks = append(tasks, task)
			}
		}
	} else if sortStr == "priority" {
		// Get sorted tasks
		tasks, err = h.taskService.GetTasksSorted()
	} else {
		// Get all tasks
		tasks, err = h.taskService.GetAllTasks()
	}

	if err != nil {
		utils.InternalErrorResponse(c, err)
		return
	}

	// Apply pagination if specified
	if limitStr != "" || offsetStr != "" {
		limit, limitErr := strconv.Atoi(limitStr)
		offset, offsetErr := strconv.Atoi(offsetStr)

		if limitErr != nil && limitStr != "" {
			utils.BadRequestResponse(c, "Invalid limit parameter")
			return
		}
		if offsetErr != nil && offsetStr != "" {
			utils.BadRequestResponse(c, "Invalid offset parameter")
			return
		}

		// Apply pagination
		total := len(tasks)
		if offset > 0 {
			if offset >= total {
				tasks = []models.Task{}
			} else {
				tasks = tasks[offset:]
			}
		}

		if limit > 0 && len(tasks) > limit {
			tasks = tasks[:limit]
		}

		// Return paginated response
		response := models.TaskCollection{
			Tasks: tasks,
			Total: total,
		}
		utils.SuccessResponse(c, http.StatusOK, response)
		return
	}

	// Return all tasks
	response := models.TaskCollection{
		Tasks: tasks,
		Total: len(tasks),
	}
	utils.SuccessResponse(c, http.StatusOK, response)
}

// GetTask handles GET /api/tasks/:id
func (h *TaskHandler) GetTask(c *gin.Context) {
	id := strings.TrimSpace(c.Param("id"))
	if id == "" {
		utils.BadRequestResponse(c, "Task ID is required")
		return
	}

	task, err := h.taskService.GetTaskByID(id)
	if err != nil {
		if strings.Contains(err.Error(), "not found") {
			utils.NotFoundResponse(c, "Task")
			return
		}
		utils.InternalErrorResponse(c, err)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, task)
}

// CreateTask handles POST /api/tasks
func (h *TaskHandler) CreateTask(c *gin.Context) {
	var formData models.TaskFormData
	if err := c.ShouldBindJSON(&formData); err != nil {
		utils.ValidationErrorResponse(c, err)
		return
	}

	task, err := h.taskService.CreateTask(formData)
	if err != nil {
		if strings.Contains(err.Error(), "validation") {
			utils.ValidationErrorResponse(c, err)
			return
		}
		utils.InternalErrorResponse(c, err)
		return
	}

	utils.SuccessResponse(c, http.StatusCreated, task)
}

// UpdateTask handles PUT /api/tasks/:id
func (h *TaskHandler) UpdateTask(c *gin.Context) {
	id := strings.TrimSpace(c.Param("id"))
	if id == "" {
		utils.BadRequestResponse(c, "Task ID is required")
		return
	}

	var updates models.TaskUpdate
	if err := c.ShouldBindJSON(&updates); err != nil {
		utils.ValidationErrorResponse(c, err)
		return
	}

	// Set the ID from the URL parameter
	updates.ID = id

	task, err := h.taskService.UpdateTask(updates)
	if err != nil {
		if strings.Contains(err.Error(), "not found") {
			utils.NotFoundResponse(c, "Task")
			return
		}
		if strings.Contains(err.Error(), "validation") {
			utils.ValidationErrorResponse(c, err)
			return
		}
		utils.InternalErrorResponse(c, err)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, task)
}

// DeleteTask handles DELETE /api/tasks/:id
func (h *TaskHandler) DeleteTask(c *gin.Context) {
	id := strings.TrimSpace(c.Param("id"))
	if id == "" {
		utils.BadRequestResponse(c, "Task ID is required")
		return
	}

	err := h.taskService.DeleteTask(id)
	if err != nil {
		if strings.Contains(err.Error(), "not found") {
			utils.NotFoundResponse(c, "Task")
			return
		}
		utils.InternalErrorResponse(c, err)
		return
	}

	c.JSON(http.StatusNoContent, nil)
}

// MoveTaskToQuadrant handles PATCH /api/tasks/:id/quadrant
func (h *TaskHandler) MoveTaskToQuadrant(c *gin.Context) {
	id := strings.TrimSpace(c.Param("id"))
	if id == "" {
		utils.BadRequestResponse(c, "Task ID is required")
		return
	}

	var request models.QuadrantMoveRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		utils.ValidationErrorResponse(c, err)
		return
	}

	task, err := h.taskService.MoveTaskToQuadrant(id, request.Quadrant)
	if err != nil {
		if strings.Contains(err.Error(), "not found") {
			utils.NotFoundResponse(c, "Task")
			return
		}
		if strings.Contains(err.Error(), "invalid quadrant") {
			utils.BadRequestResponse(c, err.Error())
			return
		}
		utils.InternalErrorResponse(c, err)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, task)
}

// ToggleTaskCompletion handles PATCH /api/tasks/:id/completion
func (h *TaskHandler) ToggleTaskCompletion(c *gin.Context) {
	id := strings.TrimSpace(c.Param("id"))
	if id == "" {
		utils.BadRequestResponse(c, "Task ID is required")
		return
	}

	var request models.CompletionToggleRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		// If no body provided, just toggle
		task, err := h.taskService.ToggleTaskCompletion(id)
		if err != nil {
			if strings.Contains(err.Error(), "not found") {
				utils.NotFoundResponse(c, "Task")
				return
			}
			utils.InternalErrorResponse(c, err)
			return
		}
		utils.SuccessResponse(c, http.StatusOK, task)
		return
	}

	// If specific completion status provided, set it
	var task *models.Task
	var err error
	
	if request.Completed != nil {
		task, err = h.taskService.SetTaskCompletion(id, *request.Completed)
	} else {
		task, err = h.taskService.ToggleTaskCompletion(id)
	}

	if err != nil {
		if strings.Contains(err.Error(), "not found") {
			utils.NotFoundResponse(c, "Task")
			return
		}
		utils.InternalErrorResponse(c, err)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, task)
}

// ClearAllTasks handles DELETE /api/tasks
func (h *TaskHandler) ClearAllTasks(c *gin.Context) {
	// Safety check - require confirmation parameter
	confirm := c.Query("confirm")
	if confirm != "true" {
		utils.BadRequestResponse(c, "This operation requires confirmation. Add ?confirm=true to proceed.")
		return
	}

	deletedCount, err := h.taskService.ClearAllTasks()
	if err != nil {
		utils.InternalErrorResponse(c, err)
		return
	}

	response := map[string]interface{}{
		"deleted": deletedCount,
		"message": "All tasks have been deleted",
	}

	utils.SuccessResponse(c, http.StatusOK, response)
}

// LoadDemoTasks handles GET /api/tasks/demo
func (h *TaskHandler) LoadDemoTasks(c *gin.Context) {
	tasks, err := h.taskService.LoadDemoTasks()
	if err != nil {
		utils.InternalErrorResponse(c, err)
		return
	}

	response := models.TaskCollection{
		Tasks: tasks,
		Total: len(tasks),
	}

	utils.SuccessResponseWithMessage(c, http.StatusOK, response, "Demo tasks loaded successfully")
}

// GetOverdueTasks handles GET /api/tasks/overdue
func (h *TaskHandler) GetOverdueTasks(c *gin.Context) {
	tasks, err := h.taskService.GetOverdueTasks()
	if err != nil {
		utils.InternalErrorResponse(c, err)
		return
	}

	response := models.TaskCollection{
		Tasks: tasks,
		Total: len(tasks),
	}

	utils.SuccessResponse(c, http.StatusOK, response)
}

// CreateBackup handles POST /api/backup
func (h *TaskHandler) CreateBackup(c *gin.Context) {
	backupName, err := h.taskService.CreateBackup()
	if err != nil {
		utils.InternalErrorResponse(c, err)
		return
	}

	response := map[string]interface{}{
		"backup_name": backupName,
		"message":     "Backup created successfully",
	}

	utils.SuccessResponse(c, http.StatusOK, response)
}

// ListBackups handles GET /api/backups
func (h *TaskHandler) ListBackups(c *gin.Context) {
	backups, err := h.taskService.ListBackups()
	if err != nil {
		utils.InternalErrorResponse(c, err)
		return
	}

	response := map[string]interface{}{
		"backups": backups,
		"count":   len(backups),
	}

	utils.SuccessResponse(c, http.StatusOK, response)
}

// RestoreFromBackup handles POST /api/restore
func (h *TaskHandler) RestoreFromBackup(c *gin.Context) {
	var request struct {
		BackupName string `json:"backup_name" binding:"required"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		utils.ValidationErrorResponse(c, err)
		return
	}

	err := h.taskService.RestoreFromBackup(request.BackupName)
	if err != nil {
		if strings.Contains(err.Error(), "not found") || strings.Contains(err.Error(), "no such file") {
			utils.NotFoundResponse(c, "Backup file")
			return
		}
		utils.InternalErrorResponse(c, err)
		return
	}

	response := map[string]interface{}{
		"message": "Data restored successfully from backup: " + request.BackupName,
	}

	utils.SuccessResponse(c, http.StatusOK, response)
}

// GetStorageInfo handles GET /api/info
func (h *TaskHandler) GetStorageInfo(c *gin.Context) {
	info := h.taskService.GetStorageInfo()
	utils.SuccessResponse(c, http.StatusOK, info)
}