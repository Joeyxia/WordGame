import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { DatabaseModule } from "./database/database.module";
import { CommonModule } from "./common/common.module";
import { HealthModule } from "./health/health.module";
import { AuthModule } from "./auth/auth.module";
import { HouseholdsModule } from "./households/households.module";
import { LearningModule } from "./learning/learning.module";
import { ParentModule } from "./parent/parent.module";
import { AdminModule } from "./admin/admin.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    CommonModule,
    HealthModule,
    AuthModule,
    HouseholdsModule,
    LearningModule,
    ParentModule,
    AdminModule
  ],
})
export class AppModule {}
