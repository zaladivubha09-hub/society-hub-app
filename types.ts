export enum Role {
  Admin = 'Admin',
  Resident = 'Resident',
  SocietyStaff = 'SocietyStaff',
}

export interface User {
  id: string;
  name: string;
  role: Role;
  avatar: string;
}

export interface Resident {
  id: string;
  name: string;
  flatNumber: string;
  familyPhotoUrl: string;
  isOwner: boolean;
  contact: string;
  idProofUrl?: string;
  rentalAgreementUrl?: string;
}

export interface Maintenance {
  residentId: string;
  amount: number;
  dueDate: string;
  status: 'Paid' | 'Pending' | 'Overdue';
  paymentDate?: string;
  invoiceId: string;
}

export interface Vehicle {
  id: string;
  residentId: string;
  vehicleNumber: string;
  type: 'Car' | 'Motorbike';
  model: string;
  stickerNumber: string;
}

export enum ComplaintStatus {
  Pending = 'Pending',
  InProgress = 'In Progress',
  Resolved = 'Resolved',
}

export interface Complaint {
  id: string;
  residentId: string;
  title: string;
  description: string;
  category: 'Plumbing' | 'Electricity' | 'Security' | 'Other';
  status: ComplaintStatus;
  raisedAt: string;
  resolvedAt?: string;
  assignedTo?: string; // Worker ID
  imageUrl?: string;
}

export interface Worker {
  id: string;
  name: string;
  service: 'Lift' | 'Garden' | 'Cleaning' | 'CCTV' | 'Plumbing' | 'Electrician';
  contact: string;
  availability: string;
  photoUrl: string;
  rating: number;
  idProofUrl?: string;
}

export interface PollOption {
  id: string;
  text: string;
  votes: number;
}

export interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  isActive: boolean;
  totalVotes: number;
  votedBy: string[];
}

export interface Notification {
  id: string;
  title: string;
  content: string;
  type: 'Event' | 'Meeting' | 'Shutdown' | 'General';
  date: string;
}

export interface SocietyDocument {
  id: string;
  name: string;
  url: string;
  category: 'Registration' | 'AGM Minutes' | 'Agreement';
  uploadDate: string;
}