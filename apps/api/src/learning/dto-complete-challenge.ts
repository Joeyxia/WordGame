import { IsString, MinLength } from "class-validator";

export class CompleteChallengeDto {
  @IsString()
  @MinLength(2)
  challengeId!: string;
}
