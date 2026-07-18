import ExpensesRepository from './expenses.repository.js';
import ExpenseEngine from '../../core/ExpenseEngine.js';
import { NotFoundError } from "../../core/errors.js";

class ExpensesService {
  async getAllExpenses(options) {
    return await ExpensesRepository.findAllWithDetails(options);
  }

  async getExpenseById(id) {
    const expense = await ExpensesRepository.findByIdWithDetails(id);
    if (!expense) throw new NotFoundError('Expense not found');
    return expense;
  }

  async logExpense(data, userId) {
    const newId = await ExpenseEngine.logExpense(data, userId);
    return await this.getExpenseById(newId);
  }

  async updateExpenseStatus(id, status, userId) {
    await ExpenseEngine.updateExpenseStatus(id, status, userId);
    return await this.getExpenseById(id);
  }

  async updateExpense(id, data, userId) {
    // Only allow updating basic string metadata if not handled by engine
    const updateData = {};
    if (data.description) updateData.description = data.description;
    updateData.updated_by = userId;

    await ExpensesRepository.update(id, updateData);
    return await this.getExpenseById(id);
  }

  async deleteExpense(id, userId) {
    await this.getExpenseById(id);
    return await ExpensesRepository.softDelete(id, userId);
  }

  async getOperationalCosts(filters) {
    return await ExpensesRepository.getOperationalCosts(filters);
  }

  async getDashboardKpis(filters) {
    return await ExpensesRepository.getDashboardKpis(filters);
  }
}

export default new ExpensesService();
