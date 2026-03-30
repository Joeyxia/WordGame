import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Role } from "@prisma/client";
import { JwtService } from "@nestjs/jwt";
import { OAuth2Client } from "google-auth-library";
import { PrismaService } from "../database/prisma.service";

@Injectable()
export class AuthService {
  private readonly oauthClient: OAuth2Client;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService
  ) {
    this.oauthClient = new OAuth2Client(this.configService.get<string>("GOOGLE_CLIENT_ID"));
  }

  async exchangeGoogleIdToken(idToken: string) {
    const ticket = await this.oauthClient.verifyIdToken({
      idToken,
      audience: this.configService.get<string>("GOOGLE_CLIENT_ID")
    });

    const payload = ticket.getPayload();
    if (!payload?.email) {
      throw new Error("Google token payload missing email");
    }

    const adminEmails = (this.configService.get<string>("ADMIN_EMAILS") || "")
      .split(",")
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean);

    const role = adminEmails.includes(payload.email.toLowerCase()) ? Role.ADMIN : Role.PARENT;

    const user = await this.prisma.user.upsert({
      where: { email: payload.email },
      update: {
        displayName: payload.name,
        avatarUrl: payload.picture,
        role
      },
      create: {
        email: payload.email,
        displayName: payload.name,
        avatarUrl: payload.picture,
        role
      }
    });

    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.displayName
    });

    return {
      accessToken: token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl
      }
    };
  }
}
