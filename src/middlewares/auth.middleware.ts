import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.js';
import { errorResponse } from '../utils/response.js';

export const authenticate = async (
  req: any,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    errorResponse(res, 'Unauthorized', undefined, 401);
    return;
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = verifyToken(token);
    (req as any).user = decoded;
    if (req?.user?.role === "SALESMAN" || req?.user?.role === "OWNER") {
      next();
      return;
    }
    errorResponse(res, 'Unauthorized', undefined, 401);
    return;
  } catch (err) {
    errorResponse(res, 'Invalid or expired token', undefined, 401);
    return;
  }
};
