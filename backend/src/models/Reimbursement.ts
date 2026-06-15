import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IReimbursement extends Document {
  companyId?: string;
  employee: string;
  name: string;
  type: string;
  amount: number;
  claimDate: string;
  description: string;
  receiptUrl?: string;
  status: string;
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReimbursementSchema: Schema = new Schema(
  {
    companyId: { type: String, required: true, index: true, default: 'company_001' },
    employee: { type: String, required: true },
    name: { type: String, required: true },
    type: { type: String, required: true },
    amount: { type: Number, required: true },
    claimDate: { type: String, required: true },
    description: { type: String, required: true },
    receiptUrl: { type: String, required: false },
    status: { type: String, required: true, default: 'Pending' },
    comment: { type: String, required: false },
  },
  { timestamps: true }
);

if (mongoose.models && mongoose.models.Reimbursement) {
  delete mongoose.models.Reimbursement;
}
export const Reimbursement: Model<IReimbursement> = mongoose.model<IReimbursement>('Reimbursement', ReimbursementSchema);
