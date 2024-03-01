import { Body, Controller, Post } from '@nestjs/common';
import { OtpService } from './otp.service';

@Controller('otp')
export class OtpController {
  constructor(private readonly otpService: OtpService) {}

  @Post()
  async sendOpt(@Body() data: { phone: string }): Promise<{ msg: string }> {
    return this.otpService.sendOtp(data.phone);
  }

  @Post('/verify')
  async verifyOpt(
    @Body() data: { phone: string; otp: string },
  ): Promise<{ msg: string }> {
    return this.otpService.verifyOtp(data.phone, data.otp);
  }
}
