import React, { useEffect, useState, useMemo } from 'react';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import VehicleModal from '../components/VehicleModal';
import { Vehicle, Resident } from '../types';
import { useAuth } from '../context/AuthContext';
import { TrashIcon, PencilIcon, CarIcon, MotorbikeIcon } from '../components/icons';
import { db } from '../firebase';
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp
} from 'firebase/firestore';

/* ---------------- VEHICLE CARD ---------------- */
const VehicleCard: React.FC<{
  vehicle: Vehicle;
  ownerName: string;
  onEdit: () => void;
  onDelete: () => void;
  isAdmin: boolean;
}> = ({ vehicle, ownerName, onEdit, onDelete, isAdmin }) => (
  <Card className="relative group overflow-hidden !p-4">
    <div className="flex flex-col items-center text-center">
      {vehicle.type === 'Car'
        ? <CarIcon className="w-24 h-24 text-primary" />
        : <MotorbikeIcon className="w-24 h-24 text-primary" />
      }

      <p className="mt-4 text-xl font-bold font-mono tracking-wider text-text-primary bg-gray-700 px-3 py-1 rounded">
        {vehicle.vehicleNumber}
      </p>

      <h3 className="mt-2 text-lg font-semibold text-text-primary truncate">
        {vehicle.model}
      </h3>

      <p className="text-text-secondary">{ownerName}</p>

      <p className="mt-2 text-sm text-gray-400">
        Sticker: <span className="font-medium text-gray-300">{vehicle.stickerNumber}</span>
      </p>
    </div>

    {isAdmin && (
      <div className="absolute top-2 right-2 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={onEdit} className="p-2 bg-background/50 hover:bg-background rounded-full text-blue-400">
          <PencilIcon className="h-4 w-4" />
        </button>
        <button onClick={onDelete} className="p-2 bg-background/50 hover:bg-background rounded-full text-red-400">
          <TrashIcon className="h-4 w-4" />
        </button>
      </div>
    )}
  </Card>
);

/* ---------------- VEHICLES PAGE ---------------- */
const Vehicles: React.FC = () => {
  const { isAdmin } = useAuth();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  /* -------- FETCH RESIDENTS -------- */
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'residents'), snap => {
      setResidents(snap.docs.map(d => ({ id: d.id, ...d.data() }) as Resident));
    });
    return unsub;
  }, []);

  /* -------- FETCH VEHICLES -------- */
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'vehicles'), snap => {
      setVehicles(snap.docs.map(d => ({ id: d.id, ...d.data() }) as Vehicle));
    });
    return unsub;
  }, []);

  const getResidentName = (residentId: string) =>
    residents.find(r => r.id === residentId)?.name || 'Unknown';

  /* -------- CRUD -------- */
  const handleSaveVehicle = async (vehicleData: Omit<Vehicle, 'id'> | Vehicle) => {
    if ('id' in vehicleData) {
      const { id, ...dataToUpdate } = vehicleData;
      await updateDoc(doc(db, 'vehicles', id), dataToUpdate);
    } else {
      await addDoc(collection(db, 'vehicles'), {
        ...vehicleData,
        createdAt: serverTimestamp()
      });
    }
    setIsModalOpen(false);
    setSelectedVehicle(null);
  };

  const handleDeleteVehicle = async (vehicleId: string) => {
    if (window.confirm('Delete this vehicle record?')) {
      await deleteDoc(doc(db, 'vehicles', vehicleId));
    }
  };

  /* -------- SEARCH -------- */
  const filteredVehicles = useMemo(() => {
    return vehicles.filter(v =>
      v.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getResidentName(v.residentId).toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [vehicles, searchTerm, residents]);

  return (
    <div>
      <PageHeader
        title="Vehicle Management"
        actionText={isAdmin ? 'Add New Vehicle' : undefined}
        onActionClick={isAdmin ? () => setIsModalOpen(true) : undefined}
      />

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by vehicle no, model, or owner..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full max-w-lg px-4 py-2 bg-card border border-border rounded-md focus:ring-primary"
        />
      </div>

      {filteredVehicles.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredVehicles.map(vehicle => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              ownerName={getResidentName(vehicle.residentId)}
              onEdit={() => {
                setSelectedVehicle(vehicle);
                setIsModalOpen(true);
              }}
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
        onClose={() => {
          setIsModalOpen(false);
          setSelectedVehicle(null);
        }}
        onSave={handleSaveVehicle}
        vehicle={selectedVehicle}
        residents={residents}
      />
    </div>
  );
};

export default Vehicles;
