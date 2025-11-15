import { Member } from '../types';

export const mockMembers: Member[] = [
  { 
    id: 'user-admin-01', 
    name: 'Admin', 
    email: 'research1@omegaseikimobility.com', 
    password: 'Arvind@1223',
    role: 'Admin', 
    assignedDevices: [] // Admin sees all, so this is not used for them
  },
  { 
    id: 'user-member-02', 
    name: 'Olivia Chen', 
    email: 'olivia.chen@example.com', 
    password: 'password123',
    role: 'Member', 
    assignedDevices: ['OSM01'] 
  },
  { 
    id: 'user-member-03', 
    name: 'Ben Carter', 
    email: 'ben.carter@example.com', 
    password: 'password123',
    role: 'Member', 
    assignedDevices: [] 
  },
  { 
    id: 'user-oem-04', 
    name: 'Kenji Tanaka', 
    email: 'kenji.tanaka@oem.com', 
    password: 'password123',
    role: 'Member', // Role is selected after login
    assignedDevices: ['OSM01'] 
  },
  { 
    id: 'user-finance-05', 
    name: 'Maria Garcia', 
    email: 'maria.garcia@finance.com', 
    password: 'password123',
    role: 'Member', // Role is selected after login
    assignedDevices: [] 
  },
];