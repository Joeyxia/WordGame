import { Injectable, NotFoundException } from "@nestjs/common";
import { LearningState } from "@prisma/client";
import { PrismaService } from "../database/prisma.service";
import { UpdateParentSettingsDto } from "./dto/update-settings.dto";
import { BuildStructureDto } from "./dto/build-structure.dto";

@Injectable()
export class ParentService {
  constructor(private readonly prisma: PrismaService) {}

  private async getOwnedChildOrFail(parentId: string, childId: string) {
    const child = await this.prisma.childProfile.findFirst({
      where: { id: childId, household: { parentId } },
      include: {
        household: { include: { settings: true } },
        worldProgress: true,
        buildInventory: true,
        structures: { orderBy: [{ updatedAt: "desc" }] }
      }
    });

    if (!child) {
      throw new NotFoundException("Child profile not found");
    }

    return child;
  }

  async getDashboard(parentId: string) {
    const households = await this.prisma.household.findMany({
      where: { parentId },
      include: {
        childProfiles: {
          include: {
            worldProgress: true,
            buildInventory: true,
            learningRecords: true,
            dailyTasks: {
              take: 7,
              orderBy: { taskDate: "desc" },
              include: { taskItems: true }
            }
          }
        },
        settings: true
      }
    });

    return {
      households,
      summary: households.map((household) => ({
        householdId: household.id,
        childCount: household.childProfiles.length,
        weakWords: household.childProfiles.reduce(
          (acc, child) => acc + child.learningRecords.filter((record) => record.state === "WEAK").length,
          0
        )
      }))
    };
  }

  async updateSettings(parentId: string, householdId: string, dto: UpdateParentSettingsDto) {
    const household = await this.prisma.household.findFirst({ where: { id: householdId, parentId } });
    if (!household) {
      throw new NotFoundException("Household not found");
    }

    return this.prisma.parentSetting.upsert({
      where: { householdId },
      update: dto,
      create: {
        householdId,
        ...dto
      }
    });
  }

  async getSettings(parentId: string) {
    const households = await this.prisma.household.findMany({
      where: { parentId },
      include: {
        settings: true,
        childProfiles: { select: { id: true, name: true, ageTrack: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    return { households };
  }

  async getChildRuntime(parentId: string, childId: string) {
    const child = await this.getOwnedChildOrFail(parentId, childId);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const task = await this.prisma.dailyTask.findUnique({
      where: { childProfileId_taskDate: { childProfileId: childId, taskDate: today } },
      include: { taskItems: true }
    });

    const dueReviews = await this.prisma.learningRecord.count({
      where: {
        childProfileId: childId,
        OR: [
          { state: LearningState.WEAK },
          { nextReviewAt: { lte: new Date() }, state: { in: [LearningState.LEARNING, LearningState.REVIEWING] } }
        ]
      }
    });

    const completedItems = task?.taskItems.filter((item) => item.completed).length ?? 0;
    const totalItems = task?.taskItems.length ?? 0;

    return {
      child: {
        id: child.id,
        name: child.name,
        ageTrack: child.ageTrack,
        grade: child.grade
      },
      worldProgress: child.worldProgress,
      buildInventory: child.buildInventory,
      structures: child.structures,
      todayTask: {
        exists: Boolean(task),
        completedItems,
        totalItems,
        completionRate: totalItems === 0 ? 0 : Math.round((completedItems / totalItems) * 100)
      },
      dueReviews
    };
  }

  async getChildReviewQueue(parentId: string, childId: string) {
    await this.getOwnedChildOrFail(parentId, childId);
    const queue = await this.prisma.learningRecord.findMany({
      where: {
        childProfileId: childId,
        OR: [
          { state: LearningState.WEAK },
          { nextReviewAt: { lte: new Date() }, state: { in: [LearningState.LEARNING, LearningState.REVIEWING] } }
        ]
      },
      include: { word: true },
      orderBy: [{ state: "asc" }, { nextReviewAt: "asc" }, { wrongCount: "desc" }],
      take: 120
    });

    return {
      queue: queue.map((item) => ({
        id: item.id,
        state: item.state,
        srsStage: item.srsStage,
        wrongCount: item.wrongCount,
        nextReviewAt: item.nextReviewAt,
        word: item.word.word,
        phonetic: item.word.phonetic,
        meaningEn: item.word.meaningEn
      }))
    };
  }

  async buildStructure(parentId: string, childId: string, dto: BuildStructureDto) {
    await this.getOwnedChildOrFail(parentId, childId);
    const structureName = dto.structureName.trim();

    const result = await this.prisma.$transaction(async (tx) => {
      const inventory = await tx.buildInventory.findUnique({ where: { childProfileId: childId } });
      const safeInventory =
        inventory ||
        (await tx.buildInventory.create({
          data: { childProfileId: childId }
        }));

      const existing = await tx.structure.findFirst({
        where: { childProfileId: childId, name: structureName }
      });

      const nextLevel = (existing?.level ?? 0) + 1;
      const cost = {
        wood: 4 + nextLevel * 3,
        stone: 2 + nextLevel * 2,
        ore: nextLevel >= 3 ? nextLevel - 2 : 0
      };

      if (safeInventory.wood < cost.wood || safeInventory.stone < cost.stone || safeInventory.ore < cost.ore) {
        return {
          ok: false as const,
          message: "Not enough resources. Learn more words to earn materials.",
          required: cost,
          inventory: safeInventory
        };
      }

      const updatedInventory = await tx.buildInventory.update({
        where: { childProfileId: childId },
        data: {
          wood: { decrement: cost.wood },
          stone: { decrement: cost.stone },
          ore: { decrement: cost.ore }
        }
      });

      const structure = existing
        ? await tx.structure.update({
            where: { id: existing.id },
            data: { level: { increment: 1 }, status: "upgraded" }
          })
        : await tx.structure.create({
            data: { childProfileId: childId, name: structureName, level: 1, status: "built" }
          });

      await tx.worldProgress.upsert({
        where: { childProfileId: childId },
        update: {
          xp: { increment: 30 + nextLevel * 5 },
          coins: { increment: 20 + nextLevel * 4 }
        },
        create: {
          childProfileId: childId,
          unlockedZones: ["starter-village"],
          xp: 30 + nextLevel * 5,
          coins: 20 + nextLevel * 4
        }
      });

      return {
        ok: true as const,
        message: `${structureName} upgraded to level ${structure.level}.`,
        required: cost,
        inventory: updatedInventory,
        structure
      };
    });

    return result;
  }

  async getReports(parentId: string) {
    const children = await this.prisma.childProfile.findMany({
      where: { household: { parentId } },
      include: { learningRecords: true, dailyTasks: { include: { taskItems: true }, take: 30, orderBy: { taskDate: "desc" } } }
    });

    return children.map((child) => {
      const total = child.learningRecords.length;
      const mastered = child.learningRecords.filter((record) => record.state === "MASTERED").length;
      const weak = child.learningRecords.filter((record) => record.state === "WEAK").length;
      const completion =
        child.dailyTasks.length === 0
          ? 0
          : Math.round(
              (child.dailyTasks.reduce((acc, task) => {
                if (task.taskItems.length === 0) {
                  return acc;
                }
                const done = task.taskItems.filter((item) => item.completed).length;
                return acc + done / task.taskItems.length;
              }, 0) /
                child.dailyTasks.length) *
                100
            );

      return {
        childProfileId: child.id,
        childName: child.name,
        mastered,
        weak,
        total,
        completionRate30d: completion
      };
    });
  }
}
