import { AIProvider, AIPlatform, AIPlatformConfig, AIModel } from './types';
import { SiliconFlowAI } from './SiliconFlowAI';
import { OpenAIProvider } from './OpenAI';
import { DeepSeekAI } from './DeepSeekAI';
import { ZhipuAI } from './ZhipuAI';
import { MoonshotAI } from './MoonshotAI';

/**
 * AI Provider 工厂函数
 * 根据平台类型创建对应的AI Provider实例
 */
export function createAIProvider(config: AIPlatformConfig): AIProvider {
  switch (config.platform) {
    case 'siliconflow':
      return new SiliconFlowAI({ apiKey: config.apiKey, baseUrl: config.baseUrl, model: config.model });
    case 'openai':
      return new OpenAIProvider({ apiKey: config.apiKey, baseUrl: config.baseUrl, model: config.model });
    case 'deepseek':
      return new DeepSeekAI({ apiKey: config.apiKey, baseUrl: config.baseUrl, model: config.model });
    case 'zhipu':
      return new ZhipuAI({ apiKey: config.apiKey, baseUrl: config.baseUrl, model: config.model });
    case 'moonshot':
      return new MoonshotAI({ apiKey: config.apiKey, baseUrl: config.baseUrl, model: config.model });
    default:
      throw new Error(`不支持的平台: ${config.platform}`);
  }
}

/**
 * 获取所有平台的模型列表
 */
export function getAllModels(): AIModel[] {
  const models: AIModel[] = [];

  // SiliconFlow
  const sf = new SiliconFlowAI({ apiKey: '' });
  models.push(...sf.models);

  // OpenAI
  const openai = new OpenAIProvider({ apiKey: '' });
  models.push(...openai.models);


  // DeepSeek
  const deepseek = new DeepSeekAI({ apiKey: '' });
  models.push(...deepseek.models);

  // Zhipu
  const zhipu = new ZhipuAI({ apiKey: '' });
  models.push(...zhipu.models);

  // Moonshot
  const moonshot = new MoonshotAI({ apiKey: '' });
  models.push(...moonshot.models);

  return models;
}

/**
 * 获取某平台的所有模型
 */
export function getModelsByPlatform(platform: AIPlatform): AIModel[] {
  try {
    const provider = createAIProvider({ platform, apiKey: '' });
    return provider.models;
  } catch {
    return [];
  }
}

// 导出所有Provider类
export { SiliconFlowAI } from './SiliconFlowAI';
export { OpenAIProvider } from './OpenAI';
export { DeepSeekAI } from './DeepSeekAI';
export { ZhipuAI } from './ZhipuAI';
export { MoonshotAI } from './MoonshotAI';
