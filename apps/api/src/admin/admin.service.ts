import { Injectable } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";
import { UpdateWordPackStatusDto } from "./dto/update-word-pack-status.dto";
import { UpsertAssetDto } from "./dto/upsert-asset.dto";
import { UpdateGlobalConfigDto } from "./dto/update-global-config.dto";
import { CreateWordDto } from "./dto/create-word.dto";
import { UpdateWordDto } from "./dto/update-word.dto";

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  getDashboard() {
    return Promise.all([
      this.prisma.user.count(),
      this.prisma.childProfile.count(),
      this.prisma.word.count(),
      this.prisma.wordPack.count()
    ]).then(([users, children, words, packs]) => ({ users, children, words, packs }));
  }

  listWordPacks() {
    return this.prisma.wordPack.findMany({ include: { items: true }, orderBy: { updatedAt: "desc" } });
  }

  async updateWordPackStatus(actorId: string, packId: string, dto: UpdateWordPackStatusDto) {
    const updated = await this.prisma.wordPack.update({
      where: { id: packId },
      data: { status: dto.status }
    });
    await this.writeAudit(actorId, "WORD_PACK_STATUS_UPDATED", "word_pack", packId, { status: dto.status });
    return updated;
  }

  async listWordsInPack(packId: string) {
    const pack = await this.prisma.wordPack.findUnique({
      where: { id: packId },
      include: {
        items: {
          include: { word: true },
          orderBy: { word: { word: "asc" } }
        }
      }
    });
    if (!pack) {
      return { pack: null, words: [] };
    }
    return {
      pack: {
        id: pack.id,
        name: pack.name,
        ageTrack: pack.ageTrack,
        status: pack.status
      },
      words: pack.items.map((item) => item.word)
    };
  }

  async createWordInPack(actorId: string, packId: string, dto: CreateWordDto) {
    const pack = await this.prisma.wordPack.findUnique({ where: { id: packId } });
    if (!pack) {
      throw new Error("Word pack not found");
    }
    const normalized = dto.word.trim().toLowerCase();

    const created = await this.prisma.$transaction(async (tx) => {
      const word = await tx.word.upsert({
        where: {
          word_ageTrack: {
            word: normalized,
            ageTrack: pack.ageTrack
          }
        },
        update: {
          phonetic: dto.phonetic,
          meaningZh: dto.meaningZh,
          meaningEn: dto.meaningEn,
          partOfSpeech: dto.partOfSpeech,
          exampleSentence: dto.exampleSentence,
          exampleSentenceZh: dto.exampleSentenceZh,
          imageUrl: dto.imageUrl,
          audioUrl: dto.audioUrl,
          difficultyLevel: dto.difficultyLevel,
          themeCategory: dto.themeCategory
        },
        create: {
          word: normalized,
          ageTrack: pack.ageTrack,
          phonetic: dto.phonetic,
          meaningZh: dto.meaningZh,
          meaningEn: dto.meaningEn,
          partOfSpeech: dto.partOfSpeech,
          exampleSentence: dto.exampleSentence,
          exampleSentenceZh: dto.exampleSentenceZh,
          imageUrl: dto.imageUrl,
          audioUrl: dto.audioUrl,
          difficultyLevel: dto.difficultyLevel,
          themeCategory: dto.themeCategory
        }
      });

      await tx.wordPackItem.upsert({
        where: { wordPackId_wordId: { wordPackId: pack.id, wordId: word.id } },
        update: {},
        create: { wordPackId: pack.id, wordId: word.id }
      });
      return word;
    });

    await this.writeAudit(actorId, "WORD_CREATED_IN_PACK", "word_pack", packId, {
      wordId: created.id,
      word: created.word
    });
    return created;
  }

  async updateWord(actorId: string, wordId: string, dto: UpdateWordDto) {
    const nextWord = dto.word?.trim().toLowerCase();
    const updated = await this.prisma.word.update({
      where: { id: wordId },
      data: {
        ...(nextWord ? { word: nextWord } : {}),
        ...(dto.phonetic !== undefined ? { phonetic: dto.phonetic } : {}),
        ...(dto.meaningZh !== undefined ? { meaningZh: dto.meaningZh } : {}),
        ...(dto.meaningEn !== undefined ? { meaningEn: dto.meaningEn } : {}),
        ...(dto.partOfSpeech !== undefined ? { partOfSpeech: dto.partOfSpeech } : {}),
        ...(dto.exampleSentence !== undefined ? { exampleSentence: dto.exampleSentence } : {}),
        ...(dto.exampleSentenceZh !== undefined ? { exampleSentenceZh: dto.exampleSentenceZh } : {}),
        ...(dto.imageUrl !== undefined ? { imageUrl: dto.imageUrl } : {}),
        ...(dto.audioUrl !== undefined ? { audioUrl: dto.audioUrl } : {}),
        ...(dto.difficultyLevel !== undefined ? { difficultyLevel: dto.difficultyLevel } : {}),
        ...(dto.themeCategory !== undefined ? { themeCategory: dto.themeCategory } : {})
      }
    });
    await this.writeAudit(actorId, "WORD_UPDATED", "word", wordId, dto);
    return updated;
  }

  listAssets() {
    return this.prisma.asset.findMany({ orderBy: { createdAt: "desc" } });
  }

  async createAsset(actorId: string, dto: UpsertAssetDto) {
    const created = await this.prisma.asset.create({
      data: {
        type: dto.type,
        source: dto.source,
        cdnUrl: dto.cdnUrl,
        license: dto.license,
        status: dto.status || "ACTIVE"
      }
    });
    await this.writeAudit(actorId, "ASSET_CREATED", "asset", created.id, dto);
    return created;
  }

  async updateAsset(actorId: string, assetId: string, dto: UpsertAssetDto) {
    const updated = await this.prisma.asset.update({
      where: { id: assetId },
      data: {
        type: dto.type,
        source: dto.source,
        cdnUrl: dto.cdnUrl,
        license: dto.license,
        status: dto.status || "ACTIVE"
      }
    });
    await this.writeAudit(actorId, "ASSET_UPDATED", "asset", assetId, dto);
    return updated;
  }

  listUsers() {
    return this.prisma.user.findMany({ orderBy: { createdAt: "desc" }, include: { households: true } });
  }

  listAuditLogs() {
    return this.prisma.adminAuditLog.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
  }

  async getGlobalConfig() {
    const settings = await this.prisma.parentSetting.findMany({ take: 200, orderBy: { updatedAt: "desc" } });
    const latestConfig = await this.prisma.adminAuditLog.findFirst({
      where: { action: "GLOBAL_CONFIG_UPDATED" },
      orderBy: { createdAt: "desc" }
    });

    const fallback = {
      defaultDailyNewWords10: settings.length ? Math.round(settings.reduce((acc, s) => acc + s.defaultDailyNewWords10, 0) / settings.length) : 20,
      defaultDailyNewWords13: settings.length ? Math.round(settings.reduce((acc, s) => acc + s.defaultDailyNewWords13, 0) / settings.length) : 20,
      reviewPriorityStrict: settings.length ? settings.filter((s) => s.reviewPriorityStrict).length >= Math.ceil(settings.length / 2) : true,
      rewardXpCorrect: 8,
      rewardCoinsCorrect: 5
    };

    return {
      config: {
        ...fallback,
        ...(typeof latestConfig?.metadata === "object" && latestConfig?.metadata ? (latestConfig.metadata as object) : {})
      },
      settingsCount: settings.length
    };
  }

  async updateGlobalConfig(actorId: string, dto: UpdateGlobalConfigDto) {
    const parentUpdate: { defaultDailyNewWords10?: number; defaultDailyNewWords13?: number; reviewPriorityStrict?: boolean } = {};
    if (dto.defaultDailyNewWords10 !== undefined) parentUpdate.defaultDailyNewWords10 = dto.defaultDailyNewWords10;
    if (dto.defaultDailyNewWords13 !== undefined) parentUpdate.defaultDailyNewWords13 = dto.defaultDailyNewWords13;
    if (dto.reviewPriorityStrict !== undefined) parentUpdate.reviewPriorityStrict = dto.reviewPriorityStrict;

    if (Object.keys(parentUpdate).length > 0) {
      await this.prisma.parentSetting.updateMany({
        data: parentUpdate
      });
    }

    await this.writeAudit(actorId, "GLOBAL_CONFIG_UPDATED", "config", "global", dto);
    return this.getGlobalConfig();
  }

  private async writeAudit(actorId: string, action: string, targetType: string, targetId: string, metadata: unknown) {
    await this.prisma.adminAuditLog.create({
      data: {
        actorId,
        action,
        targetType,
        targetId,
        metadata: (metadata || {}) as object
      }
    });
  }
}
