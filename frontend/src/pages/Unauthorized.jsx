import React from 'react';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../constants/routes';

export default function Unauthorized() {
  const navigate = useNavigate();

  return (
    <div className="w-full flex-1 flex flex-col items-center justify-center bg-surface text-on-surface p-6 min-h-[80vh]">
      <div className="w-24 h-24 bg-semantic-danger/10 rounded-full flex items-center justify-center mb-6">
        <ShieldAlert className="w-12 h-12 text-semantic-danger" />
      </div>
      
      <h1 className="font-display-lg text-4xl mb-4 text-center">Access Denied</h1>
      
      <p className="text-on-surface-variant font-body-lg text-lg max-w-md text-center mb-8">
        You do not have the required enterprise permissions to view this resource. 
        Please contact your system administrator if you believe this is a mistake.
      </p>

      <button
        onClick={() => navigate(ROUTES.DASHBOARD)}
        className="flex items-center gap-2 px-6 py-3 bg-primary-fixed text-on-primary-fixed rounded-xl font-label-bold hover:bg-[#b5fa33] transition-colors shadow-[0_0_15px_rgba(168,249,40,0.2)]"
      >
        <ArrowLeft className="w-5 h-5" />
        Return to Dashboard
      </button>
    </div>
  );
}
