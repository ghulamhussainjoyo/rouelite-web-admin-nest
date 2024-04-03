import { HttpException, HttpStatus } from '@nestjs/common';

export class InValidIdException extends HttpException {
  constructor() {
    super('INVALID ID', HttpStatus.BAD_REQUEST);
  }
}
