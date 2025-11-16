import React, { useState } from 'react';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import ResidentModal from '../components/ResidentModal';
import { mockResidents } from '../mockData';
import { Resident } from '../types';
import { useAuth } from '../context/AuthContext';
import { PencilIcon } from '../components/icons';

const Residents: React.FC = () => {
    const { isAdmin } = useAuth();
    const [residents, setResidents] = useState<Resident[]>(mockResidents);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedResident, setSelectedResident] = useState<Resident | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const handleOpenModal = (resident: Resident | null = null) => {
        setSelectedResident(resident);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedResident(null);
    };

    const handleSaveResident = (residentData: Omit<Resident, 'id'> | Resident) => {
        if ('id' in residentData) {
            // Edit
            setResidents(residents.map(r => r.id === residentData.id ? residentData : r));
        } else {
            // Add
            const newResident: Resident = {
                id: `res${residents.length + 1}${Date.now()}`,
                ...residentData
            };
            setResidents([newResident, ...residents]);
        }
        handleCloseModal();
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
            
            {filteredResidents.length === 0 && (
                <Card className="text-center py-12">
                     <h3 className="text-xl font-semibold">No residents found</h3>
                    <p className="text-text-secondary mt-2">Try adjusting your search term.</p>
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