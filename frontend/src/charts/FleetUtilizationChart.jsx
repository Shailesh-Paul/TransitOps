import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1f2937]/95 backdrop-blur-xl border border-[#374151] p-4 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="w-3.5 h-3.5 rounded-full shadow-sm" style={{ backgroundColor: payload[0].payload.fill || payload[0].color }} />
          <div>
            <p className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">{payload[0].name}</p>
            <p className="text-xl font-black text-white leading-tight mt-0.5">{payload[0].value} <span className="text-sm font-medium text-slate-500">Vehicles</span></p>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export default function FleetUtilizationChart({ data = [] }) {
  const COLORS = ['#CCFF00', '#FF4444', '#374151']; // Active, Maintenance, Inactive
  
  if (!data?.length) return <div className="h-64 flex items-center justify-center text-slate-400">No data available</div>;

  return (
    <div className="h-full w-full min-h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            innerRadius={90}
            outerRadius={120}
            paddingAngle={8}
            dataKey="value"
            cornerRadius={8}
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} style={{ filter: 'drop-shadow(0px 6px 10px rgba(0,0,0,0.08))' }} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="bottom" 
            height={36} 
            iconType="circle"
            formatter={(value) => <span className="text-slate-400 font-semibold ml-2">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
