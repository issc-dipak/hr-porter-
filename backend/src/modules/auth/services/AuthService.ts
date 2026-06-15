import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User } from '@/app/api/models/User';
import { Company } from '../../../models/Company';
import { AuditLog } from '../../../models/AuditLog';
import { UserRepository } from '../repositories/UserRepository';
import { EmployeeRepository } from '../../employees/repositories/EmployeeRepository';
import { sendEmail } from '../../../utils/email';
import { config } from '../../../config';

function isPasswordStrong(password: string): boolean {
  if (password.length < 8) return false;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasNonalphas = /\W/.test(password);
  return hasUpperCase && hasLowerCase && hasNumbers && hasNonalphas;
}

export class AuthService {
  static async login({ email, password, role }: any) {
    if (!email || !password || !role) {
      return { error: 'Please provide email, password, and role', status: 400 };
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    if (!user) {
      return { error: 'Invalid email or password', status: 401 };
    }

    if (user.role !== role) {
      return { error: `Access denied. Your account is registered as ${user.role}, not ${role}.`, status: 403 };
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password || '');
    if (!isPasswordCorrect) {
      return { error: 'Invalid email or password', status: 401 };
    }

    if (!user.isVerified) {
      return { error: 'Email not verified. Please verify your email first.', status: 403, requiresVerification: true };
    }

    if (user.status !== 'Active') {
      return { error: `Access denied. Your account status is currently ${user.status}.`, status: 403 };
    }

    // Auto Employee check/creation
    try {
      const existingEmployee = await EmployeeRepository.findByEmail(user.email);
      if (!existingEmployee) {
        await EmployeeRepository.create({
          fullName: user.fullName,
          email: user.email,
          department: user.role === 'HR' ? 'HR' : user.role === 'Admin' ? 'Management' : 'Engineering',
          designation: user.role === 'Admin' ? 'System Administrator' : user.role === 'HR' ? 'HR Manager' : 'Software Engineer',
          status: 'Active',
          phone: '+91 98765 43210',
          joinedDate: user.createdAt || new Date(),
          location: user.companyName || 'Remote, India',
          companyName: user.companyName,
          companyCode: user.companyCode,
          companyId: user.companyId,
        });
      } else if (existingEmployee.companyId !== user.companyId) {
        // Sync employee company details if they differ
        await EmployeeRepository.updateByEmail(user.email, {
          companyId: user.companyId,
          companyCode: user.companyCode,
          companyName: user.companyName
        });
      }
    } catch (empErr) {
      console.error('Auto Employee creation failed on login:', empErr);
    }

    const token = jwt.sign(
      { 
        userId: user._id, 
        email: user.email, 
        role: user.role, 
        companyName: user.companyName, 
        companyCode: user.companyCode, 
        companyId: user.companyId || 'company_001',
        fullName: user.fullName 
      },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    // Track Audit Log
    try {
      await AuditLog.create({
        companyId: user.companyId,
        action: 'Login',
        performedBy: user.email,
        details: `User successfully logged in as role ${user.role}.`,
        ipAddress: '127.0.0.1'
      });
    } catch (auditErr) {
      console.error('AuditLog failed on login:', auditErr);
    }

    return {
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        companyName: user.companyName,
        companyId: user.companyId || 'company_001',
        role: user.role,
      },
      status: 200
    };
  }

  static async companyRegister({
    companyName,
    slug,
    companySize,
    industry,
    country,
    timezone,
    workEmail,
    phoneNumber,
    fullName,
    designation,
    password
  }: any, clientIp: string = '127.0.0.1') {
    if (!companyName || !slug || !workEmail || !fullName || !password) {
      return { error: 'Please provide all required fields (companyName, slug, workEmail, fullName, password)', status: 400 };
    }

    if (!isPasswordStrong(password)) {
      return { error: 'Password must be at least 8 characters long and contain uppercase, lowercase, numbers, and symbols.', status: 400 };
    }

    const cleanSlug = slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, '');
    const cleanEmail = workEmail.toLowerCase().trim();

    // Check if company slug already exists
    const companyExists = await Company.findOne({ slug: cleanSlug });
    if (companyExists) {
      return { error: 'This company slug or subdomain is already registered.', status: 409 };
    }

    // Check if user email already exists
    const userExists = await UserRepository.findByEmail(cleanEmail);
    if (userExists) {
      return { error: 'User with this work email already exists', status: 409 };
    }

    const companyId = `company_${cleanSlug}`;

    // Create pending Company
    await Company.create({
      companyName,
      slug: cleanSlug,
      companySize: companySize || '',
      industry: industry || '',
      country: country || '',
      timezone: timezone || '',
      status: 'Pending',
      workEmail: cleanEmail,
      phoneNumber: phoneNumber || ''
    });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpire = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    // Create pending User
    const newUser = await User.create({
      fullName,
      email: cleanEmail,
      companyName,
      companyCode: cleanSlug,
      companyId,
      role: 'Admin', // mapped to Company Admin
      password: hashedPassword,
      phoneNumber: phoneNumber || '',
      designation: designation || 'Company Admin',
      isVerified: false,
      status: 'Pending',
      otp,
      otpExpire
    });

    // Send OTP email
    const subject = 'Verify your HR Core Company Account';
    const text = `Your verification OTP is: ${otp}. It will expire in 15 minutes.`;
    const html = `
      <div style="background-color: #0b0f19; color: #f8fafc; padding: 40px; font-family: sans-serif; border-radius: 12px; max-width: 600px; margin: 0 auto; border: 1px solid #1e293b;">
        <h2 style="color: #3b82f6; text-align: center; text-transform: uppercase;">Verify Your Company Profile</h2>
        <p style="color: #94a3b8; font-size: 14px;">Welcome to HR Core, ${fullName}!</p>
        <p style="color: #94a3b8; font-size: 14px;">Please verify your new company profile <strong>${companyName}</strong> (${cleanSlug}.hrcore.com) using the code below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <h1 style="color: #ffffff; letter-spacing: 5px; font-size: 36px; background: #1e1b4b; padding: 15px; border-radius: 8px; display: inline-block; border: 1px solid #4338ca;">${otp}</h1>
        </div>
        <p style="color: #ef4444; font-size: 11px; text-align: center; font-weight: bold;">This code will expire in 15 minutes. Do not share this OTP.</p>
      </div>
    `;

    sendEmail({ to: cleanEmail, subject, text, html }).catch(err => {
      console.error('Failed to send registration OTP email:', err);
    });

    // Track Audit Log
    try {
      await AuditLog.create({
        companyId,
        action: 'Signup',
        performedBy: cleanEmail,
        details: `Registered company ${companyName} (${cleanSlug}.hrcore.com) with Admin user ${fullName}. Pending verification.`,
        ipAddress: clientIp
      });
    } catch (auditErr) {
      console.error('AuditLog creation failed during signup:', auditErr);
    }

    return {
      message: 'Company registered successfully. An OTP has been sent to your email address.',
      email: cleanEmail,
      status: 201
    };
  }

  static async verifyEmail({ email, otp }: any, clientIp: string = '127.0.0.1') {
    if (!email || !otp) {
      return { error: 'Please provide email and verification OTP', status: 400 };
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail }).select('+password');
    if (!user) {
      return { error: 'User not found', status: 404 };
    }

    if (user.isVerified) {
      return { error: 'Email is already verified', status: 400 };
    }

    if (!user.otp || user.otp !== otp) {
      return { error: 'Invalid verification OTP', status: 400 };
    }

    if (user.otpExpire && new Date() > user.otpExpire) {
      return { error: 'Verification OTP has expired. Please request a new code.', status: 400 };
    }

    // Activate user
    user.isVerified = true;
    user.status = 'Active';
    user.otp = undefined;
    user.otpExpire = undefined;
    await user.save();

    // Activate company
    await Company.updateOne({ slug: user.companyCode }, { status: 'Active' });

    // Create Employee record
    try {
      const existingEmployee = await EmployeeRepository.findByEmail(user.email);
      if (!existingEmployee) {
        await EmployeeRepository.create({
          fullName: user.fullName,
          email: user.email,
          department: user.department || 'Management',
          designation: user.designation || 'System Administrator',
          status: 'Active',
          phone: user.phoneNumber || '+91 98765 43210',
          joinedDate: user.createdAt || new Date(),
          location: user.companyName || 'Remote, India',
          companyName: user.companyName,
          companyCode: user.companyCode,
          companyId: user.companyId,
          profilePicture: user.profilePicture || ''
        });
      }
    } catch (empErr) {
      console.error('Employee creation failed on email verification:', empErr);
    }

    // Track Audit Log
    try {
      await AuditLog.create({
        companyId: user.companyId,
        action: 'User Creation',
        performedBy: user.email,
        details: `Email verified successfully. Activated account and company profile.`,
        ipAddress: clientIp
      });
    } catch (auditErr) {
      console.error('AuditLog failed on email verification:', auditErr);
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
        companyName: user.companyName,
        companyCode: user.companyCode,
        companyId: user.companyId,
        fullName: user.fullName
      },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    return {
      message: 'Email verified successfully. Account is now active.',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        companyName: user.companyName,
        companyId: user.companyId,
        role: user.role
      },
      status: 200
    };
  }

  static async sendOtp(email: string) {
    if (!email) {
      return { error: 'Please provide an email address', status: 400 };
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return { error: 'User not found', status: 404 };
    }

    if (user.isVerified) {
      return { error: 'User is already verified', status: 400 };
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpire = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
    await user.save();

    const subject = 'Your HR Core Verification OTP Code';
    const text = `Your verification OTP is: ${otp}. It will expire in 15 minutes.`;
    const html = `
      <div style="background-color: #0b0f19; color: #f8fafc; padding: 40px; font-family: sans-serif; border-radius: 12px; max-width: 600px; margin: 0 auto; border: 1px solid #1e293b;">
        <h2 style="color: #3b82f6; text-align: center;">Verification OTP Code</h2>
        <div style="text-align: center; margin: 30px 0;">
          <h1 style="color: #ffffff; letter-spacing: 5px; font-size: 36px; background: #1e1b4b; padding: 15px; border-radius: 8px; display: inline-block; border: 1px solid #4338ca;">${otp}</h1>
        </div>
        <p style="color: #ef4444; font-size: 11px; text-align: center;">This code will expire in 15 minutes. Do not share this OTP.</p>
      </div>
    `;

    sendEmail({ to: user.email, subject, text, html }).catch(err => {
      console.error('Failed to send OTP email:', err);
    });

    return { message: 'OTP sent successfully to email.', status: 200 };
  }

  static async inviteUser({
    email,
    fullName,
    role,
    department,
    designation,
    senderEmail,
    senderCompanyId,
    senderCompanyCode,
    senderCompanyName
  }: any, clientIp: string = '127.0.0.1') {
    if (!email || !fullName || !role) {
      return { error: 'Please provide invitee email, full name, and role', status: 400 };
    }

    if (!['HR', 'Manager', 'Employee'].includes(role)) {
      return { error: 'Only HR, Manager, or Employee profiles can be invited', status: 400 };
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if invitee user exists
    const userExists = await UserRepository.findByEmail(cleanEmail);
    if (userExists) {
      return { error: 'User with this email is already registered in the system.', status: 409 };
    }

    const invitationToken = crypto.randomBytes(32).toString('hex');
    const invitationExpire = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Create pending invite user
    await User.create({
      fullName,
      email: cleanEmail,
      companyName: senderCompanyName,
      companyCode: senderCompanyCode,
      companyId: senderCompanyId,
      role,
      department: department || '',
      designation: designation || '',
      isVerified: false,
      status: 'Pending',
      invitationToken,
      invitationExpire,
      password: crypto.randomBytes(16).toString('hex') // temporary dummy password
    });

    // Send invitation email with link
    const inviteLink = `http://localhost:3000/?mode=accept-invite&token=${invitationToken}`;
    const subject = `You are invited to join ${senderCompanyName} on HR Core`;
    const text = `Hi ${fullName}, you have been invited to join ${senderCompanyName} as a ${role}. Click here to set up your account: ${inviteLink}`;
    const html = `
      <div style="background-color: #0b0f19; color: #f8fafc; padding: 40px; font-family: sans-serif; border-radius: 12px; max-width: 600px; margin: 0 auto; border: 1px solid #1e293b;">
        <h2 style="color: #6366f1; text-align: center;">Welcome to HR Core</h2>
        <p style="color: #94a3b8; font-size: 14px;">Hi ${fullName},</p>
        <p style="color: #94a3b8; font-size: 14px;">You have been invited by <strong>${senderEmail}</strong> to join the HR management team of <strong>${senderCompanyName}</strong> as a <strong>${role}</strong>.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${inviteLink}" style="background-color: #4f46e5; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px; border: 1px solid #4338ca; display: inline-block;">Setup Your Secure Profile</a>
        </div>
        <p style="color: #64748b; font-size: 11px; text-align: center;">If the button above does not work, copy and paste this URL into your browser: <br>${inviteLink}</p>
      </div>
    `;

    sendEmail({ to: cleanEmail, subject, text, html }).catch(err => {
      console.error('Failed to send invitation email:', err);
    });

    // Track Audit Log
    try {
      await AuditLog.create({
        companyId: senderCompanyId,
        action: 'User Invite',
        performedBy: senderEmail,
        details: `Invited user ${fullName} (${cleanEmail}) as role ${role} for department ${department}.`,
        ipAddress: clientIp
      });
    } catch (auditErr) {
      console.error('AuditLog failed on inviteUser:', auditErr);
    }

    return {
      message: 'Invitation email successfully sent to user.',
      status: 200
    };
  }

  static async acceptInvite({ token, password, phoneNumber }: any, clientIp: string = '127.0.0.1') {
    if (!token || !password) {
      return { error: 'Invitation token and password are required', status: 400 };
    }

    if (!isPasswordStrong(password)) {
      return { error: 'Password must be at least 8 characters long and contain uppercase, lowercase, numbers, and symbols.', status: 400 };
    }

    const user = await User.findOne({ invitationToken: token });
    if (!user) {
      return { error: 'Invitation token is invalid', status: 400 };
    }

    if (user.invitationExpire && new Date() > user.invitationExpire) {
      return { error: 'Invitation link has expired. Please contact your company administrator to issue a new invite.', status: 400 };
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user.password = hashedPassword;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    user.isVerified = true;
    user.status = 'Active';
    user.invitationToken = undefined;
    user.invitationExpire = undefined;
    await user.save();

    // Create Employee record
    try {
      const existingEmployee = await EmployeeRepository.findByEmail(user.email);
      if (!existingEmployee) {
        await EmployeeRepository.create({
          fullName: user.fullName,
          email: user.email,
          department: user.department || 'Management',
          designation: user.designation || 'Staff Member',
          status: 'Active',
          phone: phoneNumber || '+91 98765 43210',
          joinedDate: user.createdAt || new Date(),
          location: user.companyName || 'Remote, India',
          companyName: user.companyName,
          companyCode: user.companyCode,
          companyId: user.companyId,
          profilePicture: user.profilePicture || ''
        });
      }
    } catch (empErr) {
      console.error('Employee creation failed on invite acceptance:', empErr);
    }

    // Track Audit Log
    try {
      await AuditLog.create({
        companyId: user.companyId,
        action: 'User Creation',
        performedBy: user.email,
        details: `Accepted invitation. Activated profile as role ${user.role}.`,
        ipAddress: clientIp
      });
    } catch (auditErr) {
      console.error('AuditLog failed on acceptInvite:', auditErr);
    }

    return {
      message: 'Account configured and activated successfully. You can now log in.',
      status: 200
    };
  }

  static async signup({ fullName, email, companyName, companyCode, role, password, phoneNumber, department, profilePicture }: any) {
    // Keep standard signup as fallback to companyRegister
    return this.companyRegister({
      companyName,
      slug: companyCode || 'hrcore',
      companySize: '1-10',
      industry: 'Technology',
      country: 'India',
      timezone: 'IST',
      workEmail: email,
      phoneNumber: phoneNumber || '',
      fullName,
      designation: role === 'Admin' ? 'System Administrator' : 'HR Manager',
      password
    });
  }

  static async forgotPassword(email: string) {
    if (!email) {
      return { error: 'Please provide an email address', status: 400 };
    }

    const user = await UserRepository.findByEmail(email);
    if (!user) {
      return { error: 'No account found with this email', status: 404 };
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const hashedOTP = crypto
      .createHash('sha256')
      .update(otp)
      .digest('hex');

    user.resetPasswordOTP = hashedOTP;
    user.resetPasswordOTPExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    await user.save();

    const subject = 'Your HR Core Verification OTP Code';
    const text = `Your 6-digit security OTP code is: ${otp}. It will expire in 10 minutes.`;
    const html = `
      <div style="background-color: #0b0f19; color: #f8fafc; padding: 40px; font-family: sans-serif; border-radius: 12px; max-width: 600px; margin: 0 auto; border: 1px solid #1e293b;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h2 style="color: #6366f1; font-weight: 900; margin: 0; text-transform: uppercase; letter-spacing: 2px;">HR CORE SECURITY</h2>
          <p style="color: #64748b; font-size: 12px; margin-top: 5px;">Enterprise Profile Recovery</p>
        </div>
        <div style="background-color: #0f172a; padding: 30px; border-radius: 8px; border: 1px solid #334155; text-align: center; margin-bottom: 30px;">
          <p style="color: #94a3b8; font-size: 14px; margin-top: 0;">Here is your secure verification OTP code:</p>
          <h1 style="color: #f8fafc; font-size: 40px; font-weight: 900; letter-spacing: 8px; margin: 20px 0; background-color: #1e1b4b; padding: 15px; border-radius: 8px; border: 1px solid #4338ca; display: inline-block;">${otp}</h1>
          <p style="color: #ef4444; font-size: 11px; font-weight: bold; margin-bottom: 0;">This OTP code is valid for exactly 10 minutes. Do not share it with anyone.</p>
        </div>
        <p style="color: #64748b; font-size: 11px; text-align: center; margin-top: 40px; border-top: 1px solid #1e293b; padding-top: 20px;">
          This is an automated security message from HR Core Systems. If you did not request this code, please contact your systems administrator immediately.
        </p>
      </div>
    `;

    sendEmail({
      to: email,
      subject,
      text,
      html,
    }).catch(emailErr => {
      console.error('Failed to send forgot-password OTP email:', emailErr);
    });

    // Track Audit Log
    try {
      await AuditLog.create({
        companyId: user.companyId,
        action: 'Password Reset',
        performedBy: user.email,
        details: `Initiated password recovery process. Sent OTP token.`,
        ipAddress: '127.0.0.1'
      });
    } catch (auditErr) {
      console.error('AuditLog failed on forgotPassword:', auditErr);
    }

    return {
      message: 'A secure 6-digit OTP code has been successfully generated!',
      emailStatus: 'processing',
      status: 200
    };
  }

  static async resetPassword({ otp, newPassword }: any) {
    if (!otp || !newPassword) {
      return { error: 'Please provide both OTP and new password', status: 400 };
    }

    const hashedOTP = crypto
      .createHash('sha256')
      .update(otp)
      .digest('hex');

    const user = await UserRepository.findByOTP(hashedOTP);
    if (!user) {
      return { error: 'Verification OTP is invalid or has expired. Please request a new one.', status: 400 };
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    user.resetPasswordOTP = undefined;
    user.resetPasswordOTPExpire = undefined;

    await user.save();

    // Track Audit Log
    try {
      await AuditLog.create({
        companyId: user.companyId,
        action: 'Password Reset',
        performedBy: user.email,
        details: `Reset password successfully using recovery OTP.`,
        ipAddress: '127.0.0.1'
      });
    } catch (auditErr) {
      console.error('AuditLog failed on resetPassword:', auditErr);
    }

    return { 
      message: 'Password has been successfully updated! You can now log in.', 
      status: 200 
    };
  }
}
