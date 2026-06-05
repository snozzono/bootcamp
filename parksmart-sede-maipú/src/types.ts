export type ParkingStatus = 'free' | 'occupied' | 'blocked';
export type SlotType = 'standard' | 'ev' | 'preferential';
export type ParkingSector = 'Norte' | 'Sur' | 'Techado';

export interface ParkingSlot {
  id: number;
  code: string;
  status: ParkingStatus;
  type: SlotType;
  sector: ParkingSector;
  floor: number;
}

export type UserRole = 
  | 'Super Admin' 
  | 'Jefe Seguridad' 
  | 'Guardia' 
  | 'Jefe Servicios Gral.' 
  | 'Conductor';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
  avatarUrl?: string;
}

export interface IncidentReport {
  id: string;
  type: string;
  description: string;
  imageUrl?: string;
  timestamp: string;
  status: 'Pending' | 'Resolved';
  userEmail: string;
  slotCode?: string;
}

export interface Reservation {
  slotId: number;
  slotCode: string;
  expiresAt: string; // ISO String
  plate: string;
  createdAt: string; // ISO String
}
