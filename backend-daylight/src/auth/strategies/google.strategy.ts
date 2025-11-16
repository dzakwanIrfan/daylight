import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private configService: ConfigService) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID') || '',
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET') || '',
      callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL') || '',
      scope: ['email', 'profile'],
      passReqToCallback: true,
    });
  }

  async validate(
    request: any,
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { id, name, emails, photos } = profile;

    // Extract sessionId dari state parameter
    let sessionId: string | undefined;
    
    try {
      // Google akan return state di query.state
      const stateParam = request.query?.state;
      
      if (stateParam) {
        // Decode state (format: base64 encoded JSON)
        const decoded = Buffer.from(stateParam, 'base64').toString('utf-8');
        const stateData = JSON.parse(decoded);
        sessionId = stateData.sessionId;
      }
    } catch (error) {
      console.error('Error parsing state parameter:', error);
    }

    const user = {
      id,
      email: emails[0].value,
      firstName: name.givenName,
      lastName: name.familyName,
      picture: photos[0].value,
      sessionId,
    };

    done(null, user);
  }
}