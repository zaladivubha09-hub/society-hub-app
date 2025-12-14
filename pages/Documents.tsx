import React, { useRef, useState } from 'react';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import { useAuth } from '../context/AuthContext';
import { DocumentTextIcon } from '../components/icons';
import { mockDocuments } from '../mockData';
import { SocietyDocument } from '../types';

const Documents: React.FC = () => {
    const { isAdmin } = useAuth();
    const [documents, setDocuments] = useState<SocietyDocument[]>(mockDocuments);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            alert(`Uploading ${file.name}... (Mock Upload)`);
            const newDoc: SocietyDocument = {
                id: `d${Date.now()}`,
                name: file.name,
                url: '#',
                category: 'Agreement',
                uploadDate: new Date().toISOString().split('T')[0]
            };
            setDocuments([...documents, newDoc]);
        }
    };
    
    return (
        <div>
            <PageHeader title="Document & Record Storage" 
                actionText={isAdmin ? "Upload Document" : undefined}
                onActionClick={isAdmin ? handleUploadClick : undefined}
            />
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
            />
            <Card>
                {documents.length > 0 ? (
                <ul role="list" className="divide-y divide-border">
                    {documents.map((doc) => (
                        <li key={doc.id} className="flex items-center justify-between py-4">
                            <div className="flex items-center">
                                <DocumentTextIcon className="h-8 w-8 text-primary" />
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-text-primary">{doc.name}</p>
                                    <p className="text-sm text-text-secondary">Category: {doc.category} | Uploaded: {doc.uploadDate}</p>
                                </div>
                            </div>
                            <a href={doc.url} download className="ml-4 px-3 py-1.5 border border-border rounded-md text-sm font-medium text-text-secondary hover:bg-gray-700 transition-transform duration-150 active:scale-95 inline-block">
                                Download
                            </a>
                        </li>
                    ))}
                </ul>
                ) : (
                    <p className="text-center text-text-secondary py-4">No documents found.</p>
                )}
            </Card>

            {/* In a real app this would be a separate section or page */}
            <h3 className="text-xl font-bold mt-8 mb-4">Resident Documents (Admin View)</h3>
            <Card>
                <p className="text-text-secondary">
                    {isAdmin 
                        ? "This section would contain links to residents' ID proofs and rental agreements, accessible only to authorized personnel." 
                        : "You do not have permission to view resident-specific documents."
                    }
                </p>
                {isAdmin && (
                     <ul className="mt-4 space-y-2">
                        <li className="text-sm"><span className="font-semibold">Aarav Sharma (A-101):</span> ID Proof, Agreement</li>
                        <li className="text-sm"><span className="font-semibold">Priya Patel (A-102):</span> ID Proof, Rental Agreement</li>
                     </ul>
                )}
            </Card>
        </div>
    );
};

export default Documents;