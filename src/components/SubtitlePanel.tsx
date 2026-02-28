import React, { useRef, useEffect, useState } from 'react';
import { useAppStore, seekVideo } from '../store';
import { getCurrentSubtitleIndex } from '../utils/srtParser';
import { formatTime } from '../utils/timeFormat';
import { Subtitle } from '../types';
import { AIChatPanel } from './AIChatPanel';
import { VideoSegmentsPanel } from './VideoSegmentsPanel';
import { MarkdownPanel } from './MarkdownPanel';

// Tab 类型
type SubtitleTab = 'subtitles' | 'chat' | 'segments' | 'notes';

export const SubtitlePanel: React.FC = () => {
  const {
    subtitles,
    currentTime,
    selectedSubtitleId,
    setSelectedSubtitleId,
    isUserScrolling,
    setIsUserScrolling,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<SubtitleTab>('subtitles');
  const listRef = useRef<HTMLDivElement>(null);
  const [searchText, setSearchText] = useState('');
  const scrollTimeoutRef = useRef<number | null>(null);
  const isScrollingRef = useRef(false);

  // 获取当前播放的字幕索引
  const currentIndex = getCurrentSubtitleIndex(subtitles, currentTime);

  // 处理用户滚动 - 使用节流来检测滚动结束
  const handleScroll = () => {
    isScrollingRef.current = true;
    setIsUserScrolling(true);

    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // 滚动停止 2 秒后恢复自动滚动
    scrollTimeoutRef.current = window.setTimeout(() => {
      isScrollingRef.current = false;
      setIsUserScrolling(false);
    }, 2000);
  };

  // 自动滚动到当前字幕（仅当用户未手动滚动时）
  useEffect(() => {
    if (currentIndex >= 0 && listRef.current && !isScrollingRef.current) {
      const currentElement = listRef.current.querySelector(
        `.subtitle-item.current`
      );
      if (currentElement) {
        currentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentIndex, isUserScrolling]);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // 处理字幕点击
  const handleSubtitleClick = (subtitle: Subtitle) => {
    setSelectedSubtitleId(subtitle.id);
    seekVideo(subtitle.startTime);
  };

  // 过滤字幕
  const filteredSubtitles = searchText
    ? subtitles.filter((s) =>
        s.text.toLowerCase().includes(searchText.toLowerCase())
      )
    : subtitles;

  // 渲染字幕列表
  const renderSubtitles = () => {
    if (subtitles.length === 0) {
      return (
        <div className="subtitle-empty">
          <p>暂无字幕</p>
          <p className="hint">请先加载字幕文件</p>
        </div>
      );
    }

    return (
      <div
        className="subtitle-list"
        ref={listRef}
        onScroll={handleScroll}
        onWheel={handleScroll}
      >
        {filteredSubtitles.map((subtitle, index) => {
          const isCurrent = index === currentIndex;
          const isSelected = subtitle.id === selectedSubtitleId;

          return (
            <div
              key={subtitle.id}
              className={`subtitle-item ${isCurrent ? 'current' : ''} ${
                isSelected ? 'selected' : ''
              }`}
              onClick={() => handleSubtitleClick(subtitle)}
            >
              <span className="subtitle-time">
                {formatTime(subtitle.startTime)}
              </span>
              <span className="subtitle-text">{subtitle.text}</span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="subtitle-panel">
      {/* Tab 导航 */}
      <div className="subtitle-tabs">
        <button
          className={activeTab === 'subtitles' ? 'active' : ''}
          onClick={() => setActiveTab('subtitles')}
        >
          📝 字幕
        </button>
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
          📑 分段
        </button>
        <button
          className={activeTab === 'notes' ? 'active' : ''}
          onClick={() => setActiveTab('notes')}
        >
          📓 笔记
        </button>
      </div>

      {/* Tab 内容 */}
      <div className="subtitle-content">
        {activeTab === 'subtitles' && (
          <>
            <div className="subtitle-search">
              <input
                type="text"
                placeholder="搜索字幕..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                disabled={subtitles.length === 0}
              />
            </div>
            {renderSubtitles()}
          </>
        )}

        {activeTab === 'chat' && <AIChatPanel isEmbedded />}

        {activeTab === 'segments' && <VideoSegmentsPanel />}

        {activeTab === 'notes' && <MarkdownPanel />}
      </div>
    </div>
  );
};
