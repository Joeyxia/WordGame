import { Injectable, NotFoundException } from "@nestjs/common";
import { AgeTrack, LearningState } from "@prisma/client";
import { nextReviewAt } from "@wordquest/shared";
import { PrismaService } from "../database/prisma.service";
import { SubmitWordResultDto } from "./dto-submit-word-result";

@Injectable()
export class LearningService {
  constructor(private readonly prisma: PrismaService) {}

  private async getRewardConfig() {
    const latestConfig = await this.prisma.adminAuditLog.findFirst({
      where: { action: "GLOBAL_CONFIG_UPDATED" },
      orderBy: { createdAt: "desc" }
    });
    const metadata = (latestConfig?.metadata || {}) as Partial<{ rewardXpCorrect: number; rewardCoinsCorrect: number }>;
    return {
      rewardXpCorrect: metadata.rewardXpCorrect && metadata.rewardXpCorrect > 0 ? metadata.rewardXpCorrect : 8,
      rewardCoinsCorrect: metadata.rewardCoinsCorrect && metadata.rewardCoinsCorrect > 0 ? metadata.rewardCoinsCorrect : 5
    };
  }

  private challengeTemplates(ageTrack: AgeTrack) {
    if (ageTrack === AgeTrack.AGE_10) {
      return [
        { id: "bridge-repair", title: "Repair Bridge", description: "Use gathered materials to repair the bridge path.", requiredWords: 5, xp: 20, coins: 12, wood: 3, stone: 2, unlockZone: "stone-bridge" },
        { id: "forest-scout", title: "Forest Scout", description: "Explore the forest and recover hidden supplies.", requiredWords: 10, xp: 25, coins: 14, wood: 2, stone: 1, unlockZone: "forest-trail" },
        { id: "tower-light", title: "Light Tower", description: "Power up the learning tower beacon.", requiredWords: 15, xp: 30, coins: 16, wood: 2, stone: 3, unlockZone: "learning-tower" },
        { id: "camp-defense", title: "Camp Defense", description: "Defend camp and protect your resource chest.", requiredWords: 20, xp: 40, coins: 20, wood: 4, stone: 2, unlockZone: "camp-gate" }
      ];
    }
    return [
      { id: "signal-reactor", title: "Signal Reactor", description: "Stabilize the reactor by solving clue nodes.", requiredWords: 5, xp: 24, coins: 14, wood: 2, stone: 2, unlockZone: "reactor-core" },
      { id: "data-patrol", title: "Data Patrol", description: "Patrol routes and decode world terminals.", requiredWords: 10, xp: 30, coins: 16, wood: 2, stone: 3, unlockZone: "data-corridor" },
      { id: "supply-forge", title: "Supply Forge", description: "Forge supplies for advanced structures.", requiredWords: 15, xp: 34, coins: 20, wood: 3, stone: 4, unlockZone: "forge-yard" },
      { id: "final-expedition", title: "Final Expedition", description: "Complete expedition and secure the zone.", requiredWords: 20, xp: 45, coins: 25, wood: 4, stone: 4, unlockZone: "expedition-gate" }
    ];
  }

  private dailyWordsByTrack(ageTrack: AgeTrack, settings: { defaultDailyNewWords10: number; defaultDailyNewWords13: number }) {
    return ageTrack === AgeTrack.AGE_10 ? settings.defaultDailyNewWords10 : settings.defaultDailyNewWords13;
  }

  async generateTodayTask(childProfileId: string) {
    const child = await this.prisma.childProfile.findUnique({
      where: { id: childProfileId },
      include: { household: { include: { settings: true } } }
    });

    if (!child || !child.household.settings) {
      throw new NotFoundException("Child profile or settings missing");
    }
    if (!child.isActive) {
      throw new NotFoundException("Child profile is inactive");
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await this.prisma.dailyTask.findUnique({
      where: { childProfileId_taskDate: { childProfileId, taskDate: today } },
      include: { taskItems: { include: { word: true } } }
    });

    if (existing) {
      return existing;
    }

    const plannedNewWords = this.dailyWordsByTrack(child.ageTrack, child.household.settings);

    const reviewOrder = child.household.settings.reviewPriorityStrict
      ? [{ state: "asc" as const }, { nextReviewAt: "asc" as const }, { wrongCount: "desc" as const }]
      : [{ wrongCount: "desc" as const }, { nextReviewAt: "asc" as const }];

    const reviewRecords = await this.prisma.learningRecord.findMany({
      where: {
        childProfileId,
        nextReviewAt: { lte: new Date() },
        state: { in: [LearningState.LEARNING, LearningState.REVIEWING, LearningState.WEAK] }
      },
      orderBy: reviewOrder,
      take: plannedNewWords
    });

    const reviewWordIds = reviewRecords.map((record) => record.wordId);

    const newWords = await this.prisma.word.findMany({
      where: {
        ageTrack: child.ageTrack,
        learningRecords: { none: { childProfileId } },
        id: { notIn: reviewWordIds }
      },
      take: Math.max(plannedNewWords - reviewWordIds.length, 0)
    });

    const configSnapshot = {
      plannedNewWords,
      ageTrack: child.ageTrack,
      generatedAt: new Date().toISOString(),
      reviewPriorityStrict: child.household.settings.reviewPriorityStrict
    };

    const task = await this.prisma.dailyTask.create({
      data: {
        childProfileId,
        taskDate: today,
        plannedNewWords,
        plannedMinutes: child.household.settings.dailyMaxMinutes,
        carryOverReviewCount: Math.max(reviewRecords.length - plannedNewWords, 0),
        configSnapshot,
        taskItems: {
          create: [
            ...reviewRecords.map((record, idx) => ({
              wordId: record.wordId,
              isReview: true,
              groupIndex: Math.floor(idx / 5),
              orderInGroup: idx % 5
            })),
            ...newWords.map((word, idx) => {
              const absolute = reviewRecords.length + idx;
              return {
                wordId: word.id,
                isReview: false,
                groupIndex: Math.floor(absolute / 5),
                orderInGroup: absolute % 5
              };
            })
          ]
        }
      },
      include: {
        taskItems: { include: { word: true }, orderBy: [{ groupIndex: "asc" }, { orderInGroup: "asc" }] }
      }
    });

    for (const word of newWords) {
      await this.prisma.learningRecord.create({
        data: {
          childProfileId,
          wordId: word.id,
          ageTrack: child.ageTrack,
          contentVersion: "v1",
          sourcePackId: child.ageTrack === AgeTrack.AGE_10 ? "age10-core-v1" : "age13-core-v1",
          state: LearningState.NEW,
          srsStage: 0,
          nextReviewAt: nextReviewAt(new Date(), 0)
        }
      });
    }

    return task;
  }

  async getTodayTask(childProfileId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.prisma.dailyTask.findUnique({
      where: { childProfileId_taskDate: { childProfileId, taskDate: today } },
      include: {
        taskItems: {
          include: { word: true },
          orderBy: [{ groupIndex: "asc" }, { orderInGroup: "asc" }]
        }
      }
    });
  }

  async getChallenges(childProfileId: string) {
    const child = await this.prisma.childProfile.findUnique({
      where: { id: childProfileId },
      select: { id: true, ageTrack: true, isActive: true, name: true }
    });
    if (!child || !child.isActive) {
      throw new NotFoundException("Child profile not found");
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const task = await this.prisma.dailyTask.findUnique({
      where: { childProfileId_taskDate: { childProfileId, taskDate: today } },
      include: { taskItems: true }
    });

    const completedWords = task?.taskItems.filter((item) => item.completed).length ?? 0;
    const sessions = await this.prisma.gameSession.findMany({
      where: { childProfileId, sessionType: "challenge", startedAt: { gte: today } },
      orderBy: { startedAt: "desc" }
    });
    const completedChallengeIds = new Set(
      sessions
        .map((s) => ((s.metadata as { challengeId?: string } | null)?.challengeId || "").trim())
        .filter(Boolean)
    );

    const challenges = this.challengeTemplates(child.ageTrack).map((item) => ({
      ...item,
      unlocked: completedWords >= item.requiredWords,
      completed: completedChallengeIds.has(item.id)
    }));

    return {
      child: { id: child.id, name: child.name, ageTrack: child.ageTrack },
      today: { completedWords, totalWords: task?.taskItems.length ?? 0 },
      challenges
    };
  }

  async completeChallenge(childProfileId: string, challengeId: string) {
    const child = await this.prisma.childProfile.findUnique({
      where: { id: childProfileId },
      select: { id: true, ageTrack: true, isActive: true }
    });
    if (!child || !child.isActive) {
      throw new NotFoundException("Child profile not found");
    }

    const all = this.challengeTemplates(child.ageTrack);
    const challenge = all.find((item) => item.id === challengeId);
    if (!challenge) {
      throw new NotFoundException("Challenge not found");
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const task = await this.prisma.dailyTask.findUnique({
      where: { childProfileId_taskDate: { childProfileId, taskDate: today } },
      include: { taskItems: true }
    });
    const completedWords = task?.taskItems.filter((item) => item.completed).length ?? 0;
    if (completedWords < challenge.requiredWords) {
      return {
        ok: false,
        message: `Challenge locked. Complete ${challenge.requiredWords} words first.`,
        requiredWords: challenge.requiredWords,
        completedWords
      };
    }

    const existingSessions = await this.prisma.gameSession.findMany({
      where: { childProfileId, sessionType: "challenge", startedAt: { gte: today } },
      orderBy: { startedAt: "desc" }
    });
    const completedIds = new Set(
      existingSessions
        .map((s) => ((s.metadata as { challengeId?: string } | null)?.challengeId || "").trim())
        .filter(Boolean)
    );
    if (completedIds.has(challenge.id)) {
      return { ok: true, message: "Challenge already completed today.", alreadyCompleted: true };
    }

    await this.prisma.$transaction(async (tx) => {
      const world = await tx.worldProgress.findUnique({ where: { childProfileId } });
      const unlocked = Array.isArray(world?.unlockedZones) ? (world?.unlockedZones as string[]) : ["starter-village"];
      const nextUnlocked = unlocked.includes(challenge.unlockZone) ? unlocked : [...unlocked, challenge.unlockZone];

      await tx.gameSession.create({
        data: {
          childProfileId,
          sessionType: "challenge",
          metadata: { challengeId: challenge.id, title: challenge.title, completedAt: new Date().toISOString() }
        }
      });
      await tx.worldProgress.upsert({
        where: { childProfileId },
        update: {
          xp: { increment: challenge.xp },
          coins: { increment: challenge.coins },
          unlockedZones: nextUnlocked
        },
        create: {
          childProfileId,
          xp: challenge.xp,
          coins: challenge.coins,
          unlockedZones: nextUnlocked
        }
      });
      await tx.buildInventory.upsert({
        where: { childProfileId },
        update: {
          wood: { increment: challenge.wood },
          stone: { increment: challenge.stone }
        },
        create: {
          childProfileId,
          wood: challenge.wood,
          stone: challenge.stone
        }
      });
      await tx.reward.create({
        data: {
          childProfileId,
          kind: `challenge:${challenge.id}`,
          amount: challenge.xp + challenge.coins
        }
      });
    });

    return {
      ok: true,
      message: `Challenge completed: ${challenge.title}. Rewards granted.`,
      reward: { xp: challenge.xp, coins: challenge.coins, wood: challenge.wood, stone: challenge.stone },
      challengeId: challenge.id
    };
  }

  async submitWordResult(dto: SubmitWordResultDto) {
    const reward = await this.getRewardConfig();
    let record = await this.prisma.learningRecord.findUnique({
      where: { childProfileId_wordId: { childProfileId: dto.childProfileId, wordId: dto.wordId } }
    });

    if (!record) {
      const child = await this.prisma.childProfile.findUnique({
        where: { id: dto.childProfileId },
        select: { ageTrack: true, isActive: true }
      });

      if (!child || !child.isActive) {
        throw new NotFoundException("Child profile not found");
      }

      record = await this.prisma.learningRecord.create({
        data: {
          childProfileId: dto.childProfileId,
          wordId: dto.wordId,
          ageTrack: child.ageTrack,
          contentVersion: "v1",
          sourcePackId: child.ageTrack === AgeTrack.AGE_10 ? "age10-core-v1" : "age13-core-v1",
          state: LearningState.NEW,
          srsStage: 0,
          nextReviewAt: nextReviewAt(new Date(), 0)
        }
      });
    }

    const nextStage = dto.correct ? Math.min(record.srsStage + 1, 5) : Math.max(record.srsStage - 1, 0);
    const nextState = dto.correct
      ? nextStage >= 5
        ? LearningState.MASTERED
        : LearningState.REVIEWING
      : LearningState.WEAK;

    const updated = await this.prisma.learningRecord.update({
      where: { id: record.id },
      data: {
        srsStage: nextStage,
        state: nextState,
        wrongCount: dto.correct ? record.wrongCount : record.wrongCount + 1,
        lastReviewedAt: new Date(),
        nextReviewAt: nextReviewAt(new Date(), nextStage)
      }
    });

    await this.prisma.taskItem.updateMany({
      where: { dailyTask: { childProfileId: dto.childProfileId }, wordId: dto.wordId },
      data: { completed: true }
    });

    await this.prisma.worldProgress.updateMany({
      where: { childProfileId: dto.childProfileId },
      data: {
        xp: { increment: dto.correct ? reward.rewardXpCorrect : 2 },
        coins: { increment: dto.correct ? reward.rewardCoinsCorrect : 1 }
      }
    });

    await this.prisma.buildInventory.updateMany({
      where: { childProfileId: dto.childProfileId },
      data: {
        wood: { increment: dto.correct ? 2 : 1 },
        stone: { increment: dto.correct ? 1 : 0 }
      }
    });

    return updated;
  }
}
