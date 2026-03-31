import { IsString, MinLength } from "class-validator";

export class BuildStructureDto {
  @IsString()
  @MinLength(2)
  structureName!: string;
}
