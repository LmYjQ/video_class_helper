import React, { useRef, useEffect, useState } from 'react';
import { useAppStore, seekVideo } from '../store';
import { getCurrentSubtitleIndex } from '../utils/srtParser';
import { formatTime } from '../utils/timeFormat';
import { Subtitle } from '../types';

interface SubtitlePanelProps {
  onSeek?: (time: number) => void;
}

export const SubtitlePanel: React.FC<SubtitlePanelProps> = ({ onSeek }) => {
  const {
    subtitles,
    currentTime,
    selectedSubtitleId,
    setSelectedSubtitleId,
    isUserScrolling,
    setIsUserScrolling,
  } = useAppStore();
  const listRef = useRef<HTMLDivElement>(null);
  const [searchText, setSearchText] = useState('');
  const scrollTimeoutRef = useRef<number | null>(null);
  const lastScrollTimeRef = useRef<number>(0);

  // 获取当前播放的字幕索引
  const currentIndex = getCurrentSubtitleIndex(subtitles, currentTime);

  // 处理用户滚动开始
  const handleScrollStart = () => {
    setIsUserScrolling(true);
    // 清除之前的定时器
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
  };

  // 处理用户滚动结束 - 延迟恢复自动滚动
  const handleScrollEnd = () => {
    lastScrollTimeRef.current = Date.now();
    // 延迟 3 秒后恢复自动滚动
    scrollTimeoutRef.current = window.setTimeout(() => {
      setIsUserScrolling(false);
    }, 3000);
  };

  // 自动滚动到当前字幕（仅当用户未手动滚动时）
  useEffect(() => {
    if (currentIndex >= 0 && listRef.current && !isUserScrolling) {
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

  if (subtitles.length === 0) {
    return (
      <div className="subtitle-panel">
        <div className="subtitle-search">
          <input
            type="text"
            placeholder="搜索字幕..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            disabled
          />
        </div>
        <div className="subtitle-empty">
          <p>暂无字幕</p>
          <p className="hint">请先加载字幕文件</p>
        </div>
      </div>
    );
  }

  return (
    <div className="subtitle-panel">
      <div className="subtitle-search">
        <input
          type="text"
          placeholder="搜索字幕..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>
      <div
        className="subtitle-list"
        ref={listRef}
        onScroll={handleScrollStart}
        onWheel={handleScrollStart}
        onMouseEnter={handleScrollStart}
        onMouseLeave={handleScrollEnd}
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
    </div>
  );
};
