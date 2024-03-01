import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Twilio } from 'twilio';
@Injectable()
export class OtpService {
  private twilioClient: Twilio;
  constructor(private readonly configService: ConfigService) {
    const accountSid = `ACc823a4c6b94ae4f368da74ff6307928d`;
    const authToken = `1e79e2626c4112d7712e6f5e378c74d7`;

    if (!accountSid || !authToken) {
      throw new Error(`Twilio account SID/auth token not found`);
    }
    this.twilioClient = new Twilio(accountSid, authToken);
  }

  async sendOtp(phoneNumber: string) {
    try {
      const serviceSid = 'VAeae7769142ece182b7a2984cc0710161';

      let msg = '';
      await this.twilioClient.verify.v2
        .services(serviceSid)
        .verifications.create({ to: phoneNumber, channel: 'sms' })
        .then((verification) => (msg = verification.status));
      return { msg: msg };
    } catch (error) {
      Logger.log({ error });
      return { msg: `${error}` };
    }
  }

  async verifyOtp(phoneNumber: string, code: string) {
    const serviceSid = this.configService.get(
      'TWILIO_VERIFICATION_SERVICE_SID',
    );
    let msg = '';
    await this.twilioClient.verify.v2
      .services(serviceSid)
      .verificationChecks.create({ to: phoneNumber, code: code })
      .then((verification) => (msg = verification.status));
    return { msg: msg };
  }
}
