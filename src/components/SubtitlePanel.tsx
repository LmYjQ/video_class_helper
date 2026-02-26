import React, { useRef, useEffect, useState } from 'react';
import { useAppStore } from '../store';
import { getCurrentSubtitleIndex } from '../utils/srtParser';
import { formatTime } from '../utils/timeFormat';
import { Subtitle } from '../types';

interface SubtitlePanelProps {
  onSeek: (time: number) => void;
}

export const SubtitlePanel: React.FC<SubtitlePanelProps> = ({ onSeek }) => {
  const { subtitles, currentTime, selectedSubtitleId, setSelectedSubtitleId } =
    useAppStore();
  const listRef = useRef<HTMLDivElement>(null);
  const [searchText, setSearchText] = useState('');

  // 获取当前播放的字幕索引
  const currentIndex = getCurrentSubtitleIndex(subtitles, currentTime);

  // 自动滚动到当前字幕
  useEffect(() => {
    if (currentIndex >= 0 && listRef.current) {
      const currentElement = listRef.current.querySelector(
        `.subtitle-item.current`
      );
      if (currentElement) {
        currentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentIndex]);

  // 处理字幕点击
  const handleSubtitleClick = (subtitle: Subtitle) => {
    setSelectedSubtitleId(subtitle.id);
    onSeek(subtitle.startTime);
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
      <div className="subtitle-list" ref={listRef}>
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
