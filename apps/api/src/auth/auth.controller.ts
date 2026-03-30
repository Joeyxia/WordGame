import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { ExchangeTokenDto } from "./dto/exchange-token.dto";
import { JwtAuthGuard } from "../common/jwt-auth.guard";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("google/exchange")
  exchangeGoogle(@Body() dto: ExchangeTokenDto) {
    return this.authService.exchangeGoogleIdToken(dto.idToken);
  }

  @UseGuards(JwtAuthGuard)
  @Get("me")
  me(@Req() req: { user: unknown }) {
    return req.user;
  }
}
