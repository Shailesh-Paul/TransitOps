import AppRoutes from './routes/AppRoutes';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 antialiased font-sans flex text-sm transition-colors duration-300">
      <Toaster position="top-right" toastOptions={{ 
        duration: 3000, 
        style: { background: '#1e293b', color: '#fff', fontSize: '14px', borderRadius: '8px' },
        success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
        error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } }
      }} />
      <AppRoutes />
    </div>
  )
}

export default App
