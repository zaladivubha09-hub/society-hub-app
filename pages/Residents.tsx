
import React, { useState, useEffect } from 'react';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import ResidentModal from '../components/ResidentModal';
import { Resident, User, Role } from '../types';
import { useAuth } from '../context/AuthContext';
import { PencilIcon } from '../components/icons';
// Import Firebase functions
import { db } from '../firebase';

const Residents: React.FC = () => {
    const { isAdmin } = useAuth();
    const [residents, setResidents] = useState<Resident[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedResident, setSelectedResident] = useState<Resident | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    // FETCH DATA FROM FIREBASE DATABASE
    useEffect(() => {
        const fetchResidents = async () => {
            try {
                // We are fetching from the 'users' collection where we stored the Sign Up data
                const querySnapshot = await db.collection("users").get();
                const fetchedUsers: Resident[] = [];
                
                querySnapshot.forEach((doc) => {
                    const data = doc.data() as User & { flatNumber?: string; contact?: string; isOwner?: boolean; familyPhotoUrl?: string };
                    // Convert User profile to Resident format for display
                    fetchedUsers.push({
                        id: doc.id,
                        name: data.name,
                        flatNumber: data.flatNumber || 'Not Assigned', // Handle missing data
                        familyPhotoUrl: data.familyPhotoUrl || data.avatar || 'https://picsum.photos/seed/default/400/300',
                        isOwner: data.isOwner || false,
                        contact: data.contact || 'N/A'
                    });
                });
                
                setResidents(fetchedUsers);
            } catch (error) {
                console.error("Error fetching residents from Firestore:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchResidents();
    }, []);

    const handleOpenModal = (resident: Resident | null = null) => {
        setSelectedResident(resident);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedResident(null);
    };

    const handleSaveResident = async (residentData: Omit<Resident, 'id'> | Resident) => {
        // OPTIMISTIC UPDATE: Update UI immediately, then sync with DB in background
        
        if ('id' in residentData) {
             // 1. UPDATE EXISTING
             const updatedResident = residentData as Resident;
             
             // Update Local State Immediately
             setResidents(prev => prev.map(r => r.id === updatedResident.id ? updatedResident : r));
             
             // Close Modal Immediately
             handleCloseModal();

             // Persist to Firebase in Background (Fire & Forget)
             db.collection("users").doc(updatedResident.id).update(residentData).catch(error => {
                 console.error("Error updating resident in DB:", error);
                 alert("Failed to save changes remotely. Please check your internet connection.");
                 // Optionally revert local state here if needed
             });

        } else {
             // 2. ADD NEW
             // Generate ID synchronously
             const docRef = db.collection("users").doc();
             const newId = docRef.id;
             const newResident = { ...residentData, id: newId } as Resident;

             // Update Local State Immediately
             setResidents(prev => [...prev, newResident]);
             
             // Close Modal Immediately
             handleCloseModal();

             // Persist to Firebase in Background
             docRef.set(residentData).catch(error => {
                 console.error("Error adding resident to DB:", error);
                 // Revert local change on failure
                 setResidents(prev => prev.filter(r => r.id !== newId));
                 alert("Failed to add resident remotely. Please check your internet connection.");
             });
        }
    };
    
    const filteredResidents = residents.filter(resident => 
        resident.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resident.flatNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            <PageHeader 
                title="Residents Directory"
                actionText={isAdmin ? "Add New Resident" : undefined}
                onActionClick={isAdmin ? () => handleOpenModal() : undefined}
            />

            <div className="mb-6">
                <input
                    type="text"
                    placeholder="Search by name or flat number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full max-w-lg px-4 py-2 bg-card border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
            </div>
            
            {loading ? (
                <div className="text-center py-12 text-text-secondary">Loading residents from Firebase...</div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredResidents.map((resident) => (
                        <Card key={resident.id} className="relative !p-0 overflow-hidden group">
                            <img src={resident.familyPhotoUrl} alt={`${resident.name}'s family`} className="w-full h-40 object-cover" />
                            <div className="p-4">
                                <h3 className="font-bold text-lg text-text-primary truncate">{resident.name}</h3>
                                <p className="text-sm text-text-secondary">Flat: {resident.flatNumber}</p>
                                <span className={`mt-2 inline-block px-2 py-0.5 text-xs font-semibold rounded-full ${resident.isOwner ? 'bg-blue-500/20 text-blue-300' : 'bg-purple-500/20 text-purple-300'}`}>
                                    {resident.isOwner ? 'Owner' : 'Tenant'}
                                </span>
                            </div>
                            {isAdmin && (
                                <button onClick={() => handleOpenModal(resident)} className="absolute top-2 right-2 p-2 bg-black bg-opacity-50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                    <PencilIcon className="h-4 w-4" />
                                </button>
                            )}
                        </Card>
                    ))}
                </div>
            )}
            
            {!loading && filteredResidents.length === 0 && (
                <Card className="text-center py-12">
                     <h3 className="text-xl font-semibold">No residents found</h3>
                    <p className="text-text-secondary mt-2">Try adding a new resident.</p>
                </Card>
            )}

            <ResidentModal 
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSaveResident}
                resident={selectedResident}
            />
        </div>
    );
};

export default Residents;
