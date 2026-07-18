import { FiSearch } from 'react-icons/fi';

export default function SearchBar({ value, onChange, placeholder = 'Search...' }) {
  return (
    <div className="relative w-full sm:max-w-xs">
      <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
      <input
        type="text"
        className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all shadow-sm"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
