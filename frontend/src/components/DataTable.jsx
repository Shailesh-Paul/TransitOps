import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import EmptyState from './EmptyState';

export default function DataTable({ columns, data, pagination }) {
  if (!data || data.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="bg-white border border-slate-100 shadow-sm rounded-xl overflow-hidden flex flex-col w-full text-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              {columns.map((col, i) => (
                <th 
                  key={i}
                  scope="col"
                  className={`px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider ${col.className || ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-100">
            {data.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-slate-50/75 transition-colors group">
                {columns.map((col, colIndex) => (
                  <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-slate-700">
                    {col.render ? col.render(row) : row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={pagination.prevPage}
              disabled={pagination.currentPage === 1}
              className="px-4 py-2 border border-slate-300 rounded-md text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50"
            >
              Prev
            </button>
            <button
              onClick={pagination.nextPage}
              disabled={pagination.currentPage === pagination.totalPages}
              className="px-4 py-2 border border-slate-300 rounded-md text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex flex-1 items-center justify-between">
            <p className="text-sm text-slate-500">
              Showing <span className="font-medium text-slate-900">{((pagination.currentPage - 1) * pagination.itemsPerPage) + 1}</span> to <span className="font-medium text-slate-900">{Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.currentData?.length + (pagination.currentPage - 1) * pagination.itemsPerPage || 0)}</span> pages
            </p>
            <nav className="inline-flex rounded-md shadow-sm">
              <button
                onClick={pagination.prevPage}
                disabled={pagination.currentPage === 1}
                className="px-3 py-2 rounded-l-md border border-slate-300 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-50 transition-colors"
              >
                <FiChevronLeft className="h-4 w-4" />
              </button>
              <div className="px-4 py-2 border-y border-slate-300 bg-white text-sm font-medium text-slate-700">
                {pagination.currentPage} / {pagination.totalPages}
              </div>
              <button
                onClick={pagination.nextPage}
                disabled={pagination.currentPage === pagination.totalPages}
                className="px-3 py-2 rounded-r-md border border-slate-300 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-50 transition-colors"
              >
                <FiChevronRight className="h-4 w-4" />
              </button>
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}
