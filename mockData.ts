import { Resident, Maintenance, Vehicle, Complaint, Worker, Poll, Notification, SocietyDocument, ComplaintStatus } from './types';

export const mockResidents: Resident[] = [
  { id: 'res1', name: 'Aarav Sharma', flatNumber: 'A-101', familyPhotoUrl: 'https://picsum.photos/seed/fam1/400/300', isOwner: true, contact: '9876543210' },
  { id: 'res2', name: 'Priya Patel', flatNumber: 'A-102', familyPhotoUrl: 'https://picsum.photos/seed/fam2/400/300', isOwner: false, contact: '9876543211' },
  { id: 'res3', name: 'Rohan Mehta', flatNumber: 'B-201', familyPhotoUrl: 'https://picsum.photos/seed/fam3/400/300', isOwner: true, contact: '9876543212' },
  { id: 'res4', name: 'Sneha Reddy', flatNumber: 'B-202', familyPhotoUrl: 'https://picsum.photos/seed/fam4/400/300', isOwner: true, contact: '9876543213' },
  { id: 'res5', name: 'Vikram Singh', flatNumber: 'C-301', familyPhotoUrl: 'https://picsum.photos/seed/fam5/400/300', isOwner: true, contact: '9876543214' },
];

export const mockMaintenance: Maintenance[] = [
  { residentId: 'res1', amount: 5000, dueDate: '2024-07-10', status: 'Paid', paymentDate: '2024-07-05', invoiceId: 'INV001' },
  { residentId: 'res2', amount: 5000, dueDate: '2024-07-10', status: 'Paid', paymentDate: '2024-07-08', invoiceId: 'INV002' },
  { residentId: 'res3', amount: 5000, dueDate: '2024-07-10', status: 'Overdue', invoiceId: 'INV003' },
  { residentId: 'res4', amount: 5000, dueDate: '2024-07-10', status: 'Pending', invoiceId: 'INV004' },
  { residentId: 'res5', amount: 15000, dueDate: '2024-05-10', status: 'Overdue', invoiceId: 'INV005' }, // Defaulter for multiple months
];

export const mockVehicles: Vehicle[] = [
  { id: 'v1', residentId: 'res1', vehicleNumber: 'MH01AB1234', type: 'Car', model: 'Honda City', stickerNumber: 'SH-A101-01' },
  { id: 'v2', residentId: 'res3', vehicleNumber: 'MH02CD5678', type: 'Car', model: 'Maruti Swift', stickerNumber: 'SH-B201-01' },
  { id: 'v3', residentId: 'res3', vehicleNumber: 'MH02EF9012', type: 'Motorbike', model: 'Royal Enfield', stickerNumber: 'SH-B201-02' },
  { id: 'v4', residentId: 'res4', vehicleNumber: 'MH03GH3456', type: 'Car', model: 'Hyundai Verna', stickerNumber: 'SH-B202-01' },
];

export const mockComplaints: Complaint[] = [
  { id: 'c1', residentId: 'res2', title: 'Leaky faucet in kitchen', description: 'The kitchen sink faucet has been dripping constantly for two days.', category: 'Plumbing', status: ComplaintStatus.Resolved, raisedAt: '2024-07-15T10:00:00Z', resolvedAt: '2024-07-16T14:00:00Z', assignedTo: 'w2', imageUrl: 'https://picsum.photos/seed/faucet/400/200' },
  { id: 'c2', residentId: 'res4', title: 'Corridor light not working', description: 'The light in the B-wing 2nd-floor corridor is out.', category: 'Electricity', status: ComplaintStatus.InProgress, raisedAt: '2024-07-18T09:00:00Z', assignedTo: 'w1' },
  { id: 'c3', residentId: 'res1', title: 'Unknown person loitering', description: 'Saw an unfamiliar person near the C-wing staircase.', category: 'Security', status: ComplaintStatus.Pending, raisedAt: '2024-07-19T22:00:00Z' },
];

export const mockWorkers: Worker[] = [
  { id: 'w1', name: 'Rajesh Kumar', service: 'Electrician', contact: '9123456780', availability: 'Mon-Sat, 9am-6pm', photoUrl: 'https://picsum.photos/seed/worker1/200', rating: 4.8, idProofUrl: '#' },
  { id: 'w2', name: 'Suresh Patel', service: 'Plumbing', contact: '9123456781', availability: '24/7 for emergencies', photoUrl: 'https://picsum.photos/seed/worker2/200', rating: 4.9, idProofUrl: '#' },
  { id: 'w3', name: 'Mala Devi', service: 'Cleaning', contact: '9123456782', availability: 'Daily, 8am-10am', photoUrl: 'https://picsum.photos/seed/worker3/200', rating: 4.5, idProofUrl: '#' },
  { id: 'w4', name: 'Amit Singh', service: 'Garden', contact: '9123456783', availability: 'Tue, Thu, Sat mornings', photoUrl: 'https://picsum.photos/seed/worker4/200', rating: 4.7 },
  { id: 'w5', name: 'Karan Verma', service: 'CCTV', contact: '9123456784', availability: 'By appointment', photoUrl: 'https://picsum.photos/seed/worker5/200', rating: 4.6, idProofUrl: '#' },
  { id: 'w6', name: 'Deepak Sharma', service: 'Lift', contact: '9123456785', availability: 'On call', photoUrl: 'https://picsum.photos/seed/worker6/200', rating: 4.8 },
];

export const mockPolls: Poll[] = [
  { id: 'p1', question: 'Should we install a new water purifier in the gym?', isActive: true, options: [{ id: 'o1', text: 'Yes', votes: 28 }, { id: 'o2', text: 'No', votes: 15 }], totalVotes: 43, votedBy: ['user1', 'res2'] },
  { id: 'p2', question: 'Choose the new color for the building exterior.', isActive: false, options: [{ id: 'o3', text: 'Beige', votes: 50 }, { id: 'o4', text: 'Light Blue', votes: 35 }, { id: 'o5', text: 'Grey', votes: 22 }], totalVotes: 107, votedBy: [] },
];

export const mockNotifications: Notification[] = [
  { id: 'n1', title: 'Annual General Meeting', content: 'The AGM will be held on July 30th, 2024, at 7 PM in the clubhouse.', type: 'Meeting', date: '2024-07-15' },
  { id: 'n2', title: 'Water Supply Shutdown', content: 'Water supply will be suspended for tank cleaning on July 22nd from 10 AM to 4 PM.', type: 'Shutdown', date: '2024-07-18' },
  { id: 'n3', title: 'Independence Day Celebration', content: 'Join us for the flag hoisting ceremony on August 15th at 9 AM.', type: 'Event', date: '2024-07-20' },
];

export const mockDocuments: SocietyDocument[] = [
  { id: 'd1', name: 'Society Registration Certificate', url: '#', category: 'Registration', uploadDate: '2020-01-15' },
  { id: 'd2', name: 'AGM Minutes - 2023', url: '#', category: 'AGM Minutes', uploadDate: '2023-08-01' },
  { id: 'd3', name: 'Waste Management Contract', url: '#', category: 'Agreement', uploadDate: '2024-01-01' },
];
