
import React, { useState } from 'react';
import { Search, HandHelping, Plus, Calendar, CheckCircle, Clock, FileText, X } from 'lucide-react';
import { SeniorCitizen, User, AssistanceRecord } from '../types.ts';
import { storage } from '../storage.ts';

interface AssistanceProps {
  seniors: SeniorCitizen[];
  currentUser: User;
  onRefresh: () => void;
}

const Assistance: React.FC<AssistanceProps> = ({ seniors, currentUser, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedForAssistance, setSelectedForAssistance] = useState<SeniorCitizen | null>(null);
  const [assistanceForm, setAssistanceForm] = useState<Partial<AssistanceRecord>>({
    type: 'Social Pension',
    status: 'Received',
    description: ''
  });

  const filteredSeniors = seniors.filter(s => 
    s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.scid.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleGrantAssistance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedForAssistance) return;

    const newRecord: AssistanceRecord = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      type: assistanceForm.type as string,
      status: assistanceForm.status as any,
      description: assistanceForm.description as string,
      encodedBy: currentUser.fullName
    };

    const updatedSeniors = seniors.map(s => 
      s.id === selectedForAssistance.id 
        ? { ...s, assistance: [newRecord, ...s.assistance] } 
        : s
    );

    storage.saveSeniors(updatedSeniors);
    storage.addAuditLog({ 
      action: 'Assistance Granted', 
      details: `Granted ${newRecord.type} to: ${selectedForAssistance.fullName}` 
    }, currentUser);

    setSelectedForAssistance(null);
    setAssistanceForm({ type: 'Social Pension', status: 'Received', description: '' });
    onRefresh();
  };

  return (
    <div className="space-y-6">
      <div className="bg-indigo-600 p-6 sm:p-8 rounded-2xl sm:rounded-3xl text-white shadow-xl shadow-indigo-600/20">
        <div className="flex items-center gap-3 sm:gap-4 mb-4">
          <HandHelping className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-200" />
          <h2 className="text-xl sm:text-3xl font-bold">Benefits Tracking</h2>
        </div>
        <p className="text-indigo-100 max-w-xl text-sm sm:text-base">Search and select a senior citizen to record distributed benefits or relief goods.</p>
        
        <div className="mt-6 sm:mt-8 relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-indigo-300" />
          <input 
            type="text" 
            placeholder="Search name or SCID..."
            className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl sm:rounded-2xl outline-none focus:bg-white focus:text-slate-800 placeholder:text-indigo-200 transition-all text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-left">
                <th className="px-4 sm:px-6 py-4 text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest">Senior Citizen</th>
                <th className="px-4 sm:px-6 py-4 text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest">Purok</th>
                <th className="px-4 sm:px-6 py-4 text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest">Recent Assistance</th>
                <th className="px-4 sm:px-6 py-4 text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSeniors.map((senior) => (
                <tr key={senior.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 sm:px-6 py-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <img src={senior.photoUrl || `https://picsum.photos/seed/${senior.id}/200`} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover shrink-0" alt="" />
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 text-xs sm:text-sm truncate">{senior.fullName}</p>
                        <p className="text-[9px] sm:text-[10px] font-bold text-indigo-500 uppercase">{senior.scid}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-4">
                    <span className="px-2 py-0.5 sm:py-1 bg-slate-100 rounded text-[10px] sm:text-xs text-slate-600 font-bold whitespace-nowrap">{senior.purok}</span>
                  </td>
                  <td className="px-4 sm:px-6 py-4">
                    {senior.assistance.length > 0 ? (
                      <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs">
                        <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="text-slate-600 font-medium truncate max-w-[80px] sm:max-w-none">{senior.assistance[0].type}</span>
                        <span className="text-slate-400 whitespace-nowrap">({new Date(senior.assistance[0].date).toLocaleDateString()})</span>
                      </div>
                    ) : (
                      <span className="text-[10px] sm:text-xs text-slate-400 italic">No history</span>
                    )}
                  </td>
                  <td className="px-4 sm:px-6 py-4 text-right">
                    <button 
                      onClick={() => setSelectedForAssistance(senior)}
                      className="inline-flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold transition-all whitespace-nowrap"
                    >
                      <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Record
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedForAssistance && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 sm:p-6 border-b border-slate-100 flex justify-between items-center bg-indigo-50/50">
              <h3 className="text-lg font-bold text-slate-800 truncate pr-4">Log Assistance</h3>
              <button onClick={() => setSelectedForAssistance(null)} className="p-2 hover:bg-white rounded-full transition-colors shrink-0"><X className="w-6 h-6 text-slate-400" /></button>
            </div>
            <form onSubmit={handleGrantAssistance} className="p-4 sm:p-6 space-y-4 overflow-y-auto">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3">
                <img src={selectedForAssistance.photoUrl || `https://picsum.photos/seed/${selectedForAssistance.id}/200`} className="w-10 h-10 rounded-lg object-cover shrink-0" alt="" />
                <div className="min-w-0">
                  <h4 className="font-bold text-slate-800 text-sm truncate">{selectedForAssistance.fullName}</h4>
                  <p className="text-[10px] text-indigo-600 font-bold">{selectedForAssistance.scid}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Assistance Type</label>
                  <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm" value={assistanceForm.type} onChange={e => setAssistanceForm({...assistanceForm, type: e.target.value})}><option>Social Pension</option><option>Financial Assistance</option><option>Medical Mission Goods</option><option>Relief Goods / Food Pack</option></select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Status</label>
                  <div className="flex gap-3">
                    {['Received', 'Pending'].map(s => (
                      <button key={s} type="button" onClick={() => setAssistanceForm({...assistanceForm, status: s as any})} className={`flex-1 py-2 rounded-xl border-2 font-bold text-xs transition-all ${assistanceForm.status === s ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-100 text-slate-400'}`}>{s}</button>
                    ))}
                  </div>
                </div>
                <button type="submit" className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 text-sm mt-4"><FileText className="w-4 h-4" /> Record Grant</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Assistance;
