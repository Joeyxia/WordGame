import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";
import { UpdateParentSettingsDto } from "./dto/update-settings.dto";

@Injectable()
export class ParentService {
  constructor(private readonly prisma: PrismaService) {}

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
