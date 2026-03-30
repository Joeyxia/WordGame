import { Controller, Get } from "@nestjs/common";

@Controller("health")
export class HealthController {
  @Get()
  getHealth() {
    return { ok: true, service: "wordquest-api", timestamp: new Date().toISOString() };
  }
}
