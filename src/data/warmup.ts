// Warm-up exercises performed before the main workout
export interface WarmupExercise {
  name: string;
  duration: number;
  tip: string;
}

export const warmupExercises: WarmupExercise[] = [
  { name: "Yerinde Koşu", duration: 60, tip: "Hafif tempoda yerinde koş, vücudunu ısıt." },
  { name: "Kol Çevirme", duration: 30, tip: "Kolları geniş daireler çizerek ileri-geri çevir." },
  { name: "Kalça Çevirme", duration: 30, tip: "Elleri belde, kalçayı saat yönü ve tersinde çevir." },
  { name: "Gövde Dönüşü", duration: 30, tip: "Kollar açık, gövdeyi sağa-sola döndür." },
  { name: "Bacak Salınımı", duration: 30, tip: "Duvara tutunarak bacağı ileri-geri salla." },
  { name: "Diz Çekme", duration: 30, tip: "Yerinde yüksek diz çekerek tempolu koş." },
  { name: "Jumping Jacks", duration: 30, tip: "Ayakları açıp kolları yukarı kaldır, geri kapat." },
  { name: "Dinamik Esneme", duration: 30, tip: "Kolları ve bacakları hafifçe germe hareketleri yap." },
];

export const WARMUP_TOTAL_SECONDS = warmupExercises.reduce((a, e) => a + e.duration, 0);
