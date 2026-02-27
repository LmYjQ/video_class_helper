import { ChatMessage } from '../../types';
import { BaseAIProvider } from './BaseAI';
import { SiliconFlowConfig, AIModel, AI_PLATFORMS, DEFAULT_MODELS } from './types';

/**
 * SiliconFlow AI Provider 实现
 * 支持接入多种开源和闭源大模型
 */
export class SiliconFlowAI extends BaseAIProvider {
  id = 'siliconflow';
  name = 'SiliconFlow';
  icon = '🔥';

  models: AIModel[] = [
    { id: 'Qwen/Qwen2.5-7B-Instruct', name: 'Qwen 2.5 7B', provider: 'siliconflow' },
    { id: 'Qwen/Qwen2.5-14B-Instruct', name: 'Qwen 2.5 14B', provider: 'siliconflow' },
    { id: 'Qwen/Qwen2.5-32B-Instruct', name: 'Qwen 2.5 32B', provider: 'siliconflow' },
    { id: 'Qwen/Qwen3-8B', name: 'Qwen 3 8B', provider: 'siliconflow' },
    { id: 'deepseek-ai/DeepSeek-V2-Chat', name: 'DeepSeek V2', provider: 'siliconflow' },
    { id: 'deepseek-ai/DeepSeek-V3', name: 'DeepSeek V3', provider: 'siliconflow' },
    { id: 'THUDM/glm-4-9b-chat', name: 'GLM-4 9B', provider: 'siliconflow' },
    { id: 'THUDM/glm-4-flash', name: 'GLM-4 Flash', provider: 'siliconflow' },
    { id: 'microsoft/WizardLM-2-8x22B', name: 'WizardLM 2', provider: 'siliconflow' },
    { id: 'meta-llama/Llama-3.1-8B-Instruct', name: 'Llama 3.1 8B', provider: 'siliconflow' },
    { id: 'meta-llama/Llama-3.3-70B-Instruct', name: 'Llama 3.3 70B', provider: 'siliconflow' },
  ];

  private baseUrl: string;

  constructor(config: SiliconFlowConfig) {
    super();
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || AI_PLATFORMS.siliconflow.baseUrl;
    this.model = config.model || DEFAULT_MODELS.siliconflow;
  }

  protected buildUrl(path: string): string {
    return `${this.baseUrl}${path}`;
  }

  /**
   * 发送对话请求
   */
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
}
