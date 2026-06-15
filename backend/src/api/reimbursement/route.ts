import { NextResponse } from 'next/server';
import connectToDatabase from '@/app/api/lib/mongodb';
import { Reimbursement } from '@/app/api/models/Reimbursement';
import { verifyAuth } from '@/app/api/lib/auth';

// GET all reimbursements (optionally filter by email)
export async function GET(req: Request) {
  try {
    const decoded = verifyAuth(req);
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const url = new URL(req.url);
    const email = url.searchParams.get('email');
    
    await connectToDatabase();
    
    const filter = email 
      ? { companyId: decoded.companyId, employee: email.toLowerCase() } 
      : { companyId: decoded.companyId };
    const claims = await Reimbursement.find(filter).sort({ createdAt: -1 });
    
    return NextResponse.json(claims, { status: 200 });
  } catch (error: any) {
    console.error('Failed to fetch reimbursements:', error);
    return NextResponse.json({ error: 'Failed to fetch reimbursements', details: error.message }, { status: 500 });
  }
}

// POST a new reimbursement claim
export async function POST(req: Request) {
  try {
    const decoded = verifyAuth(req);
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const data = await req.json() as any;
    
    if (!data.employee || !data.name || !data.type || !data.amount || !data.claimDate || !data.description) {
      return NextResponse.json(
        { error: 'Missing required fields (employee, name, type, amount, claimDate, description)' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const newClaim = await Reimbursement.create({
      ...data,
      companyId: decoded.companyId,
      employee: data.employee.toLowerCase(),
      status: 'Pending'
    });

    return NextResponse.json(
      { message: 'Reimbursement claim submitted successfully', claim: newClaim },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Failed to create reimbursement claim:', error);
    return NextResponse.json({ error: 'Failed to submit reimbursement claim', details: error.message }, { status: 500 });
  }
}

