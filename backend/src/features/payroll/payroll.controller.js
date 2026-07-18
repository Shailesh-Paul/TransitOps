import PayrollService from './payroll.service.js';
import { asyncHandler } from "../../utils/asyncHandler.js";

class PayrollController {
  
  getAll = asyncHandler(async (req, res, next) => {
    const { page, limit, sort, order, search, status, month, year } = req.query;
      
      const filters = {};
      if (status) filters.status = status;
      if (month) filters.month = month;
      if (year) filters.year = year;

      const result = await PayrollService.getPayrollRecords({
        page: page ? parseInt(page) : 1,
        limit: limit ? parseInt(limit) : 10,
        sort,
        order,
        search,
        filters
      });

      return res.status(200).json({
        status: 'success',
        data: result.data,
        meta: result.meta
      });
  });

  getById = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
      const record = await PayrollService.getRecordById(id);
      
      return res.status(200).json({
        status: 'success',
        data: record
      });
  });

  create = asyncHandler(async (req, res, next) => {
    const userId = req.user.id;
      const data = req.body;
      
      const newRecord = await PayrollService.createRecord(data, userId);
      
      return res.status(201).json({
        status: 'success',
        data: newRecord,
        message: 'Payroll record created successfully'
      });
  });

  update = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
      const userId = req.user.id;
      const data = req.body;
      
      const updatedRecord = await PayrollService.updateRecord(id, data, userId);
      
      return res.status(200).json({
        status: 'success',
        data: updatedRecord,
        message: 'Payroll record updated successfully'
      });
  });

  remove = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
      await PayrollService.deleteRecord(id);
      
      return res.status(200).json({
        status: 'success',
        message: 'Payroll record deleted successfully'
      });
  });
}

export default new PayrollController();
