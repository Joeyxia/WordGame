import { IsBoolean, IsInt, IsOptional, Max, Min } from "class-validator";

export class UpdateGlobalConfigDto {
  @IsOptional()
  @IsInt()
  @Min(10)
  @Max(25)
  defaultDailyNewWords10?: number;

  @IsOptional()
  @IsInt()
  @Min(10)
  @Max(25)
  defaultDailyNewWords13?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  rewardXpCorrect?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  rewardCoinsCorrect?: number;

  @IsOptional()
  @IsBoolean()
  reviewPriorityStrict?: boolean;
}
