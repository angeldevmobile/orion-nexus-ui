declare module 'passport-github2' {
  import { Strategy as PassportStrategy } from 'passport-strategy';
  import { Request } from 'express';

  export interface Profile {
    id: string;
    username: string;
    displayName: string;
    emails?: Array<{ value: string; verified?: boolean }>;
    photos?: Array<{ value: string }>;
    provider: string;
    _raw: string;
    _json: Record<string, unknown>; // Changed from any
  }

  export interface StrategyOptions {
    clientID: string;
    clientSecret: string;
    callbackURL: string;
    scope?: string | string[];
    userAgent?: string;
  }

  export type VerifyCallback = (error?: Error | null, user?: Express.User, info?: object) => void; // Changed from any

  export type VerifyFunction = (
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback
  ) => void;

  export class Strategy extends PassportStrategy {
    constructor(options: StrategyOptions, verify: VerifyFunction);
    name: string;
    
    // Método requerido por la interfaz de Passport
    authenticate(req: Request, options?: object): void;
  }
}