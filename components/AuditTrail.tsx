
import React, { useMemo } from 'react';
import { History, Search, Download, Shield } from 'lucide-react';
import { AuditLog } from '../types.ts';

interface AuditTrailProps {
  logs: AuditLog[];
}

const AuditTrail: React.FC<AuditTrailProps> = ({ logs }) => {
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredLogs = useMemo(() => {
    return logs.filter(l => 
      l.userName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      l.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.details.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [logs, searchTerm]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-800 text-white rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0">
            <History className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg sm:text-2xl font-bold text-slate-800 truncate pr-4">System Audit Trail</h2>
            <p className="text-slate-500 text-[10px] sm:text-sm truncate">Transactions and security logs</p>
          </div>
        </div>
        <button 
          onClick={() => window.print()}
          className="flex items-center justify-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 font-bold hover:bg-slate-50 transition-all shadow-sm text-sm w-full sm:w-auto"
        >
          <Download className="w-4 h-4 sm:w-5 sm:h-5" /> Export
        </button>
      </div>

      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 flex items-center gap-4 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search logs..."
            className="w-full pl-9 sm:pl-11 pr-4 py-2 sm:py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-800 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-900 text-white text-left">
                <th className="px-4 py-3 text-[10px] sm:text-xs font-bold uppercase tracking-widest border-r border-slate-800">Timestamp</th>
                <th className="px-4 py-3 text-[10px] sm:text-xs font-bold uppercase tracking-widest border-r border-slate-800">User</th>
                <th className="px-4 py-3 text-[10px] sm:text-xs font-bold uppercase tracking-widest border-r border-slate-800">Action</th>
                <th className="px-4 py-3 text-[10px] sm:text-xs font-bold uppercase tracking-widest">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-4 py-3 text-[11px] sm:text-sm font-mono text-slate-400 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center shrink-0">
                        <Shield className="w-3.5 h-3.5 text-slate-500" />
                      </div>
                      <span className="text-[11px] sm:text-sm font-bold text-slate-700 truncate max-w-[100px] sm:max-w-none">{log.userName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-bold uppercase whitespace-nowrap inline-block ${
                      log.action.includes('Login') ? 'bg-indigo-100 text-indigo-700' :
                      log.action.includes('Delete') ? 'bg-rose-100 text-rose-700' :
                      log.action.includes('Update') ? 'bg-amber-100 text-amber-700' :
                      'bg-emerald-100 text-emerald-700'
                    }`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[11px] sm:text-sm text-slate-600 min-w-[200px] leading-relaxed">
                    {log.details}
                  </td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-12 sm:py-20 text-center">
                    <History className="w-10 h-10 sm:w-12 sm:h-12 text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-400 font-medium text-sm px-6">No system logs found.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AuditTrail;
