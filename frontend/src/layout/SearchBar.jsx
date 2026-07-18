import React from 'react';
import { Search } from 'lucide-react';

export default function SearchBar() {
  return (
    <div className="relative max-w-md w-full hidden md:block">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-4 w-4 text-slate-400" />
      </div>
      <input
        type="text"
        className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-semantic-primary focus:border-transparent transition-all"
        placeholder="Search vehicles, drivers, trips (⌘K)..."
      />
    </div>
  );
}
