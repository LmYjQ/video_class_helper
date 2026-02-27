import { ChatMessage } from '../../types';
import { BaseAIProvider } from './BaseAI';
import { ZhipuConfig, AIModel, AI_PLATFORMS, DEFAULT_MODELS } from './types';

/**
 * 智谱AI (Zhipu) Provider 实现
 */
export class ZhipuAI extends BaseAIProvider {
  id = 'zhipu';
  name = '智谱AI';
  icon = '💎';

  models: AIModel[] = [
    { id: 'glm-4', name: 'GLM-4', provider: 'zhipu' },
    { id: 'glm-4-flash', name: 'GLM-4 Flash', provider: 'zhipu' },
    { id: 'glm-4-plus', name: 'GLM-4 Plus', provider: 'zhipu' },
    { id: 'glm-4-long', name: 'GLM-4 Long', provider: 'zhipu' },
    { id: 'glm-3-turbo', name: 'GLM-3 Turbo', provider: 'zhipu' },
  ];

  private baseUrl: string;

  constructor(config: ZhipuConfig) {
    super();
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || AI_PLATFORMS.zhipu.baseUrl;
    this.model = config.model || DEFAULT_MODELS.zhipu;
  }

  protected buildUrl(path: string): string {
    return `${this.baseUrl}${path}`;
  }

  async chat(messages: ChatMessage[], model?: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error('API Key 未设置');
    }

    const url = this.buildUrl('/chat/completions');
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
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error?.message || `API 请求失败: ${response.status}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  }
}
