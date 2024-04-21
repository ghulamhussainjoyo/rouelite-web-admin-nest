import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ClubController } from './club.controller';
import { ClubService } from './club.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Club, ClubSchema } from 'src/schema/club.schema';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { User, UserSchema } from 'src/schema/user.schema';
import { LoggerMiddleware } from 'src/common/middleware/logger.middleware';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Club.name, schema: ClubSchema },
      { name: User.name, schema: UserSchema },
    ]),
    CloudinaryModule,
  ],
  controllers: [ClubController],
  providers: [ClubService],
})
// export class ClubModule {}
export class ClubModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes(ClubController);
  }
}
