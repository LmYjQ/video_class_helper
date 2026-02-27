import { create } from 'zustand';
import { AppState, Subtitle, ChatMessage, AIMode, BottomPanelMode, VideoSegment, AIPlatform } from '../types';

// 默认平台
const DEFAULT_PLATFORM: AIPlatform = 'siliconflow';
// 默认模型
const DEFAULT_MODEL = 'Qwen/Qwen2.5-7B-Instruct';

// 用于存储视频元素的引用
let videoElement: HTMLVideoElement | null = null;

export const setVideoElement = (element: HTMLVideoElement | null) => {
  videoElement = element;
};

export const getVideoElement = () => videoElement;

// 视频跳转函数
export const seekVideo = (time: number) => {
  if (videoElement) {
    videoElement.currentTime = time;
  }
};

interface AppStore extends AppState {
  setVideoPath: (path: string | null, name: string | null) => void;
  setSubtitles: (subtitles: Subtitle[]) => void;
  setCurrentTime: (time: number) => void;
  setIsPlaying: (playing: boolean) => void;
  setBottomPanelMode: (mode: BottomPanelMode) => void;
  addChatMessage: (message: ChatMessage) => void;
  clearChatMessages: () => void;
  setAIMode: (mode: AIMode) => void;
  setAiApiKey: (key: string) => void;
  setAiModel: (model: string) => void;
  setAiPlatform: (platform: AIPlatform) => void;
  setNotes: (notes: string) => void;
  setSelectedSubtitleId: (id: number | null) => void;
  // 用户是否正在手动滚动字幕列表
  isUserScrolling: boolean;
  setIsUserScrolling: (scrolling: boolean) => void;
  // 视频分段
  setVideoSegments: (segments: VideoSegment[]) => void;
  setSegmentPrompt: (prompt: string) => void;
}

// 默认的分段 prompt
const DEFAULT_SEGMENT_PROMPT = `请根据以下字幕内容，将视频分为若干个逻辑段落，每个段落需要有：
1. 标题（简洁概括该段落主题）
2. 开始时间和结束时间（格式：HH:MM:SS）
3. 一句话总结

请按以下JSON格式返回：
[
  {"title": "标题1", "startTime": "00:00", "endTime": "05:30", "summary": "一句话总结"},
  {"title": "标题2", "startTime": "05:30", "endTime": "10:00", "summary": "一句话总结"}
]`;

export const useAppStore = create<AppStore>((set) => ({
  videoPath: null,
  videoName: null,
  subtitles: [],
  currentTime: 0,
  isPlaying: false,
  bottomPanelMode: 'hidden',
  chatMessages: [],
  aiMode: 'summarize',
  aiApiKey: localStorage.getItem('aiApiKey') || '',
  aiModel: localStorage.getItem('aiModel') || DEFAULT_MODEL,
  aiPlatform: (localStorage.getItem('aiPlatform') as AIPlatform) || DEFAULT_PLATFORM,
  notes: '',
  selectedSubtitleId: null,
  isUserScrolling: false,
  videoSegments: [],
  segmentPrompt: localStorage.getItem('segmentPrompt') || DEFAULT_SEGMENT_PROMPT,
  setIsUserScrolling: (scrolling) => set({ isUserScrolling: scrolling }),

  setVideoPath: (path, name) => set({ videoPath: path, videoName: name }),
  setSubtitles: (subtitles) => set({ subtitles }),
  setCurrentTime: (time) => set({ currentTime: time }),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setBottomPanelMode: (mode) => set({ bottomPanelMode: mode }),
  addChatMessage: (message) =>
    set((state) => ({ chatMessages: [...state.chatMessages, message] })),
  clearChatMessages: () => set({ chatMessages: [] }),
  setAIMode: (mode) => set({ aiMode: mode }),
  setAiApiKey: (key) => {
    localStorage.setItem('aiApiKey', key);
    set({ aiApiKey: key });
  },
  setAiModel: (model) => {
    localStorage.setItem('aiModel', model);
    set({ aiModel: model });
  },
  setAiPlatform: (platform) => {
    localStorage.setItem('aiPlatform', platform);
    set({ aiPlatform: platform });
  },
  setNotes: (notes) => set({ notes }),
  setSelectedSubtitleId: (id) => set({ selectedSubtitleId: id }),
  setVideoSegments: (segments) => set({ videoSegments: segments }),
  setSegmentPrompt: (prompt) => {
    localStorage.setItem('segmentPrompt', prompt);
    set({ segmentPrompt: prompt });
  },
}));
