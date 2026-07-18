import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getExpenseById } from '../../services/expenseService';
import { submitExpense, approveExpense, rejectExpense, postExpense, archiveExpense } from '../../services/approvalService';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import Loader from '../../components/Loader';
import { formatCurrency, formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';
import { 
  Building2, Hash, FileText, CheckCircle2, 
  AlertCircle, Receipt, User, Truck, Clock, 
  Map, UserCircle2, Calendar, FileCheck2, ShieldCheck
} from 'lucide-react';

const ApprovalWorkspace = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [expense, setExpense] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Action states
  const [comments, setComments] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchExpenseDetails = async () => {
    try {
      setLoading(true);
      const data = await getExpenseById(id);
      setExpense(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load expense details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenseDetails();
  }, [id]);

  if (loading) return <Loader fullScreen text="Loading Workspace..." />;
  if (error) return <div className="p-6 text-center text-red-500">{error}</div>;
  if (!expense) return <div className="p-6 text-center">Expense not found</div>;

  const currentStatus = expense.enterprise_status || expense.status;

  const handleAction = async (action) => {
    if (action === 'REJECT' && !reason.trim()) {
      toast.error('Rejection reason is mandatory.');
      return;
    }

    try {
      setIsSubmitting(true);
      if (action === 'SUBMIT') await submitExpense(id, comments);
      else if (action === 'APPROVE') await approveExpense(id, comments);
      else if (action === 'REJECT') await rejectExpense(id, reason, comments);
      else if (action === 'POST') await postExpense(id, comments);
      else if (action === 'ARCHIVE') await archiveExpense(id, comments);

      toast.success(`Expense ${action.toLowerCase()} successfully`);
      setComments('');
      setReason('');
      await fetchExpenseDetails();
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to ${action.toLowerCase()} expense`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getWorkflowStep = (status) => {
    const steps = ['Draft', 'Pending Approval', 'Approved', 'Posted', 'Archived'];
    if (status === 'Rejected') return -1;
    return steps.indexOf(status);
  };
  const currentStep = getWorkflowStep(currentStatus);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <PageHeader 
          title={`Approval Workspace`}
          subtitle={`Managing ${expense.accounting_reference || `ID: ${expense.id}`}`}
        />
        <Link to="/expenses" className="btn btn-secondary">
          Back to Expenses
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column - Actions and Timeline */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Action Center */}
          <div className="card p-6 border-t-4 border-t-primary">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" />
                Workflow Actions
              </h3>
              <StatusBadge status={expense.status} />
            </div>

            {currentStatus === 'Rejected' || currentStatus === 'Archived' ? (
              <div className="bg-gray-50 border border-gray-200 p-4 rounded text-center text-gray-500">
                No further workflow actions are available for this state.
              </div>
            ) : (
              <div className="space-y-4">
                {currentStatus === 'Pending Approval' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rejection Reason <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      className="input w-full" 
                      placeholder="Required if rejecting..."
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Optional Notes</label>
                  <textarea 
                    className="input w-full" 
                    rows="2" 
                    placeholder="Reviewer Notes, Finance Notes, or Posting Notes..."
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                  ></textarea>
                </div>

                <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-gray-100">
                  {currentStatus === 'Draft' && (
                    <button onClick={() => handleAction('SUBMIT')} disabled={isSubmitting} className="btn btn-primary flex-1">
                      Submit for Approval
                    </button>
                  )}
                  {currentStatus === 'Pending Approval' && (
                    <>
                      <button onClick={() => handleAction('APPROVE')} disabled={isSubmitting} className="btn bg-green-600 hover:bg-green-700 text-white flex-1">
                        Approve
                      </button>
                      <button onClick={() => handleAction('REJECT')} disabled={isSubmitting} className="btn bg-red-600 hover:bg-red-700 text-white flex-1">
                        Reject
                      </button>
                    </>
                  )}
                  {currentStatus === 'Approved' && (
                    <button onClick={() => handleAction('POST')} disabled={isSubmitting} className="btn bg-blue-600 hover:bg-blue-700 text-white flex-1">
                      Post to Ledger
                    </button>
                  )}
                  {currentStatus === 'Posted' && (
                    <button onClick={() => handleAction('ARCHIVE')} disabled={isSubmitting} className="btn bg-gray-600 hover:bg-gray-700 text-white flex-1">
                      Archive
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Workflow Progress Indicator */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-6">Workflow Progress</h3>
            <div className="relative pt-4 pb-2">
              <div className="absolute left-0 top-1/2 w-full h-1 bg-gray-200 -z-10 transform -translate-y-1/2 rounded"></div>
              {currentStatus === 'Rejected' ? (
                 <div className="flex justify-center items-center">
                   <div className="flex flex-col items-center text-red-600">
                     <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center border-4 border-white">
                        <AlertCircle className="w-5 h-5" />
                     </div>
                     <span className="mt-2 text-sm font-semibold">Rejected</span>
                   </div>
                 </div>
              ) : (
                <div className="flex justify-between">
                  {['Draft', 'Pending', 'Approved', 'Posted', 'Archived'].map((step, index) => {
                    const isCompleted = currentStep >= index;
                    const isCurrent = currentStep === index;
                    
                    return (
                      <div key={step} className={`flex flex-col items-center ${isCompleted ? 'text-primary' : 'text-gray-400'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-4 border-white ${isCompleted ? 'bg-primary text-white' : 'bg-gray-200'} ${isCurrent ? 'ring-4 ring-primary/30 shadow-[0_0_15px_rgba(168,249,40,0.5)]' : ''}`}>
                          {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <span className="text-xs">{index + 1}</span>}
                        </div>
                        <span className={`mt-2 text-xs font-medium text-center max-w-[80px] ${isCurrent ? 'text-gray-900 font-bold' : ''}`}>{step}</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Approval History Table */}
          <div className="card overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold">Approval History</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status Change</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {expense.audit_timeline && expense.audit_timeline.length > 0 ? (
                    expense.audit_timeline.filter(log => log.action.startsWith('WORKFLOW_') || log.action === 'EXPENSE_CREATED').map(log => (
                      <tr key={log.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(log.created_at, true)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{log.userFirstName ? `${log.userFirstName} ${log.userLastName}` : `User #${log.user_id}`}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.action.replace('WORKFLOW_', '')}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {log.old_value?.status} → <span className="font-semibold text-gray-900">{log.new_value?.status || 'Created'}</span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                          {log.new_value?.reason && <span className="text-red-600 font-medium mr-2">Reason: {log.new_value.reason}</span>}
                          {log.new_value?.comments}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">No workflow history found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
        </div>

        {/* Right Column - Brief Summary Context */}
        <div className="space-y-6">
          <div className="card p-6 bg-gray-50">
            <h3 className="text-sm uppercase tracking-wider font-semibold text-gray-500 mb-4">Expense Context</h3>
            
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-400">Total Amount</p>
                <p className="font-display-lg text-2xl text-primary">{formatCurrency(Number(expense.amount || 0) + Number(expense.tax || 0))}</p>
              </div>
              
              <div className="h-px bg-gray-200 w-full my-2"></div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-400">Category</p>
                  <p className="text-sm font-medium">{expense.category}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Module</p>
                  <p className="text-sm font-medium">{expense.source_module}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Date</p>
                  <p className="text-sm font-medium">{formatDate(expense.date)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Cost Center</p>
                  <p className="text-sm font-medium">{expense.cost_center_id || 'N/A'}</p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <Link to={`/expenses/${expense.id}`} className="text-primary hover:underline text-sm font-medium flex items-center gap-1">
                  <FileText className="w-4 h-4" />
                  View Full Audit Details
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApprovalWorkspace;
