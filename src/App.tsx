import React, { useRef, useCallback, useEffect } from 'react';
import { convertFileSrc } from '@tauri-apps/api/core';
import {
  Toolbar,
  SubtitlePanel,
  AIChatPanel,
  MarkdownPanel,
} from './components';
import { useAppStore, setVideoElement, seekVideo } from './store';
import './App.css';

function App() {
  const { videoPath, bottomPanelMode, setVideoPath } = useAppStore();

  // 处理视频加载
  const handleVideoLoad = useCallback((path: string) => {
    // 从路径中提取文件名
    const name = path.split(/[/\\]/).pop() || 'video';
    // 对路径进行编码处理
    const encodedPath = path.replace(/\\/g, '/').replace(/:/g, '%3A');
    console.log('Video path:', path);
    console.log('Video encoded path:', encodedPath);
    console.log('Video URL:', convertFileSrc(path));
    setVideoPath(path, name);
  }, [setVideoPath]);

  // 处理字幕跳转
  const handleSeek = useCallback((time: number) => {
    seekVideo(time);
  }, []);

  // 转换视频路径
  const videoUrl = videoPath ? convertFileSrc(videoPath) : null;

  return (
    <div className="app">
      {/* 顶部工具栏 */}
      <Toolbar onVideoLoad={handleVideoLoad} />

      {/* 主内容区域 */}
      <div className="main-content">
        {/* 左侧视频区域 */}
        <div className="video-section">
          <VideoPlayerWithRef videoUrl={videoUrl} />
        </div>

        {/* 右侧字幕区域 */}
        <div className="subtitle-section">
          <SubtitlePanel onSeek={handleSeek} />
        </div>
      </div>

      {/* 底部面板 */}
      {bottomPanelMode !== 'hidden' && (
        <div className="bottom-panel">
          <div className="bottom-panel-header">
            <span>
              {bottomPanelMode === 'ai' ? '🤖 AI 对话' : '📓 学习笔记'}
            </span>
            <button
              className="close-btn"
              onClick={() => useAppStore.getState().setBottomPanelMode('hidden')}
            >
              ✕
            </button>
          </div>
          <div className="bottom-panel-content">
            {bottomPanelMode === 'ai' && <AIChatPanel />}
            {bottomPanelMode === 'notes' && <MarkdownPanel />}
          </div>
        </div>
      )}
    </div>
  );
}

// 包装 VideoPlayer 以支持 ref
interface VideoPlayerWithRefProps {
  videoUrl: string | null;
}

const VideoPlayerWithRef: React.FC<VideoPlayerWithRefProps> = ({
  videoUrl,
}) => {
  const { setCurrentTime, setIsPlaying } = useAppStore();
  const videoRef = useRef<HTMLVideoElement>(null);

  // 将 video 元素注册到 store
  useEffect(() => {
    if (videoRef.current) {
      setVideoElement(videoRef.current);
    }
    return () => setVideoElement(null);
  }, []);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handlePlay = () => setIsPlaying(true);
  const handlePause = () => setIsPlaying(false);

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

  // 尝试使用原生 video 标签（更可靠）
  return (
    <div className="video-player">
      <video
        ref={videoRef}
        src={videoUrl}
        width="100%"
        height="100%"
        controls
        onTimeUpdate={handleTimeUpdate}
        onPlay={handlePlay}
        onPause={handlePause}
        style={{ backgroundColor: '#000' }}
      />
    </div>
  );
};

export default App;
