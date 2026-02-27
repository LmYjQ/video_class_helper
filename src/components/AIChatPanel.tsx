import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../store';
import { createAIProvider, AI_PROMPTS, AIMode } from '../services/ai';
import { VideoSegmentsPanel } from './VideoSegmentsPanel';

// Tab 类型
type ChatTab = 'chat' | 'segments';

interface AIChatPanelProps {
  isEmbedded?: boolean;
}

export const AIChatPanel: React.FC<AIChatPanelProps> = ({ isEmbedded = false }) => {
  const {
    subtitles,
    chatMessages,
    addChatMessage,
    clearChatMessages,
    aiMode,
    setAIMode,
    aiApiKey,
    aiModel,
    aiPlatform,
    selectedSubtitleId,
  } = useAppStore();

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<ChatTab>('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 自动滚动到最新消息
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // 获取选中的字幕文本或全部字幕
  const getSubtitlesText = () => {
    if (selectedSubtitleId) {
      const selected = subtitles.find((s) => s.id === selectedSubtitleId);
      return selected?.text || '';
    }
    return subtitles.map((s) => s.text).join('\n');
  };

  // 发送消息
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    if (!aiApiKey) {
      alert('请先在右上角设置 API Key');
      return;
    }

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);

    // 添加用户消息
    addChatMessage({ role: 'user', content: userMessage });

    try {
      const ai = createAIProvider({ platform: aiPlatform, apiKey: aiApiKey, model: aiModel });

      // 构建消息列表
      const systemPrompt = AI_PROMPTS[aiMode] || '';
      const subtitlesText = getSubtitlesText();

      const messages = [
        {
          role: 'system' as const,
          content: '你是一个专业的学习助手，擅长总结、翻译和回答问题。',
        },
        ...(systemPrompt
          ? [{ role: 'user' as const, content: systemPrompt + '\n\n' + subtitlesText }]
          : [{ role: 'user' as const, content: subtitlesText + '\n\n问题：' + userMessage }]),
      ];

      const response = await ai.chat(messages, aiModel);
      addChatMessage({ role: 'assistant', content: response });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '请求失败';
      addChatMessage({
        role: 'assistant',
        content: `错误：${errorMessage}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 键盘提交
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // 预设操作
  const handlePreset = async (mode: AIMode) => {
    setAIMode(mode);

    if (!aiApiKey) {
      alert('请先在右上角设置 API Key');
      return;
    }

    if (subtitles.length === 0) {
      alert('请先加载字幕文件');
      return;
    }

    const prompts: Record<AIMode, string> = {
      summarize: '请总结这个视频字幕的核心内容',
      optimize: '请优化这些字幕的翻译',
      qa: '请回答以下问题',
    };

    setInput(prompts[mode]);
  };

  return (
    <div className={`ai-chat-panel ${isEmbedded ? 'embedded' : ''}`}>
      {/* Tab 切换 - 仅在非嵌入模式显示 */}
      {!isEmbedded && (
        <div className="chat-tabs">
          <button
            className={activeTab === 'chat' ? 'active' : ''}
            onClick={() => setActiveTab('chat')}
          >
            💬 AI对话
          </button>
          <button
            className={activeTab === 'segments' ? 'active' : ''}
            onClick={() => setActiveTab('segments')}
          >
            📑 视频分段
          </button>
        </div>
      )}

      {/* 分段面板 - 仅在非嵌入模式显示 */}
      {!isEmbedded && activeTab === 'segments' && <VideoSegmentsPanel />}

      {/* AI对话内容 */}
      {(isEmbedded || activeTab === 'chat') && (
        <div className="chat-content">
          {/* 模式选择 */}
          <div className="mode-buttons">
            <button
              className={aiMode === 'summarize' ? 'active' : ''}
              onClick={() => handlePreset('summarize')}
            >
              📝 总结
            </button>
            <button
              className={aiMode === 'optimize' ? 'active' : ''}
              onClick={() => handlePreset('optimize')}
            >
              ✨ 优化
            </button>
            <button
              className={aiMode === 'qa' ? 'active' : ''}
              onClick={() => handlePreset('qa')}
            >
              ❓ 问答
            </button>
            <button className="clear-btn" onClick={clearChatMessages}>
              清空
            </button>
          </div>

          {/* 消息列表 */}
          <div className="chat-messages">
            {chatMessages.length === 0 && (
              <div className="chat-empty">
                <p>选择模式并发送消息开始对话</p>
                <p className="hint">
                  提示：点击字幕可以针对特定内容提问
                </p>
              </div>
            )}
            {chatMessages.map((msg, index) => (
              <div key={index} className={`chat-message ${msg.role}`}>
                <div className="message-content">{msg.content}</div>
              </div>
            ))}
            {isLoading && (
              <div className="chat-message assistant loading">
                <div className="message-content">思考中...</div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* 输入框 */}
          <div className="chat-input">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                aiMode === 'qa'
                  ? '输入你的问题...'
                  : '点击上方按钮执行操作，或输入自定义指令...'
              }
              disabled={isLoading}
            />
            <button onClick={handleSend} disabled={isLoading || !input.trim()}>
              发送
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
