import { BadRequestException, Injectable, UploadedFile } from '@nestjs/common';
import { UploadApiErrorResponse, UploadApiResponse, v2 } from 'cloudinary';
import toStream = require('buffer-to-stream');

@Injectable()
export class CloudinaryService {
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
}
