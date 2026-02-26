// 字幕类型
export interface Subtitle {
  id: number;
  startTime: number; // 秒
  endTime: number;   // 秒
  text: string;
}

// 视频信息
export interface VideoInfo {
  path: string;
  name: string;
}

// AI对话消息
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// AI对话模式
export type AIMode = 'summarize' | 'optimize' | 'qa';

// 底部面板模式
export type BottomPanelMode = 'ai' | 'notes' | 'hidden';

// 应用状态
export interface AppState {
  videoPath: string | null;
  videoName: string | null;
  subtitles: Subtitle[];
  currentTime: number;
  isPlaying: boolean;
  bottomPanelMode: BottomPanelMode;
  chatMessages: ChatMessage[];
  aiMode: AIMode;
  aiApiKey: string;
  notes: string;
  selectedSubtitleId: number | null;
  isUserScrolling: boolean;
}
