import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_here';

export interface DecodedToken {
  userId: string;
  email: string;
  role: string;
  companyName: string;
  companyCode: string;
  companyId: string;
  fullName?: string;
}

export function verifyAuth(req: Request): DecodedToken | null {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // Provide backwards compatibility for existing tokens
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
