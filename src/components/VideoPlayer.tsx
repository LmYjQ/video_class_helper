import React, { useRef, useEffect } from 'react';
import { convertFileSrc } from '@tauri-apps/api/core';
import { useAppStore, setVideoElement } from '../store';

interface VideoPlayerProps {
  videoPath: string | null;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoPath }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { setCurrentTime, setIsPlaying, currentTime } = useAppStore();

  // 转换文件路径为 Tauri 可用的 URL
  const videoUrl = videoPath ? convertFileSrc(videoPath) : null;

  // 将 video 元素注册到 store
  useEffect(() => {
    if (videoRef.current) {
      setVideoElement(videoRef.current);
    }
    return () => setVideoElement(null);
  }, []);

  // 处理播放进度
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  // 处理播放状态变化
  const handlePlay = () => setIsPlaying(true);
  const handlePause = () => setIsPlaying(false);

  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!videoRef.current) return;

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
          if (videoRef.current?.paused) {
            videoRef.current.play();
          } else {
            videoRef.current?.pause();
          }
          break;
        case 'ArrowLeft':
          e.preventDefault();
          videoRef.current!.currentTime = Math.max(0, currentTime - 10);
          break;
        case 'ArrowRight':
          e.preventDefault();
          videoRef.current!.currentTime = currentTime + 10;
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentTime]);

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
      <video
        ref={videoRef}
        src={videoUrl}
        controls
        onTimeUpdate={handleTimeUpdate}
        onPlay={handlePlay}
        onPause={handlePause}
      />
    </div>
  );
};
