export type AiRole = 'PROJECT_MANAGER' | 'ARCHITECT' | 'RESEARCHER' | 'ENGINEER' | 'REVIEWER' | 'TESTER' | 'SECURITY';
export type AiProvider = 'openai' | 'anthropic' | 'google' | 'deepseek';

export interface Task {
  id: string;
  description: string;
  role: AiRole;
  provider: AiProvider;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: string;
}

export interface OrchestrationStep {
  type: 'analyzing' | 'task_assigned' | 'task_completed' | 'final_response' | 'error' | 'status_update';
  message: string;
  payload?: any;
}

export class WebOrchestrator {
  private apiKeys: Record<string, string>;

  // Dynamic API URL for production deployment
  private apiUrl: string = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/orchestrate';

  constructor(keys: Record<string, string>) {
    this.apiKeys = keys;
  }

  async processRequest(request: string, onStep: (step: OrchestrationStep) => void) {
    try {
      onStep({ type: 'analyzing', message: 'Project Manager is formulating a project plan...' });

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ request, apiKeys: this.apiKeys })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Server orchestration failed');
      }

      const data = await response.json();
      data.tasks.forEach((task: Task) => {
        onStep({ type: 'task_assigned', message: `Assigned ${task.role}`, payload: task });
        onStep({ type: 'task_completed', message: `${task.role} finished artifact`, payload: task });
      });

      onStep({ type: 'final_response', message: 'Orchestration complete.', payload: data.finalResponse });
    } catch (error: any) {
      onStep({ type: 'error', message: error.message });
    }
  }
}
