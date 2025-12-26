
import React, { useState, useEffect } from 'react';
import { 
  Users, 
  HeartPulse, 
  HandHelping, 
  History, 
  LayoutDashboard, 
  LogOut, 
  Menu, 
  X,
  Plus,
  Bell,
  Settings,
  ShieldCheck,
  User as UserIcon,
  Lock,
  ArrowLeft
} from 'lucide-react';
import { User, UserRole, ViewType, SeniorCitizen, AuditLog } from './types.ts';
import { storage, seedInitialData } from './storage.ts';
import Dashboard from './components/Dashboard.tsx';
import Registry from './components/Registry.tsx';
import MedicalRecords from './components/MedicalRecords.tsx';
import Assistance from './components/Assistance.tsx';
import AuditTrail from './components/AuditTrail.tsx';

const ROLE_PASSWORDS: Record<UserRole, string> = {
  [UserRole.ADMIN]: 'admin123',
  [UserRole.STAFF]: 'staff123',
  [UserRole.HEALTH_WORKER]: 'health123'
};

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(storage.getCurrentUser());
  const [activeView, setActiveView] = useState<ViewType>('DASHBOARD');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [seniors, setSeniors] = useState<SeniorCitizen[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);

  // Login State
  const [pendingRole, setPendingRole] = useState<UserRole | null>(null);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    seedInitialData();
    setSeniors(storage.getSeniors());
    setLogs(storage.getAuditLogs());
  }, []);

  const handleRoleSelect = (role: UserRole) => {
    setPendingRole(role);
    setLoginError('');
    setPassword('');
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingRole) return;

    if (password === ROLE_PASSWORDS[pendingRole]) {
      const mockUser: User = {
        id: pendingRole.toLowerCase(),
        username: pendingRole.toLowerCase(),
        role: pendingRole,
        fullName: `${pendingRole.charAt(0) + pendingRole.slice(1).toLowerCase()} Officer`
      };
      storage.setCurrentUser(mockUser);
      setCurrentUser(mockUser);
      storage.addAuditLog({ action: 'Login', details: `User logged in as ${pendingRole}` }, mockUser);
      setPendingRole(null);
      setPassword('');
    } else {
      setLoginError('Invalid password. Please try again.');
    }
  };

  const handleLogout = () => {
    if (currentUser) {
      storage.addAuditLog({ action: 'Logout', details: 'User logged out' }, currentUser);
    }
    storage.setCurrentUser(null);
    setCurrentUser(null);
  };

  const refreshData = () => {
    setSeniors(storage.getSeniors());
    setLogs(storage.getAuditLogs());
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 p-6">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full transition-all duration-300">
          <div className="text-center mb-8">
            <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-8 h-8 text-indigo-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">Barangay Mapatag</h1>
            <p className="text-slate-500 text-sm">Senior Citizen Profiling System</p>
          </div>
          
          {!pendingRole ? (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <p className="text-center text-sm font-medium text-slate-400 mb-2">Select your access level</p>
              <button 
                onClick={() => handleRoleSelect(UserRole.ADMIN)}
                className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-xl transition-all group"
              >
                <div className="flex items-center gap-3">
                  <Settings className="w-5 h-5 text-slate-400 group-hover:text-indigo-500" />
                  <span className="font-semibold text-slate-700">Administrator</span>
                </div>
                <Plus className="w-4 h-4 text-slate-400" />
              </button>
              <button 
                onClick={() => handleRoleSelect(UserRole.STAFF)}
                className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 rounded-xl transition-all group"
              >
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-slate-400 group-hover:text-emerald-500" />
                  <span className="font-semibold text-slate-700">Barangay Staff</span>
                </div>
                <Plus className="w-4 h-4 text-slate-400" />
              </button>
              <button 
                onClick={() => handleRoleSelect(UserRole.HEALTH_WORKER)}
                className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-xl transition-all group"
              >
                <div className="flex items-center gap-3">
                  <HeartPulse className="w-5 h-5 text-slate-400 group-hover:text-rose-500" />
                  <span className="font-semibold text-slate-700">Health Worker</span>
                </div>
                <Plus className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          ) : (
            <form onSubmit={handleLoginSubmit} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex items-center gap-2 text-indigo-600 mb-2">
                <button 
                  type="button" 
                  onClick={() => setPendingRole(null)}
                  className="p-1 hover:bg-indigo-50 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <span className="font-bold uppercase text-xs tracking-wider">Logging in as {pendingRole}</span>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Access Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    autoFocus
                    type="password"
                    placeholder="Enter password..."
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                {loginError && <p className="mt-2 text-xs text-rose-500 font-medium">{loginError}</p>}
                <p className="mt-4 text-[10px] text-slate-400 bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <span className="font-bold">Tip:</span> Use <span className="text-slate-600 font-mono">{ROLE_PASSWORDS[pendingRole]}</span> for this demo.
                </p>
              </div>

              <button 
                type="submit"
                className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20"
              >
                Verify & Continue
              </button>
            </form>
          )}
          
          <p className="mt-8 text-[10px] text-center text-slate-400 uppercase tracking-widest font-bold">
            &copy; 2026 Barangay Mapatag IT Services
          </p>
        </div>
      </div>
    );
  }

  const menuItems = [
    { id: 'DASHBOARD', label: 'Dashboard', icon: LayoutDashboard, roles: [UserRole.ADMIN, UserRole.STAFF, UserRole.HEALTH_WORKER] },
    { id: 'REGISTRY', label: 'Senior Registry', icon: Users, roles: [UserRole.ADMIN, UserRole.STAFF] },
    { id: 'MEDICAL', label: 'Health Profiling', icon: HeartPulse, roles: [UserRole.ADMIN, UserRole.HEALTH_WORKER] },
    { id: 'ASSISTANCE', label: 'Benefits Tracking', icon: HandHelping, roles: [UserRole.ADMIN, UserRole.STAFF] },
    { id: 'AUDIT', label: 'Audit Logs', icon: History, roles: [UserRole.ADMIN] },
  ];

  const filteredMenu = menuItems.filter(item => item.roles.includes(currentUser.role));

  return (
    <div className="min-h-screen flex bg-slate-50">
      <aside 
        className={`${isSidebarOpen ? 'w-64' : 'w-20'} fixed md:relative h-full bg-slate-900 text-white transition-all duration-300 z-50 flex flex-col`}
      >
        <div className="p-4 flex items-center justify-between border-b border-slate-800">
          <div className={`flex items-center gap-3 ${!isSidebarOpen && 'hidden md:flex'}`}>
            <ShieldCheck className="w-8 h-8 text-indigo-400" />
            {isSidebarOpen && <span className="font-bold text-lg tracking-tight">MAPATAG</span>}
          </div>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-slate-800 rounded-lg">
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {filteredMenu.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id as ViewType)}
              className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all ${
                activeView === item.id 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {isSidebarOpen && <span className="font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={handleLogout}
            className={`w-full flex items-center gap-4 p-3 text-rose-400 hover:bg-rose-400/10 rounded-xl transition-all`}
          >
            <LogOut className="w-5 h-5" />
            {isSidebarOpen && <span className="font-medium">Sign Out</span>}
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-slate-800 hidden sm:block">
              {menuItems.find(i => i.id === activeView)?.label}
            </h2>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 border border-slate-200 rounded-full">
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                <UserIcon className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-bold text-slate-800 leading-none">{currentUser.fullName}</p>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{currentUser.role}</p>
              </div>
            </div>
            <button className="p-2 text-slate-400 hover:text-indigo-600 relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          {activeView === 'DASHBOARD' && <Dashboard seniors={seniors} logs={logs} />}
          {activeView === 'REGISTRY' && <Registry seniors={seniors} onRefresh={refreshData} currentUser={currentUser} />}
          {activeView === 'MEDICAL' && <MedicalRecords seniors={seniors} onRefresh={refreshData} currentUser={currentUser} />}
          {activeView === 'ASSISTANCE' && <Assistance seniors={seniors} onRefresh={refreshData} currentUser={currentUser} />}
          {activeView === 'AUDIT' && <AuditTrail logs={logs} />}
        </div>
      </main>
    </div>
  );
};

export default App;
