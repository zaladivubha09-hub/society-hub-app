
import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { Resident } from '../types';
import { CameraIcon } from './icons';
import { storage } from '../firebase';

interface ResidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (resident: Omit<Resident, 'id'> | Resident) => Promise<void>;
  resident: Resident | null;
}

const ResidentModal: React.FC<ResidentModalProps> = ({ isOpen, onClose, onSave, resident }) => {
  const initialFormState = {
    name: '',
    flatNumber: '',
    contact: '',
    isOwner: true,
    familyPhotoUrl: '',
    idProofUrl: '',
    rentalAgreementUrl: '',
  };
    
  const [formData, setFormData] = useState(initialFormState);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  
  // State to hold actual File objects
  const [files, setFiles] = useState<{ [key: string]: File | null }>({
      familyPhotoUrl: null,
      idProofUrl: null,
      rentalAgreementUrl: null
  });

  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (resident) {
      setFormData({
        name: resident.name,
        flatNumber: resident.flatNumber,
        contact: resident.contact,
        isOwner: resident.isOwner,
        familyPhotoUrl: resident.familyPhotoUrl || '',
        idProofUrl: resident.idProofUrl || '',
        rentalAgreementUrl: resident.rentalAgreementUrl || '',
      });
      setPhotoPreview(resident.familyPhotoUrl || null);
    } else {
      setFormData(initialFormState);
      setPhotoPreview(null);
    }
    // Reset files on open/close
    setFiles({
        familyPhotoUrl: null,
        idProofUrl: null,
        rentalAgreementUrl: null
    });
  }, [resident, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'radio') {
        setFormData(prev => ({ ...prev, [name]: value === 'true' }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          const { name } = e.target;
          
          // Store the file object for upload later
          setFiles(prev => ({ ...prev, [name]: file }));

          // Create a local preview
          if (name === 'familyPhotoUrl') {
              const reader = new FileReader();
              reader.onloadend = () => {
                  setPhotoPreview(reader.result as string);
              };
              reader.readAsDataURL(file);
          }
      }
  }

  const uploadFile = async (file: File, path: string): Promise<string> => {
      const storageRef = storage.ref(path);
      await storageRef.put(file);
      return await storageRef.getDownloadURL();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{10}$/.test(formData.contact)) {
        alert('Please enter a valid 10-digit contact number.');
        return;
    }
    if (formData.name.trim().length < 2) {
        alert('Please enter a valid name.');
        return;
    }

    setUploading(true);
    
    try {
        let updatedFormData = { ...formData };

        // Upload Family Photo
        if (files.familyPhotoUrl) {
            const url = await uploadFile(files.familyPhotoUrl, `residents/${Date.now()}_family_${files.familyPhotoUrl.name}`);
            updatedFormData.familyPhotoUrl = url;
        } else if (!updatedFormData.familyPhotoUrl && !resident) {
             // Set default if new and no photo provided
             updatedFormData.familyPhotoUrl = 'https://picsum.photos/seed/newfam/400/300';
        }

        // Upload ID Proof
        if (files.idProofUrl) {
             const url = await uploadFile(files.idProofUrl, `documents/${Date.now()}_id_${files.idProofUrl.name}`);
             updatedFormData.idProofUrl = url;
        }

        // Upload Rental Agreement
        if (files.rentalAgreementUrl) {
             const url = await uploadFile(files.rentalAgreementUrl, `documents/${Date.now()}_agreement_${files.rentalAgreementUrl.name}`);
             updatedFormData.rentalAgreementUrl = url;
        }

        if (resident) {
          await onSave({ ...resident, ...updatedFormData });
        } else {
          await onSave(updatedFormData);
        }
    } catch (error) {
        console.error("Error uploading files:", error);
        alert("Failed to upload images. Please check your connection.");
    } finally {
        setUploading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={resident ? 'Edit Resident' : 'Add New Resident'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-text-secondary">Full Name</label>
          <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required className="mt-1 w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
                <label htmlFor="flatNumber" className="block text-sm font-medium text-text-secondary">Flat Number</label>
                <input type="text" id="flatNumber" name="flatNumber" value={formData.flatNumber} onChange={handleChange} required className="mt-1 w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
                <label htmlFor="contact" className="block text-sm font-medium text-text-secondary">Contact Number</label>
                <input type="tel" id="contact" name="contact" value={formData.contact} onChange={handleChange} required className="mt-1 w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
        </div>
        <div>
            <label className="block text-sm font-medium text-text-secondary">Status</label>
            <div className="mt-2 flex space-x-4">
                <label className="flex items-center">
                    <input type="radio" name="isOwner" value="true" checked={formData.isOwner} onChange={handleChange} className="focus:ring-primary h-4 w-4 text-primary bg-background border-border"/>
                    <span className="ml-2 text-text-primary">Owner</span>
                </label>
                <label className="flex items-center">
                    <input type="radio" name="isOwner" value="false" checked={!formData.isOwner} onChange={handleChange} className="focus:ring-primary h-4 w-4 text-primary bg-background border-border"/>
                    <span className="ml-2 text-text-primary">Tenant</span>
                </label>
            </div>
        </div>
        
        <div className="pt-2">
            <label className="block text-sm font-medium text-text-secondary">Family Photo</label>
            <div className="mt-2 flex items-center gap-4">
                {photoPreview ? (
                    <img src={photoPreview} alt="Family" className="w-16 h-16 rounded-md object-cover border border-border" />
                ) : (
                    <div className="w-16 h-16 rounded-md bg-background border border-border flex items-center justify-center text-text-secondary">
                        <CameraIcon className="w-8 h-8"/>
                    </div>
                )}
                <label htmlFor="family-photo-upload" className="cursor-pointer px-3 py-2 border border-border rounded-md text-sm font-medium text-text-secondary hover:bg-gray-700">
                    <span>{photoPreview ? 'Change Photo' : 'Upload Photo'}</span>
                    <input id="family-photo-upload" name="familyPhotoUrl" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" />
                </label>
                {files.familyPhotoUrl && <span className="text-xs text-green-400">Selected: {files.familyPhotoUrl.name}</span>}
            </div>
        </div>

        <div className="space-y-2 pt-2">
            <label className="block text-sm font-medium text-text-secondary">Documents</label>
            <div className="flex items-center">
                <label htmlFor="id-proof-upload" className="cursor-pointer px-3 py-2 border border-border rounded-md text-sm font-medium text-text-secondary hover:bg-gray-700 w-40 text-center">
                    ID Proof
                </label>
                <input id="id-proof-upload" name="idProofUrl" type="file" className="sr-only" onChange={handleFileChange} />
                <span className="ml-4 text-sm text-gray-400 truncate">{files.idProofUrl?.name || (formData.idProofUrl ? "File Uploaded" : "No file chosen")}</span>
            </div>
            {!formData.isOwner && (
                <div className="flex items-center">
                    <label htmlFor="agreement-upload" className="cursor-pointer px-3 py-2 border border-border rounded-md text-sm font-medium text-text-secondary hover:bg-gray-700 w-40 text-center">
                        Rental Agreement
                    </label>
                    <input id="agreement-upload" name="rentalAgreementUrl" type="file" className="sr-only" onChange={handleFileChange} />
                    <span className="ml-4 text-sm text-gray-400 truncate">{files.rentalAgreementUrl?.name || (formData.rentalAgreementUrl ? "File Uploaded" : "No file chosen")}</span>
                </div>
            )}
        </div>
        
        <div className="flex justify-end space-x-4 pt-4 border-t border-border mt-6">
          <button type="button" onClick={onClose} disabled={uploading} className="px-4 py-2 rounded-md text-sm font-medium text-text-secondary bg-gray-700 hover:bg-gray-600 transition-transform duration-150 active:scale-95 disabled:opacity-50">Cancel</button>
          <button type="submit" disabled={uploading} className="px-4 py-2 rounded-md text-sm font-medium text-white bg-primary hover:bg-primary-hover transition-transform duration-150 active:scale-95 disabled:opacity-50">
              {uploading ? 'Saving...' : 'Save Resident'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ResidentModal;
