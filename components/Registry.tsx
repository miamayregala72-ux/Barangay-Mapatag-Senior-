
import React, { useState, useMemo } from 'react';
import { Search, Plus, UserPlus, Edit2, Trash2, Eye, X, CheckCircle, Users, Save } from 'lucide-react';
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
  const [seniorToEdit, setSeniorToEdit] = useState<SeniorCitizen | null>(null);
  const [selectedSenior, setSelectedSenior] = useState<SeniorCitizen | null>(null);
  
  const [formData, setFormData] = useState<Partial<SeniorCitizen>>({
    fullName: '',
    birthdate: '',
    sex: 'Male',
    address: '',
    purok: 'Purok 1',
    civilStatus: 'Single',
    contact: '',
    emergencyContact: { name: '', relationship: '', phone: '' }
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

  const handleAddNew = () => {
    setFormData({
      fullName: '',
      birthdate: '',
      sex: 'Male',
      address: '',
      purok: 'Purok 1',
      civilStatus: 'Single',
      contact: '',
      emergencyContact: { name: '', relationship: '', phone: '' }
    });
    setShowAddModal(true);
  };

  const handleEditClick = (senior: SeniorCitizen) => {
    setFormData({
      fullName: senior.fullName,
      birthdate: senior.birthdate,
      sex: senior.sex,
      address: senior.address,
      purok: senior.purok,
      civilStatus: senior.civilStatus,
      contact: senior.contact,
      emergencyContact: { ...senior.emergencyContact }
    });
    setSeniorToEdit(senior);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const age = calculateAge(formData.birthdate as string);
    if (age < 60) {
      alert("Senior citizens must be at least 60 years old.");
      return;
    }

    const currentSeniors = storage.getSeniors();
    if (seniorToEdit) {
      const updatedSeniors = currentSeniors.map(s => 
        s.id === seniorToEdit.id ? { ...s, ...formData, age } : s
      );
      storage.saveSeniors(updatedSeniors as SeniorCitizen[]);
      storage.addAuditLog({ action: 'Update Record', details: `Updated: ${seniorToEdit.fullName}` }, currentUser);
      setSeniorToEdit(null);
    } else {
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
      storage.addAuditLog({ action: 'Registration', details: `Registered: ${newSenior.fullName}` }, currentUser);
      setShowAddModal(false);
    }
    onRefresh();
  };

  return (
    <div className="space-y-6">
      {/* Search Header - Refined Grid for Mobile */}
      <div className="flex flex-col gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by name or SCID..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
          onClick={handleAddNew}
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-md shadow-indigo-600/20 text-sm whitespace-nowrap"
        >
          <UserPlus className="w-5 h-5 shrink-0" />
          <span>New Registration</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredSeniors.map((senior) => (
          <div key={senior.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all flex flex-col h-full">
            <div className="p-5 flex gap-4">
              <div className="relative shrink-0">
                <img 
                  src={senior.photoUrl || `https://picsum.photos/seed/${senior.id}/200`} 
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-slate-100 shadow-sm" 
                  alt={senior.fullName}
                />
                <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full border-2 border-white">
                  <CheckCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mb-1 truncate">{senior.scid}</p>
                <h4 className="font-bold text-slate-800 text-base sm:text-lg truncate">{senior.fullName}</h4>
                <p className="text-xs text-slate-500">{senior.age} years old • {senior.sex}</p>
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[9px] font-bold uppercase">{senior.purok}</span>
                  <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[9px] font-bold uppercase">{senior.civilStatus}</span>
                </div>
              </div>
            </div>
            
            <div className="px-5 pb-5 mt-auto flex items-center justify-between border-t border-slate-50 pt-4">
              <div className="flex items-center gap-2">
                <button onClick={() => setSelectedSenior(senior)} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
                  <Eye className="w-5 h-5" />
                </button>
                <button onClick={() => handleEditClick(senior)} className="p-2 text-slate-400 hover:text-emerald-600 transition-colors">
                  <Edit2 className="w-5 h-5" />
                </button>
              </div>
              <button 
                onClick={() => { if(confirm(`Delete ${senior.fullName}?`)) { storage.saveSeniors(seniors.filter(s => s.id !== senior.id)); onRefresh(); } }} 
                className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
        
        {filteredSeniors.length === 0 && (
          <div className="col-span-full py-12 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200">
            <Users className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-400">No senior citizens found matching your search.</p>
          </div>
        )}
      </div>

      {/* Modals - Ensured z-index and fixed height on mobile */}
      {(showAddModal || seniorToEdit) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-indigo-50 shrink-0">
              <h3 className="font-bold text-slate-800">{seniorToEdit ? 'Edit Details' : 'New Registration'}</h3>
              <button onClick={() => { setShowAddModal(false); setSeniorToEdit(null); }} className="p-2 hover:bg-white rounded-full transition-colors">
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-4 sm:p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                  <input 
                    required 
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" 
                    value={formData.fullName} 
                    onChange={e => setFormData({...formData, fullName: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Birthdate</label>
                  <input 
                    required 
                    type="date" 
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" 
                    value={formData.birthdate} 
                    onChange={e => setFormData({...formData, birthdate: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Sex</label>
                  <select 
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" 
                    value={formData.sex} 
                    onChange={e => setFormData({...formData, sex: e.target.value as any})}
                  >
                    <option>Male</option><option>Female</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Address</label>
                  <input 
                    required 
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" 
                    value={formData.address} 
                    onChange={e => setFormData({...formData, address: e.target.value})} 
                  />
                </div>
              </div>
              <button type="submit" className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 mt-4 hover:bg-indigo-700 transition-colors">
                <Save className="w-5 h-5" /> {seniorToEdit ? 'Update' : 'Register'} Senior Citizen
              </button>
            </form>
          </div>
        </div>
      )}

      {selectedSenior && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="relative h-24 bg-indigo-600 shrink-0">
              <button onClick={() => setSelectedSenior(null)} className="absolute top-3 right-3 p-2 bg-white/20 hover:bg-white/40 rounded-full text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 pb-6 -mt-12 text-center overflow-y-auto">
              <img src={selectedSenior.photoUrl || `https://picsum.photos/seed/${selectedSenior.id}/200`} className="w-24 h-24 rounded-3xl object-cover border-4 border-white shadow-xl mx-auto" alt="" />
              <h3 className="mt-4 text-xl font-bold text-slate-800">{selectedSenior.fullName}</h3>
              <p className="text-indigo-600 font-bold tracking-widest text-xs">{selectedSenior.scid}</p>
              <div className="mt-6 grid grid-cols-2 gap-3 text-left">
                {[
                  { label: 'Birthdate', val: new Date(selectedSenior.birthdate).toLocaleDateString() },
                  { label: 'Age/Sex', val: `${selectedSenior.age} / ${selectedSenior.sex}` },
                  { label: 'Purok', val: selectedSenior.purok },
                  { label: 'Status', val: selectedSenior.civilStatus }
                ].map(item => (
                  <div key={item.label} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-[9px] uppercase font-bold text-slate-400 mb-0.5">{item.label}</p>
                    <p className="font-semibold text-slate-700 text-xs">{item.val}</p>
                  </div>
                ))}
              </div>
              <button onClick={() => window.print()} className="mt-6 w-full py-3 bg-slate-800 text-white rounded-xl font-bold text-sm">Print ID Card</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Registry;
