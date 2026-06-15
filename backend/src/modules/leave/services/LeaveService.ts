import { LeaveRepository } from '../repositories/LeaveRepository';

export class LeaveService {
  static async getLeaves(companyId: string, employeeName?: string) {
    const filter: any = { companyId };
    if (employeeName) {
      filter.$or = [
        { name: employeeName },
        { employee: employeeName }
      ];
    }
    const leaves = await LeaveRepository.findAll(filter);
    return { data: leaves, status: 200 };
  }

  static async createLeave(data: any, companyId: string) {
    if (!data.employee || !data.type || !data.date || !data.reason) {
      return { error: 'Missing required fields (employee, type, date, reason)', status: 400 };
    }

    const newLeave = await LeaveRepository.create({
      ...data,
      companyId
    });

    return { message: 'Leave request submitted successfully', leave: newLeave, status: 201 };
  }

  static async updateLeaveStatus(id: string, status: string, companyId: string) {
    if (!status || !['Approved', 'Rejected', 'Pending'].includes(status)) {
      return { error: 'Invalid status provided', status: 400 };
    }

    const leave = await LeaveRepository.findById(id);
    if (!leave) {
      return { error: 'Leave request not found', status: 404 };
    }
    if (leave.companyId !== companyId) {
      return { error: 'Forbidden: You do not own this record', status: 403 };
    }

    const updatedLeave = await LeaveRepository.updateById(id, { status });
    if (!updatedLeave) {
      return { error: 'Leave request not found', status: 404 };
    }

    return { message: `Leave ${status.toLowerCase()} successfully`, leave: updatedLeave, status: 200 };
  }
}
