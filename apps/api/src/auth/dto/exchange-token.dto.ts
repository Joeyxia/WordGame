import { IsString } from "class-validator";

export class ExchangeTokenDto {
  @IsString()
  idToken!: string;
}
