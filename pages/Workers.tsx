// Workers.tsx
import React, { useEffect, useState } from 'react';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import WorkerModal from '../components/WorkerModal';
import { Worker } from '../types';
import { useAuth } from '../context/AuthContext';

// 🔥 Firebase
import { db } from '../firebase';
import {
  collection,
  addDoc,
  updateDoc,
  onSnapshot,
  doc,
  query,
  orderBy
} from 'firebase/firestore';

const Workers: React.FC = () => {
  const { isAdmin } = useAuth();

  const [workers, setWorkers] = useState<Worker[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);

  // 🔄 Fetch workers (Realtime)
  useEffect(() => {
    const q = query(collection(db, 'workers'), orderBy('name'));
    const unsubscribe = onSnapshot(q, snapshot => {
      const list: Worker[] = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<Worker, 'id'>)
      }));
      setWorkers(list);
    });

    return () => unsubscribe();
  }, []);

  const handleOpenModal = (worker: Worker | null = null) => {
    setSelectedWorker(worker);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedWorker(null);
  };

  // 💾 Save worker (Add / Update)
  const handleSaveWorker = async (workerData: Omit<Worker, 'id'> | Worker) => {
    try {
      if ('id' in workerData) {
        // UPDATE
        await updateDoc(doc(db, 'workers', workerData.id), {
          name: workerData.name,
          service: workerData.service,
          photoUrl: workerData.photoUrl,
          rating: workerData.rating,
        });
      } else {
        // CREATE
        await addDoc(collection(db, 'workers'), {
          ...workerData,
          rating: 0,
          createdAt: new Date().toISOString(),
        });
      }
      handleCloseModal();
    } catch (err) {
      console.error('Error saving worker:', err);
    }
  };

  return (
    <div>
      <PageHeader
        title="Society Staff & Workers"
        actionText={isAdmin ? 'Add New Worker' : undefined}
        onActionClick={isAdmin ? () => handleOpenModal() : undefined}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {workers.map(worker => (
          <Card key={worker.id} className="!p-0">
            {/* ✅ CLICKABLE WRAPPER (FIXED ERROR) */}
            <button
              onClick={() => handleOpenModal(worker)}
              className="w-full text-center flex flex-col items-center p-4 hover:bg-gray-800 transition-colors"
            >
              <img
                src={worker.photoUrl}
                alt={worker.name}
                className="w-24 h-24 rounded-full border-4 border-border object-cover"
              />
              <h3 className="mt-4 text-lg font-bold text-text-primary">
                {worker.name}
              </h3>
              <p className="text-primary">{worker.service}</p>

              <div className="flex items-center mt-1">
                <span className="text-yellow-400">
                  {'★'.repeat(Math.round(worker.rating))}
                  {'☆'.repeat(5 - Math.round(worker.rating))}
                </span>
                <span className="ml-2 text-xs text-text-secondary">
                  {worker.rating.toFixed(1)}
                </span>
              </div>
            </button>
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
