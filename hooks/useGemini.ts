const API_KEY = "AIzaSyBggIhE8hu9nlJv4KI9Nba6NzxxykkJysk"; 

export const sendToGemini = async (text: string): Promise<string | null> => {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text }] }]
        }),
      }
    );

    const data = await response.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return reply ?? "Cevap alınamadı.";
  } catch (err) {
    console.error("Gemini API hatası:", err);
    return null;
  }
};
