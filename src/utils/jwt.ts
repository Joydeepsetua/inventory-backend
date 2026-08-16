import jwt, { SignOptions } from 'jsonwebtoken';
import moment from 'moment';
import ms, { StringValue } from 'ms';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

const JWT_SECRET = process.env.JWT_SECRET;
const ACCESS_EXPIRES_IN = process.env.ACCESS_EXPIRES_IN;
const REFRESH_EXPIRES_IN = process.env.REFRESH_EXPIRES_IN;


// Generate JWT token
export function generateToken(payload: JwtPayload): object {
  const token = jwt.sign(
    payload,
    JWT_SECRET as string,
    {
      expiresIn: ACCESS_EXPIRES_IN,
      algorithm: 'HS512',
    } as SignOptions
  );
  const refreshToken = jwt.sign(
    payload,
    JWT_SECRET as string,
    {
      expiresIn: REFRESH_EXPIRES_IN,
      algorithm: 'HS256',
    } as SignOptions
  );
  return {
    access_token: token,
    refresh_token: refreshToken,
    token_expiry: moment()
      .add(ms(ACCESS_EXPIRES_IN as StringValue), 'milliseconds')
      .format('YYYY-MM-DD HH:mm:ss'),
    refresh_token_expiry: moment()
      .add(ms(REFRESH_EXPIRES_IN as StringValue), 'milliseconds')
      .format('YYYY-MM-DD HH:mm:ss'),
  };
}

// Verify JWT token
export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET as string) as JwtPayload;
}

// Verify refresh token
export function verifyRefreshToken(refreshToken: string): JwtPayload {
  return jwt.verify(refreshToken, JWT_SECRET as string, {
    algorithms: ['HS256']
  }) as JwtPayload;
}
