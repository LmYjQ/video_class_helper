import React, { useState, useEffect } from 'react';
import { open } from '@tauri-apps/plugin-dialog';
import { readTextFile } from '@tauri-apps/plugin-fs';
import { useAppStore } from '../store';
import { parseSRT } from '../utils/srtParser';
import { AI_PLATFORMS, getModelsByPlatform } from '../services/ai';
import { AIPlatform } from '../types';

interface ToolbarProps {
  onVideoLoad: (path: string) => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({ onVideoLoad }) => {
  const { setSubtitles, aiPlatform, setAiPlatform, aiApiKey, setAiApiKey, aiModel, setAiModel } = useAppStore();

  const [showAISettings, setShowAISettings] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(aiApiKey);
  const [currentModels, setCurrentModels] = useState<{ id: string; name: string }[]>([]);

  // 当平台变化时，更新模型列表
  useEffect(() => {
    const models = getModelsByPlatform(aiPlatform);
    setCurrentModels(models);
    // 如果当前模型不在新平台的模型列表中，重置为默认
    if (!models.find(m => m.id === aiModel)) {
      setAiModel(models[0]?.id || '');
    }
  }, [aiPlatform]);

  // 加载视频文件
  const handleLoadVideo = async () => {
    const selected = await open({
      multiple: false,
      filters: [
        {
          name: 'Video',
          extensions: ['mp4', 'webm', 'mkv', 'avi', 'mov'],
        },
      ],
    });

    if (selected) {
      onVideoLoad(selected as string);
    }
  };

  // 加载字幕文件
  const handleLoadSubtitle = async () => {
    const selected = await open({
      multiple: false,
      filters: [
        {
          name: 'Subtitle',
          extensions: ['srt', 'txt'],
        },
      ],
    });

    if (selected) {
      try {
        const content = await readTextFile(selected as string);
        const subtitles = parseSRT(content);
        setSubtitles(subtitles, selected as string);
      } catch (error) {
        console.error('Failed to load subtitle:', error);
        alert('字幕文件解析失败');
      }
    }
  };

  // 保存API Key
  const handleSaveApiKey = () => {
    setAiApiKey(apiKeyInput);
    setShowAISettings(false);
  };

  // 平台选项
  const platforms = Object.entries(AI_PLATFORMS) as [AIPlatform, { name: string; icon: string }][];

  return (
    <div className="toolbar">
      <button className="toolbar-btn" onClick={handleLoadVideo}>
        📂 加载视频
      </button>
      <button className="toolbar-btn" onClick={handleLoadSubtitle}>
        📝 加载字幕
      </button>

      {/* 右侧AI设置 */}
      <div className="toolbar-ai-settings">
        <button
          className="toolbar-btn ai-settings-btn"
          onClick={() => setShowAISettings(!showAISettings)}
        >
          ⚙️ AI设置
        </button>

        {showAISettings && (
          <div className="ai-settings-dropdown">
            <div className="settings-row">
              <label>平台:</label>
              <select
                value={aiPlatform}
                onChange={(e) => setAiPlatform(e.target.value as AIPlatform)}
              >
                {platforms.map(([key, { name, icon }]) => (
                  <option key={key} value={key}>
                    {icon} {name}
                  </option>
                ))}
              </select>
            </div>

            <div className="settings-row">
              <label>模型:</label>
              <select
                value={aiModel}
                onChange={(e) => setAiModel(e.target.value)}
              >
                {currentModels.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="settings-row">
              <label>API Key:</label>
              <input
                type="password"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="输入API Key"
              />
            </div>

            <button
              className="save-btn"
              onClick={handleSaveApiKey}
              disabled={!apiKeyInput}
            >
              保存
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
