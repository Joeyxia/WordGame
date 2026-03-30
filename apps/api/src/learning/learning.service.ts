import { Injectable, NotFoundException } from "@nestjs/common";
import { AgeTrack, LearningState } from "@prisma/client";
import { nextReviewAt } from "@wordquest/shared";
import { PrismaService } from "../database/prisma.service";
import { SubmitWordResultDto } from "./dto-submit-word-result";

@Injectable()
export class LearningService {
  constructor(private readonly prisma: PrismaService) {}

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

    const reviewRecords = await this.prisma.learningRecord.findMany({
      where: {
        childProfileId,
        nextReviewAt: { lte: new Date() },
        state: { in: [LearningState.LEARNING, LearningState.REVIEWING, LearningState.WEAK] }
      },
      orderBy: [{ state: "asc" }, { nextReviewAt: "asc" }, { wrongCount: "desc" }],
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

  async submitWordResult(dto: SubmitWordResultDto) {
    const record = await this.prisma.learningRecord.findUnique({
      where: { childProfileId_wordId: { childProfileId: dto.childProfileId, wordId: dto.wordId } }
    });

    if (!record) {
      throw new NotFoundException("Learning record not found");
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
        xp: { increment: dto.correct ? 8 : 2 },
        coins: { increment: dto.correct ? 5 : 1 }
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
