import { NextResponse } from 'next/server';
import connectToDatabase from '@/app/api/lib/mongodb';
import { Announcement } from '@/app/api/models/Announcement';
import { verifyAuth } from '@/app/api/lib/auth';

export async function GET(req: Request) {
  try {
    const decoded = verifyAuth(req);
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const companyId = decoded.companyId;

    await connectToDatabase();
    const announcements = await Announcement.find({ companyId }).sort({ createdAt: -1 });
    return NextResponse.json(announcements, { status: 200 });
  } catch (error: any) {
    console.error('Failed to fetch announcements:', error);
    return NextResponse.json({ error: 'Failed to fetch announcements', details: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const decoded = verifyAuth(req);
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const companyId = decoded.companyId;
    const companyName = decoded.companyName;
    const data = await req.json() as any;
    
    if (!data.title || !data.content || !data.postedBy) {
      return NextResponse.json({ error: 'Missing required fields (title, content, postedBy)' }, { status: 400 });
    }
    
    await connectToDatabase();
    
    const newAnnouncement = await Announcement.create({
      ...data,
      companyId,
      companyName
    });
    
    // Notify all users about the new announcement
    try {
      const { SystemNotificationService } = await import('../../services/systemNotificationService');
      await SystemNotificationService.notifyAllUsers(companyId, {
        companyId,
        title: 'New Announcement',
        content: `Announcement: ${data.title}`,
        type: 'announcement',
        targetPage: 'announcements'
      });
    } catch (err) {
      console.error('Failed to trigger announcement notification:', err);
    }

    return NextResponse.json(newAnnouncement, { status: 201 });
  } catch (error: any) {
    console.error('Failed to create announcement:', error);
    return NextResponse.json({ error: 'Failed to create announcement', details: error.message }, { status: 500 });
  }
}

