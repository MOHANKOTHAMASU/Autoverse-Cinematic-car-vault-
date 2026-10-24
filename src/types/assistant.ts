// AutoVerse Stage 15: Smart AI Automotive Assistant Data Contracts
// Defines message models, tool calling schemas, citation types, and conversation state

export type MessageRole = 'user' | 'assistant' | 'system' | 'tool';

export type CitationSourceType =
  | 'vehicle_spec'
  | 'safety_rating'
  | 'editorial_review'
  | 'tco_calculator'
  | 'community_review'
  | 'launch_dossier'
  | 'charging_network'
  | 'safety_intelligence'
  | 'market_intelligence';

export interface AssistantCitation {
  id: string;
  title: string;
  url: string;
  sourceType: CitationSourceType;
  vehicleSlug?: string;
  organization?: string;
  verificationDate?: string;
  snippet?: string;
}

export interface ToolCallRecord {
  id: string;
  name: string;
  args: Record<string, any>;
  resultSummary: string;
  status: 'success' | 'error';
  durationMs: number;
}

export interface RecommendedVehicleCard {
  slug: string;
  brand: string;
  model: string;
  variant: string;
  price: number;
  currency: string;
  horsepower: number;
  electricRangeMiles?: number;
  electricRangeKm?: number;
  powertrain: string;
  bodyType: string;
  thumbnail: string;
  matchScore: number;
  primaryReason: string;
  tradeOffs: string[];
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
  toolCalls?: ToolCallRecord[];
  sources?: AssistantCitation[];
  recommendedVehicles?: RecommendedVehicleCard[];
  suggestedFollowUps?: string[];
  isStreaming?: boolean;
  error?: string;
}

export interface ConversationThread {
  id: string;
  userId?: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
  isPinned?: boolean;
}

export type AIProviderType = 'gemini' | 'openai' | 'anthropic' | 'autoverse_neural';

export interface AIProviderConfig {
  provider: AIProviderType;
  modelName: string;
  isConfigured: boolean;
  apiKeyMasked?: string;
  temperature: number;
  maxTokens: number;
  rateLimitPerMinute: number;
  timeoutMs: number;
  systemPromptVersion: string;
  lastUpdated?: string;
}

export interface AssistantAdminMetrics {
  totalQueries: number;
  toolExecutions: Record<string, number>;
  failedCalls: number;
  averageResponseTimeMs: number;
  lastActivityAt: string;
  recentToolLogs: {
    id: string;
    toolName: string;
    timestamp: string;
    durationMs: number;
    status: 'success' | 'error';
    details: string;
  }[];
}
