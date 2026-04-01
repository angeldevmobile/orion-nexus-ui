import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { JWTPayload } from '../types/auth';

const JWT_SECRET: Secret = process.env.JWT_SECRET || 'fallback-secret-key';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';

export const generateToken = (payload: JWTPayload): string => {
  return jwt.sign(
    payload as object,
    JWT_SECRET,
    { expiresIn: JWT_EXPIRE } as SignOptions 
  );
};

export const verifyToken = (token: string): JWTPayload => {
  const decoded = jwt.verify(token, JWT_SECRET);
  return decoded as JWTPayload;
};