import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { ExecutionModule } from './execution/execution.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TestCasesModule } from './test-cases/test-cases.module';
import { TestSuitesModule } from './test-suites/test-suites.module';
import { EnvironmentsModule } from './environments/environments.module';
import { SchedulesModule } from './schedules/schedules.module';
import { BugsModule } from './bugs/bugs.module';
import { ObjectModule } from './objects/object.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: +configService.get('DB_PORT', '5432'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
      },
    }),
    ExecutionModule,
    AuthModule,
    UsersModule,
    TestCasesModule,
    TestSuitesModule,
    EnvironmentsModule,
    SchedulesModule,
    BugsModule,
    ObjectModule,
  ],
})
export class AppModule {}
