// storage/sessionData.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function saveToSessionData({
  mood,
  reflection,
  sessionType,
  newMessages,
}: {
  mood?: string;
  reflection?: string;
  sessionType?: "text" | "voice" | "video";
  newMessages?: { sender: string; text: string }[];
}) {
  const today = new Date().toISOString().split('T')[0];
  const key = `session-${today}`;
  let session: any = {};
  const stored = await AsyncStorage.getItem(key);
  if (stored) session = JSON.parse(stored);
  if (mood) session.mood = mood;
  if (reflection) session.reflection = reflection;
  if (!session.sessions) session.sessions = [];
  if (sessionType && newMessages && newMessages.length > 0) {
    session.sessions.push({
      type: sessionType,
      messages: newMessages,
      time: Date.now(),
    });
  }
  session.date = today;
  await AsyncStorage.setItem(key, JSON.stringify(session));
  await pruneOldSessionData(30);
}

async function pruneOldSessionData(maxDays: number) {
  const allKeys = await AsyncStorage.getAllKeys();
  const sessionKeys = allKeys.filter(k => k.startsWith('session-'));
  if (sessionKeys.length > maxDays) {
    const sorted = sessionKeys
      .map(k => ({ key: k, date: k.slice(8) }))
      .sort((a, b) => a.date.localeCompare(b.date));
    const toDelete = sorted.slice(0, sessionKeys.length - maxDays);
    for (const item of toDelete) {
      await AsyncStorage.removeItem(item.key);
    }
  }
}
