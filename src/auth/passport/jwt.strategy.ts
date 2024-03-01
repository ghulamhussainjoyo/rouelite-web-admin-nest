import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JWTService } from '../jwt.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly jwtService: JWTService,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'THISAPPLICATIONISCREATEDBYGHULAMHUSSAINJOYO@11#$%^&*()', // Use config service to get the secret
    });
  }

  async validate(payload: any) {
    // The payload here contains the decoded JWT token payload
    // You can use this payload to retrieve user information
    const user = await this.jwtService.validateUser(payload); // Validate user based on the payload
    if (!user) {
      throw new UnauthorizedException();
    }
    return user; // If the user is valid, return it to be injected into the request
  }
}
