import { IsBoolean } from "class-validator";

export class UpdateChildActiveDto {
  @IsBoolean()
  isActive!: boolean;
}
