import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiTruck, FiLock, FiMail, FiArrowRight } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: 'system.admin@transitops.enterprise',
      password: 'admin123'
    }
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await login({ email: data.email, password: data.password });
      navigate('/');
    } catch (error) {
      console.error('Login failed', error);
      // AuthContext handles the toast error message
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex-1 min-h-screen flex bg-surface text-on-surface">
      {/* Left side - Brand/Graphic */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-surface-variant flex-col justify-between p-12 border-r border-white/5">
        <div className="absolute inset-0 cyber-lime-glow opacity-10 bg-cover bg-center mix-blend-overlay"></div>
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary-fixed/20 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-secondary/10 blur-[150px] rounded-full pointer-events-none"></div>

        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 flex items-center gap-3"
        >
          <div className="w-12 h-12 bg-primary-fixed rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(168,249,40,0.4)]">
            <FiTruck className="w-6 h-6 text-on-primary-fixed" />
          </div>
          <span className="font-display-lg text-2xl tracking-wide">TransitOps</span>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative z-10 max-w-lg"
        >
          <h1 className="font-display-lg text-5xl leading-tight mb-6">
            Intelligent Fleet <br/>
            <span className="text-primary-fixed cyber-lime-glow">Management</span>
          </h1>
          <p className="text-on-surface-variant text-lg font-body-lg">
            Centralized control for your entire transport operations. Real-time tracking, automated maintenance, and dynamic dispatching in one unified platform.
          </p>
        </motion.div>
        
        <div className="relative z-10 flex items-center gap-4 text-sm text-on-surface-variant">
          <span>© 2026 TransitOps Global Enterprise</span>
          <span className="w-1 h-1 rounded-full bg-primary-fixed"></span>
          <span>System Version 2.4.0</span>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 relative overflow-hidden bg-surface">
        {/* Mobile Background Elements */}
        <div className="absolute inset-0 lg:hidden bg-surface-variant pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-fixed/10 blur-[100px] rounded-full lg:hidden pointer-events-none"></div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="w-full max-w-md relative z-10"
        >
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-primary-fixed rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(168,249,40,0.4)]">
              <FiTruck className="w-5 h-5 text-on-primary-fixed" />
            </div>
            <span className="font-display-lg text-2xl tracking-wide">TransitOps</span>
          </div>

          <div className="mb-10">
            <h2 className="font-headline-md text-3xl mb-2">Welcome Back</h2>
            <p className="text-on-surface-variant">Enter your credentials to access the command center.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-label-bold text-on-surface">Corporate Email</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-primary-fixed text-on-surface-variant">
                  <FiMail className="h-5 w-5" />
                </div>
                <input
                  id="email"
                  type="email"
                  {...register("email", { 
                    required: "Corporate email is required",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Please enter a valid email address"
                    }
                  })}
                  className={`w-full pl-12 pr-4 py-3 bg-white/5 border rounded-xl text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-1 transition-all shadow-inner ${
                    errors.email 
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50' 
                      : 'border-white/10 focus:border-primary-fixed focus:ring-primary-fixed'
                  }`}
                  placeholder="name@transitops.enterprise"
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-label-bold text-on-surface">Secure Password</label>
                <a href="#" className="text-xs text-primary-fixed hover:underline hover:text-primary-fixed/80 transition-colors">Forgot password?</a>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-primary-fixed text-on-surface-variant">
                  <FiLock className="h-5 w-5" />
                </div>
                <input
                  id="password"
                  type="password"
                  {...register("password", { 
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters"
                    }
                  })}
                  className={`w-full pl-12 pr-4 py-3 bg-white/5 border rounded-xl text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-1 transition-all shadow-inner ${
                    errors.password 
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50' 
                      : 'border-white/10 focus:border-primary-fixed focus:ring-primary-fixed'
                  }`}
                  placeholder="••••••••"
                />
              </div>
              {errors.password && (
                <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 mt-4 bg-primary-fixed text-on-primary-fixed rounded-xl font-label-bold text-base flex justify-center items-center gap-2 hover:bg-[#b5fa33] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(168,249,40,0.2)] hover:shadow-[0_0_30px_rgba(168,249,40,0.4)] group"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-on-primary-fixed border-t-transparent rounded-full animate-spin"></div>
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Access Dashboard</span>
                  <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-white/10 text-center">
            <p className="text-sm text-on-surface-variant">
              Need access? <a href="#" className="text-primary-fixed hover:underline hover:text-primary-fixed/80 transition-colors">Contact System Administrator</a>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
