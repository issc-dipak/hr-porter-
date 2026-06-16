export const config = {
  get mongodbUri() { return process.env.MONGODB_URI || ''; },
  get jwtSecret() { return process.env.JWT_SECRET || 'your_super_secret_jwt_key_here'; },
  get emailFrom() { return process.env.EMAIL_FROM || 'dipakpatil8589@gmail.com'; },
  get smtpHost() { return process.env.SMTP_HOST || 'smtp-relay.brevo.com'; },
  get smtpPort() { return parseInt(process.env.SMTP_PORT || '587', 10); },
  get smtpUser() { return process.env.SMTP_USER || ''; },
  get smtpPass() { return process.env.SMTP_PASS || ''; },
  get razorpayKeyId() { return process.env.RAZORPAY_KEY_ID || ''; },
  get razorpayKeySecret() { return process.env.RAZORPAY_KEY_SECRET || ''; },
  get cloudinaryCloudName() { return process.env.CLOUDINARY_CLOUD_NAME || ''; },
  get cloudinaryApiKey() { return process.env.CLOUDINARY_API_KEY || ''; },
  get cloudinaryApiSecret() { return process.env.CLOUDINARY_API_SECRET || ''; },
};

