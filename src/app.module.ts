import { Module } from '@nestjs/common';
import { WidgetServicesModule } from './widget-services/widget-services.module';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AppController } from './app.controller';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }),
    WidgetServicesModule,
    DatabaseModule,
    AuthModule,
    UsersModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {
}
