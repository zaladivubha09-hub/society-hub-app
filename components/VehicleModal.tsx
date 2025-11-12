import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { Vehicle, Resident } from '../types';

interface VehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (vehicle: Omit<Vehicle, 'id'> | Vehicle) => void;
  vehicle: Vehicle | null;
  residents: Resident[];
}

const VehicleModal: React.FC<VehicleModalProps> = ({ isOpen, onClose, onSave, vehicle, residents }) => {
  const [formData, setFormData] = useState({
    residentId: '',
    vehicleNumber: '',
    type: 'Car' as 'Car' | 'Motorbike',
    model: '',
    stickerNumber: '',
  });

  useEffect(() => {
    if (vehicle) {
      setFormData({
        residentId: vehicle.residentId,
        vehicleNumber: vehicle.vehicleNumber,
        type: vehicle.type,
        model: vehicle.model,
        stickerNumber: vehicle.stickerNumber,
      });
    } else {
      setFormData({
        residentId: residents.length > 0 ? residents[0].id : '',
        vehicleNumber: '',
        type: 'Car',
        model: '',
        stickerNumber: '',
      });
    }
  }, [vehicle, isOpen, residents]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (vehicle) {
      onSave({ ...vehicle, ...formData });
    } else {
      onSave(formData);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={vehicle ? 'Edit Vehicle' : 'Add New Vehicle'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="residentId" className="block text-sm font-medium text-text-secondary">Owner</label>
          <select id="residentId" name="residentId" value={formData.residentId} onChange={handleChange} required className="mt-1 w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary">
            {residents.map(res => (
              <option key={res.id} value={res.id}>{res.name} ({res.flatNumber})</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="vehicleNumber" className="block text-sm font-medium text-text-secondary">Vehicle Number</label>
          <input type="text" id="vehicleNumber" name="vehicleNumber" value={formData.vehicleNumber} onChange={handleChange} required className="mt-1 w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>
        <div>
          <label htmlFor="stickerNumber" className="block text-sm font-medium text-text-secondary">Sticker Number</label>
          <input type="text" id="stickerNumber" name="stickerNumber" value={formData.stickerNumber} onChange={handleChange} required className="mt-1 w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-text-secondary">Type</label>
          <select id="type" name="type" value={formData.type} onChange={handleChange} required className="mt-1 w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary">
            <option>Car</option>
            <option>Motorbike</option>
          </select>
        </div>
        <div>
          <label htmlFor="model" className="block text-sm font-medium text-text-secondary">Make / Model</label>
          <input type="text" id="model" name="model" value={formData.model} onChange={handleChange} required className="mt-1 w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>
        <div className="flex justify-end space-x-4 pt-4 border-t border-border mt-6">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-md text-sm font-medium text-text-secondary bg-gray-700 hover:bg-gray-600 transition-transform duration-150 active:scale-95">Cancel</button>
          <button type="submit" className="px-4 py-2 rounded-md text-sm font-medium text-white bg-primary hover:bg-primary-hover transition-transform duration-150 active:scale-95">Save Vehicle</button>
        </div>
      </form>
    </Modal>
  );
};

export default VehicleModal;
