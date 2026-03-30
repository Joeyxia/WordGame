import { ArrayMinSize, IsArray, IsEnum, IsOptional, IsString, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { AgeTrack } from "@prisma/client";

class CreateChildDto {
  @IsString()
  name!: string;

  @IsEnum(AgeTrack)
  ageTrack!: AgeTrack;

  @IsOptional()
  @IsString()
  grade?: string;
}

export class CreateHouseholdDto {
  @IsString()
  name!: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateChildDto)
  children!: CreateChildDto[];
}
