import { BadRequestException, Injectable, UploadedFile } from '@nestjs/common';
import { UploadApiErrorResponse, UploadApiResponse, v2 } from 'cloudinary';
import toStream = require('buffer-to-stream');
import pLimit from 'p-limit';

const pLimitBound = pLimit(10);

@Injectable()
export class CloudinaryService {
  constructor() {}
  // ------------------------------>
  async uploadImage(
    file: Express.Multer.File,
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    try {
      return new Promise((resolve, reject) => {
        const upload = v2.uploader.upload_stream((err, result) => {
          if (err) return reject(err);
          resolve(result);
        });
        toStream(file.buffer).pipe(upload);
      });
    } catch (error) {
      throw new BadRequestException(`${error}`);
    }
  }
  // ------------------------------>
  async uploadImageToCloudinary(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    const result = await this.uploadImage(file);
    return result;
  }

  async uploadMultipleImageToCloudinary(
    @UploadedFile() files: Express.Multer.File[],
  ) {
    const uploadImages = files.map((image) => {
      return pLimitBound(async () => {
        const result = await this.uploadImage(image);
        return result;
      });
    });

    const uploads = await Promise.all(uploadImages);
    return uploads;
  }
}
