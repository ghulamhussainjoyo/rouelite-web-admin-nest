import { v2 } from 'cloudinary';
import { CLOUDINARY } from './constant';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

export const CloudinaryProvider = {
  provide: CLOUDINARY,
  useFactory: () => {
    const configService: ConfigService = new ConfigService();
    return v2.config({
      cloud_name: configService.get('CLOUDINARY_NAME'),
      api_key: configService.get('CLOUDINARY_API_KEY'),
      api_secret: configService.get('CLOUDINARY_SECRET_API'),
    });
  },
};
