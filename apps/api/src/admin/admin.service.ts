import { Injectable } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";

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

  listAssets() {
    return this.prisma.asset.findMany({ orderBy: { createdAt: "desc" } });
  }

  listUsers() {
    return this.prisma.user.findMany({ orderBy: { createdAt: "desc" }, include: { households: true } });
  }

  listAuditLogs() {
    return this.prisma.adminAuditLog.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
  }
}
