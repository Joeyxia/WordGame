import { IsInt, IsString, IsUrl, Max, Min, MinLength } from "class-validator";

export class CreateWordDto {
  @IsString()
  @MinLength(2)
  word!: string;

  @IsString()
  @MinLength(2)
  phonetic!: string;

  @IsString()
  @MinLength(2)
  meaningZh!: string;

  @IsString()
  @MinLength(2)
  meaningEn!: string;

  @IsString()
  @MinLength(2)
  partOfSpeech!: string;

  @IsString()
  @MinLength(4)
  exampleSentence!: string;

  @IsString()
  @MinLength(4)
  exampleSentenceZh!: string;

  @IsUrl()
  imageUrl!: string;

  @IsUrl()
  audioUrl!: string;

  @IsInt()
  @Min(1)
  @Max(5)
  difficultyLevel!: number;

  @IsString()
  @MinLength(2)
  themeCategory!: string;
}
