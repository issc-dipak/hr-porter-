import { NextResponse } from 'next/server';
import { LeaveService } from '../services/LeaveService';
import { verifyAuthToken, createErrorResponse } from '../../../middleware/auth';
import { connectToDatabase } from '../../../database';

export class LeaveController {
  static async getLeaves(req: Request) {
    try {
      const decoded = verifyAuthToken(req);
      if (!decoded) {
        return createErrorResponse('Unauthorized', 401);
      }

      await connectToDatabase();
      const employeeName = decoded.role === 'Employee' ? decoded.fullName : undefined;
      const result = await LeaveService.getLeaves(decoded.companyId, employeeName);
      return NextResponse.json(result.data, { status: result.status });
    } catch (error: any) {
      console.error('LeaveController getLeaves Error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch leaves', details: error.message },
        { status: 500 }
      );
    }
  }

  static async createLeave(req: Request) {
    try {
      const decoded = verifyAuthToken(req);
      if (!decoded) {
        return createErrorResponse('Unauthorized', 401);
      }

      await connectToDatabase();
      const body = await req.json() as any;
      const result = await LeaveService.createLeave(body, decoded.companyId);
      if (result.error) {
        return NextResponse.json({ error: result.error }, { status: result.status });
      }

      // Send system notification to Admin and HR roles
      try {
        const { SystemNotificationService } = await import('../../../services/systemNotificationService');
        await SystemNotificationService.notifyRoles(decoded.companyId, ['Admin', 'HR'], {
          companyId: decoded.companyId,
          title: 'New Leave Request',
          content: `${decoded.fullName} requested ${body.type} leave for ${body.duration || 'specified days'}`,
          type: 'leave',
          targetPage: 'leaves'
        });
      } catch (err) {
        console.error('Failed to trigger leave submission notification:', err);
      }

      return NextResponse.json(result, { status: result.status });
    } catch (error: any) {
      console.error('LeaveController createLeave Error:', error);
      return NextResponse.json(
        { error: 'Failed to submit leave request', details: error.message },
        { status: 500 }
      );
    }
  }

  static async updateLeaveStatus(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
      const decoded = verifyAuthToken(req);
      if (!decoded) {
        return createErrorResponse('Unauthorized', 401);
      }

      await connectToDatabase();
      const { id } = await params;
      const { status } = await req.json() as any;
      const result = await LeaveService.updateLeaveStatus(id, status, decoded.companyId);
      if (result.error) {
        return NextResponse.json({ error: result.error }, { status: result.status });
      }

      // Notify the employee who requested this leave
      try {
        const { SystemNotificationService } = await import('../../../services/systemNotificationService');
        const leave = result.leave;
        if (leave) {
          let recipientEmail = leave.employee; // Fallback
          
          // Try to look up by matching fullName or email in the Employee or User collections
          try {
            const { Employee } = await import('../../../models/Employee');
            const empRecord = await Employee.findOne({ 
              $or: [
                { fullName: leave.name },
                { fullName: leave.employee },
                { email: leave.employee }
              ],
              companyId: decoded.companyId 
            });
            if (empRecord && empRecord.email) {
              recipientEmail = empRecord.email;
            } else {
              const { User } = await import('../../../models/User');
              const userRecord = await User.findOne({ 
                $or: [
                  { fullName: leave.name },
                  { fullName: leave.employee },
                  { email: leave.employee }
                ],
                companyId: decoded.companyId 
              });
              if (userRecord && userRecord.email) {
                recipientEmail = userRecord.email;
              }
            }
          } catch (lookupErr) {
            console.error('Failed to lookup employee email for notification:', lookupErr);
          }

          await SystemNotificationService.createNotification({
            companyId: decoded.companyId,
            userId: recipientEmail,
            title: `Leave Request ${status}`,
            content: `Your leave request for ${leave.type} on ${leave.date} has been ${status.toLowerCase()} by HR.`,
            type: 'leave',
            targetPage: 'leaves'
          });
        }
      } catch (err) {
        console.error('Failed to trigger leave status update notification:', err);
      }

      return NextResponse.json(result, { status: result.status });
    } catch (error: any) {
      console.error('LeaveController updateLeaveStatus Error:', error);
      return NextResponse.json(
        { error: 'Failed to update leave request', details: error.message },
        { status: 500 }
      );
    }
  }
}
