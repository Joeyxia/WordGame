import { Injectable } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";
import { UpdateWordPackStatusDto } from "./dto/update-word-pack-status.dto";
import { UpsertAssetDto } from "./dto/upsert-asset.dto";
import { UpdateGlobalConfigDto } from "./dto/update-global-config.dto";
import { CreateWordDto } from "./dto/create-word.dto";
import { UpdateWordDto } from "./dto/update-word.dto";
import { BulkImportWordsDto } from "./dto/bulk-import-words.dto";
import { UpdateChildActiveDto } from "./dto/update-child-active.dto";

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  private validateWordPayload(word: CreateWordDto) {
    const issues: string[] = [];
    if (!word.word?.trim()) issues.push("word missing");
    if (!word.phonetic?.trim()) issues.push("phonetic missing");
    if (!word.meaningEn?.trim()) issues.push("meaningEn missing");
    if (!word.meaningZh?.trim()) issues.push("meaningZh missing");
    if (!word.exampleSentence?.trim()) issues.push("exampleSentence missing");
    if (!word.exampleSentenceZh?.trim()) issues.push("exampleSentenceZh missing");
    if (!word.imageUrl?.startsWith("http")) issues.push("imageUrl invalid");
    if (!word.audioUrl?.startsWith("http")) issues.push("audioUrl invalid");
    if (!word.themeCategory?.trim()) issues.push("themeCategory missing");
    if (!word.partOfSpeech?.trim()) issues.push("partOfSpeech missing");
    if (word.difficultyLevel < 1 || word.difficultyLevel > 5) issues.push("difficultyLevel out of range");
    return issues;
  }

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

  async previewImportWords(packId: string, dto: BulkImportWordsDto) {
    const pack = await this.prisma.wordPack.findUnique({ where: { id: packId } });
    if (!pack) {
      throw new Error("Word pack not found");
    }

    const normalizedWords = dto.words.map((item) => item.word.trim().toLowerCase());
    const duplicatesInPayload = normalizedWords.filter((word, index) => normalizedWords.indexOf(word) !== index);
    const uniquePayloadWords = [...new Set(normalizedWords)];
    const existingWords = await this.prisma.word.findMany({
      where: { ageTrack: pack.ageTrack, word: { in: uniquePayloadWords } },
      select: { word: true }
    });
    const existingSet = new Set(existingWords.map((item) => item.word));

    const invalidItems = dto.words
      .map((item, index) => {
        const issues = this.validateWordPayload(item);
        return {
          index,
          word: item.word,
          issues
        };
      })
      .filter((item) => item.issues.length > 0);

    return {
      pack: { id: pack.id, name: pack.name, ageTrack: pack.ageTrack },
      summary: {
        totalInput: dto.words.length,
        uniqueInput: uniquePayloadWords.length,
        duplicatesInPayload: [...new Set(duplicatesInPayload)].length,
        existingInDatabase: [...existingSet].length,
        invalidItems: invalidItems.length,
        importableCount: dto.words.length - invalidItems.length
      },
      invalidItems: invalidItems.slice(0, 100),
      existingWords: [...existingSet].slice(0, 200)
    };
  }

  async importWords(actorId: string, packId: string, dto: BulkImportWordsDto) {
    const preview = await this.previewImportWords(packId, dto);
    if (preview.summary.invalidItems > 0) {
      return {
        ok: false,
        message: "Import blocked: invalid items found. Fix preview errors first.",
        preview
      };
    }

    const pack = await this.prisma.wordPack.findUnique({ where: { id: packId } });
    if (!pack) {
      throw new Error("Word pack not found");
    }

    const uniqueByWord = new Map<string, CreateWordDto>();
    for (const item of dto.words) {
      uniqueByWord.set(item.word.trim().toLowerCase(), item);
    }

    let createdOrUpdated = 0;
    for (const [normalized, item] of uniqueByWord.entries()) {
      const word = await this.prisma.word.upsert({
        where: { word_ageTrack: { word: normalized, ageTrack: pack.ageTrack } },
        update: {
          phonetic: item.phonetic,
          meaningZh: item.meaningZh,
          meaningEn: item.meaningEn,
          partOfSpeech: item.partOfSpeech,
          exampleSentence: item.exampleSentence,
          exampleSentenceZh: item.exampleSentenceZh,
          imageUrl: item.imageUrl,
          audioUrl: item.audioUrl,
          difficultyLevel: item.difficultyLevel,
          themeCategory: item.themeCategory
        },
        create: {
          word: normalized,
          ageTrack: pack.ageTrack,
          phonetic: item.phonetic,
          meaningZh: item.meaningZh,
          meaningEn: item.meaningEn,
          partOfSpeech: item.partOfSpeech,
          exampleSentence: item.exampleSentence,
          exampleSentenceZh: item.exampleSentenceZh,
          imageUrl: item.imageUrl,
          audioUrl: item.audioUrl,
          difficultyLevel: item.difficultyLevel,
          themeCategory: item.themeCategory
        }
      });
      await this.prisma.wordPackItem.upsert({
        where: { wordPackId_wordId: { wordPackId: pack.id, wordId: word.id } },
        update: {},
        create: { wordPackId: pack.id, wordId: word.id }
      });
      createdOrUpdated += 1;
    }

    await this.writeAudit(actorId, "WORD_BULK_IMPORTED", "word_pack", packId, {
      totalInput: dto.words.length,
      uniqueImported: createdOrUpdated
    });

    return {
      ok: true,
      message: `Imported ${createdOrUpdated} unique words into ${pack.name}.`,
      importedCount: createdOrUpdated
    };
  }

  async getPackQualityReport(packId: string) {
    const data = await this.listWordsInPack(packId);
    const words = data.words || [];
    const issues: { wordId: string; word: string; issues: string[] }[] = [];

    for (const item of words) {
      const check: string[] = [];
      if (!item.meaningEn?.trim()) check.push("missing meaningEn");
      if (!item.meaningZh?.trim()) check.push("missing meaningZh");
      if (!item.imageUrl?.startsWith("http")) check.push("invalid imageUrl");
      if (!item.audioUrl?.startsWith("http")) check.push("invalid audioUrl");
      if ((item.exampleSentence || "").trim().length < 4) check.push("exampleSentence too short");
      if ((item.exampleSentenceZh || "").trim().length < 4) check.push("exampleSentenceZh too short");
      if (item.difficultyLevel < 1 || item.difficultyLevel > 5) check.push("difficultyLevel out of range");
      if (check.length) {
        issues.push({ wordId: item.id, word: item.word, issues: check });
      }
    }

    const categoryStats = words.reduce<Record<string, number>>((acc, item) => {
      acc[item.themeCategory] = (acc[item.themeCategory] || 0) + 1;
      return acc;
    }, {});

    return {
      pack: data.pack,
      summary: {
        totalWords: words.length,
        issueWords: issues.length,
        healthyWords: words.length - issues.length
      },
      categoryStats,
      issueSamples: issues.slice(0, 120)
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

  listChildren() {
    return this.prisma.childProfile.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        household: { select: { id: true, name: true, parent: { select: { email: true } } } }
      }
    });
  }

  async updateChildActive(actorId: string, childId: string, dto: UpdateChildActiveDto) {
    const child = await this.prisma.childProfile.update({
      where: { id: childId },
      data: { isActive: dto.isActive }
    });
    await this.writeAudit(actorId, "CHILD_ACTIVE_UPDATED", "child_profile", childId, { isActive: dto.isActive });
    return child;
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
