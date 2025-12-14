
import React, { useState, useEffect } from 'react';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Modal from '../components/Modal';
import { Complaint, ComplaintStatus, Worker } from '../types';
import { mockResidents, mockWorkers } from '../mockData';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { TrashIcon } from '../components/icons';

const Complaints: React.FC = () => {
    const { isAdmin, user } = useAuth();
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [loading, setLoading] = useState(true);
    const [residentsMap, setResidentsMap] = useState<Record<string, any>>({});
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

    // Form state for new/edit complaint
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState<Complaint['category']>('Other');
    const [assignedTo, setAssignedTo] = useState('');
    const [status, setStatus] = useState<ComplaintStatus>(ComplaintStatus.Pending);

    // Fetch Complaints Real-time
    useEffect(() => {
        const unsubscribe = db.collection('complaints')
            .orderBy('raisedAt', 'desc')
            .onSnapshot(snapshot => {
                const fetchedComplaints = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as Complaint[];
                setComplaints(fetchedComplaints);
                setLoading(false);
            }, err => {
                console.error("Error fetching complaints", err);
                setLoading(false);
            });
        
        return () => unsubscribe();
    }, []);

    // Fetch Users to resolve names (Real DB users)
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const snap = await db.collection('users').get();
                const map: Record<string, any> = {};
                snap.forEach(doc => {
                    map[doc.id] = doc.data();
                });
                setResidentsMap(map);
            } catch (e) {
                console.error("Error fetching users", e);
            }
        };
        fetchUsers();
    }, []);

    const getResidentName = (residentId: string): string => {
        if (residentsMap[residentId]) return residentsMap[residentId].name;
        // Fallback for mock data residents
        const mock = mockResidents.find(r => r.id === residentId);
        return mock ? mock.name : 'Unknown/User';
    };

    const getWorker = (workerId: string): Worker | undefined => mockWorkers.find(w => w.id === workerId);

    const handleOpenModal = (complaint: Complaint | null) => {
        setSelectedComplaint(complaint);
        if (complaint) {
            setTitle(complaint.title);
            setDescription(complaint.description);
            setCategory(complaint.category);
            setAssignedTo(complaint.assignedTo || '');
            setStatus(complaint.status);
        } else {
            // Reset for new complaint
            setTitle('');
            setDescription('');
            setCategory('Other');
            setAssignedTo('');
            setStatus(ComplaintStatus.Pending);
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedComplaint(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (selectedComplaint) {
                // Edit
                await db.collection('complaints').doc(selectedComplaint.id).update({
                    title,
                    description,
                    category,
                    assignedTo: assignedTo || null,
                    status,
                    // Optionally update resolvedAt if status changes to Resolved
                    ...(status === ComplaintStatus.Resolved && selectedComplaint.status !== ComplaintStatus.Resolved 
                        ? { resolvedAt: new Date().toISOString() } 
                        : {})
                });
            } else {
                // Add new
                if (!user) return;
                const newComplaint = {
                    residentId: user.id,
                    title,
                    description,
                    category,
                    status: ComplaintStatus.Pending,
                    raisedAt: new Date().toISOString(),
                };
                await db.collection('complaints').add(newComplaint);
            }
            handleCloseModal();
        } catch (error) {
            console.error("Error saving complaint:", error);
            alert("Failed to save complaint. Please try again.");
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm("Are you sure you want to delete this complaint? This action cannot be undone.")) {
            try {
                await db.collection('complaints').doc(id).delete();
            } catch (error) {
                console.error("Error deleting complaint:", error);
                alert("Failed to delete complaint.");
            }
        }
    };
    
    const getStatusChip = (status: ComplaintStatus) => {
        const styles = {
            [ComplaintStatus.Pending]: 'bg-yellow-500/20 text-yellow-400',
            [ComplaintStatus.InProgress]: 'bg-blue-500/20 text-blue-400',
            [ComplaintStatus.Resolved]: 'bg-green-500/20 text-green-400',
        };
        return <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status]}`}>{status}</span>;
    };
    
    const renderComplaintCard = (complaint: Complaint) => (
        <Card key={complaint.id} className="flex flex-col">
            <div className="flex justify-between items-start">
                <h3 className="font-semibold text-text-primary pr-2">{complaint.title}</h3>
                {getStatusChip(complaint.status)}
            </div>
            <p className="text-sm text-text-secondary mt-2 flex-grow">{complaint.description}</p>
            <div className="text-xs text-gray-400 mt-4 pt-3 border-t border-border">
                <p>Raised by: {getResidentName(complaint.residentId)}</p>
                <p>On: {new Date(complaint.raisedAt).toLocaleString()}</p>
                {complaint.assignedTo && <p>Assigned to: {getWorker(complaint.assignedTo)?.name || 'Unknown'}</p>}
            </div>
            {isAdmin && (
                <div className="mt-4 flex gap-3">
                    <button onClick={() => handleOpenModal(complaint)} className="flex-1 text-center py-2 text-sm bg-gray-700 hover:bg-gray-600 rounded-md text-white transition-colors">
                        Update Status
                    </button>
                    <button 
                        onClick={() => handleDelete(complaint.id)} 
                        className="px-3 py-2 text-sm bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-500 rounded-md transition-colors"
                        title="Delete Complaint"
                    >
                        <TrashIcon className="h-5 w-5" />
                    </button>
                </div>
            )}
        </Card>
    );

    const complaintsByStatus = {
        [ComplaintStatus.Pending]: complaints.filter(c => c.status === ComplaintStatus.Pending),
        [ComplaintStatus.InProgress]: complaints.filter(c => c.status === ComplaintStatus.InProgress),
        [ComplaintStatus.Resolved]: complaints.filter(c => c.status === ComplaintStatus.Resolved),
    };

    return (
        <div>
            <PageHeader title="Complaints & Issues" actionText="Raise New Complaint" onActionClick={() => handleOpenModal(null)} />
            
            {loading ? (
                <div className="text-center text-text-secondary py-10">Loading complaints...</div>
            ) : (
                <div className="space-y-8">
                    {(Object.keys(complaintsByStatus) as ComplaintStatus[]).map(status => (
                        complaintsByStatus[status].length > 0 && (
                            <div key={status}>
                                <h2 className="text-xl font-bold mb-4 text-text-primary">{status}</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {complaintsByStatus[status].map(renderComplaintCard)}
                                </div>
                            </div>
                        )
                    ))}
                    {complaints.length === 0 && (
                        <div className="text-center text-text-secondary py-10">
                            No complaints found.
                        </div>
                    )}
                </div>
            )}

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={selectedComplaint ? 'Update Complaint' : 'Raise a Complaint'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-text-secondary">Title</label>
                        <input type="text" id="title" value={title} onChange={e => setTitle(e.target.value)} required disabled={!!selectedComplaint && !isAdmin} className="mt-1 w-full px-3 py-2 bg-background border border-border rounded-md disabled:opacity-50" />
                    </div>
                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-text-secondary">Category</label>
                        <select id="category" value={category} onChange={e => setCategory(e.target.value as any)} disabled={!!selectedComplaint && !isAdmin} className="mt-1 w-full px-3 py-2 bg-background border border-border rounded-md disabled:opacity-50">
                            <option>Plumbing</option><option>Electricity</option><option>Security</option><option>Other</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-text-secondary">Description</label>
                        <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={4} required disabled={!!selectedComplaint && !isAdmin} className="mt-1 w-full px-3 py-2 bg-background border border-border rounded-md disabled:opacity-50" />
                    </div>
                    {isAdmin && selectedComplaint && (
                        <>
                            <div>
                                <label htmlFor="status" className="block text-sm font-medium text-text-secondary">Status</label>
                                <select id="status" value={status} onChange={e => setStatus(e.target.value as ComplaintStatus)} className="mt-1 w-full px-3 py-2 bg-background border border-border rounded-md">
                                    <option>{ComplaintStatus.Pending}</option>
                                    <option>{ComplaintStatus.InProgress}</option>
                                    <option>{ComplaintStatus.Resolved}</option>
                                </select>
                            </div>
                             <div>
                                <label htmlFor="assignedTo" className="block text-sm font-medium text-text-secondary">Assign To</label>
                                <select id="assignedTo" value={assignedTo} onChange={e => setAssignedTo(e.target.value)} className="mt-1 w-full px-3 py-2 bg-background border border-border rounded-md">
                                    <option value="">- Unassigned -</option>
                                    {mockWorkers.map(w => <option key={w.id} value={w.id}>{w.name} ({w.service})</option>)}
                                </select>
                            </div>
                        </>
                    )}
                    <div className="flex justify-end space-x-4 pt-4 border-t border-border mt-6">
                        <button type="button" onClick={handleCloseModal} className="px-4 py-2 rounded-md text-sm font-medium text-text-secondary bg-gray-700 hover:bg-gray-600">Cancel</button>
                        <button type="submit" className="px-4 py-2 rounded-md text-sm font-medium text-white bg-primary hover:bg-primary-hover">Save</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Complaints;
