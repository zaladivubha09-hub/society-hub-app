import React, { useState } from 'react';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import WorkerModal from '../components/WorkerModal';
import { mockWorkers } from '../mockData';
import { Worker } from '../types';
import { useMockAuth as useAuth } from '../hooks/useMockAuth';

const Workers: React.FC = () => {
    const { isAdmin } = useAuth();
    const [workers, setWorkers] = useState<Worker[]>(mockWorkers);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);

    const handleOpenModal = (worker: Worker | null = null) => {
        setSelectedWorker(worker);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedWorker(null);
    };

    const handleSaveWorker = (workerData: Omit<Worker, 'id'> | Worker) => {
        if ('id' in workerData) {
            // Editing
            setWorkers(workers.map(w => w.id === workerData.id ? workerData : w));
        } else {
            // Adding
            const newWorker: Worker = {
                id: `w${workers.length + 1}${Date.now()}`,
                rating: 0, // New workers start with 0 rating
                ...workerData
            };
            setWorkers([newWorker, ...workers]);
        }
        handleCloseModal();
    };

    return (
        <div>
            <PageHeader 
                title="Society Staff & Workers"
                actionText={isAdmin ? "Add New Worker" : undefined}
                onActionClick={isAdmin ? () => handleOpenModal() : undefined}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {workers.map((worker) => (
                    <Card key={worker.id} className="text-center flex flex-col items-center !p-4 cursor-pointer" onClick={() => handleOpenModal(worker)}>
                        <img 
                            src={worker.photoUrl} 
                            alt={worker.name} 
                            className="w-24 h-24 rounded-full border-4 border-border object-cover"
                        />
                        <h3 className="mt-4 text-lg font-bold text-text-primary">{worker.name}</h3>
                        <p className="text-primary">{worker.service}</p>
                        <div className="flex items-center mt-1">
                            <span className="text-yellow-400">{'★'.repeat(Math.round(worker.rating))}{'☆'.repeat(5 - Math.round(worker.rating))}</span>
                            <span className="ml-2 text-xs text-text-secondary">{worker.rating.toFixed(1)}</span>
                        </div>
                    </Card>
                ))}
            </div>

            <WorkerModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                worker={selectedWorker}
                onSave={handleSaveWorker}
                isAdmin={isAdmin}
            />
        </div>
    );
};

export default Workers;