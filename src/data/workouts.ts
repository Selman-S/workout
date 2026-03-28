import { WorkoutDay } from "@/types";

export const workoutProgram: WorkoutDay[] = [
  {
    day: "monday",
    dayLabel: "Pazartesi",
    dayTitle: "Güç ve Temel Hareketler",
    daySubtitle:
      "Ağır kilo, yavaş ve kontrollü tekrarlar. Kas inşası için temel gün.",
    color: "#ef4444",
    exercises: [
      {
        order: 1,
        name: "Goblet Squat",
        sets: 4,
        reps: "8-10",
        rest: 90,
        tip: "Dambılı göğüste sıkı tut, topuklara bas.",
      },
      {
        order: 2,
        name: "Dumbbell Floor Press",
        sets: 4,
        reps: "8-10",
        rest: 90,
        tip: "Yerde yatarken dirsekler yere değince dur, patlayıcı it.",
      },
      {
        order: 3,
        name: "Tek Kol Dumbbell Row",
        sets: 4,
        reps: "10",
        rest: 60,
        tip: "Dirseğini kalçana doğru çek, sırtını sıkıştır.",
      },
      {
        order: 4,
        name: "DB Shoulder Press",
        sets: 3,
        reps: "8-10",
        rest: 60,
        tip: "Ayakta yaparken karın kaslarını sık, belini bükme.",
      },
      {
        order: 5,
        name: "Romanian Deadlift",
        sets: 3,
        reps: "10",
        rest: 60,
        tip: "Dizleri kırmadan dambılı kaval kemiğine kadar indir.",
      },
      {
        order: 6,
        name: "Dumbbell Curl",
        sets: 3,
        reps: "10-12",
        rest: 45,
        tip: "Dirsekleri gövdeye sabitle, sadece ön kol hareket etsin.",
      },
      {
        order: 7,
        name: "Overhead Triceps Ext.",
        sets: 3,
        reps: "10-12",
        rest: 45,
        tip: "Dambılı baş arkasından yukarı doğru it.",
      },
      {
        order: 8,
        name: "Plank",
        sets: 3,
        reps: "Max Saniye",
        rest: 45,
        tip: "Vücudun ok gibi düz olsun, kalçayı düşürme.",
      },
    ],
  },
  {
    day: "wednesday",
    dayLabel: "Çarşamba",
    dayTitle: "Hacim ve Pump",
    daySubtitle:
      "Yüksek tekrar, kaslarda yanma hissi. Yağ yakımını ve kas detayını artırır.",
    color: "#3b82f6",
    exercises: [
      {
        order: 1,
        name: "Bulgarian Split Squat",
        sets: 3,
        reps: "10 (Her Bacak)",
        rest: 60,
        tip: "Arka ayağını koltuğa koy, dengeni koru.",
      },
      {
        order: 2,
        name: "Şınav (Push-up)",
        sets: 4,
        reps: "Max",
        rest: 60,
        tip: "Göğsünü yere yaklaştır, vücut bütünlüğünü bozma.",
      },
      {
        order: 3,
        name: "Direnç Bandı Row",
        sets: 3,
        reps: "12-15",
        rest: 45,
        tip: "Bandı bir yere sabitle veya ayağına dola, sert çek.",
      },
      {
        order: 4,
        name: "Lateral Raise",
        sets: 4,
        reps: "12-15",
        rest: 45,
        tip: "Dambılları yanlara omuz hizasına kadar aç.",
      },
      {
        order: 5,
        name: "Hip Thrust",
        sets: 3,
        reps: "12-15",
        rest: 60,
        tip: "Sırtını koltuğa daya, kalçanı yukarı itip sık.",
      },
      {
        order: 6,
        name: "Hammer Curl",
        sets: 3,
        reps: "12",
        rest: 45,
        tip: "Avuç içleri birbirine bakacak şekilde tut (çekiç tutuşu).",
      },
      {
        order: 7,
        name: "Triceps Pushdown",
        sets: 3,
        reps: "12-15",
        rest: 45,
        tip: "Direnç bandını yukarı sabitle, aşağı doğru bas.",
      },
      {
        order: 8,
        name: "Leg Raise",
        sets: 3,
        reps: "12-15",
        rest: 45,
        tip: "Yerde yatarken bacakları kırmadan yukarı kaldır.",
      },
    ],
  },
  {
    day: "friday",
    dayLabel: "Cuma",
    dayTitle: "Yoğunluk ve Metabolik Stres",
    daySubtitle:
      "Dinlenme sürelerini kısa tutarak nabzı yükseltmek ve yağ yakımını tetiklemek.",
    color: "#22c55e",
    exercises: [
      {
        order: 1,
        name: "Dumbbell Squat",
        sets: 4,
        reps: "10-12",
        rest: 60,
        tip: "İki dambılı yanlarda tutarak kontrollü çök.",
      },
      {
        order: 2,
        name: "Incline Push-up",
        sets: 4,
        reps: "Max",
        rest: 60,
        tip: "Ayaklarını koltuğa koy, eller yerde (Üst göğüs odaklı).",
      },
      {
        order: 3,
        name: "Dumbbell Row",
        sets: 3,
        reps: "10",
        rest: 45,
        tip: "Çift dambıl ile aynı anda çekiş yap.",
      },
      {
        order: 4,
        name: "Pike Push-up",
        sets: 3,
        reps: "8-12",
        rest: 60,
        tip: 'Kalçayı havaya kaldır, "V" şeklinde omuz pres yap.',
      },
      {
        order: 5,
        name: "Romanian Deadlift",
        sets: 3,
        reps: "10",
        rest: 45,
        tip: "Arka bacaklarındaki gerilmeyi hisset.",
      },
      {
        order: 6,
        name: "Lateral Raise",
        sets: 3,
        reps: "15",
        rest: 30,
        tip: "Kısa dinlenme ile omuzları iyice yak.",
      },
      {
        order: 7,
        name: "Curl + Tricep Süperset",
        sets: 3,
        reps: "12",
        rest: 0,
        tip: "Curl biter bitmez dinlenmeden arka kol yap.",
      },
      {
        order: 8,
        name: "Russian Twist",
        sets: 3,
        reps: "20",
        rest: 30,
        tip: "Otururken ayakları kaldır, dambıl ile sağa-sola dön.",
      },
    ],
  },
];

// Helper: get total sets for a workout day
export function getTotalSets(day: WorkoutDay): number {
  return day.exercises.reduce((sum, ex) => sum + ex.sets, 0);
}

// Helper: map JS day index (0=Sun) to workout day key
export function getTodayWorkoutDay(): string | null {
  const dayMap: Record<number, string> = {
    1: "monday",
    3: "wednesday",
    5: "friday",
  };
  return dayMap[new Date().getDay()] || null;
}

// Helper: get next workout day
export function getNextWorkoutDay(): WorkoutDay {
  const jsDay = new Date().getDay();
  if (jsDay < 1 || jsDay >= 5) return workoutProgram[0]; // Mon
  if (jsDay < 3) return workoutProgram[1]; // Wed
  if (jsDay < 5) return workoutProgram[2]; // Fri
  return workoutProgram[0]; // Mon next week
}
