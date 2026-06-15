import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

const envPath = path.join(__dirname, '../.env');

if (fs.existsSync(envPath)) {
  const result = dotenv.config({ path: envPath });
  console.log('Dotenv Load Result:', result);
} else {
  console.log('.env file not found, relying on system environment variables');
}

console.log('MONGODB_URI defined in config-env:', !!process.env.MONGODB_URI);

