import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';
import { config } from '../config';

export interface DecodedToken {
  userId: string;
  email: string;
  role: string;
  companyName: string;
  companyCode: string;
  companyId: string;
  fullName?: string;
}

export function verifyAuthToken(req: Request): DecodedToken | null {
  try {
    const authHeader = req.headers.get('Authorization');
    console.log('verifyAuthToken: authHeader =', authHeader);
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('verifyAuthToken: missing or invalid Bearer prefix');
      return null;
    }
    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, config.jwtSecret) as any;
    } catch (err: any) {
      console.error('verifyAuthToken: jwt.verify failed with error:', err.message);
      return null;
    }
    
    if (decoded) {
      if (!decoded.companyName) {
        decoded.companyName = 'HR Core Labs';
      }
      if (!decoded.companyCode) {
        decoded.companyCode = 'hrcore';
      }
      if (!decoded.companyId) {
        decoded.companyId = decoded.companyCode;
      }
      if (!decoded.fullName) {
        decoded.fullName = decoded.email.split('@')[0];
      }
    }
    
    return decoded as DecodedToken;
  } catch (error) {
    console.error('JWT Verification failed:', error);
    return null;
  }
}

export function checkRole(decoded: DecodedToken, allowedRoles: string[]): boolean {
  return allowedRoles.includes(decoded.role);
}

export function createErrorResponse(message: string, status: number = 401) {
  return NextResponse.json({ error: message }, { status });
}
