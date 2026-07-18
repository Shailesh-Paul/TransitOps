import PayrollRepository from './payroll.repository.js';
import { NotFoundError, BusinessRuleError } from "../../core/errors.js";

class PayrollService {
  
  async getPayrollRecords(options) {
    return await PayrollRepository.findAll(options);
  }

  async getRecordById(id) {
    const record = await PayrollRepository.findById(id);
    if (!record) {
      throw new NotFoundError('Payroll record not found');
    }
    return record;
  }

  async createRecord(data, userId) {
    // Calculate Net Salary
    const basic = parseFloat(data.basic_salary) || 0;
    const allowances = parseFloat(data.allowances) || 0;
    const deductions = parseFloat(data.deductions) || 0;
    const net_salary = basic + allowances - deductions;

    const insertData = {
      ...data,
      net_salary,
      created_by: userId
    };
    
    // Check if a record already exists for this employee/month/year
    const existing = await PayrollRepository.findAll({
      limit: 1,
      filters: {
        employee_id: data.employee_id,
        month: data.month,
        year: data.year
      }
    });

    if (existing.data.length > 0) {
      throw new BusinessRuleError(`Payroll already exists for employee ${data.employee_id} for ${data.month}/${data.year}`);
    }

    const newRecordId = await PayrollRepository.create(insertData);
    return await PayrollRepository.findById(newRecordId);
  }

  async updateRecord(id, data, userId) {
    const existing = await this.getRecordById(id);
    
    if (existing.status === 'paid') {
        throw new BusinessRuleError('Cannot modify a payroll record that has already been paid.');
    }

    // Recalculate Net Salary if components changed
    const basic = data.basic_salary !== undefined ? parseFloat(data.basic_salary) : parseFloat(existing.basic_salary);
    const allowances = data.allowances !== undefined ? parseFloat(data.allowances) : parseFloat(existing.allowances);
    const deductions = data.deductions !== undefined ? parseFloat(data.deductions) : parseFloat(existing.deductions);
    const net_salary = basic + allowances - deductions;

    const updateData = { 
        ...data, 
        net_salary,
        updated_by: userId 
    };

    // If status is transitioning to paid, auto-set payment date if not provided
    if (data.status === 'paid' && !data.payment_date && !existing.payment_date) {
        updateData.payment_date = new Date().toISOString().split('T')[0];
    }

    await PayrollRepository.update(id, updateData);
    return await PayrollRepository.findById(id);
  }

  async deleteRecord(id) {
    const existing = await this.getRecordById(id);
    if (existing.status === 'paid') {
        throw new BusinessRuleError('Cannot delete a payroll record that has already been paid.');
    }
    return await PayrollRepository.delete(id);
  }
}

export default new PayrollService();
