import { IsBoolean, IsString } from "class-validator";

export class SubmitWordResultDto {
  @IsString()
  childProfileId!: string;

  @IsString()
  wordId!: string;

  @IsBoolean()
  correct!: boolean;
}
