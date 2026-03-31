import { Type } from "class-transformer";
import { ArrayMinSize, IsArray, ValidateNested } from "class-validator";
import { CreateWordDto } from "./create-word.dto";

export class BulkImportWordsDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateWordDto)
  words!: CreateWordDto[];
}
