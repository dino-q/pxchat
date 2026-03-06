import { SplitType, SplitFile } from '../App';

// Matches dates with flexible format: separators (. / -), optional padding, and day representation (星期/週 + 一-日/天) with optional parenthesesconst
const DATE_REGEX = /^(\d{4}[.\/-]\d{1,2}[.\/-]\d{1,2})\s*[(（]?(星期|週)[一二三四五六日天][)）]?/gm;
export const splitText = (content: string, by: SplitType): SplitFile[] => {
  const matches = [...content.matchAll(DATE_REGEX)];

  if (matches.length === 0) {
    throw new Error('No valid date entries found in the file.');
  }

  const chunks: { date: string; content: string }[] = [];

  for (let i = 0; i < matches.length; i++) {
    const currentMatch = matches[i];
    const nextMatch = matches[i + 1];

    const startDate = currentMatch[1]; // YYYY.MM.DD
    const startIndex = currentMatch.index!;
    const endIndex = nextMatch ? nextMatch.index : content.length;

    const chunkContent = content.substring(startIndex, endIndex).trim();
    chunks.push({ date: startDate, content: chunkContent });
  }

  if (by === 'day') {
    const dailyFiles = chunks.map(chunk => ({
      filename: `${chunk.date.replace(/\./g, '-')}.txt`,
      content: chunk.content,
    }));
    return dailyFiles.reverse();
  }

  if (by === 'week') {
    const weekMap = new Map<string, { content: string[]; startDate: Date }>();

    const getWeekStart = (date: Date): Date => {
      const d = new Date(date);
      const day = d.getDay(); // 0 for Sunday
      const diff = d.getDate() - day;
      d.setDate(diff);
      d.setHours(0, 0, 0, 0);
      return d;
    };

    chunks.forEach(chunk => {
      const [year, month, day] = chunk.date.split('.').map(Number);
      const currentDate = new Date(year, month - 1, day);
      const weekStartDate = getWeekStart(currentDate);
      const weekKey = weekStartDate.toISOString().split('T')[0];

      if (!weekMap.has(weekKey)) {
        weekMap.set(weekKey, { content: [], startDate: weekStartDate });
      }

      weekMap.get(weekKey)!.content.push(chunk.content);
    });

    const result: SplitFile[] = [];
    for (const [, weekData] of weekMap.entries()) {
      const endDate = new Date(weekData.startDate);
      endDate.setDate(endDate.getDate() + 6);

      const formatDate = (d: Date) => d.toISOString().split('T')[0];
      const filename = `Week-${formatDate(weekData.startDate)}-to-${formatDate(endDate)}.txt`;
      const weekContent = weekData.content.join('\n\n');

      result.push({ filename, content: weekContent });
    }

    result.sort((a, b) => b.filename.localeCompare(a.filename));
    return result;
  }

  if (by === 'month') {
    const monthMap = new Map<string, string>();

    chunks.forEach(chunk => {
      const monthKey = chunk.date.substring(0, 7); // YYYY.MM
      const existingContent = monthMap.get(monthKey) || '';
      monthMap.set(monthKey, existingContent + chunk.content + '\n\n');
    });

    const result: SplitFile[] = [];
    for (const [monthKey, monthContent] of monthMap.entries()) {
      result.push({
        filename: `${monthKey.replace('.', '-')}.txt`,
        content: monthContent.trim(),
      });
    }

    result.sort((a, b) => b.filename.localeCompare(a.filename));
    return result;
  }

  return [];
};
