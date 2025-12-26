
import { SeniorCitizen, AuditLog, User, UserRole } from './types.ts';

const STORAGE_KEYS = {
  SENIORS: 'mapatag_seniors',
  AUDIT_LOGS: 'mapatag_audit_logs',
  CURRENT_USER: 'mapatag_current_user'
};

export const storage = {
  getSeniors: (): SeniorCitizen[] => {
    const data = localStorage.getItem(STORAGE_KEYS.SENIORS);
    return data ? JSON.parse(data) : [];
  },
  saveSeniors: (seniors: SeniorCitizen[]) => {
    localStorage.setItem(STORAGE_KEYS.SENIORS, JSON.stringify(seniors));
  },
  getAuditLogs: (): AuditLog[] => {
    const data = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
    return data ? JSON.parse(data) : [];
  },
  saveAuditLogs: (logs: AuditLog[]) => {
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(logs));
  },
  addAuditLog: (log: Pick<AuditLog, 'action' | 'details'>, currentUser: User) => {
    const logs = storage.getAuditLogs();
    const newLog: AuditLog = {
      ...log,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      userId: currentUser.id,
      userName: currentUser.fullName
    };
    storage.saveAuditLogs([newLog, ...logs]);
  },
  getCurrentUser: (): User | null => {
    const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return data ? JSON.parse(data) : null;
  },
  setCurrentUser: (user: User | null) => {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  }
};

export const seedInitialData = () => {
  if (storage.getSeniors().length === 0) {
    const initialSeniors: SeniorCitizen[] = [
      {
        id: '1',
        scid: 'SC-2024-001',
        fullName: 'Juan Dela Cruz',
        birthdate: '1955-05-15',
        age: 69,
        sex: 'Male',
        address: 'Purok 1, Mapatag',
        purok: 'Purok 1',
        civilStatus: 'Married',
        contact: '09123456789',
        photoUrl: 'https://picsum.photos/seed/juan/200',
        emergencyContact: {
          name: 'Maria Dela Cruz',
          relationship: 'Spouse',
          phone: '09987654321'
        },
        medicalInfo: {
          conditions: ['Hypertension'],
          allergies: ['Penicillin'],
          medications: ['Amlodipine'],
          limitations: 'Walks with cane',
          lastUpdated: new Date().toISOString(),
          updatedBy: 'System Admin'
        },
        assistance: [
          {
            id: 'a1',
            date: '2024-01-10',
            type: 'Social Pension',
            status: 'Received',
            description: 'Monthly pension for Q1',
            encodedBy: 'Staff Member'
          }
        ],
        dateRegistered: '2023-12-01'
      }
    ];
    storage.saveSeniors(initialSeniors);
  }
};
