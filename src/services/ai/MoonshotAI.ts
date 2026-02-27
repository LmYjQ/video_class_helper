import { ChatMessage } from '../../types';
import { BaseAIProvider } from './BaseAI';
import { MoonshotConfig, AIModel, AI_PLATFORMS, DEFAULT_MODELS } from './types';

/**
 * 月之暗面 (Moonshot) Provider 实现
 */
export class MoonshotAI extends BaseAIProvider {
  id = 'moonshot';
  name = '月之暗面';
  icon = '🌙';

  models: AIModel[] = [
    { id: 'moonshot-v1-8k', name: 'Moonshot V1 8K', provider: 'moonshot' },
    { id: 'moonshot-v1-32k', name: 'Moonshot V1 32K', provider: 'moonshot' },
    { id: 'moonshot-v1-128k', name: 'Moonshot V1 128K', provider: 'moonshot' },
  ];

  private baseUrl: string;

  constructor(config: MoonshotConfig) {
    super();
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || AI_PLATFORMS.moonshot.baseUrl;
    this.model = config.model || DEFAULT_MODELS.moonshot;
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
