import { Router } from 'express';
import { handleWebRoute } from '../adaptor';

// Import route handlers
import { GET as hello } from '../api/hello/route';
import { GET as getAnnouncements, POST as createAnnouncement } from '../api/announcements/route';
import { GET as getPresence, POST as updatePresence } from '../api/presence/route';
import { GET as getReferrals, POST as createReferral } from '../api/referrals/route';
import { GET as getReimbursements, POST as createReimbursement } from '../api/reimbursement/route';
import { PUT as updateReimbursement } from '../api/reimbursement/[id]/route';
import { POST as uploadFile } from '../api/upload/route';
import { POST as sendEmailNotification } from '../api/notifications/email/route';
import { GET as getAuditLogs } from '../api/auditlogs/route';
import { GET as testEmail } from '../api/test-email/route';
import { GET as runSeed } from '../api/seed/route';
import { GET as clearApplicants } from '../api/clear-applicants/route';
import { GET as fixCompanyIds } from '../api/fix-company-ids/route';
import { POST as chatbot } from '../api/chatbot/route';

// Assets
import { GET as getAssets, POST as createAsset } from '../api/assets/route';
import { PUT as updateAsset, DELETE as deleteAsset } from '../api/assets/[id]/route';

// Tickets Support Ticketing
import { GET as getTickets, POST as createTicket } from '../api/tickets/route';
import { GET as getMyTickets } from '../api/tickets/my/route';
import { GET as getTicketById } from '../api/tickets/[id]/route';
import { POST as addTicketComment } from '../api/tickets/[id]/comment/route';
import { PUT as assignTicket } from '../api/tickets/[id]/assign/route';
import { PUT as updateTicketStatus } from '../api/tickets/[id]/status/route';
import { POST as reopenTicket } from '../api/tickets/[id]/reopen/route';
import { GET as getTicketAnalytics } from '../api/tickets/analytics/route';
import { GET as getTicketReports } from '../api/tickets/reports/route';

// Org Chart
import { GET as getOrgChartConfig, POST as createOrgChartConfig } from '../api/organization-chart/route';
import { GET as getOrgChartTree } from '../api/organization-chart/tree/route';
import { GET as getOrgChartDepartment } from '../api/organization-chart/department/route';
import { GET as getOrgChartManagers } from '../api/organization-chart/managers/route';
import { GET as getOrgChartEmployee } from '../api/organization-chart/employee/[id]/route';
import { POST as assignReportingManager } from '../api/organization-chart/assign-manager/route';
import { PUT as updateReportingStructure } from '../api/organization-chart/update-reporting/route';
import { GET as exportOrgChart } from '../api/organization-chart/export/route';

// Jobs
import { GET as getJobs, POST as createJob } from '../api/jobs/route';
import { PUT as updateJob, DELETE as deleteJob } from '../api/jobs/[id]/route';

// Performance
import { GET as getPerformance, POST as createPerformance } from '../api/performance/route';
import { PUT as updatePerformance, DELETE as deletePerformance } from '../api/performance/[id]/route';
import { POST as createPerformanceGoal } from '../api/performance/goal/route';
import { GET as getPerformanceReports, POST as createPerformanceReport } from '../api/performance/reports/route';
import { GET as getPerformanceReportPreview } from '../api/performance/reports/preview/route';

// Tasks / Goals
import { GET as getTasks, POST as createTask } from '../api/tasks/route';
import { GET as getTaskById, PUT as updateTask, DELETE as deleteTask } from '../api/tasks/[id]/route';

// Social Feed
import { GET as getPosts, POST as createPost } from '../api/feed/posts/route';
import { GET as getPostById, PUT as updatePost, DELETE as deletePost } from '../api/feed/posts/[id]/route';
import { GET as getComments, POST as commentOnPost } from '../api/feed/posts/[id]/comments/route';
import { POST as reactToPost } from '../api/feed/posts/[id]/reactions/route';
import { GET as getFeedNotifications, PUT as markNotificationsRead } from '../api/feed/notifications/route';
import { GET as getTrending } from '../api/feed/trending/route';
import { GET as getReports, POST as reportPost } from '../api/feed/reports/route';
import { PUT as updateComment, DELETE as deleteComment } from '../api/feed/comments/[commentId]/route';

const router = Router();

// General / Utility
router.get('/hello', handleWebRoute(hello));
router.post('/upload', handleWebRoute(uploadFile));
router.get('/auditlogs', handleWebRoute(getAuditLogs));
router.get('/test-email', handleWebRoute(testEmail));
router.get('/seed', handleWebRoute(runSeed));
router.get('/clear-applicants', handleWebRoute(clearApplicants));
router.get('/fix-company-ids', handleWebRoute(fixCompanyIds));
router.post('/chatbot', handleWebRoute(chatbot));

// Assets
router.get('/assets', handleWebRoute(getAssets));
router.post('/assets', handleWebRoute(createAsset));
router.put('/assets/:id', handleWebRoute(updateAsset));
router.delete('/assets/:id', handleWebRoute(deleteAsset));

// Announcements, Presence, Referrals, Reimbursements
router.get('/announcements', handleWebRoute(getAnnouncements));
router.post('/announcements', handleWebRoute(createAnnouncement));
router.get('/presence', handleWebRoute(getPresence));
router.post('/presence', handleWebRoute(updatePresence));
router.get('/referrals', handleWebRoute(getReferrals));
router.post('/referrals', handleWebRoute(createReferral));
router.get('/reimbursement', handleWebRoute(getReimbursements));
router.post('/reimbursement', handleWebRoute(createReimbursement));
router.put('/reimbursement/:id', handleWebRoute(updateReimbursement));
router.post('/notifications/email', handleWebRoute(sendEmailNotification));

// Jobs
router.get('/jobs', handleWebRoute(getJobs));
router.post('/jobs', handleWebRoute(createJob));
router.put('/jobs/:id', handleWebRoute(updateJob));
router.delete('/jobs/:id', handleWebRoute(deleteJob));

// Performance
router.get('/performance', handleWebRoute(getPerformance));
router.post('/performance', handleWebRoute(createPerformance));
router.put('/performance/:id', handleWebRoute(updatePerformance));
router.delete('/performance/:id', handleWebRoute(deletePerformance));
router.post('/performance/goal', handleWebRoute(createPerformanceGoal));
router.get('/performance/reports', handleWebRoute(getPerformanceReports));
router.post('/performance/reports', handleWebRoute(createPerformanceReport));
router.get('/performance/reports/preview', handleWebRoute(getPerformanceReportPreview));

// Tasks / Goals (CRUD)
router.get('/tasks', handleWebRoute(getTasks));
router.post('/tasks', handleWebRoute(createTask));
router.get('/tasks/:id', handleWebRoute(getTaskById));
router.put('/tasks/:id', handleWebRoute(updateTask));
router.delete('/tasks/:id', handleWebRoute(deleteTask));

// Feed
router.get('/feed/posts', handleWebRoute(getPosts));
router.post('/feed/posts', handleWebRoute(createPost));
router.get('/feed/posts/:id', handleWebRoute(getPostById));
router.put('/feed/posts/:id', handleWebRoute(updatePost));
router.delete('/feed/posts/:id', handleWebRoute(deletePost));
router.get('/feed/posts/:id/comments', handleWebRoute(getComments));
router.post('/feed/posts/:id/comments', handleWebRoute(commentOnPost));
router.post('/feed/posts/:id/reactions', handleWebRoute(reactToPost));
router.get('/feed/notifications', handleWebRoute(getFeedNotifications));
router.put('/feed/notifications', handleWebRoute(markNotificationsRead));
router.get('/feed/trending', handleWebRoute(getTrending));
router.get('/feed/reports', handleWebRoute(getReports));
router.post('/feed/reports', handleWebRoute(reportPost));
router.put('/feed/comments/:commentId', handleWebRoute(updateComment));
router.delete('/feed/comments/:commentId', handleWebRoute(deleteComment));

// Tickets API Routes
router.get('/tickets', handleWebRoute(getTickets));
router.post('/tickets', handleWebRoute(createTicket));
router.get('/tickets/my', handleWebRoute(getMyTickets));
router.get('/tickets/analytics', handleWebRoute(getTicketAnalytics));
router.get('/tickets/reports', handleWebRoute(getTicketReports));
router.get('/tickets/:id', handleWebRoute(getTicketById));
router.post('/tickets/:id/comment', handleWebRoute(addTicketComment));
router.put('/tickets/:id/assign', handleWebRoute(assignTicket));
router.put('/tickets/:id/status', handleWebRoute(updateTicketStatus));
router.post('/tickets/:id/reopen', handleWebRoute(reopenTicket));

// Org Chart API Routes
router.get('/organization-chart', handleWebRoute(getOrgChartConfig));
router.post('/organization-chart', handleWebRoute(createOrgChartConfig));
router.get('/organization-chart/tree', handleWebRoute(getOrgChartTree));
router.get('/organization-chart/department', handleWebRoute(getOrgChartDepartment));
router.get('/organization-chart/managers', handleWebRoute(getOrgChartManagers));
router.get('/organization-chart/employee/:id', handleWebRoute(getOrgChartEmployee));
router.post('/organization-chart/assign-manager', handleWebRoute(assignReportingManager));
router.put('/organization-chart/update-reporting', handleWebRoute(updateReportingStructure));
router.get('/organization-chart/export', handleWebRoute(exportOrgChart));

export default router;
