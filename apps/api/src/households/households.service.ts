import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";
import { CreateHouseholdDto } from "./dto/create-household.dto";

@Injectable()
export class HouseholdsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(parentId: string, dto: CreateHouseholdDto) {
    const household = await this.prisma.household.create({
      data: {
        name: dto.name,
        parentId,
        settings: { create: {} },
        childProfiles: {
          create: dto.children.map((child) => ({
            name: child.name,
            ageTrack: child.ageTrack,
            grade: child.grade,
            packLevel: "core"
          }))
        }
      },
      include: { childProfiles: true, settings: true }
    });

    for (const child of household.childProfiles) {
      await this.prisma.worldProgress.create({
        data: {
          childProfileId: child.id,
          unlockedZones: ["starter-village"]
        }
      });

      await this.prisma.buildInventory.create({
        data: {
          childProfileId: child.id
        }
      });
    }

    return household;
  }

  async listMine(parentId: string) {
    return this.prisma.household.findMany({
      where: { parentId },
      include: {
        childProfiles: {
          include: {
            worldProgress: true,
            buildInventory: true
          }
        },
        settings: true
      },
      orderBy: { createdAt: "desc" }
    });
  }

  async getOrFail(householdId: string, parentId: string) {
    const household = await this.prisma.household.findFirst({
      where: { id: householdId, parentId },
      include: { childProfiles: true, settings: true }
    });

    if (!household) {
      throw new NotFoundException("Household not found");
    }

    return household;
  }
}
