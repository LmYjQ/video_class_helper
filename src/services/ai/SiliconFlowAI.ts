import { AIProvider, SiliconFlowConfig } from './types';
import { ChatMessage } from '../../types';

/**
 * SiliconFlow AI Provider 实现
 * 支持接入多种开源和闭源大模型
 */
export class SiliconFlowAI implements AIProvider {
  name = 'SiliconFlow';
  private apiKey: string;
  private baseUrl: string;
  private model: string;

  // 可用模型列表
  models = [
    'Qwen/Qwen2.5-7B-Instruct',
    'Qwen/Qwen2.5-14B-Instruct',
    'Qwen/Qwen2.5-32B-Instruct',
    'deepseek-ai/DeepSeek-V2-Chat',
    'THUDM/glm-4-9b-chat',
    'microsoft/WizardLM-2-8x22B',
  ];

  constructor(config: SiliconFlowConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || 'https://api.siliconflow.cn/v1';
    this.model = config.model || 'Qwen/Qwen2.5-7B-Instruct';
  }

  /**
   * 发送对话请求
   */
  async chat(messages: ChatMessage[], model?: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error('API Key 未设置');
    }

    const url = `${this.baseUrl}/chat/completions`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: model || this.model,
        messages: messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        stream: false,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `API 请求失败: ${response.status}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  }

  /**
   * 设置 API Key
   */
  setApiKey(key: string): void {
    this.apiKey = key;
  }

  /**
   * 设置模型
   */
  setModel(model: string): void {
    this.model = model;
  }
}

// 单例实例
let instance: SiliconFlowAI | null = null;

export function getSiliconFlowAI(apiKey?: string): SiliconFlowAI {
  if (!instance && apiKey) {
    instance = new SiliconFlowAI({ apiKey });
  } else if (instance && apiKey) {
    instance.setApiKey(apiKey);
  }
  return instance!;
}
