/**
 * AI Index - Exports for all AI providers and engine
 */

export { BuiltinAIProvider } from './BuiltinAIProvider';
export { AIRecommendationEngine } from './AIRecommendationEngine';

// Providers
export type { AIProvider, AIInsight, AIAnalysisContext } from './providers/AIProvider';
export { Prioridade, RecommendationStatus } from './providers/AIProvider';

export { OpenAIProvider } from './providers/OpenAIProvider';
export { ClaudeProvider } from './providers/ClaudeProvider';
export { GeminiProvider } from './providers/GeminiProvider';
