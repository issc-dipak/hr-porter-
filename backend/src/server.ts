import './config-env';

import express from 'express';
import cors from 'cors';
import { createServer } from 'http';

// Import Express Routers
import authRouter from './routes/authRoutes';
import employeeRouter from './routes/employeeRoutes';
import attendanceRouter from './routes/attendanceRoutes';
import leaveRouter from './routes/leaveRoutes';
import payrollRouter from './routes/payrollRoutes';
import chatRouter from './routes/chatRoutes';
import walletRouter from './routes/walletRoutes';
import settingsRouter from './routes/settingsRoutes';
import otherRouter from './routes/otherRoutes';
import recruitmentRouter from './routes/recruitmentRoutes';
import dailyUpdateRouter from './routes/dailyUpdateRoutes';
import reportRouter from './routes/reportRoutes';
import companyRouter from './routes/companyRoutes';
import systemNotificationRouter from './routes/systemNotificationRoutes';
import employeeDashboardRouter from './routes/employeeDashboardRoutes';
import hrDashboardRouter from './routes/hrDashboardRoutes';
import adminDashboardRouter from './routes/adminDashboardRoutes';
import { initSocket } from './config/socket';

const app = express();

// Configure CORS
app.use(cors({
  origin: '*', // Allow all origins for simplicity in development
  credentials: true
}));

const PORT = process.env.PORT || 5000;

// Connect to Database dynamically to ensure config reads populated environment variables
import('./database')
  .then(({ connectToDatabase }) => connectToDatabase())
  .then(() => {
    console.log('Database connected successfully');
    
    // Register the routes explicitly
    app.use('/api/auth', authRouter);
    app.use('/api/employees', employeeRouter);
    app.use('/api/attendance', attendanceRouter);
    app.use('/api/leaves', leaveRouter);
    app.use('/api/payroll', payrollRouter);
    app.use('/api/company', companyRouter);
    app.use('/api', chatRouter); // Chat contains sub-segments like /channels and /messages
    app.use('/api', walletRouter); // Wallet contains sub-segments like /wallet and /razorpay
    app.use('/api/settings', settingsRouter);
    app.use('/api/daily-updates', dailyUpdateRouter);
    app.use('/api/reports', reportRouter);
    app.use('/api/system-notifications', systemNotificationRouter);
    app.use('/api', employeeDashboardRouter);
    app.use('/api', hrDashboardRouter);
    app.use('/api', adminDashboardRouter);
    app.use('/api', otherRouter); // Other contains hello, presence, referrals, jobs, etc.
    app.use('/api', recruitmentRouter); // Recruitment ATS and Career Portal APIs

    const httpServer = createServer(app);
    initSocket(httpServer);

    httpServer.listen(PORT, () => {
      console.log(`Backend server is running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to start backend server due to database connection error:', err);
    process.exit(1);
  });
