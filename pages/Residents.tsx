// Residents.tsx (Fully Firebase + Storage Integrated)

import React, { useState, useEffect } from "react";
import PageHeader from "../components/PageHeader";
import Card from "../components/Card";
import ResidentModal from "../components/ResidentModal";
import { Resident } from "../types";
import { useAuth } from "../context/AuthContext";
import { PencilIcon } from "../components/icons";

// FIREBASE IMPORTS
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, getStorage } from "firebase/storage";
import { db } from "../firebase";

const storage = getStorage();

const Residents: React.FC = () => {
  const { isAdmin } = useAuth();
  const [residents, setResidents] = useState<Resident[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedResident, setSelectedResident] = useState<Resident | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");

  // -------------------------------------
  // 🔥 FETCH REAL-TIME RESIDENTS FROM FIRESTORE
  // -------------------------------------
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "residents"), (snapshot) => {
      const list: Resident[] = snapshot.docs.map((d) => ({
        ...(d.data() as Resident),
        id: d.id,
      }));
      setResidents(list);
    });

    return () => unsub();
  }, []);

  // -------------------------------------
  // 🔥 ADD OR EDIT RESIDENT IN FIRESTORE
  // -------------------------------------
  const handleSaveResident = async (
    data: Resident | Omit<Resident, "id">
  ) => {
    try {
      // CASE 1 → EDIT EXISTING RESIDENT
      if ("id" in data) {
        const docRef = doc(db, "residents", data.id);

        await updateDoc(docRef, {
          ...data,
          updatedAt: serverTimestamp(),
        });

        if ((data.familyPhotoUrl as any) instanceof File) {
          const photoRef = ref(
            storage,
            `residents/${data.id}/familyPhoto.jpg`
          );
          await uploadBytes(photoRef, data.familyPhotoUrl as unknown as File);
          const downloadURL = await getDownloadURL(photoRef);
          await updateDoc(docRef, { familyPhotoUrl: downloadURL });
        }

        handleCloseModal();
        return;
      }

      // CASE 2 → NEW RESIDENT
      const newResident = {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, "residents"), newResident);

      // UPLOAD IMAGE IF PROVIDED
      if ((data as any).familyPhotoUrl instanceof File) {
        const file = (data as any).familyPhotoUrl;
        const storageRef = ref(
          storage,
          `residents/${docRef.id}/familyPhoto.jpg`
        );
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);

        await updateDoc(docRef, {
          familyPhotoUrl: downloadURL,
        });
      }

      handleCloseModal();
    } catch (err) {
      console.error("Failed to save resident:", err);
      alert("Error saving resident. Check console.");
    }
  };

  // -------------------------------------
  // MODAL CONTROLS
  // -------------------------------------
  const handleOpenModal = (resident: Resident | null = null) => {
    setSelectedResident(resident);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedResident(null);
  };

  // -------------------------------------
  // SEARCH FILTER
  // -------------------------------------
  const filteredResidents = residents.filter(
    (r) =>
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.flatNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <PageHeader
        title="Residents Directory"
        actionText={isAdmin ? "Add New Resident" : undefined}
        onActionClick={isAdmin ? () => handleOpenModal() : undefined}
      />

      {/* SEARCH BOX */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by name or flat number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-lg px-4 py-2 bg-card border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* RESIDENT LIST */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredResidents.map((resident) => (
          <Card
            key={resident.id}
            className="relative !p-0 overflow-hidden group"
          >
            <img
              src={resident.familyPhotoUrl}
              alt={`${resident.name}'s family`}
              className="w-full h-40 object-cover"
            />

            <div className="p-4">
              <h3 className="font-bold text-lg text-text-primary truncate">
                {resident.name}
              </h3>
              <p className="text-sm text-text-secondary">
                Flat: {resident.flatNumber}
              </p>
              <span
                className={`mt-2 inline-block px-2 py-0.5 text-xs font-semibold rounded-full ${
                  resident.isOwner
                    ? "bg-blue-500/20 text-blue-300"
                    : "bg-purple-500/20 text-purple-300"
                }`}
              >
                {resident.isOwner ? "Owner" : "Tenant"}
              </span>
            </div>

            {isAdmin && (
              <button
                onClick={() => handleOpenModal(resident)}
                className="absolute top-2 right-2 p-2 bg-black bg-opacity-50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <PencilIcon className="h-4 w-4" />
              </button>
            )}
          </Card>
        ))}
      </div>

      {/* NO RESULTS */}
      {filteredResidents.length === 0 && (
        <Card className="text-center py-12">
          <h3 className="text-xl font-semibold">No residents found</h3>
          <p className="text-text-secondary mt-2">
            Try adjusting your search term.
          </p>
        </Card>
      )}

      {/* MODAL */}
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
