import { Task } from '@/features/tasks/TaskTypes';

const now = new Date().toISOString();
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
const nextWeek = new Date();
nextWeek.setDate(nextWeek.getDate() + 7);
const nextMonth = new Date();
nextMonth.setDate(nextMonth.getDate() + 30);

export const demoTasks: Task[] = [
  // UNASSIGNED tasks in Task Panel
  {
    id: 'demo-1',
    title: 'Review quarterly budget report',
    description: 'Analyze Q4 expenses and prepare recommendations for next quarter',
    dueDate: tomorrow.toISOString().split('T')[0],
    urgent: false,
    important: true,
    quadrant: 'UNASSIGNED',
    completed: false,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'demo-2', 
    title: 'Fix critical login bug',
    description: 'Users unable to login due to authentication service timeout',
    dueDate: new Date().toISOString().split('T')[0],
    urgent: true,
    important: true,
    quadrant: 'UNASSIGNED',
    completed: false,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'demo-3',
    title: 'Plan team building event',
    description: 'Organize quarterly team outing and team building activities',
    dueDate: nextMonth.toISOString().split('T')[0],
    urgent: false,
    important: false,
    quadrant: 'UNASSIGNED',
    completed: false,
    createdAt: now,
    updatedAt: now,
  },

  // DO quadrant - Urgent + Important
  {
    id: 'demo-4',
    title: 'Handle client emergency',
    description: 'Production server down for major client - needs immediate attention',
    dueDate: new Date().toISOString().split('T')[0],
    urgent: true,
    important: true,
    quadrant: 'DO',
    completed: false,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'demo-5',
    title: 'Submit tax documents',
    description: 'Corporate tax filing deadline is today',
    dueDate: new Date().toISOString().split('T')[0],
    urgent: true,
    important: true,
    quadrant: 'DO',
    completed: true,
    completedAt: now,
    createdAt: now,
    updatedAt: now,
  },

  // SCHEDULE quadrant - Not Urgent + Important  
  {
    id: 'demo-6',
    title: 'Complete project planning',
    description: 'Define scope, timeline, and resources for next quarter project',
    dueDate: nextWeek.toISOString().split('T')[0],
    urgent: false,
    important: true,
    quadrant: 'SCHEDULE',
    completed: false,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'demo-7',
    title: 'Update team documentation',
    description: 'Review and update development workflow documentation',
    dueDate: nextWeek.toISOString().split('T')[0],
    urgent: false,
    important: true,
    quadrant: 'SCHEDULE',
    completed: false,
    createdAt: now,
    updatedAt: now,
  },

  // DELEGATE quadrant - Urgent + Not Important
  {
    id: 'demo-8',
    title: 'Schedule vendor meetings',
    description: 'Coordinate meetings with all software vendors for contract renewal',
    dueDate: tomorrow.toISOString().split('T')[0],
    urgent: true,
    important: false,
    quadrant: 'DELEGATE',
    completed: false,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'demo-9',
    title: 'Order office supplies',
    description: 'Printer paper, pens, and other office essentials are running low',
    dueDate: new Date().toISOString().split('T')[0],
    urgent: true,
    important: false,
    quadrant: 'DELEGATE',
    completed: false,
    createdAt: now,
    updatedAt: now,
  },

  // DELETE quadrant - Not Urgent + Not Important
  {
    id: 'demo-10',
    title: 'Watch industry webinar',
    description: 'Optional webinar about emerging technology trends',
    dueDate: nextMonth.toISOString().split('T')[0],
    urgent: false,
    important: false,
    quadrant: 'DELETE',
    completed: false,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'demo-11',
    title: 'Organize desk drawer',
    description: 'Clean and organize personal workspace',
    urgent: false,
    important: false,
    quadrant: 'DELETE',
    completed: true,
    completedAt: now,
    createdAt: now,
    updatedAt: now,
  },
];