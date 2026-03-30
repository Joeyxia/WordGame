import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { Role } from "@prisma/client";
import { JwtAuthGuard } from "../common/jwt-auth.guard";
import { RolesGuard } from "../common/roles.guard";
import { Roles } from "../common/roles.decorator";
import { LearningService } from "./learning.service";
import { SubmitWordResultDto } from "./dto-submit-word-result";

@Controller("learning")
@UseGuards(JwtAuthGuard, RolesGuard)
export class LearningController {
  constructor(private readonly learningService: LearningService) {}

  @Post("task/:childProfileId/generate")
  @Roles(Role.PARENT, Role.ADMIN)
  generate(@Param("childProfileId") childProfileId: string) {
    return this.learningService.generateTodayTask(childProfileId);
  }

  @Get("task/:childProfileId")
  @Roles(Role.PARENT, Role.CHILD, Role.ADMIN)
  getTask(@Param("childProfileId") childProfileId: string) {
    return this.learningService.getTodayTask(childProfileId);
  }

  @Post("submit")
  @Roles(Role.PARENT, Role.CHILD, Role.ADMIN)
  submit(@Body() dto: SubmitWordResultDto) {
    return this.learningService.submitWordResult(dto);
  }
}
