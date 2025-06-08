import { GCP_CONFIG } from './gcpConfig';

// Ses dosyasını base64'e çevirme
const audioToBase64 = async (audioUri: string): Promise<string> => {
  try {
    const response = await fetch(audioUri);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result as string;
        resolve(base64data.split(',')[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Ses dosyası base64\'e çevrilemedi:', error);
    throw error;
  }
};

// Speech-to-Text API'sini kullanarak sesi metne çevirme
export const transcribeAudio = async (audioUri: string): Promise<string> => {
  try {
    const audioBase64 = await audioToBase64(audioUri);
    
    const response = await fetch(
      `https://speech.googleapis.com/v1/speech:recognize?key=${GCP_CONFIG.credentials.private_key}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          config: GCP_CONFIG.speechToText,
          audio: {
            content: audioBase64,
          },
        }),
      }
    );

    const data = await response.json();
    if (data.results && data.results[0]) {
      return data.results[0].alternatives[0].transcript;
    }
    return '';
  } catch (error) {
    console.error('Ses metne çevrilemedi:', error);
    throw error;
  }
};

// Text-to-Speech API'sini kullanarak metni sese çevirme
export const textToSpeech = async (text: string): Promise<string> => {
  try {
    const response = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${GCP_CONFIG.credentials.private_key}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: { text },
          voice: GCP_CONFIG.textToSpeech,
          audioConfig: { audioEncoding: 'MP3' },
        }),
      }
    );

    const data = await response.json();
    if (data.audioContent) {
      // Base64 ses verisini bir blob'a çevirme
      const audioBlob = new Blob(
        [Uint8Array.from(atob(data.audioContent), c => c.charCodeAt(0))],
        { type: 'audio/mp3' }
      );
      
      // Blob'u bir URL'e çevirme
      return URL.createObjectURL(audioBlob);
    }
    throw new Error('Ses içeriği alınamadı');
  } catch (error) {
    console.error('Metin sese çevrilemedi:', error);
    throw error;
  }
}; 