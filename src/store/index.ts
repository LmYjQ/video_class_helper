import { create } from 'zustand';
import { AppState, Subtitle, ChatMessage, AIMode, BottomPanelMode } from '../types';

// 用于存储视频元素的引用
let videoElement: HTMLVideoElement | null = null;

export const setVideoElement = (element: HTMLVideoElement | null) => {
  videoElement = element;
};

export const getVideoElement = () => videoElement;

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
  setNotes: (notes: string) => void;
  setSelectedSubtitleId: (id: number | null) => void;
}

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
  notes: '',
  selectedSubtitleId: null,

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
  setNotes: (notes) => set({ notes }),
  setSelectedSubtitleId: (id) => set({ selectedSubtitleId: id }),
}));
