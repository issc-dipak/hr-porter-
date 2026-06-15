import { NextResponse } from 'next/server';
import { AuthService } from '../services/AuthService';
import { connectToDatabase } from '../../../database';
import { rateLimiter } from '../../../middleware/rateLimiter';
import { verifyAuth } from '../../../api/lib/auth';

export class AuthController {
  static async login(req: Request) {
    try {
      await connectToDatabase();
      const body: any = await req.json();
      
      const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
      const limiter = rateLimiter(`${ip}:login`, 10, 5 * 60 * 1000); // 10 login attempts in 5 mins
      if (limiter.blocked) return limiter.response!;

      const result = await AuthService.login(body);
      
      if (result.error) {
        return NextResponse.json({ error: result.error, requiresVerification: result.requiresVerification }, { status: result.status });
      }
      
      return NextResponse.json(result, { status: result.status });
    } catch (error: any) {
      console.error('AuthController Login Error:', error);
      return NextResponse.json(
        { error: 'Internal Server Error', details: error.message },
        { status: 500 }
      );
    }
  }

  static async companyRegister(req: Request) {
    try {
      await connectToDatabase();
      const body: any = await req.json();
      
      const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
      const limiter = rateLimiter(`${ip}:company-register`, 5, 15 * 60 * 1000); // 5 signup attempts in 15 mins
      if (limiter.blocked) return limiter.response!;

      const result = await AuthService.companyRegister(body, ip);
      
      if (result.error) {
        return NextResponse.json({ error: result.error }, { status: result.status });
      }
      
      return NextResponse.json(result, { status: result.status });
    } catch (error: any) {
      console.error('AuthController Company Register Error:', error);
      return NextResponse.json(
        { error: 'Internal Server Error', details: error.message },
        { status: 500 }
      );
    }
  }

  static async verifyEmail(req: Request) {
    try {
      await connectToDatabase();
      const body: any = await req.json();
      
      const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
      const limiter = rateLimiter(`${ip}:verify-email`, 5, 15 * 60 * 1000); // 5 attempts in 15 mins
      if (limiter.blocked) return limiter.response!;

      const result = await AuthService.verifyEmail(body, ip);
      
      if (result.error) {
        return NextResponse.json({ error: result.error }, { status: result.status });
      }
      
      return NextResponse.json(result, { status: result.status });
    } catch (error: any) {
      console.error('AuthController Verify Email Error:', error);
      return NextResponse.json(
        { error: 'Internal Server Error', details: error.message },
        { status: 500 }
      );
    }
  }

  static async sendOtp(req: Request) {
    try {
      await connectToDatabase();
      const body: any = await req.json();
      
      const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
      const limiter = rateLimiter(`${ip}:send-otp`, 3, 10 * 60 * 1000); // 3 OTP sends in 10 mins
      if (limiter.blocked) return limiter.response!;

      const result = await AuthService.sendOtp(body.email);
      
      if (result.error) {
        return NextResponse.json({ error: result.error }, { status: result.status });
      }
      
      return NextResponse.json(result, { status: result.status });
    } catch (error: any) {
      console.error('AuthController Send OTP Error:', error);
      return NextResponse.json(
        { error: 'Internal Server Error', details: error.message },
        { status: 500 }
      );
    }
  }

  static async inviteUser(req: Request) {
    try {
      const decoded = verifyAuth(req);
      if (!decoded || (decoded.role !== 'Admin' && decoded.role !== 'HR')) {
        return NextResponse.json({ error: 'Unauthorized. Only Admin and HR can invite users.' }, { status: 401 });
      }

      await connectToDatabase();
      const body: any = await req.json();
      
      const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
      const result = await AuthService.inviteUser({
        ...body,
        senderEmail: decoded.email,
        senderCompanyId: decoded.companyId,
        senderCompanyCode: decoded.companyCode,
        senderCompanyName: decoded.companyName
      }, ip);
      
      if (result.error) {
        return NextResponse.json({ error: result.error }, { status: result.status });
      }
      
      return NextResponse.json(result, { status: result.status });
    } catch (error: any) {
      console.error('AuthController Invite User Error:', error);
      return NextResponse.json(
        { error: 'Internal Server Error', details: error.message },
        { status: 500 }
      );
    }
  }

  static async acceptInvite(req: Request) {
    try {
      await connectToDatabase();
      const body: any = await req.json();
      
      const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
      const limiter = rateLimiter(`${ip}:accept-invite`, 5, 15 * 60 * 1000); // 5 attempts in 15 mins
      if (limiter.blocked) return limiter.response!;

      const result = await AuthService.acceptInvite(body, ip);
      
      if (result.error) {
        return NextResponse.json({ error: result.error }, { status: result.status });
      }
      
      return NextResponse.json(result, { status: result.status });
    } catch (error: any) {
      console.error('AuthController Accept Invite Error:', error);
      return NextResponse.json(
        { error: 'Internal Server Error', details: error.message },
        { status: 500 }
      );
    }
  }

  static async forgotPassword(req: Request) {
    try {
      await connectToDatabase();
      const body: any = await req.json();
      
      const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
      const limiter = rateLimiter(`${ip}:forgot-password`, 3, 15 * 60 * 1000);
      if (limiter.blocked) return limiter.response!;

      const result = await AuthService.forgotPassword(body.email);
      
      if (result.error) {
        return NextResponse.json({ error: result.error }, { status: result.status });
      }
      
      return NextResponse.json(result, { status: result.status });
    } catch (error: any) {
      console.error('AuthController ForgotPassword Error:', error);
      return NextResponse.json(
        { error: 'Internal Server Error', details: error.message },
        { status: 500 }
      );
    }
  }

  static async resetPassword(req: Request) {
    try {
      await connectToDatabase();
      const body: any = await req.json();
      
      const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
      const limiter = rateLimiter(`${ip}:reset-password`, 5, 15 * 60 * 1000);
      if (limiter.blocked) return limiter.response!;

      const result = await AuthService.resetPassword(body);
      
      if (result.error) {
        return NextResponse.json({ error: result.error }, { status: result.status });
      }
      
      return NextResponse.json(result, { status: result.status });
    } catch (error: any) {
      console.error('AuthController ResetPassword Error:', error);
      return NextResponse.json(
        { error: 'Internal Server Error', details: error.message },
        { status: 500 }
      );
    }
  }

  static async signup(req: Request) {
    // Redirect standard signup to companyRegister
    return this.companyRegister(req);
  }
}
