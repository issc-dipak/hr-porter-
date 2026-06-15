import { NextResponse } from 'next/server';
import { AttendanceService } from '../services/AttendanceService';
import { verifyAuthToken, createErrorResponse } from '../../../middleware/auth';
import { connectToDatabase } from '../../../database';

export class AttendanceController {
  static async getAttendance(req: Request) {
    try {
      const decoded = verifyAuthToken(req);
      if (!decoded) {
        return createErrorResponse('Unauthorized', 401);
      }

      await connectToDatabase();
      const employeeName = decoded.role === 'Employee' ? decoded.fullName : undefined;
      const result = await AttendanceService.getAttendance(decoded.companyId, employeeName);
      return NextResponse.json(result.data, { status: result.status });
    } catch (error: any) {
      console.error('AttendanceController getAttendance Error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch attendance records', details: error.message },
        { status: 500 }
      );
    }
  }

  static async logAttendance(req: Request) {
    try {
      const decoded = verifyAuthToken(req);
      if (!decoded) {
        return createErrorResponse('Unauthorized', 401);
      }

      await connectToDatabase();
      const body = await req.json() as any;
      const result = await AttendanceService.logAttendance(body, decoded.companyId);
      if (result.error) {
        return NextResponse.json({ error: result.error }, { status: result.status });
      }
      return NextResponse.json(result, { status: result.status });
    } catch (error: any) {
      console.error('AttendanceController logAttendance Error:', error);
      return NextResponse.json(
        { error: 'Failed to log attendance record', details: error.message },
        { status: 500 }
      );
    }
  }
}
