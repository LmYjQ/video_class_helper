import { ChatMessage } from '../../types';

/**
 * AI Provider 接口
 * 支持扩展多个AI服务提供商
 */
export interface AIProvider {
  /** 提供商名称 */
  name: string;
  /** 可用模型列表 */
  models: string[];
  /** 发送对话请求 */
  chat(messages: ChatMessage[], model?: string): Promise<string>;
}

/** SiliconFlow API 配置 */
export interface SiliconFlowConfig {
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
