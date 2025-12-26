
import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { Users, UserCheck, HeartPulse, HandHelping, TrendingUp, ShieldCheck } from 'lucide-react';
import { SeniorCitizen, AuditLog } from '../types.ts';

interface DashboardProps {
  seniors: SeniorCitizen[];
  logs: AuditLog[];
}

const Dashboard: React.FC<DashboardProps> = ({ seniors, logs }) => {
  const stats = useMemo(() => ({
    total: seniors.length,
    males: seniors.filter(s => s.sex === 'Male').length,
    females: seniors.filter(s => s.sex === 'Female').length,
    assistanceToday: seniors.reduce((acc, s) => acc + s.assistance.filter(a => a.date.startsWith(new Date().toISOString().split('T')[0])).length, 0),
    avgAge: seniors.length > 0 ? Math.round(seniors.reduce((acc, s) => acc + s.age, 0) / seniors.length) : 0
  }), [seniors]);

  const ageData = useMemo(() => {
    const brackets = [
      { name: '60-65', count: 0 },
      { name: '66-70', count: 0 },
      { name: '71-75', count: 0 },
      { name: '76-80', count: 0 },
      { name: '81+', count: 0 }
    ];
    seniors.forEach(s => {
      if (s.age <= 65) brackets[0].count++;
      else if (s.age <= 70) brackets[1].count++;
      else if (s.age <= 75) brackets[2].count++;
      else if (s.age <= 80) brackets[3].count++;
      else brackets[4].count++;
    });
    return brackets;
  }, [seniors]);

  const sexData = [
    { name: 'Male', value: stats.males },
    { name: 'Female', value: stats.females }
  ];

  const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#ef4444'];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard icon={Users} label="Total Registered" value={stats.total} color="bg-indigo-500" />
        <StatCard icon={UserCheck} label="Avg. Age" value={stats.avgAge} color="bg-amber-500" />
        <StatCard icon={HeartPulse} label="Health Alerts" value={3} color="bg-rose-500" />
        <StatCard icon={HandHelping} label="Assistance Logged" value={stats.assistanceToday} color="bg-emerald-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-indigo-500" />
            <h3 className="font-bold text-slate-800 text-sm sm:text-base">Age Distribution</h3>
          </div>
          <div className="h-48 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ageData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '10px'}} />
                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Users className="w-5 h-5 text-pink-500" />
            <h3 className="font-bold text-slate-800 text-sm sm:text-base">Gender Distribution</h3>
          </div>
          <div className="h-48 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sexData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {sexData.map((_entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{fontSize: '12px'}} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="font-bold text-slate-800 mb-4 text-sm sm:text-base">Recent Activity</h3>
        <div className="space-y-4">
          {logs.slice(0, 5).map((log) => (
            <div key={log.id} className="flex items-start gap-3 sm:gap-4 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-white flex items-center justify-center border border-slate-200 shrink-0">
                <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <p className="font-bold text-slate-800 text-xs sm:text-sm truncate">{log.userName}</p>
                  <span className="text-[9px] sm:text-[10px] text-slate-400 font-medium shrink-0 ml-2">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p className="text-[11px] sm:text-xs text-slate-600 mt-1 line-clamp-2"><span className="font-bold text-indigo-600">{log.action}:</span> {log.details}</p>
              </div>
            </div>
          ))}
          {logs.length === 0 && <p className="text-center text-slate-400 py-4 text-sm">No recent activities.</p>}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, color }: { icon: any, label: string, value: string | number, color: string }) => (
  <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-center gap-3 sm:gap-4">
      <div className={`p-2 sm:p-3 rounded-xl ${color} text-white`}>
        <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] sm:text-xs font-medium text-slate-400 truncate">{label}</p>
        <p className="text-lg sm:text-xl font-bold text-slate-800">{value}</p>
      </div>
    </div>
  </div>
);

export default Dashboard;
