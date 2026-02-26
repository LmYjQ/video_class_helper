import React, { useRef, useEffect } from 'react';
import ReactPlayer from 'react-player';
import { convertFileSrc } from '@tauri-apps/api/core';
import { useAppStore } from '../store';

interface VideoPlayerProps {
  videoPath: string | null;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoPath }) => {
  const playerRef = useRef<ReactPlayer>(null);
  const { setCurrentTime, setIsPlaying, currentTime, subtitles } = useAppStore();

  // 处理播放进度
  const handleProgress = (state: { playedSeconds: number }) => {
    setCurrentTime(state.playedSeconds);
  };

  // 处理播放状态变化
  const handlePlay = () => setIsPlaying(true);
  const handlePause = () => setIsPlaying(false);

  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!playerRef.current) return;

      // 忽略在输入框中的快捷键
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (e.key) {
        case ' ':
          e.preventDefault();
          // 空格键切换播放状态
          break;
        case 'ArrowLeft':
          e.preventDefault();
          playerRef.current.seekTo(Math.max(0, currentTime - 10), 'seconds');
          break;
        case 'ArrowRight':
          e.preventDefault();
          playerRef.current.seekTo(currentTime + 10, 'seconds');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentTime]);

  // 转换文件路径为 Tauri 可用的 URL
  const videoUrl = videoPath ? convertFileSrc(videoPath) : null;

  if (!videoUrl) {
    return (
      <div className="video-placeholder">
        <div className="placeholder-content">
          <span className="placeholder-icon">🎬</span>
          <p>请先加载视频文件</p>
          <p className="placeholder-hint">点击上方工具栏的"加载视频"按钮</p>
        </div>
      </div>
    );
  }

  return (
    <div className="video-player">
      <ReactPlayer
        ref={playerRef}
        url={videoUrl}
        width="100%"
        height="100%"
        controls
        playing={false}
        onProgress={handleProgress}
        onPlay={handlePlay}
        onPause={handlePause}
        progressInterval={500}
      />
    </div>
  );
};

// 导出 seekTo 函数供外部调用
export const seekToVideo = (seconds: number) => {
  // 这个函数会在 SubtitlePanel 中通过 ref 调用
};
