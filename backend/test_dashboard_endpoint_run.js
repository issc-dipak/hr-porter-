const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_here';
const MONGODB_URI = process.env.MONGODB_URI;

async function testDashboard() {
  await mongoose.connect(MONGODB_URI);
  
  const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({}, { strict: false, collection: 'users' }));
  const user = await User.findOne({ role: { $in: ['Admin', 'HR'] } });
  
  if (!user) {
    console.error("No Admin or HR user found in database!");
    await mongoose.connection.close();
    return;
  }
  
  console.log(`Generating token for ${user.email} with role ${user.role}...`);
  const token = jwt.sign({
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
    companyId: user.companyId || 'company_hcpindex',
    companyName: user.companyName || 'HCP Index Labs',
    companyCode: user.companyCode || 'hcpindex'
  }, JWT_SECRET, { expiresIn: '1h' });
  
  await mongoose.connection.close();
  
  const url = `http://127.0.0.1:5000/api/hr/dashboard?t=${Date.now()}`;
  console.log(`Querying ${url}...`);
  
  try {
    const res = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log(`Status: ${res.status}`);
    const data = await res.json();
    console.log("UPGRADED DASHBOARD PAYLOAD RESPONSE SAMPLE:");
    console.log(JSON.stringify(data, null, 2).slice(0, 1000) + "...\n[TRUNCATED]");
  } catch (err) {
    console.error("Fetch failed:", err);
  }
}

testDashboard().catch(console.error);
