import * as moduleAlias from 'module-alias';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Register module aliases for production compiled code (ends with .js in dist/)
if (__filename.endsWith('.js')) {
  moduleAlias.addAliases({
    '@/app/api/models': path.join(__dirname, 'models'),
    '@/backend': __dirname,
    '@/app': __dirname,
    'next/server': path.join(__dirname, 'next-mock.js')
  });
}

const envPath = path.join(__dirname, '../.env');

if (fs.existsSync(envPath)) {
  const result = dotenv.config({ path: envPath });
  console.log('Dotenv Load Result:', result);
} else {
  console.log('.env file not found, relying on system environment variables');
}

console.log('MONGODB_URI defined in config-env:', !!process.env.MONGODB_URI);

