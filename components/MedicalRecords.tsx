
import React, { useState } from 'react';
import { Search, HeartPulse, Stethoscope, Pill, AlertTriangle, Save, X, Edit2 } from 'lucide-react';
import { SeniorCitizen, User, MedicalInfo } from '../types.ts';
import { storage } from '../storage.ts';

interface MedicalRecordsProps {
  seniors: SeniorCitizen[];
  currentUser: User;
  onRefresh: () => void;
}

const MedicalRecords: React.FC<MedicalRecordsProps> = ({ seniors, currentUser, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingSenior, setEditingSenior] = useState<SeniorCitizen | null>(null);
  const [medicalForm, setMedicalForm] = useState<MedicalInfo | null>(null);

  const filteredSeniors = seniors.filter(s => 
    s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.scid.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (senior: SeniorCitizen) => {
    setEditingSenior(senior);
    setMedicalForm({ ...senior.medicalInfo });
  };

  const handleSave = () => {
    if (!editingSenior || !medicalForm) return;

    const updatedSeniors = seniors.map(s => 
      s.id === editingSenior.id 
        ? { 
            ...s, 
            medicalInfo: { 
              ...medicalForm, 
              lastUpdated: new Date().toISOString(), 
              updatedBy: currentUser.fullName 
            } 
          } 
        : s
    );

    storage.saveSeniors(updatedSeniors);
    storage.addAuditLog({ 
      action: 'Health Update', 
      details: `Updated medical profile for: ${editingSenior.fullName}` 
    }, currentUser);
    
    setEditingSenior(null);
    setMedicalForm(null);
    onRefresh();
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Find senior by name or SCID to update health records..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-rose-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {filteredSeniors.map((senior) => (
          <div key={senior.id} className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col md:flex-row gap-6 hover:shadow-lg transition-all">
            <div className="w-full md:w-48 shrink-0">
              <img src={senior.photoUrl || `https://picsum.photos/seed/${senior.id}/200`} className="w-full h-48 rounded-xl object-cover" />
              <div className="mt-3 text-center">
                <h4 className="font-bold text-slate-800">{senior.fullName}</h4>
                <p className="text-xs text-rose-500 font-bold uppercase">{senior.scid}</p>
              </div>
            </div>
            
            <div className="flex-1 flex flex-col">
              <div className="flex-1 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-rose-100 text-rose-600 rounded-lg shrink-0">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400">Conditions</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {senior.medicalInfo.conditions.length > 0 ? senior.medicalInfo.conditions.map((c, i) => (
                        <span key={i} className="px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-100 rounded text-xs font-medium">{c}</span>
                      )) : <span className="text-xs text-slate-400 italic">None recorded</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-lg shrink-0">
                    <Pill className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400">Medications</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {senior.medicalInfo.medications.length > 0 ? senior.medicalInfo.medications.map((m, i) => (
                        <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded text-xs font-medium">{m}</span>
                      )) : <span className="text-xs text-slate-400 italic">None recorded</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-amber-100 text-amber-600 rounded-lg shrink-0">
                    <Stethoscope className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400">Limitations / Notes</p>
                    <p className="text-xs text-slate-600 mt-1">{senior.medicalInfo.limitations || 'No specific limitations noted.'}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-50">
                <p className="text-[10px] text-slate-400 italic">Last updated: {new Date(senior.medicalInfo.lastUpdated).toLocaleDateString()}</p>
                <button 
                  onClick={() => handleEdit(senior)}
                  className="flex items-center gap-2 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-rose-500/20 transition-all"
                >
                  <Edit2 className="w-4 h-4" />
                  Update Vitals
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editingSenior && medicalForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-rose-50">
              <div className="flex items-center gap-3">
                <HeartPulse className="w-6 h-6 text-rose-500" />
                <h3 className="text-xl font-bold text-slate-800">Update Health Profile</h3>
              </div>
              <button onClick={() => setEditingSenior(null)} className="p-2 hover:bg-white rounded-full">
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
                <img src={editingSenior.photoUrl || `https://picsum.photos/seed/${editingSenior.id}/200`} className="w-12 h-12 rounded-xl object-cover" />
                <div>
                  <h4 className="font-bold text-slate-800">{editingSenior.fullName}</h4>
                  <p className="text-xs text-slate-400">{editingSenior.scid} • {editingSenior.age} years old</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Conditions (Comma separated)</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  placeholder="e.g. Hypertension, Diabetes"
                  value={medicalForm.conditions.join(', ')}
                  onChange={(e) => setMedicalForm({...medicalForm, conditions: e.target.value.split(',').map(s => s.trim()).filter(s => s !== '')})}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Medications (Comma separated)</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  placeholder="e.g. Losartan, Metformin"
                  value={medicalForm.medications.join(', ')}
                  onChange={(e) => setMedicalForm({...medicalForm, medications: e.target.value.split(',').map(s => s.trim()).filter(s => s !== '')})}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Physical Limitations / Urgent Notes</label>
                <textarea 
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl h-24 resize-none"
                  value={medicalForm.limitations}
                  onChange={(e) => setMedicalForm({...medicalForm, limitations: e.target.value})}
                />
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setEditingSenior(null)}
                  className="flex-1 py-3 border border-slate-200 rounded-xl font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSave}
                  className="flex-1 py-3 bg-rose-500 text-white rounded-xl font-bold hover:bg-rose-600 transition-all flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  Save Records
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicalRecords;
