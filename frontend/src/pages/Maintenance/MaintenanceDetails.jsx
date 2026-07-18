import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getComprehensiveDetails, startMaintenance, completeMaintenance, cancelMaintenance, updateProgress } from '../../services/maintenanceService';
import Loader from '../../components/Loader';
import { FiArrowLeft, FiAlertTriangle, FiCheckCircle, FiClock, FiTool, FiCalendar, FiMapPin, FiTruck, FiInfo, FiCopy } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function MaintenanceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [noteInput, setNoteInput] = useState('');
  const [progressInput, setProgressInput] = useState('');
  const [newChecklistItem, setNewChecklistItem] = useState('');

  // Completion Form State
  const [showCompletionForm, setShowCompletionForm] = useState(false);
  const [completionData, setCompletionData] = useState({
    technician: '',
    completion_summary: '',
    root_cause: '',
    corrective_action: '',
    customer_remarks: '',
    parts: [],
    labour_hours: 0,
    labour_rate: 0,
    misc_cost: 0
  });

  const fetchDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getComprehensiveDetails(id);
      setDetails(response.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load maintenance details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  if (loading) return <Loader />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <FiAlertTriangle className="w-12 h-12 text-error mb-4 opacity-80" />
        <p className="text-error font-label-bold mb-4">{error}</p>
        <button onClick={fetchDetails} className="px-4 py-2 border border-white/20 rounded font-label-bold text-xs uppercase hover:bg-white/5 transition-all text-primary">Retry</button>
      </div>
    );
  }

  if (!details) return null;

  const { record, audit_logs, previous_maintenance, recent_trips, fuel_history } = details;

  const handleAction = async (actionFn, successMsg) => {
    if (!window.confirm(`Are you sure you want to perform this action?`)) return;
    setIsSubmitting(true);
    try {
      await actionFn(id);
      toast.success(successMsg);
      fetchDetails();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Action failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitCompletion = async (e) => {
    e.preventDefault();
    if (record.progress !== 100) {
      toast.error("Progress must be 100% to complete.");
      return;
    }
    setIsSubmitting(true);
    try {
      await completeMaintenance(id, { ...completionData, force_complete: true, progress: 100 });
      toast.success("Maintenance Completed Successfully");
      setShowCompletionForm(false);
      fetchDetails();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Completion failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addPartRow = () => {
    setCompletionData(prev => ({
      ...prev,
      parts: [...prev.parts, { part_name: '', quantity: 1, unit_cost: 0 }]
    }));
  };

  const updatePartRow = (index, field, value) => {
    const updated = [...completionData.parts];
    updated[index][field] = value;
    setCompletionData({ ...completionData, parts: updated });
  };

  const removePartRow = (index) => {
    const updated = completionData.parts.filter((_, i) => i !== index);
    setCompletionData({ ...completionData, parts: updated });
  };

  const copyWorkOrder = () => {
    const wo = record.work_order_number || `MNT-${record.id}`;
    navigator.clipboard.writeText(wo);
    toast.success('Work Order copied!');
  };

  const handleUpdateProgress = async (e) => {
    e.preventDefault();
    if (progressInput === '' || isNaN(progressInput) || progressInput < 0 || progressInput > 100) {
      toast.error("Enter a valid progress between 0 and 100");
      return;
    }
    setIsSubmitting(true);
    try {
      await updateProgress(id, { progress: Number(progressInput) });
      toast.success("Progress updated");
      setProgressInput('');
      fetchDetails();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteInput.trim()) return;
    setIsSubmitting(true);
    try {
      await updateProgress(id, { note: noteInput.trim() });
      toast.success("Note added");
      setNoteInput('');
      fetchDetails();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add note');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleChecklist = async (idx, currentList) => {
    const updated = [...currentList];
    updated[idx].isCompleted = !updated[idx].isCompleted;
    setIsSubmitting(true);
    try {
      await updateProgress(id, { work_performed_checklist: updated });
      fetchDetails();
    } catch (err) {
      toast.error('Failed to update checklist');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddChecklist = async (e) => {
    e.preventDefault();
    if (!newChecklistItem.trim()) return;
    const currentList = record.work_performed_checklist ? (typeof record.work_performed_checklist === 'string' ? JSON.parse(record.work_performed_checklist) : record.work_performed_checklist) : [];
    const updated = [...currentList, { id: Date.now(), label: newChecklistItem.trim(), isCompleted: false }];
    setIsSubmitting(true);
    try {
      await updateProgress(id, { work_performed_checklist: updated });
      setNewChecklistItem('');
      fetchDetails();
    } catch (err) {
      toast.error('Failed to add item');
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Derived State ---
  const todayDate = new Date().toDateString();
  const scheduledDate = record.scheduled_date ? new Date(record.scheduled_date).toDateString() : null;
  const isDueToday = record.status === 'Scheduled' && scheduledDate === todayDate;
  const isOverdue = record.status === 'Overdue';
  const isUpcoming = record.status === 'Scheduled' && record.scheduled_date && new Date(record.scheduled_date) > new Date();
  
  const getStatusColor = (status) => {
    switch(status) {
      case 'Completed': return 'bg-primary-fixed/20 text-primary-fixed border-primary-fixed/30';
      case 'In Progress': return 'bg-secondary/20 text-secondary border-secondary/30';
      case 'Scheduled': return 'bg-surface-container-highest text-on-surface border-white/20';
      case 'Overdue':
      case 'Cancelled': return 'bg-error/20 text-error border-error/30';
      default: return 'bg-white/10 text-white border-white/20';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      {/* Header Actions */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => navigate('/maintenance')} className="text-primary hover:text-primary-fixed flex items-center gap-2 text-sm font-label-bold uppercase transition-all">
          <FiArrowLeft /> Back to List
        </button>
        <div className="flex gap-2">
          {record.status === 'Scheduled' && (
            <>
              <button disabled={isSubmitting} onClick={() => handleAction(startMaintenance, 'Maintenance Started')} className="px-4 py-2 rounded bg-secondary/20 text-secondary font-label-bold text-xs uppercase hover:bg-secondary/30 transition-all border border-secondary/30">Start Maintenance</button>
              <button disabled={isSubmitting} onClick={() => handleAction(cancelMaintenance, 'Maintenance Cancelled')} className="px-4 py-2 rounded bg-error/10 text-error font-label-bold text-xs uppercase hover:bg-error/20 transition-all">Cancel Schedule</button>
            </>
          )}
          {(record.status === 'In Progress' || record.status === 'Overdue') && (
            <>
              <button disabled={isSubmitting} onClick={() => setShowCompletionForm(true)} className="px-4 py-2 rounded bg-primary-fixed text-on-primary-fixed font-label-bold text-xs uppercase hover:opacity-90 transition-all shadow-[0_0_15px_rgba(168,249,40,0.3)]">Complete Maintenance</button>
            </>
          )}
        </div>
      </div>

      {/* Notifications Banner */}
      {isDueToday && (
        <div className="bg-error/20 border border-error/50 text-error px-4 py-3 rounded-lg flex items-center gap-3">
          <FiAlertTriangle className="shrink-0" />
          <p className="text-sm font-bold">Due Today: This maintenance is scheduled to start today.</p>
        </div>
      )}
      {isOverdue && (
        <div className="bg-error/20 border border-error/50 text-error px-4 py-3 rounded-lg flex items-center gap-3">
          <FiAlertTriangle className="shrink-0" />
          <p className="text-sm font-bold">Overdue: This maintenance has missed its scheduled date.</p>
        </div>
      )}
      {isUpcoming && record.priority === 'Critical' && (
        <div className="bg-error/10 border border-error/30 text-error px-4 py-3 rounded-lg flex items-center gap-3">
          <FiAlertTriangle className="shrink-0" />
          <p className="text-sm font-bold">Critical Priority: Ensure parts are procured for this upcoming maintenance.</p>
        </div>
      )}

      {/* Title & Status */}
      <div className="glass-card rounded-2xl p-6 border border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6 opacity-10">
          <FiTool className="w-32 h-32 text-primary" />
        </div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="font-display-lg text-primary text-3xl font-extrabold uppercase">
                {record.work_order_number || `MNT-${record.id}`}
              </h1>
              <button onClick={copyWorkOrder} className="p-1.5 text-on-surface-variant hover:text-primary transition-all hover:bg-white/10 rounded" title="Copy Work Order">
                <FiCopy />
              </button>
              <span className={`px-2.5 py-1 rounded text-xs font-bold uppercase border ${getStatusColor(record.status)}`}>
                {record.status}
              </span>
            </div>
            <p className="text-on-surface-variant font-body-lg text-lg">
              {record.registration_number} • {record.make} {record.model}
            </p>
          </div>
          <div className="text-left md:text-right">
            <p className="text-on-surface-variant text-sm font-label-bold uppercase mb-1">Estimated Cost</p>
            <p className="text-3xl font-display-lg text-primary-fixed">₹{Number(record.cost || 0).toLocaleString('en-IN')}</p>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Schedule Information */}
          <div className="glass-card rounded-xl p-6 border border-white/5">
            <h3 className="font-label-bold text-primary uppercase mb-4 flex items-center gap-2 border-b border-white/10 pb-2">
              <FiCalendar /> Schedule Information
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-[10px] text-on-surface-variant uppercase font-bold mb-1">Category</p>
                <p className="text-sm text-primary font-medium">{record.category || 'N/A'}</p>
              </div>
              <div>
                <p className="text-[10px] text-on-surface-variant uppercase font-bold mb-1">Type</p>
                <p className="text-sm text-primary font-medium">{record.type}</p>
              </div>
              <div>
                <p className="text-[10px] text-on-surface-variant uppercase font-bold mb-1">Trigger</p>
                <p className="text-sm text-primary font-medium">{record.trigger_type || 'Manual'}</p>
              </div>
              <div>
                <p className="text-[10px] text-on-surface-variant uppercase font-bold mb-1">Priority</p>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/10 text-primary">{record.priority || 'Medium'}</span>
              </div>
              <div>
                <p className="text-[10px] text-on-surface-variant uppercase font-bold mb-1">Scheduled Date</p>
                <p className="text-sm text-primary font-medium">{record.scheduled_date ? new Date(record.scheduled_date).toLocaleDateString() : 'N/A'}</p>
              </div>
              <div>
                <p className="text-[10px] text-on-surface-variant uppercase font-bold mb-1">Expected Completion</p>
                <p className="text-sm text-primary font-medium">{record.expected_completion_date ? new Date(record.expected_completion_date).toLocaleDateString() : 'N/A'}</p>
              </div>
            </div>
            <div>
              <p className="text-[10px] text-on-surface-variant uppercase font-bold mb-1">Description</p>
              <p className="text-sm text-on-surface bg-surface-container-low p-3 rounded border border-white/5">{record.description || 'No description provided.'}</p>
            </div>
          </div>

          {/* Completion Summary Card (if completed) */}
          {record.status === 'Completed' && (
            <div className="glass-card rounded-xl p-6 border border-primary-fixed/30 bg-gradient-to-r from-primary-fixed/10 to-transparent">
              <h3 className="font-label-bold text-primary-fixed uppercase mb-4 border-b border-primary-fixed/20 pb-2 flex items-center gap-2">
                <FiCheckCircle /> Completion Summary
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-[10px] text-on-surface-variant uppercase font-bold mb-1">Technician</p>
                  <p className="text-sm text-primary font-medium">{record.performed_by || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-on-surface-variant uppercase font-bold mb-1">Downtime</p>
                  <p className="text-sm text-primary font-medium">{record.downtime_minutes ? `${Math.floor(record.downtime_minutes / 60)}h ${record.downtime_minutes % 60}m` : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-on-surface-variant uppercase font-bold mb-1">Root Cause</p>
                  <p className="text-sm text-primary font-medium">{record.root_cause || 'N/A'}</p>
                </div>
                <div>
                   <p className="text-[10px] text-on-surface-variant uppercase font-bold mb-1">Completed At</p>
                  <p className="text-sm text-primary font-medium">{record.end_date ? new Date(record.end_date).toLocaleString() : 'N/A'}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] text-on-surface-variant uppercase font-bold mb-1">Summary</p>
                  <p className="text-sm text-on-surface bg-black/20 p-3 rounded border border-white/5">{record.completion_summary || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-on-surface-variant uppercase font-bold mb-1">Corrective Action</p>
                  <p className="text-sm text-on-surface bg-black/20 p-3 rounded border border-white/5">{record.corrective_action || 'N/A'}</p>
                </div>
              </div>

              {/* Financial Breakdown */}
              <h4 className="text-xs font-bold text-primary mt-6 mb-3 border-b border-white/10 pb-2">Financial Breakdown</h4>
              <div className="bg-black/20 rounded p-4 border border-white/5">
                <div className="flex justify-between mb-2 text-sm">
                  <span className="text-on-surface-variant">Parts Cost</span>
                  <span className="font-mono text-primary">₹{(Number(record.cost || 0) - Number(record.labour_cost || 0) - Number(record.misc_cost || 0)).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between mb-2 text-sm">
                  <span className="text-on-surface-variant">Labour Cost ({record.labour_hours || 0} hrs @ ₹{record.labour_rate || 0})</span>
                  <span className="font-mono text-primary">₹{Number(record.labour_cost || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between mb-4 text-sm border-b border-white/10 pb-2">
                  <span className="text-on-surface-variant">Misc Cost</span>
                  <span className="font-mono text-primary">₹{Number(record.misc_cost || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span className="text-primary-fixed uppercase">Total Cost</span>
                  <span className="font-mono text-primary-fixed">₹{Number(record.cost || 0).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          )}

          {/* Vehicle Impact Notice */}
          <div className="glass-card rounded-xl p-6 border border-white/5 bg-gradient-to-r from-surface-container-low to-transparent">
             <h3 className="font-label-bold text-primary uppercase mb-3 flex items-center gap-2">
              <FiInfo /> Enterprise Vehicle Impact
            </h3>
            {record.status === 'Scheduled' && <p className="text-sm text-on-surface-variant">Vehicle remains available. Dispatching operations can continue normally until maintenance officially begins.</p>}
            {(record.status === 'In Progress' || record.status === 'Overdue') && <p className="text-sm text-secondary font-bold">Vehicle is currently unavailable for dispatch. It has been marked as In Shop.</p>}
            {record.status === 'Completed' && <p className="text-sm text-primary-fixed">Vehicle has been successfully returned to service and is available for dispatch.</p>}
            {record.status === 'Cancelled' && <p className="text-sm text-on-surface-variant">Maintenance was cancelled. Vehicle is available for dispatch.</p>}
          </div>

          {/* Related Information */}
          <div className="glass-card rounded-xl p-6 border border-white/5">
            <h3 className="font-label-bold text-primary uppercase mb-4 border-b border-white/10 pb-2">Related Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Previous Maintenance */}
              <div>
                <h4 className="text-xs font-bold text-on-surface-variant mb-3 flex items-center gap-2"><FiTool /> Previous Maintenance</h4>
                {previous_maintenance?.length > 0 ? (
                  <ul className="space-y-2">
                    {previous_maintenance.map(m => (
                      <li key={m.id} className="text-sm p-2 rounded bg-white/5 border border-white/5 flex justify-between items-center">
                        <div>
                          <p className="font-bold text-primary text-xs">{m.work_order_number || `MNT-${m.id}`}</p>
                          <p className="text-[10px] text-on-surface-variant">{m.type}</p>
                        </div>
                        <span className="text-[10px] font-mono">{new Date(m.created_at).toLocaleDateString()}</span>
                      </li>
                    ))}
                  </ul>
                ) : <p className="text-xs text-on-surface-variant">No previous records.</p>}
              </div>

              {/* Recent Trips */}
              <div>
                <h4 className="text-xs font-bold text-on-surface-variant mb-3 flex items-center gap-2"><FiTruck /> Recent Trips</h4>
                 {recent_trips?.length > 0 ? (
                  <ul className="space-y-2">
                    {recent_trips.map(t => (
                      <li key={t.id} className="text-sm p-2 rounded bg-white/5 border border-white/5 flex justify-between items-center">
                        <div>
                          <p className="font-bold text-primary text-xs">TRIP-{t.id}</p>
                          <p className="text-[10px] text-on-surface-variant uppercase">{t.status}</p>
                        </div>
                        <span className="text-[10px] font-mono">{new Date(t.start_time).toLocaleDateString()}</span>
                      </li>
                    ))}
                  </ul>
                ) : <p className="text-xs text-on-surface-variant">No recent trips.</p>}
              </div>
            </div>
          </div>

        </div>

        {/* Right Column - Status & Audit */}
        <div className="space-y-6">

          {/* Progress Tracking */}
          {['In Progress', 'Completed'].includes(record.status) && (
            <div className="glass-card rounded-xl p-6 border border-white/5 bg-gradient-to-br from-primary-fixed/5 to-transparent">
              <h3 className="font-label-bold text-primary uppercase mb-4 border-b border-white/10 pb-2 flex items-center gap-2">
                <FiTool /> Progress Tracking
              </h3>
              <div className="mb-4">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-xs font-bold text-on-surface-variant uppercase">Completion</span>
                  <span className="text-2xl font-display-lg text-primary-fixed">{record.progress || 0}%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden border border-white/5">
                  <div className="bg-primary-fixed h-3 transition-all duration-500 shadow-[0_0_10px_rgba(168,249,40,0.5)]" style={{ width: `${record.progress || 0}%` }}></div>
                </div>
              </div>
              
              {record.status === 'In Progress' && (
                <form onSubmit={handleUpdateProgress} className="flex gap-2">
                  <input 
                    type="number" 
                    min="0" max="100" 
                    placeholder="New %"
                    className="w-full bg-surface-container-low border border-white/10 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-primary transition-all"
                    value={progressInput}
                    onChange={(e) => setProgressInput(e.target.value)}
                  />
                  <button type="submit" disabled={isSubmitting} className="px-3 py-1.5 rounded bg-primary-fixed/20 text-primary-fixed hover:bg-primary-fixed/30 font-bold text-xs uppercase transition-all">
                    Update
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Work Performed Checklist */}
          <div className="glass-card rounded-xl p-6 border border-white/5">
            <h3 className="font-label-bold text-primary uppercase mb-4 border-b border-white/10 pb-2 flex items-center gap-2">
              <FiCheckCircle /> Work Performed
            </h3>
            <div className="space-y-2 mb-4 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
              {(() => {
                const list = record.work_performed_checklist ? (typeof record.work_performed_checklist === 'string' ? JSON.parse(record.work_performed_checklist) : record.work_performed_checklist) : [];
                if (list.length === 0) return <p className="text-xs text-on-surface-variant">No checklist items.</p>;
                return list.map((item, idx) => (
                  <label key={item.id || idx} className={`flex items-start gap-3 p-2 rounded border transition-all cursor-pointer ${item.isCompleted ? 'bg-primary-fixed/10 border-primary-fixed/20' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}>
                    <input 
                      type="checkbox" 
                      checked={item.isCompleted} 
                      onChange={() => toggleChecklist(idx, list)}
                      disabled={record.status !== 'In Progress' || isSubmitting}
                      className="mt-0.5"
                    />
                    <span className={`text-sm ${item.isCompleted ? 'text-primary-fixed line-through opacity-70' : 'text-on-surface'}`}>{item.label}</span>
                  </label>
                ));
              })()}
            </div>
            {record.status === 'In Progress' && (
              <form onSubmit={handleAddChecklist} className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Add checklist item..."
                  className="w-full bg-surface-container-low border border-white/10 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-primary transition-all"
                  value={newChecklistItem}
                  onChange={(e) => setNewChecklistItem(e.target.value)}
                />
                <button type="submit" disabled={isSubmitting} className="px-3 py-1.5 rounded bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase transition-all">
                  Add
                </button>
              </form>
            )}
          </div>

          {/* Technician Notes */}
          <div className="glass-card rounded-xl p-6 border border-white/5">
             <h3 className="font-label-bold text-primary uppercase mb-4 border-b border-white/10 pb-2 flex items-center gap-2">
              <FiInfo /> Technician Notes
            </h3>
            <div className="space-y-3 mb-4 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
               {(() => {
                const notes = record.technician_notes ? (typeof record.technician_notes === 'string' ? JSON.parse(record.technician_notes) : record.technician_notes) : [];
                if (notes.length === 0) return <p className="text-xs text-on-surface-variant">No notes yet.</p>;
                return notes.map((note, idx) => (
                  <div key={idx} className="bg-surface-container-low p-3 rounded border border-white/5">
                    <p className="text-sm text-white mb-1">{note.comment}</p>
                    <div className="flex justify-between items-center text-[10px] text-on-surface-variant">
                      <span className="font-bold text-primary">{note.technician}</span>
                      <span className="font-mono">{new Date(note.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                ));
              })()}
            </div>
            {record.status === 'In Progress' && (
              <form onSubmit={handleAddNote} className="flex flex-col gap-2">
                <textarea 
                  rows="2"
                  placeholder="Add a chronological note..."
                  className="w-full bg-surface-container-low border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-all resize-none"
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                ></textarea>
                <div className="flex justify-end">
                  <button type="submit" disabled={isSubmitting} className="px-4 py-1.5 rounded bg-secondary/20 text-secondary hover:bg-secondary/30 font-bold text-xs uppercase transition-all border border-secondary/30">
                    Add Note
                  </button>
                </div>
              </form>
            )}
          </div>
          
          {/* Vehicle Snapshot */}
          <div className="glass-card rounded-xl p-6 border border-white/5">
            <h3 className="font-label-bold text-primary uppercase mb-4 border-b border-white/10 pb-2 flex items-center gap-2">
              <FiTruck /> Vehicle Info
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[11px] text-on-surface-variant uppercase font-bold">Status</span>
                <span className="text-xs font-bold text-primary">{record.vehicle_status}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[11px] text-on-surface-variant uppercase font-bold">Registration</span>
                <span className="text-xs font-mono text-primary">{record.registration_number}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[11px] text-on-surface-variant uppercase font-bold">Capacity</span>
                <span className="text-xs font-mono text-primary">{record.capacity} L</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[11px] text-on-surface-variant uppercase font-bold">Driver</span>
                <span className="text-xs font-bold text-primary">{record.current_driver || 'Unassigned'}</span>
              </div>
            </div>
          </div>

          {/* Audit History Timeline */}
          <div className="glass-card rounded-xl p-6 border border-white/5">
            <h3 className="font-label-bold text-primary uppercase mb-4 border-b border-white/10 pb-2 flex items-center gap-2">
              <FiClock /> Audit Timeline
            </h3>
            <div className="space-y-4 pl-2 border-l-2 border-white/10 ml-2 mt-4 relative">
              {audit_logs?.map((log, index) => (
                <div key={log.id} className="relative pl-4">
                  <div className="absolute -left-[27px] top-1 w-3 h-3 rounded-full bg-primary-fixed border-4 border-[#0a1128]"></div>
                  <p className="text-xs font-bold text-primary mb-0.5">{log.action.replace(/_/g, ' ')}</p>
                  <p className="text-[10px] text-on-surface-variant font-mono mb-1">{new Date(log.created_at).toLocaleString()}</p>
                  <p className="text-[10px] text-on-surface-variant">User: {log.user_email || log.user_id}</p>
                </div>
              ))}
              {audit_logs?.length === 0 && (
                <p className="text-xs text-on-surface-variant pl-4">No audit logs found.</p>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Completion Modal */}
      {showCompletionForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-surface-container rounded-2xl border border-white/10 w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-surface-container-high sticky top-0 z-10">
              <div>
                <h2 className="text-2xl font-display-lg text-primary uppercase">Complete Maintenance</h2>
                <p className="text-on-surface-variant text-sm">Finalize work order {record.work_order_number}</p>
              </div>
              <button onClick={() => setShowCompletionForm(false)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 text-primary transition-all">✕</button>
            </div>
            
            <form onSubmit={submitCompletion} className="p-6 overflow-y-auto flex-1 custom-scrollbar">
              <div className="space-y-8">
                
                {/* Section 1: Summary */}
                <section>
                  <h3 className="text-sm font-label-bold text-primary uppercase border-b border-white/10 pb-2 mb-4">1. Work Summary</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-[10px] text-on-surface-variant uppercase font-bold mb-1">Assigned Technician *</label>
                      <input type="text" required value={completionData.technician} onChange={e => setCompletionData({...completionData, technician: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-all" />
                    </div>
                    <div>
                      <label className="block text-[10px] text-on-surface-variant uppercase font-bold mb-1">Root Cause</label>
                      <input type="text" value={completionData.root_cause} onChange={e => setCompletionData({...completionData, root_cause: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-all" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] text-on-surface-variant uppercase font-bold mb-1">Completion Summary *</label>
                      <textarea required rows="2" value={completionData.completion_summary} onChange={e => setCompletionData({...completionData, completion_summary: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-all resize-none"></textarea>
                    </div>
                    <div>
                      <label className="block text-[10px] text-on-surface-variant uppercase font-bold mb-1">Corrective Action</label>
                      <textarea rows="2" value={completionData.corrective_action} onChange={e => setCompletionData({...completionData, corrective_action: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-all resize-none"></textarea>
                    </div>
                    <div>
                      <label className="block text-[10px] text-on-surface-variant uppercase font-bold mb-1">Customer Remarks (Optional)</label>
                      <textarea rows="2" value={completionData.customer_remarks} onChange={e => setCompletionData({...completionData, customer_remarks: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-all resize-none"></textarea>
                    </div>
                  </div>
                </section>

                {/* Section 2: Parts */}
                <section>
                  <div className="flex justify-between items-center border-b border-white/10 pb-2 mb-4">
                    <h3 className="text-sm font-label-bold text-primary uppercase">2. Parts Consumed</h3>
                    <button type="button" onClick={addPartRow} className="text-[10px] px-2 py-1 bg-white/10 hover:bg-white/20 rounded uppercase font-bold text-primary">+ Add Part</button>
                  </div>
                  
                  {completionData.parts.length === 0 ? (
                    <p className="text-xs text-on-surface-variant italic">No parts consumed.</p>
                  ) : (
                    <div className="space-y-2">
                      {completionData.parts.map((p, idx) => (
                        <div key={idx} className="flex gap-2 items-start bg-black/20 p-2 rounded border border-white/5">
                          <div className="flex-1">
                            <label className="block text-[9px] text-on-surface-variant uppercase mb-1">Part Name</label>
                            <input type="text" required value={p.part_name} onChange={e => updatePartRow(idx, 'part_name', e.target.value)} className="w-full bg-transparent border-b border-white/10 px-1 py-1 text-sm text-white focus:outline-none focus:border-primary" />
                          </div>
                          <div className="w-20">
                            <label className="block text-[9px] text-on-surface-variant uppercase mb-1">Qty</label>
                            <input type="number" min="1" required value={p.quantity} onChange={e => updatePartRow(idx, 'quantity', Number(e.target.value))} className="w-full bg-transparent border-b border-white/10 px-1 py-1 text-sm text-white focus:outline-none focus:border-primary text-center" />
                          </div>
                          <div className="w-32">
                            <label className="block text-[9px] text-on-surface-variant uppercase mb-1">Unit Cost (₹)</label>
                            <input type="number" min="0" step="0.01" required value={p.unit_cost} onChange={e => updatePartRow(idx, 'unit_cost', Number(e.target.value))} className="w-full bg-transparent border-b border-white/10 px-1 py-1 text-sm text-white focus:outline-none focus:border-primary text-right" />
                          </div>
                          <div className="w-32">
                            <label className="block text-[9px] text-on-surface-variant uppercase mb-1">Total</label>
                            <div className="px-1 py-1 text-sm text-primary-fixed text-right font-mono">₹{((p.quantity || 0) * (p.unit_cost || 0)).toLocaleString('en-IN')}</div>
                          </div>
                          <button type="button" onClick={() => removePartRow(idx)} className="mt-5 w-8 h-8 flex justify-center items-center rounded bg-error/10 text-error hover:bg-error/20 transition-all">✕</button>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                {/* Section 3: Labour & Misc */}
                <section>
                  <h3 className="text-sm font-label-bold text-primary uppercase border-b border-white/10 pb-2 mb-4">3. Labour & Miscellaneous</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-[10px] text-on-surface-variant uppercase font-bold mb-1">Labour Hours</label>
                      <input type="number" min="0" step="0.1" value={completionData.labour_hours} onChange={e => setCompletionData({...completionData, labour_hours: Number(e.target.value)})} className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-all text-right font-mono" />
                    </div>
                    <div>
                      <label className="block text-[10px] text-on-surface-variant uppercase font-bold mb-1">Labour Rate (₹/hr)</label>
                      <input type="number" min="0" step="0.01" value={completionData.labour_rate} onChange={e => setCompletionData({...completionData, labour_rate: Number(e.target.value)})} className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-all text-right font-mono" />
                    </div>
                    <div>
                      <label className="block text-[10px] text-on-surface-variant uppercase font-bold mb-1">Misc Cost (₹)</label>
                      <input type="number" min="0" step="0.01" value={completionData.misc_cost} onChange={e => setCompletionData({...completionData, misc_cost: Number(e.target.value)})} className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-all text-right font-mono" />
                    </div>
                  </div>
                </section>
                
                {/* Total Cost Summary */}
                <section className="bg-primary-fixed/5 rounded-xl p-6 border border-primary-fixed/20 flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-label-bold text-primary-fixed uppercase">Total Maintenance Cost</h3>
                    <p className="text-xs text-on-surface-variant">Parts + Labour + Misc</p>
                  </div>
                  <div className="text-right">
                    <span className="text-4xl font-display-lg text-primary-fixed font-mono">
                      ₹{(
                        completionData.parts.reduce((sum, p) => sum + (p.quantity * p.unit_cost), 0) +
                        (completionData.labour_hours * completionData.labour_rate) +
                        completionData.misc_cost
                      ).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </section>

              </div>
              
              <div className="sticky bottom-0 bg-surface-container pt-4 pb-2 border-t border-white/10 mt-6 flex justify-end gap-4 z-10">
                <button type="button" onClick={() => setShowCompletionForm(false)} className="px-6 py-2 rounded text-primary font-bold text-xs uppercase hover:bg-white/5 transition-all">Cancel</button>
                <button type="submit" disabled={isSubmitting || record.progress !== 100} className="px-6 py-2 rounded bg-primary-fixed text-on-primary-fixed font-label-bold text-xs uppercase hover:opacity-90 transition-all shadow-[0_0_15px_rgba(168,249,40,0.3)] disabled:opacity-50 disabled:shadow-none">
                  {record.progress !== 100 ? 'Requires 100% Progress' : 'Finalize & Complete'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
