import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IAnnouncement extends Document {
  companyId?: string;
  title: string;
  content: string;
  category: string; // 'Urgent' | 'General' | 'Event' | 'Policy'
  postedBy: string;
  companyName: string;
  createdAt: Date;
  updatedAt: Date;
}

const AnnouncementSchema: Schema = new Schema(
  {
    companyId: { type: String, required: true, index: true, default: 'company_001' },
    title: { type: String, required: true },
    content: { type: String, required: true },
    category: { type: String, required: true, default: 'General' },
    postedBy: { type: String, required: true },
    companyName: { type: String, default: 'HR Core Labs' },
  },
  { timestamps: true }
);

AnnouncementSchema.index({ companyId: 1, createdAt: -1 });

delete (mongoose.models as any).Announcement;
export const Announcement: Model<IAnnouncement> = mongoose.model<IAnnouncement>('Announcement', AnnouncementSchema);
