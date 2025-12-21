import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { Worker } from '../types';
// Fix: Imported DocumentTextIcon.
import { PencilIcon, CheckIcon, CameraIcon, DocumentTextIcon } from './icons';

interface WorkerModalProps {
  isOpen: boolean;
  onClose: () => void;
  worker: Worker | null;
  onSave: (worker: Omit<Worker, 'id'> | Worker) => void;
  isAdmin: boolean;
}

const WorkerModal: React.FC<WorkerModalProps> = ({ isOpen, onClose, worker, onSave, isAdmin }) => {
  const initialFormState: Omit<Worker, 'id' | 'rating'> = {
      name: '',
      service: 'Electrician',
      contact: '',
      availability: '',
      photoUrl: 'https://picsum.photos/seed/newworker/200',
      idProofUrl: '',
  };
    
  // The isEditing state is now true if it's a new worker OR if the admin clicks the edit button
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Omit<Worker, 'id'|'rating'> & {rating?: number}>(initialFormState);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (worker) {
        setFormData(worker);
        setPhotoPreview(worker.photoUrl);
        setIsEditing(false); // Start in view mode for existing worker
      } else {
        setFormData(initialFormState);
        setPhotoPreview(null);
        setIsEditing(true); // Start in edit mode for new worker
      }
    }
  }, [worker, isOpen]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (formData) {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          const reader = new FileReader();
          reader.onloadend = () => {
              setPhotoPreview(reader.result as string);
              setFormData({...formData, photoUrl: reader.result as string});
          };
          reader.readAsDataURL(file);
      }
  };

  const handleSave = () => {
    if (!/^\d{10}$/.test(formData.contact)) {
        alert('Please enter a valid 10-digit contact number.');
        return;
    }
    if (formData.name.trim().length < 2) {
        alert('Please enter a valid name.');
        return;
    }
    
    if (worker) { // Editing existing worker
        onSave({ ...worker, ...formData });
    } else { // Adding new worker
        // Fix: Add rating property to satisfy the Omit<Worker, 'id'> type for a new worker.
        onSave({ ...formData, rating: 0 });
    }
    onClose();
  };
  
  const handleCancel = () => {
    if (worker) {
        setFormData(worker);
        setPhotoPreview(worker.photoUrl);
        setIsEditing(false);
    } else {
        onClose();
    }
  }

  const getModalTitle = () => {
      if (!worker) return 'Add New Worker';
      if (isEditing) return 'Edit Worker Profile';
      return 'Worker Details';
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={getModalTitle()}>
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
                <div className="relative">
                    {photoPreview ? (
                        <img src={photoPreview} alt={formData.name} className="w-32 h-32 rounded-full border-4 border-border object-cover" />
                    ) : (
                         <div className="w-32 h-32 rounded-full border-4 border-border bg-background flex items-center justify-center">
                            <CameraIcon className="w-12 h-12 text-text-secondary"/>
                         </div>
                    )}
                    {isEditing && (
                        <label htmlFor="photo-upload" className="absolute -bottom-2 -right-2 bg-primary p-2 rounded-full cursor-pointer hover:bg-primary-hover transition-colors">
                            <PencilIcon className="w-4 h-4 text-white"/>
                            <input id="photo-upload" type="file" className="sr-only" accept="image/*" onChange={handlePhotoChange} />
                        </label>
                    )}
                </div>
                <div className="flex-1 text-center sm:text-left">
                  {isEditing ? (
                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Full Name" className="text-2xl font-bold text-text-primary bg-background border-b-2 border-border focus:border-primary outline-none w-full" />
                  ) : (
                    <h3 className="text-2xl font-bold text-text-primary">{formData.name}</h3>
                  )}

                  {isEditing ? (
                    <select name="service" value={formData.service} onChange={handleInputChange} className="mt-1 text-lg text-primary bg-background border-b-2 border-border focus:border-primary outline-none w-full">
                        <option>Electrician</option>
                        <option>Plumbing</option>
                        <option>Cleaning</option>
                        <option>Garden</option>
                        <option>CCTV</option>
                        <option>Lift</option>
                    </select>
                  ) : (
                     <p className="text-lg text-primary">{formData.service}</p>
                  )}
                  {worker && (
                      <div className="flex items-center justify-center sm:justify-start mt-2">
                        <span className="text-yellow-400">{'★'.repeat(Math.round(formData.rating || 0))}{'☆'.repeat(5 - Math.round(formData.rating || 0))}</span>
                        <span className="ml-2 text-text-secondary">{(formData.rating || 0).toFixed(1)}</span>
                      </div>
                  )}
                </div>
            </div>
            
            <div className="mt-6 border-t border-border pt-6 space-y-4">
                <div>
                  <label className="text-sm font-medium text-text-secondary">Contact</label>
                  {isEditing ? (
                    <input type="tel" name="contact" value={formData.contact} onChange={handleInputChange} placeholder="10-digit number" className="mt-1 w-full px-3 py-2 bg-background border border-border rounded-md" />
                  ) : (
                    <p className="text-text-primary">{formData.contact}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-text-secondary">Availability</label>
                  {isEditing ? (
                    <input type="text" name="availability" value={formData.availability} onChange={handleInputChange} placeholder="e.g., Mon-Fri, 9am-5pm" className="mt-1 w-full px-3 py-2 bg-background border border-border rounded-md" />
                  ) : (
                     <p className="text-text-primary">{formData.availability}</p>
                  )}
                </div>
                {formData.idProofUrl && !isEditing ? (
                    <div>
                         <label className="text-sm font-medium text-text-secondary">ID Proof</label>
                         <a href={formData.idProofUrl} className="text-primary hover:underline block">View Document</a>
                    </div>
                ) : isEditing ? (
                     <div>
                         <label className="text-sm font-medium text-text-secondary">ID Proof</label>
                          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-border border-dashed rounded-md">
                            <div className="space-y-1 text-center">
                                <DocumentTextIcon className="mx-auto h-12 w-12 text-text-secondary" />
                                <div className="flex text-sm text-gray-400">
                                    <label htmlFor="id-proof-upload" className="relative cursor-pointer bg-card rounded-md font-medium text-primary hover:text-primary-hover focus-within:outline-none">
                                        <span>Upload ID Proof</span>
                                        <input id="id-proof-upload" name="idProofUrl" type="file" className="sr-only" />
                                    </label>
                                </div>
                                <p className="text-xs text-gray-500">PDF, PNG, JPG</p>
                            </div>
                        </div>
                    </div>
                ) : null}
            </div>

            <div className="flex justify-end space-x-4 pt-6 mt-6 border-t border-border">
                {isEditing ? (
                    <>
                       <button type="button" onClick={handleCancel} className="px-4 py-2 rounded-md text-sm font-medium text-text-secondary bg-gray-700 hover:bg-gray-600 transition-transform duration-150 active:scale-95">Cancel</button>
                       <button type="button" onClick={handleSave} className="flex items-center px-4 py-2 rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-transform duration-150 active:scale-95">
                          <CheckIcon className="h-4 w-4 mr-2" />
                          Save
                       </button>
                    </>
                ) : (
                   <>
                      <button type="button" onClick={onClose} className="px-4 py-2 rounded-md text-sm font-medium text-text-secondary bg-gray-700 hover:bg-gray-600 transition-transform duration-150 active:scale-95">Close</button>
                      {isAdmin && (
                          <button type="button" onClick={() => setIsEditing(true)} className="flex items-center px-4 py-2 rounded-md text-sm font-medium text-white bg-primary hover:bg-primary-hover transition-transform duration-150 active:scale-95">
                              <PencilIcon className="h-4 w-4 mr-2" />
                              Edit
                          </button>
                      )}
                   </>
                )}
            </div>
        </div>
    </Modal>
  );
};

export default WorkerModal;
