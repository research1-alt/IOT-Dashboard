
import React from 'react';

export interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  change?: string;
  changeType?: 'increase' | 'decrease';
}

export interface FleetStatusData {
  name: string;
  value: number;
  color: string;
}

export interface Alert {
  id: string;
  type: 'Speeding' | 'Harsh Braking' | 'Geofence Exit';
  device: string;
  timestamp: string;
}

export interface Device {
  id: string;
  status: 'Driving' | 'Parked' | 'Offline' | 'Maintenance' | 'Stored';
  location: string;
  logFileContent?: string; // Content of the attached CAN log file
  // New properties for detail view
  ownerName?: string;
  vin?: string;
  registrationNo?: string;
  chassisNo?: string;
  batteryUID?: string;
  vehicleModel?: string;
  manufacturingYear?: number;
  fleet?: string;
  locationOfOrigin?: string;
  lastUpdated?: string;
  canTimestamp?: string;
  gpsTimestamp?: string;
  imageUrl?: string;
  _serverTimestamp?: string; // Metadata to prove data came from server
  // Telemetry fields from spreadsheet
  speed?: string;
  soc?: string;
  fuel?: string;
  battery?: string;
  ignition?: 'On' | 'Off'; // Added ignition status
  latitude?: number | null;
  longitude?: number | null;
  timestamp?: string;
}


export interface DecodingFile {
  name: string;
  size: number;
  uploadDate: string;
  content: string;
}

export interface LogFile {
  name:string;
  size: number;
  uploadDate: string;
  content: string;
}

export type NavView = 
    | 'dashboard' 
    | 'live-map' 
    | 'live-alerts'
    | 'battery-health'
    | 'analytics'
    | 'reports'
    | 'raw-data'
    | 'vehicle-twin'
    | 'diy-lab'
    | 'manage' 
    | 'converter' 
    | 'billing' 
    | 'settings' 
    | 'server-monitor' 
    | 'service';

export type UserRole = 'Admin' | 'OEM Manager' | 'Finance Manager' | 'Fleet Manager' | 'Dealer' | 'Customer';

export interface Member {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole | 'Member'; // Allow 'Member' for mock data compatibility
  assignedDevices: string[];
}


export interface Signal {
  name: string;
  startBit: number;
  length: number;
  isLittleEndian: boolean;
  isSigned: boolean;
  scale: number;
  offset: number;
  min: number;
  max: number;
  unit: string;
  valueTable?: { [key: number]: string };
}

export interface Message {
  name: string;
  dlc: number;
  signals: { [key: string]: Signal };
}

export interface CanMatrix {
  [id: string]: Message;
}

export interface CANMessage {
    timestamp: number;
    id: string; // Hex string e.g. "0x1827FF81"
    name?: string; // Message name from DBC
    dlc: number;
    data: string[]; // Array of hex byte strings e.g. ["01", "00"]
    isTx: boolean;
    decoded?: { [key: string]: number | string };
}

// Configuration Types
export type DataSourceMode = 'local' | 'server';

export interface AppConfig {
    mode: DataSourceMode;
    serverUrl: string;
    apiKey?: string; // Optional for future use
}

// --- Telemetry Types ---
export interface VehicleHeaderStats {
  time: string;
  obdStatus: string;
  odometer: string;
  speed: string;
  ignition: string;
  latitude?: number | null;
  longitude?: number | null;
}

export interface CanDataItem {
  label: string;
  value: string;
}

export interface TelemetryData {
    header: VehicleHeaderStats;
    details: CanDataItem[];
    rawMessages?: CANMessage[];
    error?: string;
}
