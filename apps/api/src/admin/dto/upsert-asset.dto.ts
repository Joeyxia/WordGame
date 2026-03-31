import { IsIn, IsOptional, IsString, IsUrl, MinLength } from "class-validator";

export class UpsertAssetDto {
  @IsString()
  @IsIn(["image", "audio"])
  type!: "image" | "audio";

  @IsString()
  @MinLength(2)
  source!: string;

  @IsUrl()
  cdnUrl!: string;

  @IsString()
  @MinLength(2)
  license!: string;

  @IsOptional()
  @IsString()
  status?: string;
}
