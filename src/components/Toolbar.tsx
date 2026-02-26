import React from 'react';
import { open } from '@tauri-apps/plugin-dialog';
import { readTextFile } from '@tauri-apps/plugin-fs';
import { useAppStore } from '../store';
import { parseSRT } from '../utils/srtParser';

interface ToolbarProps {
  onVideoLoad: (path: string) => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({ onVideoLoad }) => {
  const { setSubtitles } = useAppStore();

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
        setSubtitles(subtitles);
      } catch (error) {
        console.error('Failed to load subtitle:', error);
        alert('字幕文件解析失败');
      }
    }
  };

  return (
    <div className="toolbar">
      <button className="toolbar-btn" onClick={handleLoadVideo}>
        📂 加载视频
      </button>
      <button className="toolbar-btn" onClick={handleLoadSubtitle}>
        📝 加载字幕
      </button>
    </div>
  );
};
