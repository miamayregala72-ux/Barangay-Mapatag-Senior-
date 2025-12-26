
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
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-slate-800 text-white rounded-2xl flex items-center justify-center">
            <History className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">System Audit Trail</h2>
            <p className="text-slate-500 text-sm">Review all transactions and security logs</p>
          </div>
        </div>
        <button 
          onClick={() => window.print()}
          className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 font-bold hover:bg-slate-50 transition-all shadow-sm"
        >
          <Download className="w-5 h-5" />
          Export Log
        </button>
      </div>

      <div className="bg-white p-4 rounded-3xl border border-slate-200 flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search logs by user, action, or keyword..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-slate-800"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white text-left">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest border-r border-slate-800">Timestamp</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest border-r border-slate-800">User</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest border-r border-slate-800">Action</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4 text-sm font-mono text-slate-400">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-slate-100 rounded-full flex items-center justify-center">
                        <Shield className="w-3.5 h-3.5 text-slate-500" />
                      </div>
                      <span className="text-sm font-bold text-slate-700">{log.userName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                      log.action.includes('Login') ? 'bg-indigo-100 text-indigo-700' :
                      log.action.includes('Delete') ? 'bg-rose-100 text-rose-700' :
                      log.action.includes('Update') ? 'bg-amber-100 text-amber-700' :
                      'bg-emerald-100 text-emerald-700'
                    }`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {log.details}
                  </td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-20 text-center">
                    <History className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-400 font-medium">No system logs found.</p>
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
