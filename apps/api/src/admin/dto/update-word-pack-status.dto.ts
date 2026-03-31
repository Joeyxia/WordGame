import { IsEnum } from "class-validator";
import { PackStatus } from "@prisma/client";

export class UpdateWordPackStatusDto {
  @IsEnum(PackStatus)
  status!: PackStatus;
}
