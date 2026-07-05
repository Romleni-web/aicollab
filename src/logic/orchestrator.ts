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

/**
 * PRODUCTION ORCHESTRATOR
 * Now proxies all requests through a secure backend to prevent key exposure
 * and enable robust JSON parsing/validation.
 */
export class WebOrchestrator {
  private apiKeys: Record<string, string>;
  private apiUrl: string = 'http://localhost:3001/api/orchestrate';

  constructor(keys: Record<string, string>) {
    this.apiKeys = keys;
  }

  async processRequest(request: string, onStep: (step: OrchestrationStep) => void) {
    try {
      onStep({ type: 'analyzing', message: 'Project Manager is formulating a project plan (Production Mode)...' });

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

      // Emit steps for the tasks that were completed in parallel on the backend
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
