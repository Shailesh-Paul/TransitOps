import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user } = useAuth();

  return (
    <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-margin-desktop h-20 bg-surface/70 backdrop-blur-xl border-b border-white/10 transition-all">
      <div className="flex items-center gap-8">
        <span className="font-display-lg text-[32px] text-primary-fixed tracking-tighter">TransitOps</span>
        <div className="hidden md:flex items-center bg-white/5 px-4 py-2 rounded-full border border-white/10 gap-3">
          <span className="material-symbols-outlined text-on-surface-variant">search</span>
          <input 
            className="bg-transparent border-none outline-none focus:ring-0 text-body-md w-64 text-on-surface placeholder:text-on-surface-variant/50" 
            placeholder="Global Mission Search..." 
            type="text" 
          />
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-full hover:bg-white/5 transition-colors text-on-surface-variant flex items-center justify-center">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button className="p-2 rounded-full hover:bg-white/5 transition-colors text-on-surface-variant flex items-center justify-center">
            <span className="material-symbols-outlined">settings</span>
          </button>
        </div>
        <div className="h-10 w-10 rounded-full border border-primary-fixed/30 p-0.5 overflow-hidden">
          <img 
            className="w-full h-full object-cover rounded-full" 
            alt="Profile Avatar" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuClWOJrQKMht8vo8vzm0_CU-AU1XsuJ4WWxqNl4STg0LK1oyWZ_cnQuXFw9b_JfQw0Fg9-MMuhZwXdV063FdFNnctRtJg6JXyFss74eOj8fpxodnJ1SR8OTuiAkW4oMBxMOQvzk___LuthE4GU5F6hNtPpSsgeYYmaj6ybkC1nxiXoV0du9NE8lTOkeUzvqXTLumDq4wxsz__c32Ie234452iW6I0RcQBKloDX5a88mDYkdmfsIw-VLHYWbFJ-wZCWHupD9R_SaSUE" 
          />
        </div>
      </div>
    </nav>
  );
}
