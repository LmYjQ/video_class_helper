import { ChatMessage } from '../../types';
import { BaseAIProvider } from './BaseAI';
import { OpenAIConfig, AIModel, AI_PLATFORMS, DEFAULT_MODELS } from './types';

/**
 * OpenAI Provider 实现
 */
export class OpenAIProvider extends BaseAIProvider {
  id = 'openai';
  name = 'OpenAI';
  icon = '🤖';

  models: AIModel[] = [
    { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai' },
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openai' },
    { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'openai' },
    { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'openai' },
  ];

  private baseUrl: string;

  constructor(config: OpenAIConfig) {
    super();
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || AI_PLATFORMS.openai.baseUrl;
    this.model = config.model || DEFAULT_MODELS.openai;
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
