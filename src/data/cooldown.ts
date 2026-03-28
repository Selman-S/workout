// Cool-down stretching exercises performed after the main workout
export interface CooldownExercise {
  name: string;
  duration: number;
  tip: string;
}

export const cooldownExercises: CooldownExercise[] = [
  { name: "Kuadriseps Esneme", duration: 30, tip: "Ayakta durup bir ayağını arkadan tut, ön bacağı ger." },
  { name: "Hamstring Esneme", duration: 30, tip: "Oturup bacağını uzat, parmak uçlarına doğru uzan." },
  { name: "Göğüs Açma", duration: 30, tip: "Kollarını arkada birleştir, göğsünü aç ve nefes al." },
  { name: "Omuz Esneme", duration: 30, tip: "Bir kolu göğsünden karşıya çek, diğer elle tut." },
  { name: "Sırt Esneme", duration: 30, tip: "Child's pose: dizlerin üstünde öne uzan, kolları ileri at." },
  { name: "Derin Nefes", duration: 30, tip: "Gözlerini kapat, 4sn nefes al, 4sn ver. Rahatla." },
];

export const COOLDOWN_TOTAL_SECONDS = cooldownExercises.reduce((a, e) => a + e.duration, 0);
