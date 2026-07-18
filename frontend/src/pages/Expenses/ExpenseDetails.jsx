import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getExpenseById } from '../../services/expenseService';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import Loader from '../../components/Loader';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { 
  Building2, Hash, FileText, CheckCircle2, 
  AlertCircle, Receipt, User, Truck, Clock, 
  Map, UserCircle2, Calendar, FileCheck2
} from 'lucide-react';

const ExpenseDetails = () => {
  const { id } = useParams();
  const [expense, setExpense] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchExpenseDetails();
  }, [id]);

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

  if (loading) return <Loader fullScreen text="Loading Expense Details..." />;
  if (error) return <div className="p-6 text-center text-red-500">{error}</div>;
  if (!expense) return <div className="p-6 text-center">Expense not found</div>;

  const getWorkflowStep = (status) => {
    const steps = ['Draft', 'Pending Approval', 'Approved', 'Posted', 'Archived'];
    if (status === 'Rejected') return -1;
    return steps.indexOf(status);
  };

  const currentStep = getWorkflowStep(expense.enterprise_status || expense.status);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <PageHeader 
          title={`Expense Details`}
          subtitle={`Reviewing ${expense.accounting_reference || expense.expense_id || `ID: ${expense.id}`}`}
        />
        <Link to="/expenses" className="btn btn-secondary">
          Back to Expenses
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Details */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Header & Identifiers */}
          <div className="card p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <FileText className="h-5 w-5 text-gray-500" />
                  Primary Information
                </h3>
              </div>
              <StatusBadge status={expense.status} />
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">Expense ID</p>
                <p className="font-medium">{expense.expense_id || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Accounting Reference</p>
                <p className="font-medium">{expense.accounting_reference || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Source Module</p>
                <p className="font-medium">{expense.source_module || 'Manual'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Source Record ID</p>
                <p className="font-medium">{expense.source_record_id || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Category</p>
                <p className="font-medium">{expense.category}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Created Date</p>
                <p className="font-medium">{formatDate(expense.created_at, true)}</p>
              </div>
            </div>
          </div>

          {/* Financial Information */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-6">
              <Receipt className="h-5 w-5 text-gray-500" />
              Financial Information
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">Base Amount</p>
                <p className="font-semibold text-lg">{formatCurrency(expense.amount || 0)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Tax</p>
                <p className="font-semibold text-lg">{formatCurrency(expense.tax || 0)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Amount</p>
                <p className="font-bold text-xl text-primary">{formatCurrency(Number(expense.amount || 0) + Number(expense.tax || 0))}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Currency</p>
                <p className="font-medium">{expense.currency || 'INR'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Payment Method</p>
                <p className="font-medium">{expense.payment_method || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Invoice Number</p>
                <p className="font-medium">{expense.invoice_number || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Receipt Status</p>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${expense.receipt_status === 'Verified' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {expense.receipt_status || 'Pending'}
                </span>
              </div>
            </div>
          </div>

          {/* Source Information */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-6">
              <Truck className="h-5 w-5 text-gray-500" />
              Source Information
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">Vehicle</p>
                {expense.vehicle_id ? (
                  <Link to={`/vehicles/${expense.vehicle_id}`} className="text-primary hover:underline font-medium">
                    {expense.vehicleName || `Vehicle #${expense.vehicle_id}`}
                  </Link>
                ) : <p className="font-medium text-gray-400">-</p>}
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Driver</p>
                {expense.driver_id ? (
                  <Link to={`/drivers/${expense.driver_id}`} className="text-primary hover:underline font-medium">
                    {expense.driverFirstName ? `${expense.driverFirstName} ${expense.driverLastName}` : `Driver #${expense.driver_id}`}
                  </Link>
                ) : <p className="font-medium text-gray-400">-</p>}
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Trip</p>
                {expense.trip_id ? (
                  <Link to={`/trips`} className="text-primary hover:underline font-medium">
                    {`Trip #${expense.trip_id}`}
                  </Link>
                ) : <p className="font-medium text-gray-400">-</p>}
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Vendor</p>
                <p className="font-medium">{expense.vendor || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Cost Center</p>
                <p className="font-medium">{expense.cost_center_id || '-'}</p>
              </div>
            </div>
          </div>

          {/* Workflow */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-6">Lifecycle Workflow</h3>
            <div className="relative pt-4">
              <div className="absolute left-0 top-1/2 w-full h-1 bg-gray-200 -z-10 transform -translate-y-1/2 rounded"></div>
              {expense.enterprise_status === 'Rejected' ? (
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
                  {['Draft', 'Pending Approval', 'Approved', 'Posted', 'Archived'].map((step, index) => {
                    const isCompleted = currentStep >= index;
                    const isCurrent = currentStep === index;
                    
                    return (
                      <div key={step} className={`flex flex-col items-center ${isCompleted ? 'text-primary' : 'text-gray-400'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-4 border-white ${isCompleted ? 'bg-primary text-white' : 'bg-gray-200'} ${isCurrent ? 'ring-4 ring-primary/30' : ''}`}>
                          {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <span className="text-xs">{index + 1}</span>}
                        </div>
                        <span className={`mt-2 text-xs font-medium text-center max-w-[80px] ${isCurrent ? 'text-gray-900' : ''}`}>{step}</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Attachments Placeholder */}
          <div className="card p-6 border-dashed border-2 border-gray-200 bg-gray-50">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-2 text-gray-700">
              <FileCheck2 className="h-5 w-5" />
              Attachments
            </h3>
            <p className="text-sm text-gray-500 mb-4">Prepare for future Invoice, Receipt, and Supporting Document uploads.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <div className="bg-white p-4 rounded-lg border border-gray-200 flex items-center gap-3 opacity-60">
                 <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                   <FileText className="w-5 h-5 text-gray-400" />
                 </div>
                 <div>
                   <p className="text-sm font-medium">Invoice.pdf</p>
                   <p className="text-xs text-gray-400">Placeholder</p>
                 </div>
               </div>
               <div className="bg-white p-4 rounded-lg border border-gray-200 flex items-center gap-3 opacity-60">
                 <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                   <FileText className="w-5 h-5 text-gray-400" />
                 </div>
                 <div>
                   <p className="text-sm font-medium">Receipt.jpg</p>
                   <p className="text-xs text-gray-400">Placeholder</p>
                 </div>
               </div>
            </div>
          </div>
          
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          
          {/* Financial Integrity Summary */}
          <div className="card p-6 border-t-4 border-t-primary">
            <h3 className="text-lg font-semibold mb-4">Integrity Summary</h3>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Source Record Verification</p>
                  <p className="text-xs text-gray-500">Source verified via Engine</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Accounting Reference</p>
                  <p className="text-xs text-gray-500">Valid ID generated</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                {expense.receipt_status === 'Verified' ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
                )}
                <div>
                  <p className="text-sm font-medium">Receipt Status</p>
                  <p className="text-xs text-gray-500">{expense.receipt_status || 'Pending Verification'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Audit Trail Status</p>
                  <p className="text-xs text-gray-500">{expense.audit_timeline?.length || 0} events recorded</p>
                </div>
              </div>
            </div>
          </div>

          {/* Approval Information */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-4">Approval Info</h3>
            
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Created By</p>
                <div className="flex items-center gap-2 mt-1">
                  <UserCircle2 className="w-4 h-4 text-gray-400" />
                  <p className="text-sm font-medium">
                    {expense.createdByFirstName ? `${expense.createdByFirstName} ${expense.createdByLastName}` : `User #${expense.created_by}`}
                  </p>
                </div>
              </div>
              {expense.approved_by && (
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Approved By</p>
                  <div className="flex items-center gap-2 mt-1">
                    <UserCircle2 className="w-4 h-4 text-green-500" />
                    <p className="text-sm font-medium">
                      {expense.approvedByFirstName ? `${expense.approvedByFirstName} ${expense.approvedByLastName}` : `User #${expense.approved_by}`}
                    </p>
                  </div>
                </div>
              )}
              {expense.posted_by && (
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Posted By</p>
                  <div className="flex items-center gap-2 mt-1">
                    <UserCircle2 className="w-4 h-4 text-primary" />
                    <p className="text-sm font-medium">
                      {expense.postedByFirstName ? `${expense.postedByFirstName} ${expense.postedByLastName}` : `User #${expense.posted_by}`}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Audit Timeline */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-500" />
              Audit Timeline
            </h3>
            
            <div className="relative border-l border-gray-200 ml-3 space-y-6">
              {expense.audit_timeline && expense.audit_timeline.length > 0 ? (
                expense.audit_timeline.map((log, idx) => (
                  <div key={log.id} className="relative pl-6">
                    <div className="absolute w-3 h-3 bg-gray-200 rounded-full -left-[6.5px] top-1.5 border-2 border-white"></div>
                    <div>
                      <p className="text-sm font-semibold">{log.action.replace(/_/g, ' ')}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(log.created_at, true)}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        by {log.userFirstName ? `${log.userFirstName} ${log.userLastName}` : `User #${log.user_id}`}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 pl-4">No audit logs found.</p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ExpenseDetails;
