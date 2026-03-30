import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { Role } from "@prisma/client";
import { JwtAuthGuard } from "../common/jwt-auth.guard";
import { RolesGuard } from "../common/roles.guard";
import { Roles } from "../common/roles.decorator";
import { CurrentUser } from "../common/current-user.decorator";
import { CreateHouseholdDto } from "./dto/create-household.dto";
import { HouseholdsService } from "./households.service";

@Controller("households")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.PARENT, Role.ADMIN)
export class HouseholdsController {
  constructor(private readonly householdsService: HouseholdsService) {}

  @Post()
  create(@CurrentUser() user: { sub: string }, @Body() dto: CreateHouseholdDto) {
    return this.householdsService.create(user.sub, dto);
  }

  @Get("mine")
  listMine(@CurrentUser() user: { sub: string }) {
    return this.householdsService.listMine(user.sub);
  }
}
