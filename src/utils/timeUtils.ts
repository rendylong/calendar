export function getLocalTime(): Date {
  return new Date();
}

export function roundToNearestQuarter(date: Date): Date {
  const minutes = date.getMinutes();
  const roundedMinutes = Math.floor(minutes / 15) * 15;
  const newDate = new Date(date);
  newDate.setMinutes(roundedMinutes, 0, 0);
  return newDate;
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
}

export function getDefaultStartTime(): string {
  const now = new Date();
  const hours = now.getHours();
  const minutes = Math.floor(now.getMinutes() / 15) * 15;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

export function getDefaultEndTime(startTime: string): string {
  const [hours, minutes] = startTime.split(':').map(Number);
  const date = new Date();
  date.setHours(hours);
  date.setMinutes(minutes);
  date.setHours(date.getHours() + 1);
  return formatTime(date);
} 