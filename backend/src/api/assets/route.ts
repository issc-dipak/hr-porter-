import { NextResponse } from 'next/server';
import connectToDatabase from '@/app/api/lib/mongodb';
import { Asset } from '@/app/api/models/Asset';
import { verifyAuth } from '@/app/api/lib/auth';

export async function GET(req: Request) {
  try {
    const decoded = verifyAuth(req);
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const companyName = decoded.companyName;

    await connectToDatabase();
    const assets = await Asset.find({ companyName }).sort({ createdAt: -1 });
    return NextResponse.json(assets, { status: 200 });
  } catch (error: any) {
    console.error('Failed to fetch assets:', error);
    return NextResponse.json({ error: 'Failed to fetch assets', details: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const decoded = verifyAuth(req);
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const companyName = decoded.companyName;
    const data = await req.json() as any;
    
    if (!data.name || !data.type || !data.serialNumber) {
      return NextResponse.json({ error: 'Missing required fields (name, type, serialNumber)' }, { status: 400 });
    }
    
    await connectToDatabase();
    
    const newAsset = await Asset.create({
      ...data,
      companyName
    });
    
    return NextResponse.json(newAsset, { status: 201 });
  } catch (error: any) {
    console.error('Failed to create asset:', error);
    return NextResponse.json({ error: 'Failed to create asset', details: error.message }, { status: 500 });
  }
}

