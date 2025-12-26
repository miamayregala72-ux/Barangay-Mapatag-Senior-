
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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
    
    // Default open on desktop
    if (window.innerWidth >= 1024) {
      setIsSidebarOpen(true);
    }
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
      setLoginError('Invalid password.');
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
      <div className="min-h-screen flex items-center justify-center bg-indigo-600 p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="text-center mb-8">
            <ShieldCheck className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-slate-800">MAPATAG</h1>
            <p className="text-slate-500 text-sm">Senior Profiling System</p>
          </div>
          
          {!pendingRole ? (
            <div className="space-y-3">
              {[
                { role: UserRole.ADMIN, icon: Settings, label: 'Administrator', color: 'text-indigo-600' },
                { role: UserRole.STAFF, icon: Users, label: 'Barangay Staff', color: 'text-emerald-600' },
                { role: UserRole.HEALTH_WORKER, icon: HeartPulse, label: 'Health Worker', color: 'text-rose-600' }
              ].map(item => (
                <button 
                  key={item.role}
                  onClick={() => handleRoleSelect(item.role)}
                  className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-xl transition-all"
                >
                  <div className="flex items-center gap-4">
                    <item.icon className={`w-5 h-5 ${item.color}`} />
                    <span className="font-bold text-slate-700">{item.label}</span>
                  </div>
                  <Plus className="w-4 h-4 text-slate-300" />
                </button>
              ))}
            </div>
          ) : (
            <form onSubmit={handleLoginSubmit} className="space-y-6">
              <button type="button" onClick={() => setPendingRole(null)} className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
                <input 
                  autoFocus
                  type="password"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {loginError && <p className="mt-2 text-xs text-rose-500">{loginError}</p>}
              </div>
              <button type="submit" className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold">Sign In</button>
            </form>
          )}
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
    <div className="min-h-screen flex bg-slate-50 relative overflow-hidden">
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Fixed the w-0 and min-width issues that caused content to vanish */}
      <aside className={`
        fixed lg:relative inset-y-0 left-0 z-[70] bg-slate-900 text-white transition-all duration-300 flex flex-col shrink-0 overflow-hidden
        ${isSidebarOpen ? 'w-64 translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-20'}
      `}>
        <div className="p-4 flex items-center justify-between border-b border-slate-800 h-16 shrink-0 w-64 lg:w-auto">
          <div className={`flex items-center gap-3 ${!isSidebarOpen && 'lg:hidden'}`}>
            <ShieldCheck className="w-8 h-8 text-indigo-400" />
            <span className="font-bold text-lg tracking-tight">MAPATAG</span>
          </div>
          {/* Collapsed view logo */}
          {!isSidebarOpen && (
            <div className="hidden lg:flex justify-center w-full">
               <ShieldCheck className="w-8 h-8 text-indigo-400" />
            </div>
          )}
          <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-slate-800 rounded-lg lg:hidden">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto w-64 lg:w-auto">
          {filteredMenu.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveView(item.id as ViewType);
                if (window.innerWidth < 1024) setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all ${
                activeView === item.id 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              } ${!isSidebarOpen && 'lg:justify-center'}`}
              title={item.label}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {(isSidebarOpen || window.innerWidth < 1024) && (
                <span className="font-medium whitespace-nowrap">{item.label}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800 w-64 lg:w-auto">
          <button onClick={handleLogout} className={`w-full flex items-center gap-4 p-3 text-rose-400 hover:bg-rose-400/10 rounded-xl transition-all ${!isSidebarOpen && 'lg:justify-center'}`} title="Sign Out">
            <LogOut className="w-5 h-5 shrink-0" />
            {(isSidebarOpen || window.innerWidth < 1024) && <span className="font-medium">Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen min-w-0 relative">
        <header className="h-16 bg-white border-b border-slate-200 px-4 flex items-center justify-between shrink-0 z-50 sticky top-0">
          <div className="flex items-center gap-4 min-w-0">
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-slate-50 rounded-lg lg:hidden shrink-0">
              <Menu className="w-6 h-6 text-slate-600" />
            </button>
            <h2 className="text-lg font-bold text-slate-800 truncate">
              {menuItems.find(i => i.id === activeView)?.label}
            </h2>
          </div>
          
          <div className="flex items-center gap-3 shrink-0 ml-2">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full">
              <UserIcon className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-bold text-slate-700">{currentUser.fullName}</span>
            </div>
            <button className="p-2 text-slate-400 hover:text-indigo-600 relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border border-white"></span>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50">
          <div className="max-w-7xl mx-auto">
            {activeView === 'DASHBOARD' && <Dashboard seniors={seniors} logs={logs} />}
            {activeView === 'REGISTRY' && <Registry seniors={seniors} onRefresh={refreshData} currentUser={currentUser} />}
            {activeView === 'MEDICAL' && <MedicalRecords seniors={seniors} onRefresh={refreshData} currentUser={currentUser} />}
            {activeView === 'ASSISTANCE' && <Assistance seniors={seniors} onRefresh={refreshData} currentUser={currentUser} />}
            {activeView === 'AUDIT' && <AuditTrail logs={logs} />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
