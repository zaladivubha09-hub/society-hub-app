import React, { useState } from 'react';
import PageHeader from '../components/PageHeader';
import Modal from '../components/Modal';
import { mockNotifications as initialNotifications } from '../mockData';
import { useAuth } from '../context/AuthContext';
import { BellIcon, WrenchIcon, UsersIcon } from '../components/icons';
import { Notification } from '../types';

const NotificationIcon = ({type}: {type: 'Meeting' | 'Shutdown' | 'Event' | 'General'}) => {
    const icons = {
        'Meeting': <UsersIcon className="h-6 w-6 text-blue-400" />,
        'Shutdown': <WrenchIcon className="h-6 w-6 text-yellow-400" />,
        'Event': <BellIcon className="h-6 w-6 text-purple-400" />,
        'General': <BellIcon className="h-6 w-6 text-gray-400" />,
    }
    return <div className="p-3 bg-gray-800 rounded-full">{icons[type] || icons['General']}</div>
}

const Notifications: React.FC = () => {
    const { isAdmin } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Form state
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [type, setType] = useState<'Event' | 'Meeting' | 'Shutdown' | 'General'>('General');

    const handleOpenModal = () => {
        setIsModalOpen(true);
    };
    
    const handleCloseModal = () => {
        setIsModalOpen(false);
        // Reset form
        setTitle('');
        setContent('');
        setType('General');
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newNotification: Notification = {
            id: `n${notifications.length + 1}`,
            title,
            content,
            type,
            date: new Date().toISOString(),
        };
        setNotifications([newNotification, ...notifications]);
        handleCloseModal();
    };

    return (
        <div>
            <PageHeader title="Notifications & Announcements" 
                actionText={isAdmin ? 'Send New Notification' : undefined}
                onActionClick={isAdmin ? handleOpenModal : undefined}
            />
            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Send New Notification">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-text-secondary">Title</label>
                        <input type="text" id="title" value={title} onChange={e => setTitle(e.target.value)} required className="mt-1 w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                    <div>
                        <label htmlFor="type" className="block text-sm font-medium text-text-secondary">Type</label>
                        <select id="type" value={type} onChange={e => setType(e.target.value as  Notification['type'])}className="mt-1 w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary">
                            <option>General</option>
                            <option>Event</option>
                            <option>Meeting</option>
                            <option>Shutdown</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="content" className="block text-sm font-medium text-text-secondary">Content</label>
                        <textarea id="content" value={content} onChange={e => setContent(e.target.value)} rows={5} required className="mt-1 w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                    <div className="flex justify-end space-x-4 pt-4">
                        <button type="button" onClick={handleCloseModal} className="px-4 py-2 rounded-md text-sm font-medium text-text-secondary bg-gray-700 hover:bg-gray-600 transition-transform duration-150 active:scale-95">Cancel</button>
                        <button type="submit" className="px-4 py-2 rounded-md text-sm font-medium text-white bg-primary hover:bg-primary-hover transition-transform duration-150 active:scale-95">Send Notification</button>
                    </div>
                </form>
            </Modal>
            <div className="flow-root">
                <ul className="-mb-8">
                    {notifications.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((notification, idx) => (
                        <li key={notification.id}>
                            <div className="relative pb-8">
                                {idx !== notifications.length - 1 ? (
                                    <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-border" aria-hidden="true"></span>
                                ) : null}
                                <div className="relative flex items-start space-x-3">
                                    <div>
                                        <NotificationIcon type={notification.type} />
                                    </div>
                                    <div className="min-w-0 flex-1 pt-1.5">
                                        <div className="text-sm text-text-secondary">
                                            <span className="font-semibold text-text-primary">{notification.title}</span> - {notification.type}
                                        </div>
                                        <p className="mt-1 text-sm text-text-secondary">{notification.content}</p>
                                        <p className="mt-1 text-xs text-gray-500">{new Date(notification.date).toDateString()}</p>
                                    </div>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default Notifications;