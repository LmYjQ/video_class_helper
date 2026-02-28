import React, { useState, useEffect } from 'react';
import { useAppStore, seekVideo } from '../store';
import { createAIProvider } from '../services/ai';
import { formatTime } from '../utils/timeFormat';
import { readTextFile, writeTextFile } from '@tauri-apps/plugin-fs';

// 根据字幕路径生成分段文件路径
const getSegmentsFilePath = (subtitlePath: string): string => {
  // 将 .srt 替换为 .segments.json
  return subtitlePath.replace(/\.(srt|txt)$/i, '.segments.json');
};

// 格式化字幕文本，包含时间信息
const formatSubtitlesWithTime = (subtitles: { startTime: number; endTime: number; text: string }[]) => {
  return subtitles.map((s) => {
    const start = formatTime(s.startTime);
    const end = formatTime(s.endTime);
    return `[${start} -> ${end}] ${s.text}`;
  }).join('\n');
};

// 解析时间字符串为秒数
const parseTimeToSeconds = (timeStr: string): number => {
  const parts = timeStr.split(':');
  if (parts.length === 3) {
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    const seconds = parseFloat(parts[2]);
    return hours * 3600 + minutes * 60 + seconds;
  } else if (parts.length === 2) {
    const minutes = parseInt(parts[0], 10);
    const seconds = parseFloat(parts[1]);
    return minutes * 60 + seconds;
  }
  return 0;
};

export const VideoSegmentsPanel: React.FC = () => {
  const {
    subtitles,
    subtitlePath,
    videoSegments,
    setVideoSegments,
    segmentPrompt,
    setSegmentPrompt,
    aiApiKey,
    aiModel,
    aiPlatform,
  } = useAppStore();

  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditingPrompt, setIsEditingPrompt] = useState(false);
  const [tempPrompt, setTempPrompt] = useState(segmentPrompt);

  // 加载字幕时自动加载分段文件
  useEffect(() => {
    const loadSegments = async () => {
      if (subtitlePath) {
        try {
          const segmentsPath = getSegmentsFilePath(subtitlePath);
          const content = await readTextFile(segmentsPath);
          const segments = JSON.parse(content);
          setVideoSegments(segments);
        } catch {
          // 文件不存在或解析失败，忽略
        }
      }
    };
    loadSegments();
  }, [subtitlePath, setVideoSegments]);

  // 保存分段到文件
  const saveSegmentsToFile = async (segments: typeof videoSegments) => {
    if (subtitlePath && segments.length > 0) {
      try {
        const segmentsPath = getSegmentsFilePath(subtitlePath);
        await writeTextFile(segmentsPath, JSON.stringify(segments, null, 2));
      } catch (error) {
        console.error('保存分段失败:', error);
      }
    }
  };

  // 生成视频分段
  const handleGenerateSegments = async () => {
    if (!aiApiKey) {
      alert('请先设置 API Key');
      return;
    }

    if (subtitles.length === 0) {
      alert('请先加载字幕文件');
      return;
    }

    setIsGenerating(true);

    try {
      const ai = createAIProvider({ platform: aiPlatform, apiKey: aiApiKey, model: aiModel });
      const subtitlesText = formatSubtitlesWithTime(subtitles);

      // 获取视频总时长
      const totalDuration = subtitles.length > 0
        ? subtitles[subtitles.length - 1].endTime
        : 0;

      const messages = [
        {
          role: 'system' as const,
          content: '你是一个视频内容分析助手，擅长将视频内容分段并总结。请根据字幕的时间戳来确定每个分段的具体时间，确保覆盖整个视频。',
        },
        {
          role: 'user' as const,
          content: `${segmentPrompt}\n\n视频总时长：${formatTime(totalDuration)}\n\n字幕内容：\n${subtitlesText}`,
        },
      ];

      const response = await ai.chat(messages, aiModel);

      // 解析 JSON 响应
      try {
        // 尝试提取 JSON 数组
        const jsonMatch = response.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const segments = JSON.parse(jsonMatch[0]);
          const parsedSegments = segments.map((seg: any, index: number) => ({
            id: index,
            title: seg.title || '未命名分段',
            startTime: parseTimeToSeconds(seg.startTime || '0'),
            endTime: parseTimeToSeconds(seg.endTime || '0'),
            summary: seg.summary || '',
          }));
          setVideoSegments(parsedSegments);
          await saveSegmentsToFile(parsedSegments);
        } else {
          alert('无法解析AI返回的分段结果');
        }
      } catch (parseError) {
        console.error('解析分段结果失败:', parseError);
        alert('解析分段结果失败，请检查返回格式');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '请求失败';
      alert(`生成失败：${errorMessage}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // 保存 prompt
  const handleSavePrompt = () => {
    setSegmentPrompt(tempPrompt);
    setIsEditingPrompt(false);
  };

  // 点击分段跳转
  const handleSegmentClick = (startTime: number) => {
    seekVideo(startTime);
  };

  return (
    <div className="video-segments-panel">
      {/* 分段工具栏 */}
      <div className="segments-toolbar">
        <button
          className="generate-btn"
          onClick={handleGenerateSegments}
          disabled={isGenerating || subtitles.length === 0 || !aiApiKey}
        >
          {isGenerating ? '生成中...' : '📑 生成分段'}
        </button>
        <button
          className="edit-prompt-btn"
          onClick={() => {
            if (isEditingPrompt) {
              handleSavePrompt();
            } else {
              setIsEditingPrompt(true);
            }
          }}
        >
          {isEditingPrompt ? '保存' : '✏️ 编辑Prompt'}
        </button>
      </div>

      {/* Prompt 编辑区域 */}
      {isEditingPrompt && (
        <div className="prompt-editor">
          <textarea
            value={tempPrompt}
            onChange={(e) => setTempPrompt(e.target.value)}
            placeholder="输入自定义的 prompt..."
            rows={4}
          />
        </div>
      )}

      {/* 分段列表 */}
      <div className="segments-list">
        {videoSegments.length === 0 ? (
          <div className="segments-empty">
            <p>暂无分段</p>
            <p className="hint">点击"生成分段"按钮根据字幕内容自动生成视频分段</p>
          </div>
        ) : (
          videoSegments.map((segment) => (
            <div
              key={segment.id}
              className="segment-item"
              onClick={() => handleSegmentClick(segment.startTime)}
            >
              <div className="segment-header">
                <span className="segment-title">{segment.title}</span>
                <span className="segment-time">
                  {formatTime(segment.startTime)} - {formatTime(segment.endTime)}
                </span>
              </div>
              <div className="segment-summary">{segment.summary}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
