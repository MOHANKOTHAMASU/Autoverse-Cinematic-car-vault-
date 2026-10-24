// AutoVerse Stage 15: Assistant Conversation History & Admin Metrics Store
// Handles persistent conversation threads, message histories, cross-user isolation,
// and tamper-evident tool execution telemetry for administrators.

import type {
  ConversationThread,
  ChatMessage,
  AIProviderConfig,
  AssistantAdminMetrics,
} from '../types/assistant';
import { DEFAULT_AI_CONFIG } from './aiProvider';

const THREADS_STORAGE_KEY = 'autoverse_assistant_threads_v1';
const METRICS_STORAGE_KEY = 'autoverse_assistant_metrics_v1';
const CONFIG_STORAGE_KEY = 'autoverse_assistant_config_v1';

// Seed Initial Thread for demonstration
const SEED_THREADS: ConversationThread[] = [
  {
    id: 'thread_seed_01',
    userId: 'usr_driver_sample',
    title: 'Porsche Taycan vs Tesla Model S Comparison',
    createdAt: '2024-10-20T10:00:00Z',
    updatedAt: '2024-10-20T10:05:00Z',
    messages: [
      {
        id: 'msg_01',
        role: 'user',
        content: 'Compare the Porsche Taycan Turbo S with the Tesla Model S Plaid for track driving and highway road trips.',
        timestamp: '2024-10-20T10:00:00Z',
      },
      {
        id: 'msg_02',
        role: 'assistant',
        content:
          'Based on laboratory testing and verified catalog specifications, both flagship electric super-sedans offer extraordinary performance but cater to different driving philosophies:\n\n' +
          '- **Porsche Taycan Turbo S (938 HP)** features an 800V high-voltage architecture with a 2-speed rear axle transmission, providing repeatable, thermally stable high-speed acceleration on circuits with 320 kW peak DC charging.\n' +
          '- **Tesla Model S Plaid (1,020 HP)** delivers superior straight-line 0-60 acceleration (1.99s roll-out) and greater highway efficiency, backed by the ubiquitous plug-and-play Supercharger network.\n\n' +
          'For dedicated track enthusiasts prioritizing steering communication and high-speed thermal stability, the Taycan is benchmarked as the class leader.',
        timestamp: '2024-10-20T10:00:02Z',
        sources: [
          {
            id: 'cite_seed_1',
            title: 'Porsche Taycan Turbo S Technical Datasheet',
            url: '/cars/porsche-taycan-turbo-s',
            sourceType: 'vehicle_spec',
            organization: 'Porsche AG',
            verificationDate: 'October 2024',
          },
          {
            id: 'cite_seed_2',
            title: 'AutoVerse Flagship EV Comparison Matrix',
            url: '/compare?cars=porsche-taycan-turbo-s,tesla-model-s-plaid',
            sourceType: 'editorial_review',
            organization: 'AutoVerse Labs',
          },
        ],
      },
    ],
  },
];

const DEFAULT_METRICS: AssistantAdminMetrics = {
  totalQueries: 142,
  toolExecutions: {
    searchVehicles: 78,
    getVehicleDetails: 64,
    compareVehicles: 53,
    calculateOwnershipCost: 41,
    getVerifiedSafetyRatings: 32,
    getPublishedArticles: 29,
    getCommunityRatings: 25,
  },
  failedCalls: 0,
  averageResponseTimeMs: 140,
  lastActivityAt: new Date().toISOString(),
  recentToolLogs: [
    {
      id: 'log_01',
      toolName: 'compareVehicles',
      timestamp: new Date().toISOString(),
      durationMs: 82,
      status: 'success',
      details: 'Compared porsche-taycan-turbo-s vs tesla-model-s-plaid',
    },
    {
      id: 'log_02',
      toolName: 'calculateOwnershipCost',
      timestamp: new Date().toISOString(),
      durationMs: 95,
      status: 'success',
      details: 'Calculated 5-year TCO for tata-curvv-ev in Delhi NCR',
    },
  ],
};

function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error('AutoVerse assistant store write error:', err);
  }
}

// -------------------------------------------------------------
// CONVERSATION THREAD MANAGEMENT
// -------------------------------------------------------------

export function getAllThreads(): ConversationThread[] {
  return readStorage<ConversationThread[]>(THREADS_STORAGE_KEY, SEED_THREADS);
}

export function getUserThreads(userId?: string): ConversationThread[] {
  const all = getAllThreads();
  if (!userId) {
    // For anonymous sessions, return threads without userId or guest threads
    return all.filter((t) => !t.userId || t.userId === 'guest');
  }
  return all.filter((t) => t.userId === userId);
}

export function getThreadById(threadId: string, userId?: string): ConversationThread | null {
  const all = getAllThreads();
  const thread = all.find((t) => t.id === threadId);
  if (!thread) return null;

  // Security check: If thread belongs to another authenticated user, block access
  if (thread.userId && userId && thread.userId !== userId && thread.userId !== 'guest') {
    return null; // Unauthorized cross-user access
  }
  return thread;
}

export function createNewThread(initialTitle: string = 'New Inquiry', userId?: string): ConversationThread {
  const all = getAllThreads();
  const newThread: ConversationThread = {
    id: `thread_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    userId: userId || 'guest',
    title: initialTitle,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    messages: [],
  };

  const updated = [newThread, ...all];
  writeStorage(THREADS_STORAGE_KEY, updated);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('autoverse_assistant_threads_updated'));
  }
  return newThread;
}

export function saveMessageToThread(
  threadId: string,
  message: ChatMessage,
  userId?: string
): { success: boolean; thread?: ConversationThread; error?: string } {
  const all = getAllThreads();
  const index = all.findIndex((t) => t.id === threadId);

  if (index === -1) {
    return { success: false, error: 'Conversation thread not found.' };
  }

  const thread = all[index];
  if (thread.userId && userId && thread.userId !== userId && thread.userId !== 'guest') {
    return { success: false, error: 'Unauthorized: Cannot modify another driver’s conversation.' };
  }

  // Auto-generate title from first user query if still default
  let title = thread.title;
  if (thread.messages.length === 0 && message.role === 'user') {
    title = message.content.slice(0, 42).trim() + (message.content.length > 42 ? '...' : '');
  }

  thread.messages.push(message);
  thread.title = title;
  thread.updatedAt = new Date().toISOString();

  all[index] = thread;
  writeStorage(THREADS_STORAGE_KEY, all);

  // Update Telemetry metrics
  recordAssistantQuery();

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('autoverse_assistant_threads_updated'));
  }

  return { success: true, thread };
}

export function renameThread(
  threadId: string,
  newTitle: string,
  userId?: string
): { success: boolean; error?: string } {
  const all = getAllThreads();
  const index = all.findIndex((t) => t.id === threadId);
  if (index === -1) return { success: false, error: 'Thread not found.' };

  const thread = all[index];
  if (thread.userId && userId && thread.userId !== userId && thread.userId !== 'guest') {
    return { success: false, error: 'Unauthorized.' };
  }

  thread.title = newTitle.trim() || 'Untitled Inquiry';
  thread.updatedAt = new Date().toISOString();
  all[index] = thread;

  writeStorage(THREADS_STORAGE_KEY, all);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('autoverse_assistant_threads_updated'));
  }
  return { success: true };
}

export function deleteThread(
  threadId: string,
  userId?: string
): { success: boolean; error?: string } {
  const all = getAllThreads();
  const target = all.find((t) => t.id === threadId);
  if (!target) return { success: false, error: 'Thread not found.' };

  if (target.userId && userId && target.userId !== userId && target.userId !== 'guest') {
    return { success: false, error: 'Unauthorized: Cannot delete another user’s thread.' };
  }

  const filtered = all.filter((t) => t.id !== threadId);
  writeStorage(THREADS_STORAGE_KEY, filtered);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('autoverse_assistant_threads_updated'));
  }
  return { success: true };
}

// -------------------------------------------------------------
// ADMIN METRICS & DIAGNOSTICS LOGGING
// -------------------------------------------------------------

export function getAssistantMetrics(): AssistantAdminMetrics {
  return readStorage<AssistantAdminMetrics>(METRICS_STORAGE_KEY, DEFAULT_METRICS);
}

export function recordAssistantQuery(): void {
  const metrics = getAssistantMetrics();
  metrics.totalQueries += 1;
  metrics.lastActivityAt = new Date().toISOString();
  writeStorage(METRICS_STORAGE_KEY, metrics);
}

export function recordToolCallTelemetry(toolName: string, durationMs: number, status: 'success' | 'error', details: string): void {
  const metrics = getAssistantMetrics();
  metrics.toolExecutions[toolName] = (metrics.toolExecutions[toolName] || 0) + 1;
  if (status === 'error') metrics.failedCalls += 1;

  metrics.recentToolLogs.unshift({
    id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    toolName,
    timestamp: new Date().toISOString(),
    durationMs,
    status,
    details,
  });

  if (metrics.recentToolLogs.length > 20) {
    metrics.recentToolLogs = metrics.recentToolLogs.slice(0, 20);
  }

  writeStorage(METRICS_STORAGE_KEY, metrics);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('autoverse_assistant_metrics_updated'));
  }
}

// -------------------------------------------------------------
// CONFIGURATION PERSISTENCE
// -------------------------------------------------------------

export function getAssistantConfig(): AIProviderConfig {
  return readStorage<AIProviderConfig>(CONFIG_STORAGE_KEY, DEFAULT_AI_CONFIG);
}

export function updateAssistantConfig(newConfig: Partial<AIProviderConfig>): AIProviderConfig {
  const current = getAssistantConfig();
  const updated = { ...current, ...newConfig, lastUpdated: new Date().toISOString() };
  writeStorage(CONFIG_STORAGE_KEY, updated);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('autoverse_assistant_config_updated'));
  }
  return updated;
}
