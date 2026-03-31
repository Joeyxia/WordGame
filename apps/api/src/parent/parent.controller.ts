import { Body, Controller, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { Role } from "@prisma/client";
import { CurrentUser } from "../common/current-user.decorator";
import { JwtAuthGuard } from "../common/jwt-auth.guard";
import { Roles } from "../common/roles.decorator";
import { RolesGuard } from "../common/roles.guard";
import { ParentService } from "./parent.service";
import { UpdateParentSettingsDto } from "./dto/update-settings.dto";
import { BuildStructureDto } from "./dto/build-structure.dto";

@Controller("parent")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.PARENT, Role.ADMIN)
export class ParentController {
  constructor(private readonly parentService: ParentService) {}

  @Get("dashboard")
  dashboard(@CurrentUser() user: { sub: string }) {
    return this.parentService.getDashboard(user.sub);
  }

  @Patch("settings/:householdId")
  updateSettings(
    @CurrentUser() user: { sub: string },
    @Param("householdId") householdId: string,
    @Body() dto: UpdateParentSettingsDto
  ) {
    return this.parentService.updateSettings(user.sub, householdId, dto);
  }

  @Get("settings")
  settings(@CurrentUser() user: { sub: string }) {
    return this.parentService.getSettings(user.sub);
  }

  @Get("child/:childId/runtime")
  childRuntime(@CurrentUser() user: { sub: string }, @Param("childId") childId: string) {
    return this.parentService.getChildRuntime(user.sub, childId);
  }

  @Get("child/:childId/review-queue")
  childReviewQueue(@CurrentUser() user: { sub: string }, @Param("childId") childId: string) {
    return this.parentService.getChildReviewQueue(user.sub, childId);
  }

  @Post("child/:childId/build")
  buildStructure(
    @CurrentUser() user: { sub: string },
    @Param("childId") childId: string,
    @Body() dto: BuildStructureDto
  ) {
    return this.parentService.buildStructure(user.sub, childId, dto);
  }

  @Get("reports")
  reports(@CurrentUser() user: { sub: string }) {
    return this.parentService.getReports(user.sub);
  }

  @Get("reports-export")
  reportsExport(@CurrentUser() user: { sub: string }) {
    return this.parentService.getReportsExport(user.sub);
  }
}
