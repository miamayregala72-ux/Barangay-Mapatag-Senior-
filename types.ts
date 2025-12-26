
export enum UserRole {
  ADMIN = 'ADMIN',
  STAFF = 'STAFF',
  HEALTH_WORKER = 'HEALTH_WORKER'
}

export interface User {
  id: string;
  username: string;
  role: UserRole;
  fullName: string;
}

export interface MedicalInfo {
  conditions: string[];
  allergies: string[];
  medications: string[];
  limitations: string;
  lastUpdated: string;
  updatedBy: string;
}

export interface AssistanceRecord {
  id: string;
  date: string;
  type: string;
  status: 'Received' | 'Pending' | 'Denied';
  description: string;
  encodedBy: string;
}

export interface SeniorCitizen {
  id: string;
  scid: string; // Senior Citizen ID Key
  fullName: string;
  birthdate: string;
  age: number;
  sex: 'Male' | 'Female';
  address: string;
  purok: string;
  civilStatus: 'Single' | 'Married' | 'Widowed' | 'Separated';
  contact: string;
  photoUrl?: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  medicalInfo: MedicalInfo;
  assistance: AssistanceRecord[];
  dateRegistered: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
}

export type ViewType = 'DASHBOARD' | 'REGISTRY' | 'MEDICAL' | 'ASSISTANCE' | 'AUDIT' | 'USERS';
