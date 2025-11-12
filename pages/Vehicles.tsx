import React, { useState } from 'react';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import VehicleModal from '../components/VehicleModal';
import { mockVehicles, mockResidents } from '../mockData';
import { Vehicle, Resident } from '../types';
import { useMockAuth as useAuth } from '../hooks/useMockAuth';
import { TrashIcon, PencilIcon, CarIcon, MotorbikeIcon } from '../components/icons';

const VehicleCard: React.FC<{
    vehicle: Vehicle;
    ownerName: string;
    onEdit: () => void;
    onDelete: () => void;
    isAdmin: boolean;
}> = ({ vehicle, ownerName, onEdit, onDelete, isAdmin }) => {
    return (
        <Card className="relative group overflow-hidden !p-4">
            <div className="flex flex-col items-center text-center">
                {vehicle.type === 'Car' 
                    ? <CarIcon className="w-24 h-24 text-primary" />
                    : <MotorbikeIcon className="w-24 h-24 text-primary" />
                }
                <p className="mt-4 text-xl font-bold font-mono tracking-wider text-text-primary bg-gray-700 px-3 py-1 rounded">
                    {vehicle.vehicleNumber}
                </p>
                <h3 className="mt-2 text-lg font-semibold text-text-primary truncate">{vehicle.model}</h3>
                <p className="text-text-secondary">{ownerName}</p>
                <p className="mt-2 text-sm text-gray-400">Sticker: <span className="font-medium text-gray-300">{vehicle.stickerNumber}</span></p>
            </div>
            {isAdmin && (
                <div className="absolute top-2 right-2 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={onEdit} className="p-2 bg-background/50 backdrop-blur-sm hover:bg-background rounded-full transition-colors text-blue-400">
                        <PencilIcon className="h-4 w-4" />
                    </button>
                    <button onClick={onDelete} className="p-2 bg-background/50 backdrop-blur-sm hover:bg-background rounded-full transition-colors text-red-400">
                        <TrashIcon className="h-4 w-4" />
                    </button>
                </div>
            )}
        </Card>
    );
};


const Vehicles: React.FC = () => {
    const { isAdmin } = useAuth();
    const [vehicles, setVehicles] = useState(mockVehicles);
    const [residents] = useState(mockResidents);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const getResidentName = (residentId: string) => {
        return residents.find(r => r.id === residentId)?.name || 'Unknown';
    };

    const handleOpenModal = (vehicle: Vehicle | null = null) => {
        setSelectedVehicle(vehicle);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedVehicle(null);
    };
    
    const handleSaveVehicle = (vehicleData: Omit<Vehicle, 'id'> | Vehicle) => {
        if ('id' in vehicleData) {
            // Editing existing vehicle
            setVehicles(vehicles.map(v => v.id === vehicleData.id ? vehicleData : v));
        } else {
            // Adding new vehicle
            const newVehicle: Vehicle = {
                id: `v${vehicles.length + 1}${Date.now()}`,
                ...vehicleData,
            };
            setVehicles([newVehicle, ...vehicles]);
        }
        handleCloseModal();
    };

    const handleDeleteVehicle = (vehicleId: string) => {
        if (window.confirm('Are you sure you want to delete this vehicle record?')) {
            setVehicles(vehicles.filter(v => v.id !== vehicleId));
        }
    };
    
    const filteredVehicles = vehicles.filter(v => 
        v.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getResidentName(v.residentId).toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            <PageHeader 
                title="Vehicle Management"
                actionText={isAdmin ? "Add New Vehicle" : undefined}
                onActionClick={isAdmin ? () => handleOpenModal() : undefined}
            />
            
            <div className="mb-6">
                <input
                    type="text"
                    placeholder="Search by vehicle no, model, or owner..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full max-w-lg px-4 py-2 bg-card border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
            </div>

            {filteredVehicles.length > 0 ? (
                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredVehicles.map((vehicle) => (
                       <VehicleCard 
                           key={vehicle.id}
                           vehicle={vehicle}
                           ownerName={getResidentName(vehicle.residentId)}
                           onEdit={() => handleOpenModal(vehicle)}
                           onDelete={() => handleDeleteVehicle(vehicle.id)}
                           isAdmin={isAdmin}
                       />
                    ))}
                </div>
            ) : (
                 <Card className="text-center py-12">
                     <h3 className="text-xl font-semibold">No vehicles found</h3>
                    <p className="text-text-secondary mt-2">Try adjusting your search term.</p>
                </Card>
            )}


            <VehicleModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSaveVehicle}
                vehicle={selectedVehicle}
                residents={residents}
            />
        </div>
    );
};

export default Vehicles;