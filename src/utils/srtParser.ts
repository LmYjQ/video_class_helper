import { Subtitle } from '../types';

/**
 * 解析SRT字幕文件
 * @param content SRT文件内容
 * @returns 解析后的字幕数组
 */
export function parseSRT(content: string): Subtitle[] {
  const subtitles: Subtitle[] = [];
  const blocks = content.trim().split(/\n\n+/);

  for (const block of blocks) {
    const lines = block.split('\n');
    if (lines.length < 3) continue;

    // 解析索引行（第一行）
    const indexLine = lines[0].trim();
    if (!/^\d+$/.test(indexLine)) continue;
    const id = parseInt(indexLine, 10);

    // 解析时间行（第二行）
    const timeLine = lines[1].trim();
    const timeMatch = timeLine.match(
      /(\d{2}):(\d{2}):(\d{2})[,.](\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2})[,.](\d{3})/
    );

    if (!timeMatch) continue;

    const startTime =
      parseInt(timeMatch[1]) * 3600 +
      parseInt(timeMatch[2]) * 60 +
      parseInt(timeMatch[3]) +
      parseInt(timeMatch[4]) / 1000;

    const endTime =
      parseInt(timeMatch[5]) * 3600 +
      parseInt(timeMatch[6]) * 60 +
      parseInt(timeMatch[7]) +
      parseInt(timeMatch[8]) / 1000;

    // 解析文本行（剩余行）
    const text = lines.slice(2).join('\n').trim();

    subtitles.push({ id, startTime, endTime, text });
  }

  return subtitles;
}

/**
 * 获取当前时间对应的字幕索引
 * @param subtitles 字幕数组
 * @param currentTime 当前播放时间
 * @returns 对应的字幕索引，如果没有则返回-1
 */
export function getCurrentSubtitleIndex(
  subtitles: Subtitle[],
  currentTime: number
): number {
  for (let i = subtitles.length - 1; i >= 0; i--) {
    if (currentTime >= subtitles[i].startTime) {
      return i;
    }
  }
  return -1;
}
