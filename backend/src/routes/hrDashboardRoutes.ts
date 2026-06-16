import { Router } from 'express';
import { handleWebRoute } from '../adaptor';
import { NextResponse } from 'next/server';
import { verifyAuth } from '../api/lib/auth';
import connectToDatabase from '../api/lib/mongodb';
import { Employee } from '../models/Employee';
import { Attendance } from '../models/Attendance';
import { Leave } from '../models/Leave';
import { Payroll } from '../models/Payroll';
import { Ticket } from '../models/Ticket';
import { Job } from '../models/Job';
import { Application } from '../models/Application';
import { DailyWorkUpdate } from '../models/DailyWorkUpdate';
import { Performance } from '../models/Performance';
import { User } from '../models/User';
import { AuditLog } from '../models/AuditLog';
import { Announcement } from '../models/Announcement';
import { DeletedEmployee } from '../models/DeletedEmployee';
import { Company } from '../models/Company';
import mongoose from 'mongoose';

const router = Router();

// GET /api/hr/dashboard
router.get('/hr/dashboard', handleWebRoute(async (req: Request) => {
  try {
    const decoded = verifyAuth(req);
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { companyId, role } = decoded;

    // Strict Role-Based Separation: Only HR can load this endpoint
    if (role !== 'HR') {
      return NextResponse.json({ error: 'Forbidden: HR access required' }, { status: 403 });
    }

    await connectToDatabase();

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const todayStr = new Date().toISOString().split('T')[0];
    const isValidId = mongoose.Types.ObjectId.isValid(companyId);

    // 1. Fetch all datasets concurrently using parallel Promise.all, lean, and field projection
    const [
      allEmployees,
      todayAttendance,
      hrUsers,
      leaves,
      tickets,
      activeJobs,
      applications,
      monthlyPayrolls,
      workUpdates,
      performances,
      auditLogs,
      announcements,
      deletedEmpsCount,
      activeCompany
    ] = await Promise.all([
      Employee.find({ companyId }).select('status joinedDate fullName email department dateOfBirth profilePicture documents salaryStructure').lean(),
      Attendance.find({ companyId, date: todayStr }).select('status name remarks timeIn timeOut date').lean(),
      User.find({ companyId, role: { $in: ['HR', 'Admin', 'Company Admin'] } }).select('status invitationToken role').lean(),
      Leave.find({ companyId }).select('status updatedAt dept name date reason type').lean(),
      Ticket.find({ companyId }).select('status escalated priority employeeName subject').lean(),
      Job.find({ companyId, status: 'Active' }).select('_id title dept createdAt').lean(),
      Application.find({ companyId }).select('stage source createdAt jobId').lean(),
      Payroll.find({ companyId, month: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}` }).select('net pf tax employee employeeName bonus allowance status').lean(),
      DailyWorkUpdate.find({ companyId }).sort({ date: -1 }).select('status employeeName department yesterdaysWork todaysPlan blockers date').lean(),
      Performance.find({ companyId }).select('rating dept name goals status lastReview').lean(),
      AuditLog.find({ companyId }).sort({ createdAt: -1 }).limit(20).select('performedBy action createdAt ipAddress details').lean(),
      Announcement.find({ companyId }).sort({ createdAt: -1 }).select('createdAt title content category postedBy').lean(),
      DeletedEmployee.countDocuments({ companyId }),
      Company.findOne(
        isValidId 
          ? { $or: [{ _id: companyId }, { slug: companyId }] } 
          : { slug: companyId }
      ).select('companyName status').lean()
    ]);

    // 2. Employee Statistics Calculations
    const activeEmployees = allEmployees.filter(e => e.status === 'Active');
    const onboardingEmployees = allEmployees.filter(e => e.status === 'Onboarding' || e.status === 'Pending');
    const inactiveEmployees = allEmployees.filter(e => e.status === 'Inactive' || e.status === 'Suspended' || e.status === 'Resigned' || e.status === 'Terminated');
    
    const newJoiners = allEmployees.filter(e => {
      const jd = new Date(e.joinedDate);
      return jd.getMonth() === currentMonth && jd.getFullYear() === currentYear;
    });

    // 3. Today's Attendance Calculations
    const presentToday = new Set(todayAttendance.filter(a => a.status === 'Present' || a.status === 'Late' || a.status === 'On Break').map(a => a.name)).size;
    const absentToday = Math.max(0, activeEmployees.length - presentToday);
    const wfhToday = new Set(todayAttendance.filter(a => a.remarks?.toLowerCase().includes('wfh') || a.remarks?.toLowerCase().includes('remote')).map(a => a.name)).size;
    const lateToday = new Set(todayAttendance.filter(a => a.status === 'Late' || a.remarks?.toLowerCase().includes('late')).map(a => a.name)).size;

    // 4. HR Managers Statistics
    const activeHr = hrUsers.filter(u => u.status === 'Active').length;
    const pendingHr = hrUsers.filter(u => u.status === 'Pending' || u.invitationToken).length;

    // 5. Leaves Info
    const pendingLeaves = leaves.filter(l => l.status === 'Pending');
    const approvedToday = leaves.filter(l => {
      const ud = new Date(l.updatedAt);
      return l.status === 'Approved' && ud.toDateString() === new Date().toDateString();
    });

    // 6. Helpdesk Tickets
    const openTickets = tickets.filter(t => t.status === 'Open' || t.status === 'Pending');
    const resolvedTickets = tickets.filter(t => t.status === 'Resolved' || t.status === 'Closed');
    const escalatedTickets = tickets.filter(t => t.escalated === true && t.status !== 'Resolved' && t.status !== 'Closed');
    const highPriorityTickets = openTickets.filter(t => t.priority === 'High' || t.priority === 'Critical');

    // 7. Recruitment Info
    const recruitmentsInfo = {
      activeJobs: activeJobs.length,
      applications: applications.length,
      funnel: {
        sourced: applications.length,
        interview: applications.filter(a => ['Interview', 'Technical Round', 'HR Round'].includes(a.stage)).length,
        offer: applications.filter(a => ['Selected', 'Offer Sent'].includes(a.stage)).length,
        hired: applications.filter(a => a.stage === 'Joined').length
      },
      sources: {
        linkedIn: applications.filter(a => a.source?.toLowerCase().includes('linkedin')).length,
        referral: applications.filter(a => a.source?.toLowerCase().includes('referral')).length,
        website: applications.filter(a => a.source?.toLowerCase().includes('website') || a.source?.toLowerCase().includes('portal') || !a.source).length,
        indeed: applications.filter(a => a.source?.toLowerCase().includes('indeed')).length,
        naukri: applications.filter(a => a.source?.toLowerCase().includes('naukri')).length,
        other: applications.filter(a => !['linkedin', 'referral', 'website', 'portal', 'indeed', 'naukri'].some(s => a.source?.toLowerCase().includes(s)) && a.source).length
      }
    };

    // 8. Monthly Payroll Cost & Calculations
    const totalPayrollAmount = monthlyPayrolls.reduce((sum, p) => sum + (p.net || 0), 0);
    const pfContribution = monthlyPayrolls.reduce((sum, p) => sum + (p.pf || 0), 0) || Math.round(totalPayrollAmount * 0.12);
    const taxDeductions = monthlyPayrolls.reduce((sum, p) => sum + (p.tax || 0), 0) || Math.round(totalPayrollAmount * 0.10);

    // Compute department-wise payroll
    const deptPayrollMap: Record<string, number> = {};
    monthlyPayrolls.forEach(p => {
      const emp = allEmployees.find(e => e.email === p.employee || e.fullName === p.employeeName);
      const dept = emp?.department || 'Operations';
      deptPayrollMap[dept] = (deptPayrollMap[dept] || 0) + (p.net || 0);
    });

    // 9. Action Center Items
    const pendingDocuments = allEmployees.filter(e => e.documents?.some(doc => doc.status === 'Pending' || doc.status === 'Pending Verification'));

    // 10. Daily Status Reports (DSR)
    const dsrMetrics = {
      total: workUpdates.length,
      completed: workUpdates.filter(u => u.status === 'Completed' || u.status === 'Reviewed').length,
      inProgress: workUpdates.filter(u => u.status === 'In Progress' || u.status === 'Submitted' || u.status === 'Pending Review').length,
      blocked: workUpdates.filter(u => u.status === 'Blocked').length
    };

    // 11. Department Health
    const getDeptMatch = (empDept: string | undefined, targetDept: string) => {
      if (!empDept) return false;
      const ed = empDept.toLowerCase();
      const td = targetDept.toLowerCase();
      if (ed === td) return true;
      if (td === 'engineering' && (ed.includes('eng') || ed.includes('software') || ed.includes('tech') || ed.includes('dev'))) return true;
      if (td === 'hr' && (ed.includes('hr') || ed.includes('human'))) return true;
      return ed.includes(td);
    };

    const departments = ['Engineering', 'Sales', 'HR', 'Finance', 'Marketing', 'Operations'];

    const departmentHealth = departments.map(dept => {
      const deptEmployees = allEmployees.filter(e => getDeptMatch(e.department, dept));
      
      const presentEmployeesCount = new Set(
        todayAttendance
          .filter(a => deptEmployees.some(emp => emp.fullName === a.name) && (a.status === 'Present' || a.status === 'Late' || a.status === 'On Break'))
          .map(a => a.name)
      ).size;
      const attRate = deptEmployees.length > 0 ? (presentEmployeesCount / deptEmployees.length) * 100 : 0;
      
      const approvedLeavesTodayCount = new Set(
        leaves
          .filter(l => l.status === 'Approved' && l.date?.includes(todayStr) && (getDeptMatch(l.dept, dept) || deptEmployees.some(emp => emp.fullName === l.name)))
          .map(l => l.name)
      ).size;
      const leaveRate = deptEmployees.length > 0 ? (approvedLeavesTodayCount / deptEmployees.length) * 100 : 0;

      const deptPerformances = performances.filter(p => getDeptMatch(p.dept, dept));
      const avgRating = deptPerformances.length > 0
        ? (deptPerformances.reduce((sum, p) => sum + (p.rating || 0), 0) / deptPerformances.length)
        : 0;
      const performanceScore = avgRating > 0 ? Math.round(avgRating * 20) : 0;

      const deptPayroll = deptPayrollMap[dept] || deptEmployees.reduce((sum, e) => sum + (e.salaryStructure?.net || 0), 0);

      return {
        department: dept,
        employeeCount: deptEmployees.length,
        attendanceRate: Math.round(attRate),
        leaveRate: Math.round(leaveRate),
        performanceScore: Math.min(100, performanceScore),
        payrollCost: deptPayroll
      };
    });

    // 12. Events and Anniversaries
    const events: any[] = [];
    allEmployees.forEach(emp => {
      if (emp.dateOfBirth) {
        events.push({
          type: 'Birthday',
          name: emp.fullName,
          date: emp.dateOfBirth,
          avatar: emp.profilePicture || ''
        });
      }
      if (emp.joinedDate) {
        events.push({
          type: 'Work Anniversary',
          name: emp.fullName,
          date: emp.joinedDate,
          avatar: emp.profilePicture || ''
        });
      }
    });
    
    events.sort((a, b) => {
      const d1 = new Date(a.date);
      const d2 = new Date(b.date);
      return d1.getMonth() === d2.getMonth() ? d1.getDate() - d2.getDate() : d1.getMonth() - d2.getMonth();
    });
    
    const slicedEvents = events.slice(0, 5);

    // 13. Performance Alerts
    const topPerformers = performances.filter(p => p.rating >= 4.5).map(p => ({ name: p.name, rating: p.rating, goalCompletion: parseInt(p.goals) || 95 }));
    const performanceAlerts = performances.filter(p => p.rating < 3.8).map(p => ({ name: p.name, rating: p.rating, goalCompletion: parseInt(p.goals) || 60 }));
    const performanceProbationEmployees = allEmployees.filter(e => e.status === 'Probation' || e.designation?.toLowerCase().includes('intern') || e.status === 'Onboarding').map(e => ({ name: e.fullName, date: e.joinedDate }));
    const reviewDueEmployees = performances.filter(p => p.status === 'Under Review' || p.status === 'Pending').map(p => ({ name: p.name, date: p.lastReview || '2026-06-30' }));

    const performanceData = {
      topPerformers,
      alerts: performanceAlerts,
      probation: performanceProbationEmployees,
      reviewDue: reviewDueEmployees
    };

    // 14. Formatted Audit Logs
    const formattedAuditLogs = auditLogs.map(log => ({
      id: log._id,
      user: log.performedBy,
      action: log.action,
      timestamp: log.createdAt,
      ipAddress: log.ipAddress || '127.0.0.1',
      details: log.details
    }));

    // 15. Security Center Stats
    const failedAttemptsCount = auditLogs.filter(log => log.action.toLowerCase().includes('login failed') || log.action.toLowerCase().includes('failed login')).length;
    const passwordResetsCount = auditLogs.filter(log => log.action.toLowerCase().includes('password reset') || log.action.toLowerCase().includes('forgot password')).length;
    const lockedAccountsCount = allEmployees.filter(e => e.status === 'Suspended').length;
    
    // Real login logs from database (no mock fallbacks)
    const recentLogins = auditLogs
      .filter(log => log.action.toLowerCase().includes('login') || log.action.toLowerCase().includes('session'))
      .map(log => ({
        user: log.performedBy,
        timestamp: log.createdAt,
        ipAddress: log.ipAddress || '127.0.0.1',
        status: log.action.toLowerCase().includes('failed') ? 'Failed' : 'Success'
      }));

    const securityAlerts = auditLogs
      .filter(log => log.action.toLowerCase().includes('failed') || log.action.toLowerCase().includes('locked') || log.action.toLowerCase().includes('unauthorized') || log.action.toLowerCase().includes('permission') || log.action.toLowerCase().includes('suspicious'))
      .map(log => ({
        id: log._id.toString(),
        user: log.performedBy,
        action: log.action,
        timestamp: log.createdAt,
        ipAddress: log.ipAddress || '127.0.0.1',
        severity: log.action.toLowerCase().includes('failed') || log.action.toLowerCase().includes('suspicious') ? 'High' : 'Medium'
      }));

    // 16. Announcements Info
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const unreadAnnouncementsCount = announcements.filter(a => new Date(a.createdAt) >= sevenDaysAgo).length;
    
    // Split announcements into recent vs scheduled (future timestamps)
    const recentAnnouncements = announcements.filter(a => new Date(a.createdAt) <= new Date());
    const scheduledAnnouncements = announcements.filter(a => new Date(a.createdAt) > new Date()).map(a => ({
      id: a._id.toString(),
      title: a.title,
      content: a.content,
      category: a.category,
      scheduledDate: a.createdAt,
      postedBy: a.postedBy
    }));

    // 17. Company Health Overview Percentages
    const joinedLast30Days = allEmployees.filter(e => {
      const jd = new Date(e.joinedDate);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return jd >= thirtyDaysAgo;
    }).length;
    const employeeGrowth = allEmployees.length > 0
      ? Math.round((joinedLast30Days / Math.max(1, allEmployees.length - joinedLast30Days)) * 100)
      : 0;

    const attendancePct = activeEmployees.length > 0
      ? Math.min(100, Math.round((presentToday / activeEmployees.length) * 100))
      : 0;

    const leavePct = activeEmployees.length > 0
      ? Math.min(100, Math.round((leaves.filter(l => l.status === 'Approved' && l.date?.includes(todayStr)).length / activeEmployees.length) * 100))
      : 0;

    const avgPerfRating = performances.length > 0
      ? (performances.reduce((sum, p) => sum + (p.rating || 0), 0) / performances.length)
      : 0;
    const performancePct = avgPerfRating > 0 ? Math.round((avgPerfRating / 5) * 100) : 0;

    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const thisMonthApps = applications.filter(a => {
      const d = new Date(a.createdAt);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).length;
    const lastMonthApps = applications.filter(a => {
      const d = new Date(a.createdAt);
      return d.getMonth() === lastMonth.getMonth() && d.getFullYear() === lastMonth.getFullYear();
    }).length;
    const hiringGrowth = lastMonthApps > 0 
      ? Math.round(((thisMonthApps - lastMonthApps) / lastMonthApps) * 100) 
      : (thisMonthApps > 0 ? 100 : 0);

    const attritionRate = allEmployees.length > 0
      ? Math.round((deletedEmpsCount / (allEmployees.length + deletedEmpsCount)) * 100)
      : 0;
    const retentionRate = Math.max(0, 100 - attritionRate);

    const companyHealth = {
      employeeGrowth,
      attendance: attendancePct,
      leave: leavePct,
      performance: performancePct,
      hiringGrowth,
      retentionRate,
      attritionRate
    };

    // 18. Multi-Company details
    const companyDetails = {
      companyName: activeCompany?.companyName || decoded.companyName || 'HCP Index Labs',
      employeeCount: allEmployees.length,
      subscriptionPlan: 'Enterprise SaaS Premium',
      storageUsage: '1.85 GB / 15 GB',
      status: activeCompany?.status || 'Active'
    };

    // Calculate dynamic lists & checklist tasks
    const newJoinersList = newJoiners.map(e => ({
      name: e.fullName,
      department: e.department || 'Operations',
      designation: e.designation || 'Specialist',
      date: e.joinedDate
    }));

    const resignedEmployees = allEmployees.filter(e => e.status === 'Resigned' || e.status === 'Terminated');
    const resignedList = resignedEmployees.map(e => ({
      name: e.fullName,
      department: e.department || 'Operations',
      designation: e.designation || 'Specialist',
      date: e.updatedAt
    }));

    const activeJobsList = activeJobs.map(j => {
      const jobApps = applications.filter(a => a.jobId === j._id.toString());
      return {
        title: j.title,
        dept: j.dept || 'Operations',
        applicants: jobApps.length,
        date: j.createdAt
      };
    });

    const payrollTasks = [
      { label: 'Verify monthly timesheets & late check-ins', checked: todayAttendance.filter(a => a.status === 'Late').length === 0 },
      { label: 'Review and approve pending leave requests', checked: pendingLeaves.length === 0 },
      { label: 'Deduct PF and TDS configurations', checked: monthlyPayrolls.length > 0 },
      { label: 'Generate tax-slip allowances & bonuses', checked: monthlyPayrolls.some(p => p.bonus > 0 || p.allowance > 0) },
      { label: 'Release digital bank payslips to employee vaults', checked: monthlyPayrolls.length > 0 && monthlyPayrolls.every(p => p.status === 'Paid' || p.status === 'Approved') }
    ];

    // Approved leaves today
    const leavesToday = leaves
      .filter(l => l.status === 'Approved' && l.date?.includes(todayStr))
      .map(l => ({ name: l.name, dept: l.dept || 'Operations', reason: l.reason, date: l.date }));

    // Attendance Exceptions (Late check-ins or no checkout)
    const attendanceExceptions = todayAttendance
      .filter(a => a.status === 'Late' || a.remarks?.toLowerCase().includes('late') || !a.timeOut || a.timeOut === '-')
      .map(a => ({ id: a._id, name: a.name, date: a.date, status: a.status, timeIn: a.timeIn, timeOut: a.timeOut || '-' }));

    // Probation employees list
    const probationEmployees = allEmployees
      .filter(e => e.status === 'Probation' || e.designation?.toLowerCase().includes('intern'))
      .map(e => ({ name: e.fullName, department: e.department, designation: e.designation, date: e.joinedDate }));

    // Upcoming Birthdays and Anniversaries lists
    const birthdaysList = events.filter(e => e.type === 'Birthday').map(e => ({ name: e.name, date: e.date, avatar: e.avatar }));
    const anniversariesList = events.filter(e => e.type === 'Work Anniversary').map(e => ({ name: e.name, date: e.date, avatar: e.avatar }));

    // Exit tracking process
    const exitTrackingList = allEmployees
      .filter(e => e.status === 'Resigned' || e.status === 'Terminated' || e.status === 'Suspended')
      .map(e => ({ id: e._id, name: e.fullName, department: e.department, status: e.status, date: e.updatedAt }));

    // Satisfaction Score
    const satisfactionScore = performances.length > 0
      ? Math.min(100, Math.round((performances.reduce((sum, p) => sum + (p.rating || 0), 0) / performances.length) * 20))
      : 88;

    // Return upgraded centralized dashboard payload
    return NextResponse.json({
      companyDetails,
      companyHealth,
      satisfactionScore,
      leavesToday,
      attendanceExceptions,
      probationEmployees,
      birthdaysList,
      anniversariesList,
      exitTrackingList,
      workforce: {
        newJoinersList,
        resignedList
      },
      recruitments: {
        activeJobsList,
        funnel: recruitmentsInfo.funnel,
        sources: recruitmentsInfo.sources
      },
      payroll: {
        payrollTasks
      },
      kpis: {
        totalEmployees: { 
          count: allEmployees.length, 
          active: activeEmployees.length, 
          inactive: inactiveEmployees.length,
          newJoiners: newJoiners.length 
        },
        totalHrManagers: {
          count: hrUsers.length,
          active: activeHr,
          pending: pendingHr
        },
        attendanceOverview: { 
          present: presentToday, 
          absent: absentToday, 
          wfh: wfhToday, 
          late: lateToday 
        },
        monthlyPayroll: { 
          totalCost: totalPayrollAmount || 0, 
          pfContribution,
          taxDeductions,
          upcomingDate: '2026-06-30' 
        },
        openRecruitments: { 
          activeJobs: activeJobs.length, 
          applicationsReceived: applications.length
        },
        openTickets: { 
          open: openTickets.length, 
          escalated: escalatedTickets.length, 
          resolved: resolvedTickets.length,
          highPriority: highPriorityTickets.length
        },
        pendingLeaves: {
          pending: pendingLeaves.length,
          approvedToday: approvedToday.length
        }
      },
      actionCenter: {
        pendingLeaves: pendingLeaves.map(l => ({ id: l._id, name: l.name, type: l.type, date: l.date, reason: l.reason, dept: l.dept })),
        pendingCorrections: todayAttendance.filter(a => 
          (a.status === 'Late' || a.remarks?.toLowerCase().includes('late')) && 
          !a.remarks?.toLowerCase().includes('approved') && 
          !a.remarks?.toLowerCase().includes('rejected') &&
          !a.remarks?.toLowerCase().includes('verified')
        ).map(a => ({ id: a._id, name: a.name, date: a.date, timeIn: a.timeIn })),
        pendingOnboarding: onboardingEmployees.map(e => ({ id: e._id, name: e.fullName, designation: e.designation })),
        pendingDocuments: pendingDocuments.map(e => ({ id: e._id, name: e.fullName, docs: e.documents?.filter(d => d.status === 'Pending' || d.status === 'Pending Verification').map(d => d.name) })),
        pendingEscalations: escalatedTickets.map(t => ({ id: t._id, name: t.employeeName, subject: t.subject, priority: t.priority }))
      },
      dsr: {
        updates: workUpdates.slice(0, 10).map(u => ({ id: u._id, name: u.employeeName, dept: u.department, yesterdaysWork: u.yesterdaysWork, todaysPlan: u.todaysPlan, blockers: u.blockers || 'None', status: u.status, date: u.date })),
        metrics: dsrMetrics
      },
      departmentHealth,
      events: slicedEvents,
      performance: performanceData,
      announcements: {
        recent: recentAnnouncements.map(a => ({
          id: a._id,
          title: a.title,
          content: a.content,
          category: a.category,
          postedBy: a.postedBy,
          createdAt: a.createdAt
        })),
        unreadCount: unreadAnnouncementsCount,
        scheduled: scheduledAnnouncements
      }
    }, { status: 200 });

  } catch (error: any) {
    console.error('Failed to get HR Command Center data:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}));

// POST /api/hr/action
router.post('/hr/action', handleWebRoute(async (req: Request) => {
  try {
    const decoded = verifyAuth(req);
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { companyId } = decoded;

    const data = await req.json() as any;
    const { type, id, action } = data; // type: 'leave' | 'ticket' | 'document' | 'correction' | 'onboarding'

    if (!type || !id || !action) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    await connectToDatabase();

    // Log the approval action in the AuditLog
    await AuditLog.create({
      companyId,
      action: `${type.toUpperCase()} ${action.toUpperCase()}`,
      performedBy: decoded.email || 'admin@company.com',
      details: `Admin ${action}d ${type} request for ID: ${id}`,
      ipAddress: '127.0.0.1'
    });

    if (type === 'leave') {
      const statusMap = action === 'approve' ? 'Approved' : 'Rejected';
      const updated = await Leave.findOneAndUpdate({ _id: id, companyId }, { status: statusMap }, { new: true });
      return NextResponse.json({ success: true, item: updated }, { status: 200 });
    }

    if (type === 'ticket') {
      const statusMap = action === 'approve' ? 'Resolved' : 'Closed';
      const updated = await Ticket.findOneAndUpdate({ _id: id, companyId }, { status: statusMap }, { new: true });
      return NextResponse.json({ success: true, item: updated }, { status: 200 });
    }

    if (type === 'document') {
      const statusMap = action === 'approve' ? 'Verified' : 'Rejected';
      const updated = await Employee.findOneAndUpdate(
        { companyId, "documents._id": id },
        { $set: { "documents.$.status": statusMap } },
        { new: true }
      );
      return NextResponse.json({ success: true, item: updated }, { status: 200 });
    }

    if (type === 'onboarding') {
      const statusMap = action === 'approve' ? 'Active' : 'Pending';
      const updated = await Employee.findOneAndUpdate(
        { _id: id, companyId },
        { $set: { status: statusMap } },
        { new: true }
      );
      return NextResponse.json({ success: true, item: updated }, { status: 200 });
    }

    if (type === 'correction') {
      const statusMap = action === 'approve' ? 'Present' : 'Late';
      const remarksMap = action === 'approve' ? 'Late arrival correction approved' : 'Late arrival correction rejected';
      const updated = await Attendance.findOneAndUpdate(
        { _id: id, companyId },
        { $set: { status: statusMap, remarks: remarksMap } },
        { new: true }
      );
      return NextResponse.json({ success: true, item: updated }, { status: 200 });
    }

    return NextResponse.json({ error: 'Invalid action type' }, { status: 400 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}));

export default router;
