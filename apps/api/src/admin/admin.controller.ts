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
