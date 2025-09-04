import { Task, TaskFormData, TaskQuadrant } from '@/features/tasks/TaskTypes';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

// API Response Types
interface APIResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  message?: string;
}

interface TaskCollection {
  tasks: Task[];
  total: number;
}

interface BackupInfo {
  backup_name: string;
  message: string;
}

interface BackupList {
  backups: string[];
  count: number;
}

interface RestoreRequest {
  backup_name: string;
}

// HTTP Client wrapper with error handling
class APIClient {
  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        
        try {
          const errorData = await response.json();
          if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch {
          // If response is not JSON, use default error message
        }
        
        throw new Error(errorMessage);
      }

      // Handle 204 No Content responses
      if (response.status === 204) {
        return null as T;
      }

      const data: APIResponse<T> = await response.json();
      
      if (!data.success && data.error) {
        throw new Error(data.error);
      }
      
      return data.data;
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Unable to connect to server. Please check if the backend is running.');
      }
      throw error;
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async patch<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// Create API client instance
const apiClient = new APIClient();

// Task API Service
export const taskAPI = {
  // Get all tasks
  async getAllTasks(): Promise<Task[]> {
    const response = await apiClient.get<TaskCollection>('/tasks');
    return response.tasks;
  },

  // Get tasks with filtering and pagination
  async getTasks(params?: {
    quadrant?: TaskQuadrant;
    completed?: boolean;
    sort?: 'priority';
    limit?: number;
    offset?: number;
  }): Promise<TaskCollection> {
    const searchParams = new URLSearchParams();
    
    if (params?.quadrant) searchParams.set('quadrant', params.quadrant);
    if (params?.completed !== undefined) searchParams.set('completed', params.completed.toString());
    if (params?.sort) searchParams.set('sort', params.sort);
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.offset) searchParams.set('offset', params.offset.toString());

    const endpoint = `/tasks${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
    return apiClient.get<TaskCollection>(endpoint);
  },

  // Get a specific task by ID
  async getTaskById(id: string): Promise<Task> {
    return apiClient.get<Task>(`/tasks/${id}`);
  },

  // Create a new task
  async createTask(taskData: TaskFormData): Promise<Task> {
    return apiClient.post<Task>('/tasks', taskData);
  },

  // Update an existing task
  async updateTask(id: string, updates: Partial<TaskFormData>): Promise<Task> {
    return apiClient.put<Task>(`/tasks/${id}`, updates);
  },

  // Delete a task
  async deleteTask(id: string): Promise<void> {
    return apiClient.delete<void>(`/tasks/${id}`);
  },

  // Move task to a specific quadrant
  async moveTaskToQuadrant(id: string, quadrant: TaskQuadrant): Promise<Task> {
    return apiClient.patch<Task>(`/tasks/${id}/quadrant`, { quadrant });
  },

  // Toggle task completion
  async toggleTaskCompletion(id: string): Promise<Task> {
    return apiClient.patch<Task>(`/tasks/${id}/completion`, {});
  },

  // Set task completion status
  async setTaskCompletion(id: string, completed: boolean): Promise<Task> {
    return apiClient.patch<Task>(`/tasks/${id}/completion`, { completed });
  },

  // Clear all tasks
  async clearAllTasks(): Promise<{ deleted: number; message: string }> {
    return apiClient.delete<{ deleted: number; message: string }>('/tasks?confirm=true');
  },

  // Load demo tasks
  async loadDemoTasks(): Promise<Task[]> {
    const response = await apiClient.get<TaskCollection>('/tasks/demo');
    return response.tasks;
  },

  // Get overdue tasks
  async getOverdueTasks(): Promise<Task[]> {
    const response = await apiClient.get<TaskCollection>('/tasks/overdue');
    return response.tasks;
  },
};

// Backup API Service
export const backupAPI = {
  // Create a manual backup
  async createBackup(): Promise<BackupInfo> {
    return apiClient.post<BackupInfo>('/backup');
  },

  // List available backups
  async listBackups(): Promise<BackupList> {
    return apiClient.get<BackupList>('/backups');
  },

  // Restore from a backup
  async restoreFromBackup(backupName: string): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>('/restore', { backup_name: backupName });
  },
};

// System API Service
export const systemAPI = {
  // Health check
  async healthCheck(): Promise<{
    status: string;
    timestamp: string;
    service: string;
    version: string;
  }> {
    return apiClient.get<{
      status: string;
      timestamp: string;
      service: string;
      version: string;
    }>('/health');
  },

  // Readiness check
  async readinessCheck(): Promise<{
    status: string;
    timestamp: string;
    checks: Record<string, string>;
  }> {
    return apiClient.get<{
      status: string;
      timestamp: string;
      checks: Record<string, string>;
    }>('/ready');
  },

  // Get storage information
  async getStorageInfo(): Promise<Record<string, unknown>> {
    return apiClient.get<Record<string, unknown>>('/info');
  },
};

// Export default API object
export const api = {
  tasks: taskAPI,
  backup: backupAPI,
  system: systemAPI,
};

export default api;