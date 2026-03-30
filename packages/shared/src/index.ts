export type AgeTrack = 10 | 13;

export type ReviewState = "new" | "learning" | "reviewing" | "weak" | "mastered";

export interface SrsIntervalRule {
  stage: number;
  minutes: number;
}

export const SRS_RULES: SrsIntervalRule[] = [
  { stage: 0, minutes: 10 },
  { stage: 1, minutes: 24 * 60 },
  { stage: 2, minutes: 3 * 24 * 60 },
  { stage: 3, minutes: 7 * 24 * 60 },
  { stage: 4, minutes: 14 * 24 * 60 },
  { stage: 5, minutes: 30 * 24 * 60 }
];

export interface LearningPriorityInput {
  weak: boolean;
  overdueMinutes: number;
  wrongCount: number;
}

export function computeReviewPriority(input: LearningPriorityInput): number {
  const weakBoost = input.weak ? 1_000_000 : 0;
  return weakBoost + input.overdueMinutes * 10 + input.wrongCount * 100;
}

export function nextReviewAt(now: Date, stage: number): Date {
  const matched = SRS_RULES.find((rule) => rule.stage === stage) ?? SRS_RULES[SRS_RULES.length - 1];
  return new Date(now.getTime() + matched.minutes * 60 * 1000);
}
