import { Controller, Get, UseGuards } from "@nestjs/common";
import { Role } from "@prisma/client";
import { JwtAuthGuard } from "../common/jwt-auth.guard";
import { Roles } from "../common/roles.decorator";
import { RolesGuard } from "../common/roles.guard";
import { AdminService } from "./admin.service";

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

  @Get("assets")
  assets() {
    return this.adminService.listAssets();
  }

  @Get("users")
  users() {
    return this.adminService.listUsers();
  }

  @Get("review-queue")
  reviewQueue() {
    return this.adminService.listAuditLogs();
  }
}
