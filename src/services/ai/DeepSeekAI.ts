import { ChatMessage } from '../../types';
import { BaseAIProvider } from './BaseAI';
import { DeepSeekConfig, AIModel, AI_PLATFORMS, DEFAULT_MODELS } from './types';

/**
 * DeepSeek Provider 实现
 */
export class DeepSeekAI extends BaseAIProvider {
  id = 'deepseek';
  name = 'DeepSeek';
  icon = '📚';

  models: AIModel[] = [
    { id: 'deepseek-chat', name: 'DeepSeek Chat', provider: 'deepseek' },
    { id: 'deepseek-coder', name: 'DeepSeek Coder', provider: 'deepseek' },
  ];

  private baseUrl: string;

  constructor(config: DeepSeekConfig) {
    super();
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || AI_PLATFORMS.deepseek.baseUrl;
    this.model = config.model || DEFAULT_MODELS.deepseek;
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
      throw new Error(error.message || `API 请求失败: ${response.status}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  }
}
