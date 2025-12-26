
import React, { useState, useMemo } from 'react';
import { Search, Plus, UserPlus, Edit2, Trash2, Eye, X, CheckCircle, Users } from 'lucide-react';
import { SeniorCitizen, User } from '../types.ts';
import { storage } from '../storage.ts';

interface RegistryProps {
  seniors: SeniorCitizen[];
  currentUser: User;
  onRefresh: () => void;
}

const Registry: React.FC<RegistryProps> = ({ seniors, currentUser, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedSenior, setSelectedSenior] = useState<SeniorCitizen | null>(null);
  const [formData, setFormData] = useState<Partial<SeniorCitizen>>({
    fullName: '',
    birthdate: '',
    sex: 'Male',
    address: '',
    purok: 'Purok 1',
    civilStatus: 'Single',
    contact: '',
    emergencyContact: {
        name: '',
        relationship: '',
        phone: ''
    }
  });

  const filteredSeniors = useMemo(() => {
    return seniors.filter(s => 
      s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      s.scid.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [seniors, searchTerm]);

  const calculateAge = (birthdate: string) => {
    const today = new Date();
    const birth = new Date(birthdate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const age = calculateAge(formData.birthdate as string);
    if (age < 60) {
      alert("Senior citizens must be at least 60 years old.");
      return;
    }

    const currentSeniors = storage.getSeniors();
    const newSenior: SeniorCitizen = {
      id: crypto.randomUUID(),
      scid: `SC-${new Date().getFullYear()}-${String(currentSeniors.length + 1).padStart(3, '0')}`,
      fullName: formData.fullName as string,
      birthdate: formData.birthdate as string,
      age: age,
      sex: formData.sex as 'Male' | 'Female',
      address: formData.address as string,
      purok: formData.purok as string,
      civilStatus: formData.civilStatus as any,
      contact: formData.contact as string,
      emergencyContact: formData.emergencyContact as any,
      dateRegistered: new Date().toISOString().split('T')[0],
      medicalInfo: {
        conditions: [],
        allergies: [],
        medications: [],
        limitations: '',
        lastUpdated: new Date().toISOString(),
        updatedBy: currentUser.fullName
      },
      assistance: []
    };

    storage.saveSeniors([...currentSeniors, newSenior]);
    storage.addAuditLog({ action: 'Registration', details: `Registered new senior: ${newSenior.fullName}` }, currentUser);
    setShowAddModal(false);
    onRefresh();
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove ${name}?`)) {
      const remaining = seniors.filter(s => s.id !== id);
      storage.saveSeniors(remaining);
      storage.addAuditLog({ action: 'Deletion', details: `Deleted senior record: ${name}` }, currentUser);
      onRefresh();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by name or SCID..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl font-bold transition-all shadow-lg shadow-indigo-600/20 w-full sm:w-auto"
        >
          <UserPlus className="w-5 h-5" />
          <span>New Registration</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredSeniors.map((senior) => (
          <div key={senior.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all group">
            <div className="p-5 flex gap-4">
              <div className="relative">
                <img 
                  src={senior.photoUrl || `https://picsum.photos/seed/${senior.id}/200`} 
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-slate-100" 
                  alt={senior.fullName}
                />
                <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full border-2 border-white">
                  <CheckCircle className="w-3 h-3" />
                </span>
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-1">{senior.scid}</p>
                <h4 className="font-bold text-slate-800 text-lg truncate">{senior.fullName}</h4>
                <p className="text-sm text-slate-500">{senior.age} years old • {senior.sex}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[10px] font-bold uppercase">{senior.purok}</span>
                  <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-md text-[10px] font-bold uppercase">{senior.civilStatus}</span>
                </div>
              </div>
            </div>
            <div className="px-5 pb-5 flex items-center justify-between border-t border-slate-50 pt-4">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setSelectedSenior(senior)}
                  className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
                  title="View Profile"
                >
                  <Eye className="w-5 h-5" />
                </button>
                <button 
                  className="p-2 text-slate-400 hover:text-emerald-600 transition-colors"
                  title="Edit Record"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
              </div>
              <button 
                onClick={() => handleDelete(senior.id, senior.fullName)}
                className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                title="Remove Member"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
        {filteredSeniors.length === 0 && (
          <div className="col-span-full py-12 text-center bg-white rounded-2xl border-2 border-dashed border-slate-200">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No records found matching your search.</p>
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-indigo-50/50">
              <h3 className="text-xl font-bold text-slate-800">New Senior Registration</h3>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-white rounded-full transition-colors">
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 overflow-y-auto max-h-[80vh]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
                  <input 
                    required 
                    type="text" 
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" 
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Date of Birth</label>
                  <input 
                    required 
                    type="date" 
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" 
                    value={formData.birthdate}
                    onChange={(e) => setFormData({...formData, birthdate: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Sex</label>
                  <select 
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                    value={formData.sex}
                    onChange={(e) => setFormData({...formData, sex: e.target.value as any})}
                  >
                    <option>Male</option>
                    <option>Female</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Purok</label>
                  <select 
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                    value={formData.purok}
                    onChange={(e) => setFormData({...formData, purok: e.target.value})}
                  >
                    <option>Purok 1</option>
                    <option>Purok 2</option>
                    <option>Purok 3</option>
                    <option>Purok 4</option>
                    <option>Purok 5</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Civil Status</label>
                  <select 
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                    value={formData.civilStatus}
                    onChange={(e) => setFormData({...formData, civilStatus: e.target.value as any})}
                  >
                    <option>Single</option>
                    <option>Married</option>
                    <option>Widowed</option>
                    <option>Separated</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Complete Address</label>
                  <input 
                    required 
                    type="text" 
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" 
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                  />
                </div>
              </div>
              <div className="mt-8 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/20"
                >
                  Register Senior
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedSenior && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-200">
            <div className="relative h-32 bg-indigo-600">
              <button 
                onClick={() => setSelectedSenior(null)}
                className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/40 rounded-full text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 pb-8 -mt-16 text-center">
              <img 
                src={selectedSenior.photoUrl || `https://picsum.photos/seed/${selectedSenior.id}/200`} 
                className="w-32 h-32 rounded-3xl object-cover border-4 border-white shadow-xl mx-auto" 
              />
              <h3 className="mt-4 text-2xl font-bold text-slate-800">{selectedSenior.fullName}</h3>
              <p className="text-indigo-600 font-bold tracking-widest">{selectedSenior.scid}</p>
              
              <div className="mt-6 grid grid-cols-2 gap-4 text-left">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Birthdate</p>
                  <p className="font-semibold text-slate-700">{new Date(selectedSenior.birthdate).toLocaleDateString()}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Age / Sex</p>
                  <p className="font-semibold text-slate-700">{selectedSenior.age} / {selectedSenior.sex}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Purok</p>
                  <p className="font-semibold text-slate-700">{selectedSenior.purok}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Civil Status</p>
                  <p className="font-semibold text-slate-700">{selectedSenior.civilStatus}</p>
                </div>
              </div>
              
              <div className="mt-4 p-4 bg-indigo-50 border border-indigo-100 rounded-xl text-left">
                <p className="text-[10px] uppercase font-bold text-indigo-400 mb-2">Emergency Contact</p>
                <p className="font-bold text-slate-800">{selectedSenior.emergencyContact.name}</p>
                <p className="text-sm text-slate-600">{selectedSenior.emergencyContact.relationship} • {selectedSenior.emergencyContact.phone}</p>
              </div>

              <button 
                onClick={() => window.print()}
                className="mt-6 w-full py-3 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-900 transition-colors"
              >
                Print Senior ID / Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Registry;
