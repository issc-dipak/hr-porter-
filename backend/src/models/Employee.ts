import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ISalaryStructure {
  companyId?: string;
  basic: number;
  hra: number;
  allowance: number;
  bonus: number;
  pf: number;
  esi: number;
  tax: number;
  otherDeductions: number;
  net: number;
}

export interface IEmployee extends Document {
  companyId?: string;
  empId?: string;
  fullName: string;
  department: string;
  status: string;
  designation: string;
  email: string;
  phone: string;
  joinedDate: Date;
  location: string;
  companyName?: string;
  companyCode?: string;
  profilePicture?: string;
  salaryStructure: ISalaryStructure;
  emergencyContact: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  dateOfBirth?: string;
  gender?: string;
  bloodGroup?: string;
  address?: string;
  panNumber?: string;
  uanNumber?: string;
  maxLeaves?: number;
  managerId?: string;
  departmentId?: string;
  designationId?: string;
  documents?: Array<{
    name: string;
    fileUrl: string;
    status: string;
    uploadedAt: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const SalaryStructureSchema = new Schema({
    companyId: { type: String, required: true, index: true, default: 'company_001' },
  basic: { type: Number, default: 0 },
  hra: { type: Number, default: 0 },
  allowance: { type: Number, default: 0 },
  bonus: { type: Number, default: 0 },
  pf: { type: Number, default: 0 },
  esi: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  otherDeductions: { type: Number, default: 0 },
  net: { type: Number, default: 0 }
}, { _id: false });

const EmployeeSchema: Schema = new Schema(
  {
    companyId: { type: String, required: true, index: true, default: 'company_001' },
    empId: { type: String, unique: true, sparse: true },
    fullName: { type: String, required: true },
    department: { type: String, required: true },
    status: { type: String, required: true, default: 'Active' },
    designation: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    joinedDate: { type: Date, required: true },
    location: { type: String, required: true },
    companyName: { type: String, default: 'HR Core Labs' },
    companyCode: { type: String, default: 'hrcore' },
    profilePicture: { type: String, default: '' },
    salaryStructure: { type: SalaryStructureSchema, default: () => ({
      basic: 30000,
      hra: 10000,
      allowance: 5000,
      bonus: 0,
      pf: 3600,
      esi: 1000,
      tax: 2000,
      otherDeductions: 0,
      net: 38400
    }) },
    emergencyContact: { type: String, default: '' },
    bankName: { type: String, default: '' },
    accountNumber: { type: String, default: '' },
    ifscCode: { type: String, default: '' },
    dateOfBirth: { type: String, default: '' },
    gender: { type: String, default: '' },
    bloodGroup: { type: String, default: '' },
    address: { type: String, default: '' },
    panNumber: { type: String, default: '' },
    uanNumber: { type: String, default: '' },
    maxLeaves: { type: Number, default: 24 },
    managerId: { type: String, default: '', index: true },
    departmentId: { type: String, default: '', index: true },
    designationId: { type: String, default: '', index: true },
    documents: {
      type: [{
        name: { type: String, required: true },
        fileUrl: { type: String, required: true },
        status: { type: String, default: 'Pending Verification' },
        uploadedAt: { type: Date, default: Date.now }
      }],
      default: []
    }
  },
  { timestamps: true }
);

// Prevent mongoose from using stale cached models during hot reloads
if (mongoose.models && mongoose.models.Employee) {
  delete mongoose.models.Employee;
}
export const Employee: Model<IEmployee> = mongoose.model<IEmployee>('Employee', EmployeeSchema);
