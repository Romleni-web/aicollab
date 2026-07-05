import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { z } from 'zod';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

const app = express();

// Adjust Helmet for local development to prevent CSP blocks
app.use(helmet({
  contentSecurityPolicy: false,
}));

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

// Root route to prevent 404
app.get('/', (req, res) => {
  res.json({ status: 'Orchestrator API is Online', version: '1.0.0' });
});

const TaskSchema = z.object({
  id: z.string(),
  description: z.string(),
  role: z.enum(['ARCHITECT', 'RESEARCHER', 'ENGINEER', 'REVIEWER', 'TESTER', 'SECURITY']),
  provider: z.enum(['openai', 'anthropic', 'google', 'deepseek']),
});

const PlanSchema = z.array(TaskSchema);

app.post('/api/orchestrate', async (req, res) => {
  const { request, apiKeys } = req.body;

  if (!apiKeys || !apiKeys.openai) {
    return res.status(400).json({ error: 'OpenAI API key is required in Settings.' });
  }

  try {
    const openai = new OpenAI({ apiKey: apiKeys.openai });

    // 1. PLANNING
    const planResponse = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are a Project Manager. Break the user request into 2 specialized tasks. Return ONLY a JSON array: [{"id":"1","description":"...","role":"ENGINEER","provider":"openai"}]' },
        { role: 'user', content: request }
      ],
      response_format: { type: 'json_object' }
    });

    const rawContent = planResponse.choices[0].message.content || '{"tasks":[]}';
    const parsed = JSON.parse(rawContent);
    const tasks = PlanSchema.parse(Array.isArray(parsed) ? parsed : (parsed.tasks || []));

    // 2. EXECUTION
    const executionPromises = tasks.map(async (task) => {
      try {
        if (task.provider === 'openai') {
          const client = new OpenAI({ apiKey: apiKeys.openai });
          const response = await client.chat.completions.create({
            model: 'gpt-4o',
            messages: [{ role: 'user', content: `Task: ${task.description}. Context: ${request}` }]
          });
          return { ...task, result: response.choices[0].message.content, status: 'completed' };
        }
        return { ...task, result: 'Provider not configured', status: 'failed' };
      } catch (err: any) {
        return { ...task, result: err.message, status: 'failed' };
      }
    });

    const completedTasks = await Promise.all(executionPromises);
    const successfulResults = completedTasks.filter(t => t.status === 'completed').map(t => t.result);

    // 3. SYNTHESIS
    const synthesis = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: `Merge results for "${request}":\n\n${successfulResults.join('\n\n')}` }]
    });

    res.json({
      finalResponse: synthesis.choices[0].message.content,
      tasks: completedTasks
    });

  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
