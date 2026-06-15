import { NextResponse } from 'next/server';
import connectToDatabase from '@/app/api/lib/mongodb';
import { Employee } from '@/app/api/models/Employee';
import { Attendance } from '@/app/api/models/Attendance';
import { Leave } from '@/app/api/models/Leave';
import { Payroll } from '@/app/api/models/Payroll';
import { Job } from '@/app/api/models/Job';
import { verifyAuth } from '@/app/api/lib/auth';

export async function GET(req: Request) {
  try {
    const decoded = verifyAuth(req);
    if (!decoded || (decoded.role !== 'Admin' && decoded.role !== 'HR')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const companyId = decoded.companyId || 'company_001';

    // 1. Total Employees (Active)
    const totalEmployees = await Employee.countDocuments({ companyId, status: 'Active' });

    // 2. Present Today
    const todayStr = new Date().toISOString().split('T')[0];
    const presentToday = await Attendance.countDocuments({ 
      companyId, 
      date: todayStr, 
      status: { $in: ['Present', 'On Time', 'Late'] } 
    });

    // 3. New Hires This Month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const newHires = await Employee.countDocuments({
      companyId,
      joinedDate: { $gte: startOfMonth }
    });

    // 4. Pending Leave Requests
    const pendingLeaves = await Leave.countDocuments({ companyId, status: 'Pending' });

    // 5. Monthly Payroll Cost
    const currentMonthStr = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }); // e.g., "June 2026"
    const payrolls = await Payroll.find({ companyId, month: currentMonthStr });
    const monthlyPayrollCost = payrolls.reduce((sum, p) => sum + (Number(p.net) || 0), 0);

    // 6. Open Job Positions
    const openPositions = await Job.countDocuments({ companyId, status: 'Active' });

    return NextResponse.json({
      totalEmployees,
      presentToday,
      newHires,
      pendingLeaves,
      monthlyPayrollCost,
      openPositions
    }, { status: 200 });

  } catch (error: any) {
    console.error('Failed to fetch reports dashboard:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard reports', details: error.message }, { status: 500 });
  }
}

