import { Body, Controller, Get, Param, Patch, UseGuards } from "@nestjs/common";
import { Role } from "@prisma/client";
import { CurrentUser } from "../common/current-user.decorator";
import { JwtAuthGuard } from "../common/jwt-auth.guard";
import { Roles } from "../common/roles.decorator";
import { RolesGuard } from "../common/roles.guard";
import { ParentService } from "./parent.service";
import { UpdateParentSettingsDto } from "./dto/update-settings.dto";

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

  @Get("reports")
  reports(@CurrentUser() user: { sub: string }) {
    return this.parentService.getReports(user.sub);
  }
}
