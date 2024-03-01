import { Injectable, NestMiddleware } from '@nestjs/common';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: any, res: Response, next: (err?: any) => void) {
    try {
      const obfuscateRequest = JSON.parse(JSON.stringify(req.body));
      if (obfuscateRequest && obfuscateRequest.password)
        obfuscateRequest.password = '*******';
      if (obfuscateRequest && obfuscateRequest.newPassword)
        obfuscateRequest.newPassword = '*******';
      if (obfuscateRequest && obfuscateRequest.currentPassword)
        obfuscateRequest.currentPassword = '*******';
      if (Object.keys(obfuscateRequest).length !== 0)
        console.log(
          new Date().toString() +
            ' - [Request] ' +
            req.baseUrl +
            ' - ' +
            JSON.stringify(obfuscateRequest),
        );
    } catch (error) {}
    next();
  }
}
