const API_KEY = "AIzaSyBggIhE8hu9nlJv4KI9Nba6NzxxykkJysk";

export const sendToGemini = async (text: string): Promise<string> => {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text }] }],
        }),
      }
    );

    const data = await response.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return reply ?? "Cevap alınamadı.";
  } catch (err) {
    console.error("Gemini API hatası:", err);
    return "Sunucu hatası oluştu.";
  }
};

import AsyncStorage from '@react-native-async-storage/async-storage';

async function getRecentSessions(limit = 5) {
  const sessions: any[] = [];
  const now = Date.now();

  for (let i = 0; i < 30; i++) {
    const date = new Date(now - i * 86400000).toISOString().split('T')[0];
    const raw = await AsyncStorage.getItem(`mood-${date}`);
    if (raw) {
      sessions.push(JSON.parse(raw));
    }
    if (sessions.length >= limit) break;
  }

  return sessions;
}

export async function generatePersonalizedResponse(todayNote: string, todayMood: string) {
  const recent = await getRecentSessions();

  const contextText = recent
    .map((s) => `Duygu: ${s.mood} | Not: ${s.reflection}`)
    .join('\n');

  const prompt = `
Sen bir yapay zekâ terapistsin. Kullanıcının önceki duygusal deneyimlerini biliyorsun.
Bugünkü duygusu: ${todayMood}
Bugünkü cümlesi: "${todayNote}"

Geçmiş deneyimleri:
${contextText}

Bu kişiye, duygularını tanıyan ve daha önce söylediklerini hatırlayan bir yanıt ver.
`;

  const response = await sendToGemini(prompt);
  return response;
}
