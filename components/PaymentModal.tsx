import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { Maintenance, Resident } from '../types';
import { CreditCardIcon, CheckCircleIcon, GooglePayLogo, PhonePeLogo, PaytmLogo } from './icons';

// This tells TypeScript that the Razorpay object will be available on the window
declare var Razorpay: any;

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (invoiceId: string) => void;
  bill: (Maintenance & { resident?: Resident }) | null;
}

const LoadingSpinner: React.FC = () => (
    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, onConfirm, bill }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsProcessing(false);
            setIsSuccess(false);
        }
    }, [isOpen, bill]);

    const handlePayment = () => {
        if (!bill || !bill.resident) return;

        setIsProcessing(true);

        const options = {
            key: 'rzp_test_YourKeyHere', // IMPORTANT: Replace with your Razorpay Test Key
            amount: bill.amount * 100, // Amount in the smallest currency unit (paise for INR)
            currency: 'INR',
            name: 'SocietyHub Payments',
            description: `Maintenance for Flat ${bill.resident.flatNumber}`,
            image: 'https://i.imgur.com/3g7nmJC.png', // A sample logo
            order_id: '', // In a real app, you would generate this on your server
            handler: function (response: any) {
                // This function is called on payment success
                console.log(response);
                setIsProcessing(false);
                setIsSuccess(true);
                setTimeout(() => {
                    onConfirm(bill.invoiceId);
                }, 1500);
            },
            prefill: {
                name: bill.resident.name,
                contact: bill.resident.contact,
                email: `${bill.resident.name.replace(/\s+/g, '').toLowerCase()}@societyhub.com` // dummy email
            },
            notes: {
                invoice_id: bill.invoiceId,
                flat_number: bill.resident.flatNumber,
            },
            theme: {
                color: '#4f46e5'
            },
            modal: {
                ondismiss: function() {
                    console.log('Payment modal was closed.');
                    setIsProcessing(false);
                }
            }
        };

        try {
            const rzp = new Razorpay(options);
             rzp.on('payment.failed', function (response: any){
                alert(`Payment Failed: ${response.error.description}`);
                console.error(response.error);
                setIsProcessing(false);
            });
            rzp.open();
        } catch (error) {
            console.error("Razorpay Error: ", error);
            alert("Could not initialize payment. Please check the console.");
            setIsProcessing(false);
        }
    };

    if (!bill) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Complete Your Payment">
            {isSuccess ? (
                <div className="text-center py-8 flex flex-col items-center justify-center animate-fadeIn">
                    <CheckCircleIcon className="h-20 w-20 text-green-400 mb-4" />
                    <h3 className="text-2xl font-bold text-text-primary">Payment Successful!</h3>
                    <p className="text-text-secondary mt-2">Your maintenance dues have been paid.</p>
                </div>
            ) : (
                <div className="animate-fadeIn">
                    <div className="p-4 bg-background rounded-lg border border-border mb-6">
                        <div className="flex justify-between items-center text-text-secondary text-sm mb-2">
                            <span>{bill.resident?.name} ({bill.resident?.flatNumber})</span>
                            <span>Invoice #{bill.invoiceId}</span>
                        </div>
                        <p className="text-4xl font-bold text-center text-text-primary">
                            ₹{bill.amount.toLocaleString('en-IN')}
                        </p>
                        <p className="text-center text-sm text-text-secondary mt-1">Total Amount Due</p>
                    </div>

                    <div className="text-center">
                        <p className="text-sm text-text-secondary mb-3">
                            You will be redirected to our secure payment partner, Razorpay, to complete your transaction.
                        </p>
                        <div className="flex justify-center items-center space-x-4 p-2 rounded-lg bg-background">
                            <GooglePayLogo className="h-8 w-auto" />
                            <PhonePeLogo className="h-8 w-auto" />
                            <PaytmLogo className="h-8 w-auto" />
                            <CreditCardIcon className="h-8 w-8 text-gray-400"/>
                            <span className="text-sm text-text-secondary">+ many more</span>
                        </div>
                    </div>
                     
                    <div className="flex justify-end space-x-4 pt-6 mt-6 border-t border-border">
                        <button type="button" onClick={onClose} disabled={isProcessing} className="px-4 py-2 rounded-md text-sm font-medium text-text-secondary bg-gray-700 hover:bg-gray-600 disabled:opacity-50 transition-transform duration-150 active:scale-95">
                            Cancel
                        </button>
                        <button type="button" onClick={handlePayment} disabled={isProcessing} className="flex items-center justify-center w-60 px-4 py-2 rounded-md text-sm font-medium text-white bg-primary hover:bg-primary-hover disabled:bg-primary/70 transition-transform duration-150 active:scale-95">
                            {isProcessing ? <LoadingSpinner /> : null}
                            {isProcessing ? 'Initializing...' : `Proceed to Pay Securely`}
                        </button>
                    </div>
                </div>
            )}
        </Modal>
    );
};

export default PaymentModal;