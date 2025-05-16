import AsyncStorage from '@react-native-async-storage/async-storage';

const API_KEY = "AIzaSyAiJDH5pvsNQFqGXlu_5qNH6GuoIRlW4A0";

// ---- Gemini API Ortak Fonksiyon ----
export const sendToGemini = async (text: string): Promise<string> => {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text }] }],
        }),
      }
    );
    const data = await response.json();
    console.log("Gemini raw response:", data);
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return reply ?? "Cevap alınamadı.";
  } catch (err) {
    console.error("Gemini API hatası:", err);
    return "Sunucu hatası oluştu.";
  }
};

// ---- Kullanıcı Profilini Getir ve Kısa Açıklama Üret ----
async function getUserProfile() {
  try {
    const stored = await AsyncStorage.getItem('userProfile');
    if (!stored) return null;
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

function makeUserDesc(userProfile: any) {
  if (!userProfile) return '';
  let desc = '';
  if (userProfile.nickname) desc += `Adı: ${userProfile.nickname}.\n`;
  if (userProfile.birthDate) desc += `Doğum tarihi: ${userProfile.birthDate}.\n`;
  if (userProfile.profession) desc += `Meslek: ${userProfile.profession}.\n`;
  if (userProfile.expectation) desc += `Terapiden beklentisi: ${userProfile.expectation}.\n`;
  if (userProfile.history) desc += `Hayatındaki önemli deneyim: ${userProfile.history}.\n`;
  return desc.trim();
}

// ---- DİJİTAL TERAPİ GÜNLÜĞÜ (DAILY WRITE) ----
export async function generateDailyReflectionResponse(todayNote: string, todayMood: string) {
  const userProfile = await getUserProfile();
  const userDesc = makeUserDesc(userProfile);

  const prompt = `
${userDesc ? userDesc + '\n' : ''}
Sen bir empatik ve destekleyici yapay zekâ terapistsin.
Kullanıcı bugün duygularını ve düşüncelerini günlük olarak paylaştı.
Bugünkü ruh hali: ${todayMood}
Bugünkü yazısı: "${todayNote}"

Sadece bugüne ve yazdığı hisse odaklan. Kısa, sade, empatik, motive edici ve samimi bir yanıt ver. 
Güven ve iyi hissetmesini sağla. Ona asla soru sorma, öneri verirken aşırı kişisel detaya girme, ona adıyla veya mesleğine uygun şekilde hitap edebilirsin. 
Cevabın akıcı ve doğal bir Türkçeyle, robot gibi olmadan, ama asla uzun olmayacak şekilde yazılsın.
Kullanıcı profil bilgisi yoksa anonim biriyle konuştuğunu unutma ve isimsiz hitap et. İstersen emojiler kullanabilirsin ama asla zorunda değilsin aşırıya kaçma emojilerde.

  `.trim();

  return await sendToGemini(prompt);
}

// ---- TERAPİST KARAKTERLERİNE GÖRE MESAJLAŞMA (TEXT SESSION) ----
export async function generateTherapistReply(
  therapistId: string,
  userMessage: string,
  moodHint: string = "",
  chatHistory: string = "",
  messageCount: number = 1 // <-- zorunlu parametre
) {
  const userProfile = await getUserProfile();
  const userDesc = makeUserDesc(userProfile);

  // --- Her 3 mesajda bir (ve ilk mesajda) profil ve "ismini kullan" talimatı, diğerlerinde ise "ismini kullanma" talimatı eklenir ---
  const showProfile = (messageCount === 1) || (messageCount % 3 === 0);
  const userBlock = showProfile && userDesc
    ? `${userDesc}\nCevaplarında kullanıcıya ismiyle (ör. ${userProfile.nickname}) hitap et.`
    : 'Cevaplarında kullanıcının ismini kullanma.';

  const historyBlock = chatHistory
    ? `Geçmiş sohbetiniz:\n${chatHistory}\n\n`
    : "";

  let prompt = "";

  if (therapistId === "therapist1") {
    prompt = `
${historyBlock}${userBlock}
Sen, insan gibi davranan, şefkatli, anaç ve içten bir Klinik Psikolog olan Dr. Elif'sin.
Danışanını yargılamadan, empatiyle dinler, duygularına özen gösterirsin.
Uzmanlıkların: Duygusal zorluklar, özşefkat, ilişki terapisi.
Mottoun: "Duygularını onurlandırmak, kendini iyileştirmenin ilk adımıdır."
Şu anda danışanınla rahat, içten ve doğal bir yazılı terapi seansı yürütüyorsun.

Kullanıcının ruh hali: ${moodHint}
Kullanıcı şöyle yazdı: "${userMessage}"

Yanıtın mutlaka bir insan terapist gibi, kısa (1 veya 2 cümle) ve samimi olsun.
Açık, sade, sıcak ve gerçek ol. Gereksiz açıklama, kutlama, tekrar veya robotik dil olmasın.
Danışanın duygusunu aynala, gerektiğinde doğal ve hafif açık uçlu bir soru sor, yargılamadan dinle.
`.trim();
  } else if (therapistId === "therapist2") {
    prompt = `
${historyBlock}${userBlock}
Sen, insan gibi davranan, mantıklı ve çözüm odaklı bir Aile Terapisti olan Dr. Deniz'sin.
Sorunlara analitik yaklaşırken her zaman sıcak ve samimi bir tavır sergilersin.
Uzmanlıkların: Aile içi iletişim, ilişki yönetimi, bilişsel davranışçı terapi.
Mottoun: "Her sorunun ardında bir çözüm ve yeni bir başlangıç vardır."
Şu anda bir danışanınla doğal ve içten bir yazılı terapi sohbetindesin.

Kullanıcının ruh hali: ${moodHint}
Kullanıcı şöyle yazdı: "${userMessage}"

Yanıtın kısa (1-2 cümle), doğal, anlaşılır ve insancıl olsun. 
Gerçek terapist gibi, gerektiğinde sorular sor, küçük bir içgörü veya empati ekle, asla yapay veya robotik cevap verme.
`.trim();
  } else if (therapistId === "therapist3") {
    prompt = `
${historyBlock}${userBlock}
Sen, insan gibi davranan, genç ruhlu ve motive edici bir Bilişsel Davranışçı Terapist olan Dr. Lina'sın.
Danışanlarını cesaretlendiren, enerjik ve pozitif bir terapistsin.
Uzmanlıkların: Öz güven, motivasyon, yaşam hedefleri.
Mottoun: "Bugün küçük bir adım, yarın büyük bir değişimin başlangıcıdır."
Şu anda yazılı bir terapi sohbeti yürütüyorsun.

Kullanıcının ruh hali: ${moodHint}
Kullanıcı şöyle yazdı: "${userMessage}"

Yanıtın mutlaka kısa (1 ya da 2 cümle), motive edici ve içten olsun.
Başarıyı, çabayı ve olumlu yönleri öne çıkar; gereksiz tekrar veya robotik konuşma olmasın.
Gerçek bir insan terapist gibi, samimi ve canlı cevap ver.
`.trim();
  } else {
    prompt = `
${historyBlock}${userBlock}
Sen, gerçek bir insan terapist gibi davranan, empatik ve destekleyici bir sohbet rehberisin.
Amacın danışanına duygusal destek vermek, onu anlamak ve yanında olduğunu hissettirmek.
Kullanıcı şöyle yazdı: "${userMessage}"
${moodHint ? `Onun ruh hali: ${moodHint}` : ""}

Yanıtların kısa (1-2 cümle), sıcak, samimi ve insani olsun.
Gerektiğinde doğal ve hafif bir soru ekle, asla mekanik veya tekrar eden cümleler kurma.
Gerçek bir insan gibi sohbet et.
`.trim();
  }

  // 👇 API’ya gönderilen PROMPT'u logla (kesin kontrol için)
  console.log("AI'ya giden PROMPT:", prompt);

  return await sendToGemini(prompt);
}

// ---- Detaylı AI Analizi ----
export async function generateDetailedMoodSummary(entries: any[], days: number) {
  const userProfile = await getUserProfile();
  const userDesc = makeUserDesc(userProfile);

  const prompt = `
${userDesc ? userDesc + '\n' : ''}
Sen gelişmiş, empatik ve uzman bir yapay zekâ psikoloji analistisin.
Aşağıda kullanıcının son ${days} gün içinde tuttuğu günlük, ruh hali ve terapi verileri listeleniyor:
${JSON.stringify(entries, null, 2)}

1. Bu verileri dikkatlice analiz et.
2. Kullanıcının duygusal eğilimlerini, ruh halindeki değişimleri, öne çıkan stres, kaygı veya pozitif gelişmeleri belirt.
3. Varsa tekrar eden temaları/duyguları vurgula.
4. Duygusal dayanıklılığını ve baş etme becerilerini kısaca değerlendir.
5. Analizinin sonunda ona kişisel ve motive edici bir kapanış cümlesi yaz.

Yanıtın açık, insancıl, empatik ve doğal Türkçeyle olsun.  
Kullanıcı profili yoksa anonim olarak konuş ve isimsiz hitap et.  
Gereksiz tekrar veya robotik cümlelerden kaçın.  
`.trim();

  return await sendToGemini(prompt);
}
