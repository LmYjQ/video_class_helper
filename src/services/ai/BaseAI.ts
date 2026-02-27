import { ChatMessage } from '../../types';
import { AIProvider, AIModel } from './types';

/**
 * 抽象基类 - 所有AI Provider的基类
 */
export abstract class BaseAIProvider implements AIProvider {
  abstract id: string;
  abstract name: string;
  abstract icon: string;
  abstract models: AIModel[];

  protected apiKey: string = '';
  protected model: string = '';

  abstract chat(messages: ChatMessage[], model?: string): Promise<string>;

  setApiKey(key: string): void {
    this.apiKey = key;
  }

  getApiKey(): string {
    return this.apiKey;
  }

  setModel(model: string): void {
    this.model = model;
  }

  getModel(): string {
    return this.model;
  }

  protected getHeaders(): Record<string, string> {
    return {};
  }
}
