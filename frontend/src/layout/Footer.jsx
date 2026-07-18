import React from 'react';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="mt-auto py-6 px-4 sm:px-6 lg:px-8 border-t border-slate-200/60 bg-transparent">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-semantic-text-secondary">
        <div>
          <span className="font-semibold text-semantic-text-primary">TransitOps Enterprise</span>
          <span className="mx-2 hidden md:inline">&middot;</span>
          <span className="block md:inline mt-1 md:mt-0">Version 2.4.0 (Build 9842)</span>
        </div>
        <div>
          &copy; {currentYear} TransitOps Inc. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
