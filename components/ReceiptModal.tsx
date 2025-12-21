import React from 'react';
import Modal from './Modal';
import { Maintenance, Resident } from '../types';
import { HomeIcon, PrinterIcon } from './icons';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  bill: (Maintenance & { resident?: Resident }) | null;
}

const ReceiptModal: React.FC<ReceiptModalProps> = ({ isOpen, onClose, bill }) => {
  if (!isOpen || !bill) return null;

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const receiptContent = document.getElementById('receipt-content');
      if (receiptContent) {
          printWindow.document.write(`
            <html>
              <head>
                <title>Print Receipt</title>
                <script src="https://cdn.tailwindcss.com"></script>
                <style>
                    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                </style>
              </head>
              <body class="p-8 bg-white">
                ${receiptContent.innerHTML}
              </body>
            </html>
          `);
          printWindow.document.close();
          printWindow.focus();
          setTimeout(() => {
            printWindow.print();
            printWindow.close();
          }, 250);
      }
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Payment Receipt">
        <div id="receipt-content" className="p-4 bg-gray-50 text-gray-800 rounded-lg">
            <div className="flex justify-between items-center border-b pb-4 mb-4">
                <div className="flex items-center">
                    <HomeIcon className="h-10 w-10 text-indigo-600" />
                    <div className="ml-2">
                        <h2 className="text-xl font-bold">MADHAV HOMES</h2>
                        <p className="text-sm text-gray-500">Official Receipt</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="font-semibold">Invoice #{bill.invoiceId}</p>
                    <p className="text-sm text-gray-500">Date: {new Date(bill.paymentDate!).toLocaleDateString()}</p>
                </div>
            </div>
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-600">Bill To:</h3>
                <p>{bill.resident?.name}</p>
                <p>Flat {bill.resident?.flatNumber}</p>
            </div>
            <table className="w-full mb-6">
                <thead>
                    <tr className="bg-gray-200">
                        <th className="p-2 text-left font-semibold">Description</th>
                        <th className="p-2 text-right font-semibold">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td className="p-2 border-b">Society Maintenance Due ({new Date(bill.dueDate).toLocaleString('default', { month: 'long', year: 'numeric' })})</td>
                        <td className="p-2 border-b text-right">₹{bill.amount.toLocaleString('en-IN')}</td>
                    </tr>
                </tbody>
            </table>
            <div className="flex justify-end items-center mb-6">
                <div className="text-right">
                    <p className="text-gray-600">Subtotal: ₹{bill.amount.toLocaleString('en-IN')}</p>
                    <p className="font-bold text-xl">Total Paid: ₹{bill.amount.toLocaleString('en-IN')}</p>
                </div>
            </div>
            <div className="text-center">
                 <p className="text-2xl font-bold text-green-600 border-2 border-green-600 rounded-md p-2 inline-block transform -rotate-12">
                    PAID
                </p>
            </div>
            <p className="text-center text-xs text-gray-500 mt-6">Thank you for your payment! This is a computer-generated receipt.</p>
        </div>
        <div className="flex justify-end space-x-4 pt-6 mt-4 border-t border-border">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-md text-sm font-medium text-text-secondary bg-gray-700 hover:bg-gray-600 transition-transform duration-150 active:scale-95">Close</button>
            <button type="button" onClick={handlePrint} className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium text-white bg-primary hover:bg-primary-hover transition-transform duration-150 active:scale-95">
                <PrinterIcon className="h-4 w-4 mr-2" />
                Print
            </button>
        </div>
    </Modal>
  );
};

export default ReceiptModal;
