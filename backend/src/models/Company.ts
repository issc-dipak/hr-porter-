import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ICompany extends Document {
  companyName: string;
  slug: string;
  industry?: string;
  companySize?: string;
  country?: string;
  timezone?: string;
  status: 'Pending' | 'Active' | 'Suspended';
  workEmail?: string;
  phoneNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CompanySchema: Schema = new Schema(
  {
    companyName: {
      type: String,
      required: [true, 'Please provide a company name'],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Please provide a company slug/subdomain'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    industry: {
      type: String,
      default: '',
    },
    companySize: {
      type: String,
      default: '',
    },
    country: {
      type: String,
      default: '',
    },
    timezone: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Pending', 'Active', 'Suspended'],
      default: 'Pending',
    },
    workEmail: {
      type: String,
      lowercase: true,
      trim: true,
      default: '',
    },
    phoneNumber: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// Prevent mongoose from using stale cached models during hot reloads
if (mongoose.models && mongoose.models.Company) {
  delete mongoose.models.Company;
}

export const Company: Model<ICompany> = mongoose.model<ICompany>('Company', CompanySchema);
