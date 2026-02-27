// 字幕类型
export interface Subtitle {
  id: number;
  startTime: number; // 秒
  endTime: number;   // 秒
  text: string;
}

// 视频分段类型
export interface VideoSegment {
  id: number;
  title: string;        // 分段标题
  startTime: number;   // 开始时间（秒）
  endTime: number;     // 结束时间（秒）
  summary: string;    // 分段总结
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

// AI平台类型
export type AIPlatform = 'siliconflow' | 'openai' | 'deepseek' | 'zhipu' | 'moonshot';

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
  aiModel: string;
  aiPlatform: AIPlatform;
  notes: string;
  selectedSubtitleId: number | null;
  isUserScrolling: boolean;
  // 视频分段
  videoSegments: VideoSegment[];
  segmentPrompt: string;
}
