import { v2 } from 'cloudinary';
import { CLOUDINARY } from './constant';

export const CloudinaryProvider = {
  provide: CLOUDINARY,
  useFactory: () => {
    return v2.config({
      cloud_name: 'dxidtdi0m',
      api_key: '962132978928129',
      api_secret: 'sL9sQxA2lrlXMdeAGDWgo8-e12o',
    });
  },
};
