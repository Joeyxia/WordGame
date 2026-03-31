import { IsInt, IsOptional, IsString, IsUrl, Max, Min, MinLength } from "class-validator";

export class UpdateWordDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  word?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  phonetic?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  meaningZh?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  meaningEn?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  partOfSpeech?: string;

  @IsOptional()
  @IsString()
  @MinLength(4)
  exampleSentence?: string;

  @IsOptional()
  @IsString()
  @MinLength(4)
  exampleSentenceZh?: string;

  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @IsOptional()
  @IsUrl()
  audioUrl?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  difficultyLevel?: number;

  @IsOptional()
  @IsString()
  @MinLength(2)
  themeCategory?: string;
}
