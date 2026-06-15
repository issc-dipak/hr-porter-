import { EmployeeRepository } from '../repositories/EmployeeRepository';
import { User } from '@/app/api/models/User';
import { DeletedEmployee } from '@/app/api/models/DeletedEmployee';
import { UserSettings } from '@/app/api/models/UserSettings';
import { Employee } from '@/app/api/models/Employee';
import bcrypt from 'bcryptjs';

export class EmployeeService {
  static async getEmployees(companyId: string, email?: string | null, companyCode?: string | null) {
    if (email) {
      const employee = await EmployeeRepository.findByEmail(email);
      if (!employee || employee.companyId !== companyId) {
        return { error: 'Employee not found', status: 404 };
      }
      const settings = await UserSettings.findOne({ email: employee.email.toLowerCase().trim() });
      const userObj = await User.findOne({ email: employee.email.toLowerCase().trim() });
      const empObj = employee.toObject ? employee.toObject() : employee;
      return { 
        data: { 
          ...empObj, 
          bio: settings?.bio || 'Senior Specialist', 
          role: userObj?.role || 'Employee',
          chatSettings: settings?.chatSettings || null
        }, 
        status: 200 
      };
    }

    console.log('[EmployeeService] getEmployees: filtering by companyId =', companyId);
    let employees = await EmployeeRepository.findAll({ companyId });
    console.log('[EmployeeService] getEmployees: found', employees.length, 'employees');

    // Fallback: if no employees found by companyId, try by companyCode (migration scenario)
    if (employees.length === 0 && companyCode) {
      console.log('[EmployeeService] getEmployees: falling back to companyCode =', companyCode);
      employees = await EmployeeRepository.findAll({ companyCode });
      console.log('[EmployeeService] getEmployees: fallback found', employees.length, 'employees');
      // Auto-fix companyId for these employees
      if (employees.length > 0) {
        await Promise.all(employees.map(emp => 
          EmployeeRepository.updateById(emp._id.toString() as string, { companyId })
        ));
        console.log('[EmployeeService] getEmployees: auto-fixed companyId for', employees.length, 'employees');
      }
    }

    const emails = employees.map(emp => emp.email.toLowerCase().trim());
    const settingsList = await UserSettings.find({ email: { $in: emails } });
    const settingsMap = new Map(settingsList.map(s => [s.email.toLowerCase().trim(), s]));
    
    const usersList = await User.find({ email: { $in: emails } });
    const usersMap = new Map(usersList.map(u => [u.email.toLowerCase().trim(), u]));

    const employeesWithBio = employees.map(emp => {
      const emailKey = emp.email.toLowerCase().trim();
      const settings = settingsMap.get(emailKey);
      const userObj = usersMap.get(emailKey);
      const empObj = emp.toObject ? emp.toObject() : emp;
      return {
        ...empObj,
        bio: settings?.bio || 'Senior Specialist',
        role: userObj?.role || 'Employee',
        chatSettings: settings?.chatSettings || null
      };
    });

    return { data: employeesWithBio, status: 200 };
  }

  static async createEmployee(data: any, decodedOrCompanyId: any) {
    if (!data.fullName || !data.email || !data.designation) {
      return { error: 'Missing required fields (fullName, email, designation)', status: 400 };
    }

    const existingEmployee = await EmployeeRepository.findByEmail(data.email);
    if (existingEmployee) {
      return { error: 'An employee with this email already exists', status: 409 };
    }

    let companyId: string;
    let decoded: any = null;
    if (typeof decodedOrCompanyId === 'string') {
      companyId = decodedOrCompanyId;
    } else {
      decoded = decodedOrCompanyId;
      companyId = decoded.companyId;
    }

    // Generate sequential empId starting from "000"
    const lastEmployee = await Employee.findOne({ 
      companyId, 
      empId: { $exists: true, $ne: '' } 
    }).sort({ empId: -1 });
    
    let nextNum = 0;
    if (lastEmployee && lastEmployee.empId) {
      const parsed = parseInt(lastEmployee.empId, 10);
      if (!isNaN(parsed)) {
        nextNum = parsed + 1;
      }
    }
    data.empId = String(nextNum).padStart(3, '0');

    const companyCode = decoded?.companyCode || data.companyCode || 'hrcore';
    const companyName = decoded?.companyName || data.companyName || 'HR Core Labs';

    // Create user login credentials if password is provided
    if (data.password && data.password.length >= 6) {
      const existingUser = await User.findOne({ email: data.email.toLowerCase().trim() });
      if (existingUser) {
        return { error: 'A user login account with this email already exists', status: 409 };
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(data.password, salt);

      await User.create({
        fullName: data.fullName,
        email: data.email.toLowerCase().trim(),
        companyName,
        companyCode: companyCode.toLowerCase().trim(),
        companyId,
        role: data.role || 'Employee',
        password: hashedPassword,
        phoneNumber: data.phone || '',
        department: data.department || data.dept || '',
        profilePicture: data.profilePicture || ''
      });
    }

    const newEmployee = await EmployeeRepository.create({
      ...data,
      companyId,
      companyCode,
      companyName
    });

    return { 
      message: 'Employee created successfully', 
      employee: newEmployee, 
      status: 201 
    };
  }

  static async updateEmployee(id: string, data: any, companyId: string) {
    const employee = await EmployeeRepository.findById(id);
    if (!employee) {
      return { error: 'Employee not found', status: 404 };
    }
    if (employee.companyId !== companyId) {
      return { error: 'Forbidden: You do not own this record', status: 403 };
    }

    const updatedEmployee = await EmployeeRepository.updateById(id, { $set: data });
    if (!updatedEmployee) {
      return { error: 'Employee not found', status: 404 };
    }
    return { 
      message: 'Employee updated successfully', 
      employee: updatedEmployee, 
      status: 200 
    };
  }

  static async deleteEmployee(id: string, decodedOrCompanyId: any) {
    let companyId: string;
    let isAdmin = false;
    let deletedByEmail = 'Admin';
    if (typeof decodedOrCompanyId === 'string') {
      companyId = decodedOrCompanyId;
    } else {
      companyId = decodedOrCompanyId.companyId;
      isAdmin = decodedOrCompanyId.role === 'Admin';
      deletedByEmail = decodedOrCompanyId.email || decodedOrCompanyId.fullName || 'Admin';
    }

    const employee = await EmployeeRepository.findById(id);
    if (!employee) {
      return { error: 'Employee not found', status: 404 };
    }

    // Bypass companyId ownership checks for Admins
    if (!isAdmin && employee.companyId !== companyId) {
      return { error: 'Forbidden: You do not own this record', status: 403 };
    }

    // Create a history record of deletion
    await DeletedEmployee.create({
      companyId: employee.companyId || companyId,
      fullName: employee.fullName,
      email: employee.email,
      department: employee.department,
      designation: employee.designation,
      deletedBy: deletedByEmail
    });

    const deletedEmployee = await EmployeeRepository.deleteById(id);
    if (!deletedEmployee) {
      return { error: 'Employee not found', status: 404 };
    }

    if (deletedEmployee.email) {
      await User.findOneAndDelete({ email: deletedEmployee.email });
    }

    return { 
      message: 'Employee deleted successfully', 
      status: 200 
    };
  }

  static async getDeletedEmployees(companyId: string) {
    const deletedList = await DeletedEmployee.find({ companyId }).sort({ deletedAt: -1 });
    return { data: deletedList, status: 200 };
  }
}
