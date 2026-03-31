import { IsBoolean, IsInt, IsOptional, IsString, Max, Min } from "class-validator";

export class UpdateParentSettingsDto {
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
  @IsString()
  dailyWindowStart?: string;

  @IsOptional()
  @IsString()
  dailyWindowEnd?: string;

  @IsOptional()
  @IsInt()
  @Min(20)
  @Max(180)
  dailyMaxMinutes?: number;

  @IsOptional()
  @IsBoolean()
  weekendReviewBoost?: boolean;

  @IsOptional()
  @IsBoolean()
  enableSpelling?: boolean;

  @IsOptional()
  @IsBoolean()
  enableListening?: boolean;

  @IsOptional()
  @IsBoolean()
  enableChallenge?: boolean;

  @IsOptional()
  @IsBoolean()
  reviewPriorityStrict?: boolean;
}
