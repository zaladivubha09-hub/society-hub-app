
import { Resident, Maintenance, Vehicle, Complaint, Worker, Poll, Notification, SocietyDocument, ComplaintStatus } from './types';
import { db } from './firebase';

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
  { residentId: 'res5', amount: 15000, dueDate: '2024-05-10', status: 'Overdue', invoiceId: 'INV005' },
];

export const mockVehicles: Vehicle[] = [
  { id: 'v1', residentId: 'res1', vehicleNumber: 'MH01AB1234', type: 'Car', model: 'Honda City', stickerNumber: 'SH-A101-01' },
  { id: 'v2', residentId: 'res3', vehicleNumber: 'MH02CD5678', type: 'Car', model: 'Maruti Swift', stickerNumber: 'SH-B201-01' },
  { id: 'v3', residentId: 'res3', vehicleNumber: 'MH02EF9012', type: 'Motorbike', model: 'Royal Enfield', stickerNumber: 'SH-B201-02' },
  { id: 'v4', residentId: 'res4', vehicleNumber: 'MH03GH3456', type: 'Car', model: 'Hyundai Verna', stickerNumber: 'SH-B202-01' },
];

export const mockWorkers: Worker[] = [
  { id: 'w1', name: 'Ramesh Kumar', service: 'Electrician', contact: '9876543220', availability: 'Mon-Sat 9AM-6PM', photoUrl: 'https://ui-avatars.com/api/?name=Ramesh+Kumar&background=random', rating: 4.5 },
  { id: 'w2', name: 'Suresh Patil', service: 'Plumbing', contact: '9876543221', availability: 'Mon-Sat 10AM-7PM', photoUrl: 'https://ui-avatars.com/api/?name=Suresh+Patil&background=random', rating: 4.2 },
  { id: 'w3', name: 'Sunita Devi', service: 'Cleaning', contact: '9876543222', availability: 'Mon-Sun 7AM-4PM', photoUrl: 'https://ui-avatars.com/api/?name=Sunita+Devi&background=random', rating: 4.8 },
  { id: 'w4', name: 'Rajesh Singh', service: 'CCTV', contact: '9876543223', availability: 'On Call', photoUrl: 'https://ui-avatars.com/api/?name=Rajesh+Singh&background=random', rating: 4.0 },
];

export const mockComplaints: Complaint[] = [
  { id: 'c1', residentId: 'res2', title: 'Leaky faucet in kitchen', description: 'The kitchen sink faucet has been dripping constantly for two days.', category: 'Plumbing', status: ComplaintStatus.Resolved, raisedAt: '2024-07-15T10:00:00Z', resolvedAt: '2024-07-16T14:00:00Z', assignedTo: 'w2', imageUrl: 'https://picsum.photos/seed/faucet/400/200' },
  { id: 'c2', residentId: 'res4', title: 'Corridor light not working', description: 'The light in the B-wing 2nd-floor corridor is out.', category: 'Electricity', status: ComplaintStatus.InProgress, raisedAt: '2024-07-18T09:00:00Z', assignedTo: 'w1' },
  { id: 'c3', residentId: 'res1', title: 'Unknown person loitering', description: 'There is a person standing near the B-wing entrance for the last 30 minutes who does not seem to be a resident.', category: 'Security', status: ComplaintStatus.Pending, raisedAt: '2024-07-20T18:30:00Z' },
];

export const mockNotifications: Notification[] = [
  { id: 'n1', title: 'Annual General Meeting', content: 'The AGM will be held on Sunday, 25th July at 10 AM in the clubhouse.', type: 'Meeting', date: '2024-07-25' },
  { id: 'n2', title: 'Water Tank Cleaning', content: 'Water supply will be disrupted on Thursday from 2 PM to 6 PM for cleaning.', type: 'Shutdown', date: '2024-07-22' },
  { id: 'n3', title: 'Diwali Celebration', content: 'Join us for the Grand Diwali Party on 1st November!', type: 'Event', date: '2024-11-01' },
];

export const mockPolls: Poll[] = [
  { 
    id: 'p1', 
    question: 'Should we upgrade the gym equipment?', 
    options: [
      { id: 'o1', text: 'Yes, definitely', votes: 15 },
      { id: 'o2', text: 'No, current one is fine', votes: 5 },
      { id: 'o3', text: 'Maybe next year', votes: 2 }
    ],
    isActive: true,
    totalVotes: 22,
    votedBy: ['res1', 'res2']
  },
  { 
    id: 'p2', 
    question: 'Preferred date for society picnic?', 
    options: [
      { id: 'o4', text: '15th August', votes: 8 },
      { id: 'o5', text: '2nd October', votes: 12 }
    ],
    isActive: false,
    totalVotes: 20,
    votedBy: ['res3', 'res4', 'res5']
  }
];

export const mockDocuments: SocietyDocument[] = [
  { id: 'd1', name: 'Society Registration Certificate', url: '#', category: 'Registration', uploadDate: '2020-01-15' },
  { id: 'd2', name: 'AGM Minutes 2023', url: '#', category: 'AGM Minutes', uploadDate: '2023-08-01' },
  { id: 'd3', name: 'Standard Rental Agreement Format', url: '#', category: 'Agreement', uploadDate: '2021-03-10' },
];

// Utility to upload mock data to Firestore (Run this once from a component)
export const seedDatabase = async () => {
    try {
        const check = await db.collection('users').get();
        if (!check.empty) {
            console.log("Database already has data. Skipping seed.");
            return;
        }
        
        console.log("Seeding database...");
        
        for (const r of mockResidents) {
            // Add to 'users' collection so they appear in Residents tab
            await db.collection('users').add(r);
        }
        
        console.log("Seeding complete!");
        alert("Mock data uploaded to Firestore!");
    } catch (e) {
        console.error("Error seeding database:", e);
        alert("Error seeding database. Check console.");
    }
};
