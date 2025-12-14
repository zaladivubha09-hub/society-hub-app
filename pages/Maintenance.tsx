import React, { useState, useMemo } from 'react';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import PaymentModal from '../components/PaymentModal';
import ReceiptModal from '../components/ReceiptModal';
import { Maintenance, Resident } from '../types';
import { mockMaintenance, mockResidents } from '../mockData';
import { useAuth } from '../context/AuthContext';
import { DocumentDownloadIcon, BellIcon } from '../components/icons';

type MaintenanceWithResident = Maintenance & { resident?: Resident };

const DefaulterCard: React.FC<{ resident: Resident; totalDue: number; rank: number }> = ({ resident, totalDue, rank }) => (
    <Card className="flex items-center space-x-4 !p-4 border-2 border-red-500/50 hover:bg-red-500/10 transition-colors">
        <span className="text-3xl font-bold text-red-400">{rank}</span>
        <img src={resident.familyPhotoUrl} alt={resident.name} className="w-16 h-16 rounded-full object-cover border-2 border-red-500/50" />
        <div className="flex-1">
            <h4 className="font-bold text-text-primary">{resident.name}</h4>
            <p className="text-sm text-text-secondary">Flat: {resident.flatNumber}</p>
        </div>
        <div className="text-right">
            <p className="text-sm text-red-400">Outstanding</p>
            <p className="text-xl font-bold text-red-400">₹{totalDue.toLocaleString('en-IN')}</p>
        </div>
    </Card>
);

const MaintenancePage: React.FC = () => {
    const { isAdmin } = useAuth();
    // Combine maintenance data with resident data
    const initialBills: MaintenanceWithResident[] = mockMaintenance.map(bill => ({
        ...bill,
        resident: mockResidents.find(r => r.id === bill.residentId)
    }));

    const [bills, setBills] = useState<MaintenanceWithResident[]>(initialBills);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [selectedBill, setSelectedBill] = useState<MaintenanceWithResident | null>(null);
    const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
    const [selectedBillForReceipt, setSelectedBillForReceipt] = useState<MaintenanceWithResident | null>(null);

    const handlePayClick = (bill: MaintenanceWithResident) => {
        setSelectedBill(bill);
        setIsPaymentModalOpen(true);
    };

    const handlePaymentConfirm = (invoiceId: string) => {
        setBills(prevBills => prevBills.map(bill => 
            bill.invoiceId === invoiceId 
                ? { ...bill, status: 'Paid', paymentDate: new Date().toISOString().split('T')[0] } 
                : bill
        ));
        setIsPaymentModalOpen(false);
        setSelectedBill(null);
    };
    
    const handleViewReceipt = (bill: MaintenanceWithResident) => {
        setSelectedBillForReceipt(bill);
        setIsReceiptModalOpen(true);
    };

    const handleSendReminder = (bill: MaintenanceWithResident) => {
        alert(`A maintenance due reminder has been sent to ${bill.resident?.name} (Flat ${bill.resident?.flatNumber}).`);
    };

    const summary = useMemo(() => {
        const totalDue = bills.filter(b => b.status !== 'Paid').reduce((acc, bill) => acc + bill.amount, 0);
        const totalCollected = bills.filter(b => b.status === 'Paid').reduce((acc, bill) => acc + bill.amount, 0);
        const defaulters = bills.filter(b => b.status === 'Overdue').length;
        return { totalDue, totalCollected, defaulters };
    }, [bills]);
    
    const defaulters = useMemo(() => {
        const dueMap = new Map<string, { resident: Resident; totalDue: number }>();
        bills.forEach(bill => {
            if (bill.status === 'Overdue' && bill.resident) {
                const existing = dueMap.get(bill.residentId);
                if (existing) {
                    existing.totalDue += bill.amount;
                } else {
                    dueMap.set(bill.residentId, { resident: bill.resident, totalDue: bill.amount });
                }
            }
        });
        return Array.from(dueMap.values()).sort((a, b) => b.totalDue - a.totalDue);
    }, [bills]);

    const getStatusChip = (status: 'Paid' | 'Pending' | 'Overdue') => {
        const styles = {
            Paid: 'bg-green-500/20 text-green-400',
            Pending: 'bg-yellow-500/20 text-yellow-400',
            Overdue: 'bg-red-500/20 text-red-400',
        };
        return <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status]}`}>{status}</span>;
    };

    return (
        <div>
            <PageHeader title="Maintenance Dues" />

            {isAdmin && defaulters.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-xl font-bold text-red-400 mb-4">Top Defaulters</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {defaulters.slice(0, 4).map((d, index) => (
                            <DefaulterCard key={d.resident.id} resident={d.resident} totalDue={d.totalDue} rank={index + 1} />
                        ))}
                    </div>
                </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card>
                    <h3 className="text-lg font-medium text-text-secondary">Total Collected (This Year)</h3>
                    <p className="mt-2 text-3xl font-bold text-green-400">₹{summary.totalCollected.toLocaleString('en-IN')}</p>
                </Card>
                <Card>
                    <h3 className="text-lg font-medium text-text-secondary">Total Outstanding</h3>
                    <p className="mt-2 text-3xl font-bold text-red-500">₹{summary.totalDue.toLocaleString('en-IN')}</p>
                </Card>
                <Card>
                    <h3 className="text-lg font-medium text-text-secondary">Defaulters</h3>
                    <p className="mt-2 text-3xl font-bold text-yellow-400">{summary.defaulters}</p>
                </Card>
            </div>

            <Card className="!p-0 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-border">
                        <thead className="bg-gray-800">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Resident</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Flat</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Amount</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Due Date</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {bills.map((bill) => (
                                <tr key={bill.invoiceId} className="hover:bg-gray-800 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary">{bill.resident?.name || 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{bill.resident?.flatNumber || 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">₹{bill.amount.toLocaleString('en-IN')}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{new Date(bill.dueDate).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">{getStatusChip(bill.status)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium">
                                        {bill.status === 'Paid' ? (
                                            <button 
                                                onClick={() => handleViewReceipt(bill)}
                                                className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium text-white bg-gray-600 hover:bg-gray-500 transition-transform duration-150 active:scale-95"
                                            >
                                                <DocumentDownloadIcon className="h-4 w-4 mr-1"/>
                                                Receipt
                                            </button>
                                        ) : (
                                            <div className="flex items-center space-x-2">
                                                <button 
                                                    onClick={() => handlePayClick(bill)}
                                                    className="px-4 py-2 rounded-md text-sm font-medium text-white bg-primary hover:bg-primary-hover transition-transform duration-150 active:scale-95"
                                                >
                                                    Pay Now
                                                </button>
                                                {isAdmin && (
                                                    <button
                                                        onClick={() => handleSendReminder(bill)}
                                                        title="Send Reminder"
                                                        className="p-2 text-yellow-400 hover:bg-gray-700 rounded-full transition-colors"
                                                    >
                                                        <BellIcon className="h-5 w-5"/>
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            <PaymentModal 
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                onConfirm={handlePaymentConfirm}
                bill={selectedBill}
            />

            <ReceiptModal
                isOpen={isReceiptModalOpen}
                onClose={() => setIsReceiptModalOpen(false)}
                bill={selectedBillForReceipt}
            />
        </div>
    );
};

export default MaintenancePage;