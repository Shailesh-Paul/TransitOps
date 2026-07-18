import clsx from 'clsx';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { motion } from 'framer-motion';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

export default function StatCard({ title, value, icon, trend, trendValue, color = 'primary', sparklineData }) {
  const Icon = icon;
  
  const colors = {
    primary: {
      bg: 'bg-[#CCFF00]/10',
      text: 'text-[#CCFF00]',
      stroke: '#CCFF00',
      glow: 'shadow-[0_0_15px_rgba(204,255,0,0.15)]'
    },
    emerald: {
      bg: 'bg-[#CCFF00]/10',
      text: 'text-[#CCFF00]',
      stroke: '#CCFF00',
      glow: 'shadow-[0_0_15px_rgba(204,255,0,0.15)]'
    },
    amber: {
      bg: 'bg-amber-500/10',
      text: 'text-amber-400',
      stroke: '#fbbf24',
      glow: 'shadow-[0_0_15px_rgba(251,191,36,0.15)]'
    },
    blue: {
      bg: 'bg-[#2563eb]/10',
      text: 'text-[#60a5fa]',
      stroke: '#60a5fa',
      glow: 'shadow-[0_0_15px_rgba(96,165,250,0.15)]'
    }
  };

  const theme = colors[color] || colors.primary;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98, y: 15 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="bg-[#0D1117] rounded-[16px] p-6 border border-white/5 hover-lift relative overflow-hidden group"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-bl-[100px] -mr-10 -mt-10 transition-transform duration-500 group-hover:scale-110 pointer-events-none" />
      
      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-[13px] font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
          <div className="flex items-baseline gap-2 mt-3">
            <h3 className="text-3xl font-black text-white tracking-tight">{value}</h3>
          </div>
        </div>
        <div className={clsx("p-3.5 rounded-2xl transition-all duration-300", theme.bg, theme.text, theme.glow, "group-hover:scale-110")}>
          <Icon className="w-5 h-5" strokeWidth={2.5} />
        </div>
      </div>
      
      <div className="mt-6 flex items-end justify-between relative z-10">
        <div className="flex items-center text-sm font-medium">
          <span className={clsx(
            "flex items-center px-2 py-1 rounded-md text-xs font-bold tracking-wide",
            trend === 'up' ? 'bg-[#CCFF00]/10 text-[#CCFF00]' : trend === 'down' ? 'bg-[#FF4444]/10 text-[#FF4444]' : 'bg-slate-800 text-slate-300'
          )}>
            {trend === 'up' && <TrendingUp className="w-3.5 h-3.5 mr-1" strokeWidth={3} />}
            {trend === 'down' && <TrendingDown className="w-3.5 h-3.5 mr-1" strokeWidth={3} />}
            {trend === 'neutral' && <Minus className="w-3.5 h-3.5 mr-1" strokeWidth={3} />}
            {trendValue}
          </span>
          <span className="text-slate-400 ml-2 text-xs font-medium">vs last month</span>
        </div>

        {sparklineData && (
          <div className="h-10 w-24 opacity-80 group-hover:opacity-100 transition-opacity">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparklineData}>
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke={theme.stroke} 
                  strokeWidth={2.5} 
                  dot={false}
                  isAnimationActive={true}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </motion.div>
  );
}
