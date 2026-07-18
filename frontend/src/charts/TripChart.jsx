import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1f2937]/95 backdrop-blur-xl border border-[#374151] p-4 rounded-xl shadow-2xl text-white">
        <p className="font-semibold text-slate-400 mb-1.5 uppercase text-xs tracking-wider">{label}</p>
        <p className="text-xl font-bold text-white flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#CCFF00] shadow-[0_0_12px_rgba(204,255,0,0.8)]"></span>
          {payload[0].value} Trips
        </p>
      </div>
    );
  }
  return null;
};

export default function TripChart({ data = [] }) {
  if (!data?.length) return <div className="h-64 flex items-center justify-center text-slate-400">No data available</div>;

  return (
    <div className="h-full w-full text-sm min-h-[250px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 20, right: 10, left: -25, bottom: 0 }}>
          <defs>
            <linearGradient id="colorTrips" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#CCFF00" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="#CCFF00" stopOpacity={0.0}/>
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <CartesianGrid strokeDasharray="6 6" vertical={false} stroke="#374151" strokeOpacity={0.6} />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} 
            dy={15} 
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }} 
            dx={-10}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#CCFF00', strokeWidth: 1, strokeDasharray: '4 4' }} />
          <Area 
            type="monotone" 
            dataKey="trips" 
            stroke="#CCFF00" 
            strokeWidth={4} 
            fillOpacity={1} 
            fill="url(#colorTrips)" 
            activeDot={{ r: 6, fill: '#1f2937', stroke: '#CCFF00', strokeWidth: 3, shadow: '0 0 10px rgba(204,255,0,0.8)' }}
            style={{ filter: 'url(#glow)' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
