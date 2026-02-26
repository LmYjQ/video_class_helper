/**
 * 格式化时间（秒）为 SRT 时间格式
 * @param seconds 秒数
 * @returns SRT时间格式字符串 (HH:MM:SS,mmm)
 */
export function formatSRTTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.round((seconds % 1) * 1000);

  return `${pad(hours)}:${pad(minutes)}:${pad(secs)},${pad(ms, 3)}`;
}

/**
 * 格式化时间为可读格式
 * @param seconds 秒数
 * @returns 可读格式字符串 (HH:MM:SS 或 MM:SS)
 */
export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(secs)}`;
  }
  return `${pad(minutes)}:${pad(secs)}`;
}

/**
 * 数字补零
 */
function pad(num: number, size: number = 2): string {
  return num.toString().padStart(size, '0');
}
