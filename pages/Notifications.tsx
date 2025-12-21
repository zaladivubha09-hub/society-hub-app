import React, { useState, useEffect } from 'react';
import PageHeader from '../components/PageHeader';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import { BellIcon, WrenchIcon, UsersIcon } from '../components/icons';
import { db } from '../firebase';
import { getAuth } from 'firebase/auth';
import {
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy
} from 'firebase/firestore';

const NotificationIcon = ({ type }: { type: 'Meeting' | 'Shutdown' | 'Event' | 'General' }) => {
  const icons = {
    'Meeting': <UsersIcon className="h-6 w-6 text-blue-400" />,
    'Shutdown': <WrenchIcon className="h-6 w-6 text-yellow-400" />,
    'Event': <BellIcon className="h-6 w-6 text-purple-400" />,
    'General': <BellIcon className="h-6 w-6 text-gray-400" />,
  };
  return <div className="p-3 bg-gray-800 rounded-full">{icons[type]}</div>;
};

const Notifications: React.FC = () => {
  const { isAdmin } = useAuth();
  const currentUser = getAuth().currentUser;
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<'Event' | 'Meeting' | 'Shutdown' | 'General'>('General');

  // 1️⃣ Real-time fetching from Firestore
  useEffect(() => {
    const q = query(
      collection(db, 'notifications'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      setNotifications(list);
    });

    return () => unsubscribe();
  }, []);

  // 2️⃣ Create new notification
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !content) return;

    await addDoc(collection(db, 'notifications'), {
      title,
      content,
      type,
      createdAt: serverTimestamp(),
      createdBy: currentUser?.uid || "Unknown",
      senderName: currentUser?.displayName || "Admin"
    });

    handleCloseModal();
  };

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTitle('');
    setContent('');
    setType('General');
  };

  return (
    <div>
      <PageHeader
        title="Notifications & Announcements"
        actionText={isAdmin ? "Send New Notification" : undefined}
        onActionClick={isAdmin ? handleOpenModal : undefined}
      />

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Send New Notification">
        <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <label className="text-sm text-text-secondary">Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full px-3 py-2 bg-background border border-border rounded-md"
            />
          </div>

          <div>
            <label className="text-sm text-text-secondary">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="mt-1 w-full px-3 py-2 bg-background border border-border rounded-md"
            >
              <option>General</option>
              <option>Event</option>
              <option>Meeting</option>
              <option>Shutdown</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-text-secondary">Content</label>
            <textarea
              required
              rows={5}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="mt-1 w-full px-3 py-2 bg-background border border-border rounded-md"
            />
          </div>

          <div className="flex justify-end gap-4 pt-2">
            <button
              type="button"
              onClick={handleCloseModal}
              className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-primary text-white hover:bg-primary-hover"
            >
              Send
            </button>
          </div>

        </form>
      </Modal>

      {/* Notification List */}
      <ul className="-mb-8">
        {notifications.map((n, idx) => (
          <li key={n.id}>
            <div className="relative pb-8">
              {idx !== notifications.length - 1 && (
                <span className="absolute left-4 top-4 h-full w-0.5 bg-border"></span>
              )}

              <div className="relative flex items-start space-x-3">

                <NotificationIcon type={n.type} />

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-white">
                    {n.title} – {n.type}
                  </p>

                  <p className="text-sm text-text-secondary mt-1">
                    {n.content}
                  </p>

                  <p className="text-xs text-gray-500 mt-1">
                    {n.createdAt?.toDate().toDateString() || "loading..."}
                  </p>

                  <p className="text-xs text-gray-500 mt-1">
                    Sent by: {n.senderName}
                  </p>
                </div>

              </div>
            </div>
          </li>
        ))}
      </ul>

    </div>
  );
};

export default Notifications;
