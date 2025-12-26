
import React, { useState } from 'react';
import { Search, HandHelping, Plus, Calendar, CheckCircle, Clock, FileText, X } from 'lucide-react';
import { SeniorCitizen, User, AssistanceRecord } from '../types';
import { storage } from '../storage';

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
      <div className="bg-indigo-600 p-8 rounded-3xl text-white shadow-xl shadow-indigo-600/20">
        <div className="flex items-center gap-4 mb-4">
          <HandHelping className="w-10 h-10 text-indigo-200" />
          <h2 className="text-3xl font-bold">Benefits Distribution</h2>
        </div>
        <p className="text-indigo-100 max-w-xl">Search and select a senior citizen to record distributed benefits, relief goods, or financial assistance.</p>
        
        <div className="mt-8 relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-300" />
          <input 
            type="text" 
            placeholder="Search by name or ID..."
            className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl outline-none focus:bg-white focus:text-slate-800 placeholder:text-indigo-200 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-left">
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Senior Citizen</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Purok</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Recent Assistance</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredSeniors.map((senior) => (
              <tr key={senior.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img src={senior.photoUrl || `https://picsum.photos/seed/${senior.id}/200`} className="w-10 h-10 rounded-full object-cover" />
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{senior.fullName}</p>
                      <p className="text-[10px] font-bold text-indigo-500 uppercase">{senior.scid}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-slate-100 rounded text-xs text-slate-600 font-bold">{senior.purok}</span>
                </td>
                <td className="px-6 py-4">
                  {senior.assistance.length > 0 ? (
                    <div className="flex items-center gap-2 text-xs">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span className="text-slate-600 font-medium">{senior.assistance[0].type}</span>
                      <span className="text-slate-400">({new Date(senior.assistance[0].date).toLocaleDateString()})</span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400 italic">No history</span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => setSelectedForAssistance(senior)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-xl text-xs font-bold transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    Record Grant
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredSeniors.length === 0 && (
          <div className="py-20 text-center">
            <HandHelping className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-400 font-medium">No senior records found matching search criteria.</p>
          </div>
        )}
      </div>

      {/* Grant Assistance Modal */}
      {selectedForAssistance && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-indigo-50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white">
                  <HandHelping className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800">Record Grant</h3>
                  <p className="text-xs text-slate-500">Log distributed items or pension</p>
                </div>
              </div>
              <button onClick={() => setSelectedForAssistance(null)} className="p-2 hover:bg-white rounded-full">
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>
            
            <form onSubmit={handleGrantAssistance} className="p-8 space-y-6">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-4">
                <img src={selectedForAssistance.photoUrl || `https://picsum.photos/seed/${selectedForAssistance.id}/200`} className="w-14 h-14 rounded-xl object-cover" />
                <div>
                  <h4 className="font-bold text-slate-800">{selectedForAssistance.fullName}</h4>
                  <p className="text-xs text-indigo-600 font-bold tracking-widest">{selectedForAssistance.scid}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Assistance Type</label>
                <select 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:ring-2 focus:ring-indigo-500"
                  value={assistanceForm.type}
                  onChange={(e) => setAssistanceForm({...assistanceForm, type: e.target.value})}
                >
                  <option>Social Pension</option>
                  <option>Financial Assistance</option>
                  <option>Medical Mission Goods</option>
                  <option>Relief Goods / Food Pack</option>
                  <option>Educational Grant</option>
                  <option>Other Benefits</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Status</label>
                <div className="flex gap-4">
                  {['Received', 'Pending'].map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setAssistanceForm({...assistanceForm, status: status as any})}
                      className={`flex-1 py-3 rounded-xl border-2 font-bold transition-all flex items-center justify-center gap-2 ${
                        assistanceForm.status === status 
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                        : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                      }`}
                    >
                      {status === 'Received' ? <CheckCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Description / Notes</label>
                <textarea 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl h-24 resize-none placeholder:text-slate-300"
                  placeholder="e.g. Distributed by Purok Leader, includes 5kg rice..."
                  value={assistanceForm.description}
                  onChange={(e) => setAssistanceForm({...assistanceForm, description: e.target.value})}
                />
              </div>

              <div className="flex gap-4">
                <button 
                  type="button"
                  onClick={() => setSelectedForAssistance(null)}
                  className="flex-1 py-4 border border-slate-200 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2"
                >
                  <FileText className="w-5 h-5" />
                  Grant Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Assistance;
