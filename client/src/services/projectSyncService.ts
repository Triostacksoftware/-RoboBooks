// Service to sync project detail data with main application pages
export class ProjectSyncService {
  private static instance: ProjectSyncService;
  private listeners: Map<string, Function[]> = new Map();

  private constructor() {}

  static getInstance(): ProjectSyncService {
    if (!ProjectSyncService.instance) {
      ProjectSyncService.instance = new ProjectSyncService();
    }
    return ProjectSyncService.instance;
  }

  // Subscribe to data changes
  subscribe(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  // Unsubscribe from data changes
  unsubscribe(event: string, callback: Function) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event)!;
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  // Emit data changes to all subscribers
  emit(event: string, data: any) {
    if (this.listeners.has(event)) {
      this.listeners.get(event)!.forEach(callback => callback(data));
    }
  }

  // Sync invoice data
  syncInvoice(invoice: any, projectId: string) {
    this.emit('invoice:created', { invoice, projectId });
    this.emit('project:updated', { projectId, type: 'invoice', data: invoice });
  }

  // Sync expense data
  syncExpense(expense: any, projectId: string) {
    this.emit('expense:created', { expense, projectId });
    this.emit('project:updated', { projectId, type: 'expense', data: expense });
  }

  // Sync time entry data
  syncTimeEntry(timeEntry: any, projectId: string) {
    this.emit('timeEntry:created', { timeEntry, projectId });
    this.emit('project:updated', { projectId, type: 'timeEntry', data: timeEntry });
  }

  // Sync team member data
  syncTeamMember(member: any, projectId: string) {
    this.emit('teamMember:created', { member, projectId });
    this.emit('project:updated', { projectId, type: 'teamMember', data: member });
  }

  // Update project statistics
  updateProjectStats(projectId: string, stats: any) {
    this.emit('project:stats:updated', { projectId, stats });
  }
}

// Export singleton instance
export const projectSyncService = ProjectSyncService.getInstance();

// Event types for type safety
export type ProjectSyncEvent = 
  | 'invoice:created'
  | 'expense:created'
  | 'timeEntry:created'
  | 'teamMember:created'
  | 'project:updated'
  | 'project:stats:updated';

// Hook for using the sync service in React components
export function useProjectSync() {
  return {
    subscribe: projectSyncService.subscribe.bind(projectSyncService),
    unsubscribe: projectSyncService.unsubscribe.bind(projectSyncService),
    syncInvoice: projectSyncService.syncInvoice.bind(projectSyncService),
    syncExpense: projectSyncService.syncExpense.bind(projectSyncService),
    syncTimeEntry: projectSyncService.syncTimeEntry.bind(projectSyncService),
    syncTeamMember: projectSyncService.syncTeamMember.bind(projectSyncService),
    updateProjectStats: projectSyncService.updateProjectStats.bind(projectSyncService),
  };
}
