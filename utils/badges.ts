import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'daily' | 'session' | 'ai' | 'profile' | 'streak' | 'diary';
  unlocked: boolean;
  unlockedAt?: string;
  requirements: {
    type: 'count' | 'streak' | 'profile' | 'ai';
    value: number;
  };
}

// Varsayılan rozetler
export const defaultBadges: Badge[] = [
  // Günlük Yazma Rozetleri
  {
    id: 'first_diary',
    name: 'İlk Günlük',
    description: 'İlk günlüğünü yazdın',
    icon: 'book-open-variant',
    category: 'daily',
    unlocked: false,
    requirements: { type: 'count', value: 1 }
  },
  {
    id: 'regular_writer',
    name: 'Düzenli Yazıcı',
    description: '10 günlük yazdın',
    icon: 'book-multiple',
    category: 'daily',
    unlocked: false,
    requirements: { type: 'count', value: 10 }
  },
  {
    id: 'diary_master',
    name: 'Günlük Tutkunu',
    description: '50 günlük yazdın',
    icon: 'book-account',
    category: 'daily',
    unlocked: false,
    requirements: { type: 'count', value: 50 }
  },
  {
    id: 'diary_expert',
    name: 'Günlük Uzmanı',
    description: '100 günlük yazdın',
    icon: 'book-check-outline',
    category: 'daily',
    unlocked: false,
    requirements: { type: 'count', value: 100 }
  },
  {
    id: 'diary_legend',
    name: 'Günlük Efsanesi',
    description: '365 günlük yazdın - Tam bir yıl!',
    icon: 'book-star',
    category: 'daily',
    unlocked: false,
    requirements: { type: 'count', value: 365 }
  },
  {
    id: 'mood_tracker',
    name: 'Duygu Takipçisi',
    description: '5 günlüğüne duygu durumu ekledin',
    icon: 'emoticon',
    category: 'daily',
    unlocked: false,
    requirements: { type: 'count', value: 5 }
  },
  {
    id: 'reflection_master',
    name: 'Düşünce Ustası',
    description: '10 günlüğüne detaylı yansıma ekledin',
    icon: 'lightbulb-on',
    category: 'daily',
    unlocked: false,
    requirements: { type: 'count', value: 10 }
  },
  // YENİ: Daily Write Rozetleri
  {
    id: 'daily_writer_novice',
    name: 'Başlangıç Yolculuğu',
    description: '3 gün üst üste günlük yazdın',
    icon: 'pencil-outline',
    category: 'daily',
    unlocked: false,
    requirements: { type: 'count', value: 3 }
  },
  {
    id: 'daily_writer_expert',
    name: 'Günlükçü Uzman',
    description: '15 farklı günde yazı yazdın',
    icon: 'pencil-plus',
    category: 'daily',
    unlocked: false,
    requirements: { type: 'count', value: 15 }
  },

  // Streak Rozetleri - Zorluk seviyelerini artırıyorum
  {
    id: 'streak_3',
    name: '3 Günlük Seri',
    description: '3 gün üst üste günlük yazdın',
    icon: 'fire',
    category: 'streak',
    unlocked: false,
    requirements: { type: 'streak', value: 3 }
  },
  {
    id: 'streak_7',
    name: '7 Günlük Seri',
    description: '7 gün üst üste günlük yazdın',
    icon: 'fire',
    category: 'streak',
    unlocked: false,
    requirements: { type: 'streak', value: 7 }
  },
  {
    id: 'streak_14',
    name: '14 Günlük Seri',
    description: '14 gün üst üste günlük yazdın',
    icon: 'fire',
    category: 'streak',
    unlocked: false,
    requirements: { type: 'streak', value: 14 }
  },
  {
    id: 'streak_30',
    name: '30 Günlük Seri',
    description: '30 gün üst üste günlük yazdın',
    icon: 'fire',
    category: 'streak',
    unlocked: false,
    requirements: { type: 'streak', value: 30 }
  },
  {
    id: 'streak_60',
    name: '60 Günlük Seri',
    description: '60 gün üst üste günlük yazdın - İnanılmaz!',
    icon: 'fire',
    category: 'streak',
    unlocked: false,
    requirements: { type: 'streak', value: 60 }
  },
  {
    id: 'streak_90',
    name: '90 Günlük Seri',
    description: '90 gün üst üste günlük yazdın - Tam bir alışkanlık!',
    icon: 'fire',
    category: 'streak',
    unlocked: false,
    requirements: { type: 'streak', value: 90 }
  },
  {
    id: 'streak_180',
    name: '180 Günlük Seri',
    description: '180 gün üst üste günlük yazdın - Olağanüstü!',
    icon: 'fire',
    category: 'streak',
    unlocked: false,
    requirements: { type: 'streak', value: 180 }
  },
  {
    id: 'streak_365',
    name: 'Yıllık Seri Efsanesi',
    description: '365 gün üst üste günlük yazdın - Tam bir yıl!',
    icon: 'fire',
    category: 'streak',
    unlocked: false,
    requirements: { type: 'streak', value: 365 }
  },

  // Seans Rozetleri - Zorluk seviyelerini artırıyorum
  {
    id: 'first_session',
    name: 'İlk Seans',
    description: 'İlk terapi seansını tamamladın',
    icon: 'message-text',
    category: 'session',
    unlocked: false,
    requirements: { type: 'count', value: 1 }
  },
  {
    id: 'text_expert',
    name: 'Mesajlaşma Uzmanı',
    description: '10 yazılı terapi seansı tamamladın',
    icon: 'chat',
    category: 'session',
    unlocked: false,
    requirements: { type: 'count', value: 10 }
  },
  {
    id: 'voice_expert',
    name: 'Sesli İletişimci',
    description: '10 sesli terapi seansı tamamladın',
    icon: 'microphone',
    category: 'session',
    unlocked: false,
    requirements: { type: 'count', value: 10 }
  },
  {
    id: 'video_expert',
    name: 'Görüntülü Görüşmeci',
    description: '10 görüntülü terapi seansı tamamladın',
    icon: 'video',
    category: 'session',
    unlocked: false,
    requirements: { type: 'count', value: 10 }
  },
  {
    id: 'session_master',
    name: 'Terapi Kahramanı',
    description: '25 terapi seansı tamamladın',
    icon: 'trophy-outline',
    category: 'session',
    unlocked: false,
    requirements: { type: 'count', value: 25 }
  },
  {
    id: 'diverse_therapy',
    name: 'Çok Yönlü Terapi',
    description: 'Tüm terapi tiplerini (yazılı, sesli, görüntülü) deneyimledin',
    icon: 'star-check-outline',
    category: 'session',
    unlocked: false,
    requirements: { type: 'count', value: 3 } // Bu özel bir durum, kodda kontrol edilecek
  },
  {
    id: 'therapy_dedication',
    name: 'Terapiye Adanmış',
    description: '50 terapi seansı tamamladın',
    icon: 'medal',
    category: 'session',
    unlocked: false,
    requirements: { type: 'count', value: 50 }
  },
  {
    id: 'therapy_master',
    name: 'Terapi Ustası',
    description: '100 terapi seansı tamamladın',
    icon: 'trophy',
    category: 'session',
    unlocked: false,
    requirements: { type: 'count', value: 100 }
  },
  // Yazılı seans özel rozeti
  {
    id: 'text_communicator',
    name: 'Yazılı Terapi Uzmanı',
    description: 'Bir yazılı seansta 300+ mesaj alışverişi yaptın',
    icon: 'message-processing',
    category: 'session',
    unlocked: false,
    requirements: { type: 'count', value: 1 }
  },
  // Düzenli terapi rozeti
  {
    id: 'session_consistency_1m',
    name: 'Bir Aylık Terapi',
    description: 'Bir ay boyunca haftada en az 1 seans yaptın',
    icon: 'calendar-month-outline',
    category: 'session',
    unlocked: false,
    requirements: { type: 'count', value: 4 }
  },
  {
    id: 'session_consistency_3m',
    name: 'Üç Aylık Terapi',
    description: 'Üç ay boyunca düzenli seanslar yaptın',
    icon: 'calendar-range',
    category: 'session',
    unlocked: false,
    requirements: { type: 'count', value: 12 }
  },
  {
    id: 'session_consistency_6m',
    name: 'Altı Aylık Terapi',
    description: 'Altı ay boyunca düzenli seanslar yaptın',
    icon: 'calendar-clock',
    category: 'session',
    unlocked: false,
    requirements: { type: 'count', value: 24 }
  },
  {
    id: 'session_anniversary',
    name: 'Terapi Yıldönümü',
    description: 'Bir yıl boyunca düzenli terapi seansları yaptın',
    icon: 'gift-outline',
    category: 'session',
    unlocked: false,
    requirements: { type: 'count', value: 48 }
  },

  // AI Özet Rozetleri
  {
    id: 'first_ai',
    name: 'AI Analizi',
    description: 'İlk AI özetini aldın',
    icon: 'robot',
    category: 'ai',
    unlocked: false,
    requirements: { type: 'ai', value: 1 }
  },
  {
    id: 'ai_supporter',
    name: 'AI Destekçisi',
    description: '10 AI özeti aldın',
    icon: 'robot-excited',
    category: 'ai',
    unlocked: false,
    requirements: { type: 'ai', value: 10 }
  },
  {
    id: 'ai_master',
    name: 'AI Uzmanı',
    description: '25 AI özeti aldın',
    icon: 'robot-industrial',
    category: 'ai',
    unlocked: false,
    requirements: { type: 'ai', value: 25 }
  },
  {
    id: 'ai_insights',
    name: 'AI İçgörüleri',
    description: '5 farklı duygu durumu için AI özeti aldın',
    icon: 'chart-line',
    category: 'ai',
    unlocked: false,
    requirements: { type: 'ai', value: 5 }
  },
  // YENİ: Diary Rozetleri - AI ile etkileşim için
  {
    id: 'ai_diary_starter',
    name: 'AI Günlükçü',
    description: 'İlk AI destekli günlük yazımını tamamladın',
    icon: 'notebook-edit',
    category: 'diary',
    unlocked: false,
    requirements: { type: 'ai', value: 1 }
  },
  {
    id: 'diary_analyzer',
    name: 'Derinlemesine Analiz',
    description: '5 günlüğünü AI ile analiz ettin',
    icon: 'notebook-check',
    category: 'diary',
    unlocked: false,
    requirements: { type: 'ai', value: 5 }
  },
  // YENİ: AI Destekli Günlük Rozetleri (Diary kategorisi)
  {
    id: 'diary_connoisseur',
    name: 'Detaylı Günlük Yazarı',
    description: 'En az 1000 kelimelik bir günlük girişi yazdın',
    icon: 'fountain-pen',
    category: 'diary',
    unlocked: false,
    requirements: { type: 'count', value: 1 }
  },
  {
    id: 'diary_consistency_1w',
    name: 'Bir Haftalık Günlük',
    description: '7 gün boyunca günlük yazdın',
    icon: 'calendar-week',
    category: 'diary',
    unlocked: false,
    requirements: { type: 'count', value: 7 }
  },
  {
    id: 'diary_consistency_2w',
    name: 'İki Haftalık Günlük',
    description: '15 gün boyunca günlük yazdın',
    icon: 'calendar-week',
    category: 'diary',
    unlocked: false,
    requirements: { type: 'count', value: 15 }
  },
  {
    id: 'diary_consistency_1m',
    name: 'Bir Aylık Günlük',
    description: '30 gün boyunca günlük yazdın',
    icon: 'calendar-month',
    category: 'diary',
    unlocked: false,
    requirements: { type: 'count', value: 30 }
  },
  {
    id: 'diary_consistency_2m',
    name: 'İki Aylık Günlük',
    description: '60 gün boyunca günlük yazdın',
    icon: 'calendar-month',
    category: 'diary',
    unlocked: false,
    requirements: { type: 'count', value: 60 }
  },
  {
    id: 'diary_consistency_3m',
    name: 'Üç Aylık Günlük',
    description: '90 gün boyunca günlük yazdın',
    icon: 'calendar-range',
    category: 'diary',
    unlocked: false,
    requirements: { type: 'count', value: 90 }
  },
  {
    id: 'diary_consistency_6m',
    name: 'Altı Aylık Günlük',
    description: '180 gün boyunca günlük yazdın',
    icon: 'calendar-range',
    category: 'diary',
    unlocked: false,
    requirements: { type: 'count', value: 180 }
  },
  {
    id: 'diary_yearly_review',
    name: 'Yıllık Günlük',
    description: '365 gün boyunca günlük yazdın - Tam bir yıl!',
    icon: 'calendar-today',
    category: 'diary',
    unlocked: false,
    requirements: { type: 'count', value: 365 }
  },

  // AI Özet (Summary) Rozetleri
  {
    id: 'ai_summarizer',
    name: 'Özet Uzmanı',
    description: 'AI özet sayfasında 7+ günlük veriyi analiz ettin',
    icon: 'chart-timeline-variant',
    category: 'ai',
    unlocked: false,
    requirements: { type: 'count', value: 1 }
  },
  {
    id: 'ai_researcher',
    name: 'Duygusal Araştırmacı',
    description: 'AI özet sayfasında 10+ farklı özet oluşturdun',
    icon: 'file-chart',
    category: 'ai',
    unlocked: false,
    requirements: { type: 'count', value: 1 }
  },
  {
    id: 'ai_exporter',
    name: 'Veri Paylaşımcısı',
    description: 'AI özetini PDF olarak dışa aktardın',
    icon: 'export-variant',
    category: 'ai',
    unlocked: false,
    requirements: { type: 'count', value: 1 }
  },

  // Profil Rozetleri
  {
    id: 'profile_photo',
    name: 'Profil Fotoğrafı',
    description: 'Profil fotoğrafı ekledin',
    icon: 'account',
    category: 'profile',
    unlocked: false,
    requirements: { type: 'profile', value: 1 }
  },
  {
    id: 'complete_profile',
    name: 'Tam Profil',
    description: 'Profilini tamamladın',
    icon: 'account-check',
    category: 'profile',
    unlocked: false,
    requirements: { type: 'profile', value: 1 }
  },
  {
    id: 'profile_storyteller',
    name: 'Hikaye Anlatıcısı',
    description: 'Detaylı bir biyografi yazdın',
    icon: 'book-open-page-variant',
    category: 'profile',
    unlocked: false,
    requirements: { type: 'profile', value: 1 }
  },
  {
    id: 'profile_goals',
    name: 'Hedef Belirleyici',
    description: 'Terapi hedeflerini belirledin',
    icon: 'flag-checkered',
    category: 'profile',
    unlocked: false,
    requirements: { type: 'profile', value: 1 }
  },
  // YENİ: Ek Profil Rozetleri
  {
    id: 'profile_customizer',
    name: 'Özel Profil',
    description: 'Profilini kişiselleştirdin',
    icon: 'palette',
    category: 'profile',
    unlocked: false,
    requirements: { type: 'profile', value: 1 }
  },
  {
    id: 'profile_personalizer',
    name: 'Kişisel Dokunuş',
    description: 'Profil adını ve doğum tarihini ayarladın',
    icon: 'pencil-box',
    category: 'profile',
    unlocked: false,
    requirements: { type: 'profile', value: 1 }
  },
  {
    id: 'profile_details',
    name: 'Ayrıntılı Profil',
    description: 'Tüm profil alanlarını doldurdun',
    icon: 'card-account-details',
    category: 'profile',
    unlocked: false,
    requirements: { type: 'profile', value: 1 }
  },

  // Streak Rozetleri
  {
    id: 'streak_recovery',
    name: 'Seri Kurtarıcı',
    description: 'Kaçırdığın bir günden sonra seriyi devam ettirdin',
    icon: 'replay',
    category: 'streak',
    unlocked: false,
    requirements: { type: 'streak', value: 1 }
  },

  // YENİ: GÜNLÜK YAZMA KATEGORİSİ İÇİN EK ROZETLER
  {
    id: 'daily_100',
    name: 'Günlük Yazıları Yüzlük',
    description: '100 günlük yazı yazdın',
    icon: 'book-multiple-outline',
    category: 'daily',
    unlocked: false,
    requirements: { type: 'count', value: 100 }
  },
  {
    id: 'daily_200',
    name: 'Günlük Yazıları İkiyüzlük',
    description: '200 günlük yazı yazdın',
    icon: 'book-multiple',
    category: 'daily',
    unlocked: false,
    requirements: { type: 'count', value: 200 }
  },
  {
    id: 'happy_diarist',
    name: 'Mutlu Günlükçü',
    description: '10 kez mutlu ruh hali kaydı tutuldu',
    icon: 'emoticon-happy-outline',
    category: 'daily',
    unlocked: false,
    requirements: { type: 'count', value: 10 }
  },
  {
    id: 'analytical_diarist',
    name: 'Analitik Günlükçü',
    description: 'Tüm duygu durumlarını deneyimledin',
    icon: 'chart-bubble',
    category: 'daily', 
    unlocked: false,
    requirements: { type: 'count', value: 1 }
  },
  {
    id: 'consistent_morning',
    name: 'Sabah Ritüeli',
    description: '7 sabah günlük yazdın',
    icon: 'weather-sunny',
    category: 'daily',
    unlocked: false,
    requirements: { type: 'count', value: 7 }
  },
  {
    id: 'night_owl',
    name: 'Gece Kuşu',
    description: '7 gece günlük yazdın',
    icon: 'weather-night',
    category: 'daily',
    unlocked: false,
    requirements: { type: 'count', value: 7 }
  },
  {
    id: 'weekend_writer',
    name: 'Haftasonu Yazarı',
    description: '5 haftasonu günlük yazdın',
    icon: 'calendar-weekend',
    category: 'daily',
    unlocked: false,
    requirements: { type: 'count', value: 5 }
  },
  {
    id: 'diary_attachments',
    name: 'Görsel Günlükçü',
    description: 'Günlüğüne görseller ekledin',
    icon: 'image-multiple-outline',
    category: 'daily',
    unlocked: false,
    requirements: { type: 'count', value: 1 }
  },
  
  // YENİ: SEANS KATEGORİSİ İÇİN EK ROZETLER
  {
    id: 'therapy_marathon',
    name: 'Terapi Maratonu',
    description: '50 seans tamamladın',
    icon: 'run-fast',
    category: 'session',
    unlocked: false,
    requirements: { type: 'count', value: 50 }
  },
  {
    id: 'weekly_sessions',
    name: 'Haftalık Terapi',
    description: '4 hafta üst üste seans yaptın',
    icon: 'calendar-clock',
    category: 'session',
    unlocked: false,
    requirements: { type: 'count', value: 4 }
  },
  {
    id: 'consistent_time',
    name: 'Tutarlı Zaman',
    description: 'Aynı saatte 3 seans yaptın',
    icon: 'clock-check-outline',
    category: 'session',
    unlocked: false,
    requirements: { type: 'count', value: 3 }
  },
  {
    id: 'long_text_session',
    name: 'Derin Yazılı Seans',
    description: '60+ dakika süren bir yazılı seans',
    icon: 'text-box-check-outline',
    category: 'session',
    unlocked: false,
    requirements: { type: 'count', value: 1 }
  },
  {
    id: 'voice_session_pro',
    name: 'Sesli Seans Uzmanı',
    description: '30+ dakika süren bir sesli seans',
    icon: 'microphone-outline',
    category: 'session',
    unlocked: false,
    requirements: { type: 'count', value: 1 }
  },
  {
    id: 'video_session_pro',
    name: 'Görüntülü Seans Uzmanı',
    description: '30+ dakika süren bir görüntülü seans',
    icon: 'video-outline',
    category: 'session',
    unlocked: false,
    requirements: { type: 'count', value: 1 }
  },
  {
    id: 'therapy_questions',
    name: 'Sorgulayıcı Danışan',
    description: 'Bir seansta 5+ soru sordun',
    icon: 'help-circle-outline',
    category: 'session',
    unlocked: false,
    requirements: { type: 'count', value: 1 }
  },
  {
    id: 'therapy_feedback',
    name: 'Terapist Değerlendirmesi',
    description: '3 seans sonrası değerlendirme yaptın',
    icon: 'star-half-full',
    category: 'session',
    unlocked: false,
    requirements: { type: 'count', value: 3 }
  },
  
  // YENİ: AI KATEGORİSİ İÇİN EK ROZETLER
  {
    id: 'ai_analyzer_advanced',
    name: 'İleri AI Kullanıcısı',
    description: '25 AI özeti oluşturdun',
    icon: 'robot-happy-outline',
    category: 'ai',
    unlocked: false,
    requirements: { type: 'ai', value: 25 }
  },
  {
    id: 'ai_month_review',
    name: 'Aylık Değerlendirme',
    description: 'Bir aylık veriyi AI ile analiz ettin',
    icon: 'calendar-month-outline',
    category: 'ai',
    unlocked: false,
    requirements: { type: 'ai', value: 1 }
  },
  {
    id: 'ai_custom_prompts',
    name: 'Özel AI Soruları',
    description: 'AI\'ya kendi özel sorularını sordun',
    icon: 'format-text-variant-outline',
    category: 'ai',
    unlocked: false,
    requirements: { type: 'ai', value: 1 }
  },
  {
    id: 'ai_daily_chat',
    name: 'AI Sohbet Arkadaşı',
    description: 'AI ile günlük konuşma yaptın',
    icon: 'message-text-outline',
    category: 'ai',
    unlocked: false,
    requirements: { type: 'ai', value: 1 }
  },
  {
    id: 'ai_mood_patterns',
    name: 'Duygu Kalıpları',
    description: 'AI ile duygu değişimlerini analiz ettin',
    icon: 'chart-line-variant',
    category: 'ai',
    unlocked: false,
    requirements: { type: 'ai', value: 1 }
  },
  
  // YENİ: PROFİL KATEGORİSİ İÇİN EK ROZETLER
  {
    id: 'profile_therapist_match',
    name: 'Terapist Eşleşmesi',
    description: 'Kişilik profiline göre terapist seçtin',
    icon: 'account-switch-outline',
    category: 'profile',
    unlocked: false,
    requirements: { type: 'profile', value: 1 }
  },
  {
    id: 'profile_theme',
    name: 'Tema Seçicisi',
    description: 'Uygulama temasını değiştirdin',
    icon: 'format-color-fill',
    category: 'profile',
    unlocked: false,
    requirements: { type: 'profile', value: 1 }
  },
  {
    id: 'profile_reminders',
    name: 'Hatırlatıcı Ayarı',
    description: 'Kişisel hatırlatıcıları ayarladın',
    icon: 'bell-outline',
    category: 'profile',
    unlocked: false,
    requirements: { type: 'profile', value: 1 }
  },
  {
    id: 'profile_preferences',
    name: 'Tercih Uzmanı',
    description: 'Tüm profil tercihlerini ayarladın',
    icon: 'cog-outline',
    category: 'profile',
    unlocked: false,
    requirements: { type: 'profile', value: 1 }
  },
  
  // YENİ: STREAK KATEGORİSİ İÇİN EK ROZETLER
  {
    id: 'streak_21',
    name: '21 Günlük Alışkanlık',
    description: '21 gün üst üste günlük yazdın',
    icon: 'fire',
    category: 'streak',
    unlocked: false,
    requirements: { type: 'streak', value: 21 }
  },
  {
    id: 'streak_weekend',
    name: 'Haftasonu Savaşçısı',
    description: '5 haftasonu üst üste günlük yazdın',
    icon: 'calendar-weekend-outline',
    category: 'streak',
    unlocked: false,
    requirements: { type: 'streak', value: 5 }
  },
  
  // YENİ: DIARY (GÜNLÜK) KATEGORİSİ İÇİN EK ROZETLER
  {
    id: 'diary_structured',
    name: 'Yapılandırılmış Günlük',
    description: 'Şablonlu günlük kullandın',
    icon: 'notebook-outline',
    category: 'diary',
    unlocked: false,
    requirements: { type: 'count', value: 1 }
  },
  {
    id: 'diary_gratitude',
    name: 'Minnet Günlüğü',
    description: 'Minnet günlüğü tuttun',
    icon: 'heart-outline',
    category: 'diary',
    unlocked: false,
    requirements: { type: 'count', value: 1 }
  },
  {
    id: 'diary_goals',
    name: 'Hedef Günlüğü',
    description: 'Hedef günlüğü tuttun',
    icon: 'target',
    category: 'diary',
    unlocked: false,
    requirements: { type: 'count', value: 1 }
  },
  {
    id: 'diary_mood_tracker',
    name: 'Duygu İzleyici',
    description: 'Duygu izleme günlüğü tuttun',
    icon: 'emoticon-outline',
    category: 'diary',
    unlocked: false,
    requirements: { type: 'count', value: 1 }
  },
  {
    id: 'diary_reflective',
    name: 'Yansıtıcı Günlük',
    description: 'Yansıtıcı düşünce günlüğü tuttun',
    icon: 'mirror',
    category: 'diary',
    unlocked: false,
    requirements: { type: 'count', value: 1 }
  },
  {
    id: 'diary_creative',
    name: 'Yaratıcı Günlük',
    description: 'Yaratıcı günlük tuttun',
    icon: 'palette-outline',
    category: 'diary',
    unlocked: false,
    requirements: { type: 'count', value: 1 }
  },
  {
    id: 'diary_dream',
    name: 'Rüya Günlüğü',
    description: 'Rüya günlüğü tuttun',
    icon: 'sleep',
    category: 'diary',
    unlocked: false,
    requirements: { type: 'count', value: 1 }
  },
  {
    id: 'diary_audio',
    name: 'Sesli Günlük',
    description: 'Sesli günlük kaydı yaptın',
    icon: 'microphone-variant',
    category: 'diary',
    unlocked: false,
    requirements: { type: 'count', value: 1 }
  },
  {
    id: 'diary_photo',
    name: 'Fotoğraflı Günlük',
    description: 'Fotoğraflı günlük tuttun',
    icon: 'image-outline',
    category: 'diary',
    unlocked: false,
    requirements: { type: 'count', value: 1 }
  },
  {
    id: 'diary_video',
    name: 'Video Günlük',
    description: 'Video günlük kaydı yaptın',
    icon: 'video-outline',
    category: 'diary',
    unlocked: false,
    requirements: { type: 'count', value: 1 }
  },
  {
    id: 'diary_morning',
    name: 'Sabah Günlüğü',
    description: 'Sabah günlüğü tutma alışkanlığı edindin',
    icon: 'white-balance-sunny',
    category: 'diary',
    unlocked: false,
    requirements: { type: 'count', value: 10 }
  },
  {
    id: 'diary_evening',
    name: 'Akşam Günlüğü',
    description: 'Akşam günlüğü tutma alışkanlığı edindin',
    icon: 'weather-sunset',
    category: 'diary',
    unlocked: false,
    requirements: { type: 'count', value: 10 }
  },
  
  // YENİ KATEGORİ: TAMAMLAMA ROZETLERI (COMPLETION)
  {
    id: 'badges_10',
    name: 'Rozet Koleksiyoncusu',
    description: '10 rozet kazandın',
    icon: 'medal-outline',
    category: 'profile',
    unlocked: false,
    requirements: { type: 'count', value: 10 }
  },
  {
    id: 'badges_25',
    name: 'Rozet Avcısı',
    description: '25 rozet kazandın',
    icon: 'medal',
    category: 'profile',
    unlocked: false,
    requirements: { type: 'count', value: 25 }
  },
  {
    id: 'badges_50',
    name: 'Rozet Ustası',
    description: '50 rozet kazandın',
    icon: 'trophy-variant-outline',
    category: 'profile',
    unlocked: false,
    requirements: { type: 'count', value: 50 }
  },
  {
    id: 'badges_75',
    name: 'Üstün Başarı',
    description: '75 rozet kazandın',
    icon: 'trophy-variant',
    category: 'profile',
    unlocked: false,
    requirements: { type: 'count', value: 75 }
  },
  {
    id: 'badges_100',
    name: 'Tam Tamamlama',
    description: 'Tüm 100 rozeti kazandın',
    icon: 'trophy-award',
    category: 'profile',
    unlocked: false,
    requirements: { type: 'count', value: 100 }
  },

  // STREAK KATEGORİSİ (3 YENİ ROZET)
  {
    id: 'streak_consecutive_monday',
    name: 'Pazartesi Savaşçısı',
    description: '8 Pazartesi üst üste günlük yazdın',
    icon: 'calendar-outline',
    category: 'streak',
    unlocked: false,
    requirements: { type: 'streak', value: 8 }
  },
  {
    id: 'streak_comeback',
    name: 'Geri Dönüşçü',
    description: 'Bir aylık aradan sonra tekrar günlük yazmaya başladın',
    icon: 'reload-outline',
    category: 'streak',
    unlocked: false,
    requirements: { type: 'streak', value: 1 }
  },
  {
    id: 'streak_midnight',
    name: 'Gece Yarısı Yazarı',
    description: 'Gece yarısı (00:00-01:00) günlük yazdın',
    icon: 'moon-outline',
    category: 'streak',
    unlocked: false,
    requirements: { type: 'streak', value: 1 }
  },

  // AI KATEGORİSİ (3 YENİ ROZET)
  {
    id: 'ai_prompt_master',
    name: 'AI Sorgu Uzmanı',
    description: 'AI\'ya 15+ farklı soru sordun',
    icon: 'help-buoy-outline',
    category: 'ai',
    unlocked: false,
    requirements: { type: 'ai', value: 15 }
  },
  {
    id: 'ai_data_analyzer',
    name: 'Veri Analisti',
    description: 'AI ile 3 aylık veri analizini tamamladın',
    icon: 'analytics-outline',
    category: 'ai',
    unlocked: false,
    requirements: { type: 'ai', value: 1 }
  },
  {
    id: 'ai_creative_collaborator',
    name: 'Yaratıcı Ortaklık',
    description: 'AI ile yaratıcı bir proje oluşturdun',
    icon: 'bulb-outline',
    category: 'ai',
    unlocked: false,
    requirements: { type: 'ai', value: 1 }
  },

  // DAILY KATEGORİSİ (1 YENİ ROZET)
  {
    id: 'daily_travel_journal',
    name: 'Seyahat Günlüğü',
    description: 'Seyahat ederken günlük yazdın',
    icon: 'airplane-outline',
    category: 'daily',
    unlocked: false,
    requirements: { type: 'count', value: 1 }
  },

  // DIARY KATEGORİSİ (1 YENİ ROZET)
  {
    id: 'diary_yearly_review',
    name: 'Yıllık Değerlendirme',
    description: 'Bir yıllık günlük yazımını tamamladın',
    icon: 'calendar-number-outline',
    category: 'diary',
    unlocked: false,
    requirements: { type: 'count', value: 1 }
  },

  // SESSION KATEGORİSİ (1 YENİ ROZET)
  {
    id: 'session_anniversary',
    name: 'Terapi Yıldönümü',
    description: 'Bir yıl boyunca düzenli terapi seansları yaptın',
    icon: 'gift-outline',
    category: 'session',
    unlocked: false,
    requirements: { type: 'count', value: 1 }
  }
];

export interface BadgeUpdateData {
  // Günlük rozetleri
  totalEntries?: number;

  // Seans rozetleri
  textSessions?: number;
  voiceSessions?: number;
  videoSessions?: number;
  totalSessions?: number;
  
  // Özel durumlar için
  diverseSessionCompleted?: boolean;
  aiDiaryCompleted?: number;
  dailyWriterNovice?: boolean;
  dailyWriterExpert?: boolean;

  // Seri rozetleri
  streak?: number;
  longestStreak?: number;

  // Profil rozetleri
  profileComplete?: boolean;
  hasPhoto?: boolean;
  hasBio?: boolean;
  hasGoals?: boolean;
  customizedProfile?: boolean;

  // AI rozetleri
  aiSummaries?: number;
  diaryAnalysis?: number;
  aiInsights?: boolean;
}

export async function checkAndUpdateBadges(type: string, data: BadgeUpdateData): Promise<void> {
  try {
    const stored = await AsyncStorage.getItem('user_badges');
    const badges = stored ? JSON.parse(stored) : defaultBadges;
    let updated = false;

    for (const badge of badges) {
      if (badge.unlocked || !badge.requirements) continue;

      let shouldUnlock = false;

      switch (badge.requirements.type) {
        case 'count':
          if (type === 'daily' && badge.category === 'daily') {
            if (badge.id === 'daily_writer_novice') {
              shouldUnlock = data.dailyWriterNovice || false;
            } else if (badge.id === 'daily_writer_expert') {
              shouldUnlock = data.dailyWriterExpert || false;
            } else {
            shouldUnlock = (data.totalEntries || 0) >= badge.requirements.value;
            }
          } else if (type === 'session' && badge.category === 'session') {
            switch (badge.id) {
              case 'first_session':
                shouldUnlock = (data.totalSessions || 0) >= badge.requirements.value;
                break;
              case 'text_expert':
                shouldUnlock = (data.textSessions || 0) >= badge.requirements.value;
                break;
              case 'voice_expert':
                shouldUnlock = (data.voiceSessions || 0) >= badge.requirements.value;
                break;
              case 'video_expert':
                shouldUnlock = (data.videoSessions || 0) >= badge.requirements.value;
                break;
              case 'session_master':
                shouldUnlock = (data.totalSessions || 0) >= badge.requirements.value;
                break;
              case 'therapy_dedication':
                shouldUnlock = (data.totalSessions || 0) >= badge.requirements.value;
                break;
              case 'therapy_master':
                shouldUnlock = (data.totalSessions || 0) >= badge.requirements.value;
                break;
              case 'diverse_therapy':
                shouldUnlock = data.diverseSessionCompleted || false;
                break;
              case 'session_consistency_1m':
              case 'session_consistency_3m':
              case 'session_consistency_6m':
              case 'session_anniversary':
                // Bu rozetler özel kontrol gerektirir - Şimdilik varsayılan kontroller kullanılır
                shouldUnlock = (data.totalSessions || 0) >= badge.requirements.value;
                break;
            }
          } else if ((type === 'diary' || type === 'ai') && badge.category === 'diary') {
            if (badge.id === 'ai_diary_starter') {
              shouldUnlock = (data.aiDiaryCompleted || 0) >= badge.requirements.value;
            } else if (badge.id === 'diary_analyzer') {
              shouldUnlock = (data.diaryAnalysis || 0) >= badge.requirements.value;
            } else if (badge.id === 'first_ai' || badge.id === 'ai_supporter' || badge.id === 'ai_master') {
              shouldUnlock = (data.aiSummaries || 0) >= badge.requirements.value;
            } else if (badge.id.startsWith('diary_consistency_')) {
              // Düzenlilik rozetleri toplam giriş sayısına göre kontrol edilir
              shouldUnlock = (data.totalEntries || 0) >= badge.requirements.value;
            }
          } else if (type === 'ai' && badge.category === 'ai') {
            if (badge.id === 'first_ai' || badge.id === 'ai_supporter' || badge.id === 'ai_master') {
              shouldUnlock = (data.aiSummaries || 0) >= badge.requirements.value;
            } else if (badge.id === 'ai_insights') {
              shouldUnlock = data.aiInsights || false;
            }
          }
          break;

        case 'streak':
          if (type === 'streak' && badge.category === 'streak' && data.streak) {
            shouldUnlock = data.streak >= badge.requirements.value;
          }
          break;

        case 'profile':
          if (type === 'profile' && badge.category === 'profile') {
            if (badge.id === 'profile_photo') {
              shouldUnlock = data.hasPhoto || false;
            } else if (badge.id === 'complete_profile') {
              shouldUnlock = data.profileComplete || false;
            } else if (badge.id === 'profile_storyteller') {
              shouldUnlock = data.hasBio || false;
            } else if (badge.id === 'profile_goals') {
              shouldUnlock = data.hasGoals || false;
            } else if (badge.id === 'profile_customizer') {
              shouldUnlock = data.customizedProfile || false;
            }
          }
          break;

        case 'ai':
          if (type === 'ai' && badge.category === 'ai') {
            if (badge.id === 'first_ai' || badge.id === 'ai_supporter' || badge.id === 'ai_master') {
              shouldUnlock = (data.aiSummaries || 0) >= badge.requirements.value;
            } else if (badge.id === 'ai_insights') {
              shouldUnlock = data.aiInsights || false;
            }
          }
          break;
      }

      if (shouldUnlock) {
        badge.unlocked = true;
        badge.unlockedAt = new Date().toISOString();
        updated = true;
      }
    }

    if (updated) {
      await AsyncStorage.setItem('user_badges', JSON.stringify(badges));
    }
  } catch (error) {
    console.error('Rozetler güncellenirken hata:', error);
  }
} 