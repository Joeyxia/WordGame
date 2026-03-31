import { Body, Controller, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { Role } from "@prisma/client";
import { JwtAuthGuard } from "../common/jwt-auth.guard";
import { Roles } from "../common/roles.decorator";
import { RolesGuard } from "../common/roles.guard";
import { AdminService } from "./admin.service";
import { CurrentUser } from "../common/current-user.decorator";
import { UpdateWordPackStatusDto } from "./dto/update-word-pack-status.dto";
import { UpsertAssetDto } from "./dto/upsert-asset.dto";
import { UpdateGlobalConfigDto } from "./dto/update-global-config.dto";
import { CreateWordDto } from "./dto/create-word.dto";
import { UpdateWordDto } from "./dto/update-word.dto";
import { BulkImportWordsDto } from "./dto/bulk-import-words.dto";
import { UpdateChildActiveDto } from "./dto/update-child-active.dto";

@Controller("admin")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get("dashboard")
  dashboard() {
    return this.adminService.getDashboard();
  }

  @Get("word-packs")
  wordPacks() {
    return this.adminService.listWordPacks();
  }

  @Patch("word-packs/:packId/status")
  updateWordPackStatus(
    @CurrentUser() user: { sub: string },
    @Param("packId") packId: string,
    @Body() dto: UpdateWordPackStatusDto
  ) {
    return this.adminService.updateWordPackStatus(user.sub, packId, dto);
  }

  @Get("word-packs/:packId/words")
  wordsInPack(@Param("packId") packId: string) {
    return this.adminService.listWordsInPack(packId);
  }

  @Post("word-packs/:packId/words")
  createWordInPack(
    @CurrentUser() user: { sub: string },
    @Param("packId") packId: string,
    @Body() dto: CreateWordDto
  ) {
    return this.adminService.createWordInPack(user.sub, packId, dto);
  }

  @Post("word-packs/:packId/import-preview")
  importPreview(@Param("packId") packId: string, @Body() dto: BulkImportWordsDto) {
    return this.adminService.previewImportWords(packId, dto);
  }

  @Post("word-packs/:packId/import-words")
  importWords(
    @CurrentUser() user: { sub: string },
    @Param("packId") packId: string,
    @Body() dto: BulkImportWordsDto
  ) {
    return this.adminService.importWords(user.sub, packId, dto);
  }

  @Get("word-packs/:packId/quality-report")
  qualityReport(@Param("packId") packId: string) {
    return this.adminService.getPackQualityReport(packId);
  }

  @Patch("words/:wordId")
  updateWord(@CurrentUser() user: { sub: string }, @Param("wordId") wordId: string, @Body() dto: UpdateWordDto) {
    return this.adminService.updateWord(user.sub, wordId, dto);
  }

  @Get("assets")
  assets() {
    return this.adminService.listAssets();
  }

  @Post("assets")
  createAsset(@CurrentUser() user: { sub: string }, @Body() dto: UpsertAssetDto) {
    return this.adminService.createAsset(user.sub, dto);
  }

  @Patch("assets/:assetId")
  updateAsset(@CurrentUser() user: { sub: string }, @Param("assetId") assetId: string, @Body() dto: UpsertAssetDto) {
    return this.adminService.updateAsset(user.sub, assetId, dto);
  }

  @Get("users")
  users() {
    return this.adminService.listUsers();
  }

  @Get("children")
  children() {
    return this.adminService.listChildren();
  }

  @Patch("children/:childId/active")
  updateChildActive(
    @CurrentUser() user: { sub: string },
    @Param("childId") childId: string,
    @Body() dto: UpdateChildActiveDto
  ) {
    return this.adminService.updateChildActive(user.sub, childId, dto);
  }

  @Get("review-queue")
  reviewQueue() {
    return this.adminService.listAuditLogs();
  }

  @Get("config")
  config() {
    return this.adminService.getGlobalConfig();
  }

  @Patch("config")
  updateConfig(@CurrentUser() user: { sub: string }, @Body() dto: UpdateGlobalConfigDto) {
    return this.adminService.updateGlobalConfig(user.sub, dto);
  }
}
