import { ChatMessage, AIMode } from '../../types';

// 导出 AIMode 类型
export type { AIMode };

/**
 * AI Provider 接口
 * 所有AI服务提供商都需要实现此接口
 */
export interface AIProvider {
  /** 提供商唯一标识 */
  id: string;
  /** 提供商名称 */
  name: string;
  /** 提供商图标/emoji */
  icon: string;
  /** 可用模型列表 */
  models: AIModel[];
  /** 发送对话请求 */
  chat(messages: ChatMessage[], model?: string): Promise<string>;
  /** 设置 API Key */
  setApiKey(key: string): void;
  /** 获取当前 API Key */
  getApiKey(): string;
  /** 设置模型 */
  setModel(model: string): void;
  /** 获取当前模型 */
  getModel(): string;
}

/**
 * AI 模型信息
 */
export interface AIModel {
  id: string;
  name: string;
  provider: string;
}

/**
 * AI 平台类型
 */
export type AIPlatform = 'siliconflow' | 'openai' | 'deepseek' | 'zhipu' | 'moonshot';

/**
 * AI 平台配置
 */
export interface AIPlatformConfig {
  platform: AIPlatform;
  apiKey: string;
  baseUrl?: string;
  model?: string;
}

/**
 * SiliconFlow API 配置
 */
export interface SiliconFlowConfig {
  apiKey: string;
  baseUrl?: string;
  model?: string;
}

/**
 * OpenAI API 配置
 */
export interface OpenAIConfig {
  apiKey: string;
  baseUrl?: string;
  model?: string;
}

/**
 * Anthropic API 配置
 */
export interface AnthropicConfig {
  apiKey: string;
  baseUrl?: string;
  model?: string;
}

/**
 * DeepSeek API 配置
 */
export interface DeepSeekConfig {
  apiKey: string;
  baseUrl?: string;
  model?: string;
}

/**
 * 智谱AI 配置
 */
export interface ZhipuConfig {
  apiKey: string;
  baseUrl?: string;
  model?: string;
}

/**
 * 月之暗面(Moonshot) 配置
 */
export interface MoonshotConfig {
  apiKey: string;
  baseUrl?: string;
  model?: string;
}

/** 预设提示词 */
export const AI_PROMPTS = {
  summarize: `请用简洁的语言总结以下字幕内容的核心要点，包括主题、关键信息和结论。`,
  optimize: `请优化以下字幕的翻译/文本，使其更通顺自然，符合目标语言的表达习惯。`,
  qa: '',
};

/**
 * 平台定义
 */
export const AI_PLATFORMS: Record<AIPlatform, { name: string; icon: string; baseUrl: string }> = {
  siliconflow: {
    name: 'SiliconFlow',
    icon: '🔥',
    baseUrl: 'https://api.siliconflow.cn/v1',
  },
  openai: {
    name: 'OpenAI',
    icon: '🤖',
    baseUrl: 'https://api.openai.com/v1',
  },
  deepseek: {
    name: 'DeepSeek',
    icon: '📚',
    baseUrl: 'https://api.deepseek.com/v1',
  },
  zhipu: {
    name: '智谱AI',
    icon: '💎',
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
  },
  moonshot: {
    name: '月之暗面',
    icon: '🌙',
    baseUrl: 'https://api.moonshot.cn/v1',
  },
};

/**
 * 默认模型映射
 */
export const DEFAULT_MODELS: Record<AIPlatform, string> = {
  siliconflow: 'Qwen/Qwen2.5-7B-Instruct',
  openai: 'gpt-4o-mini',
  deepseek: 'deepseek-chat',
  zhipu: 'glm-4-flash',
  moonshot: 'moonshot-v1-8k',
};
