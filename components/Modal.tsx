import React, { useEffect } from 'react';
import { XIcon } from './icons';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 animate-fadeIn"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="bg-card rounded-lg shadow-xl p-6 md:p-8 w-full max-w-lg m-4 transform transition-all"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4 pb-4 border-b border-border">
          <h2 className="text-2xl font-bold text-text-primary">{title}</h2>
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary transition-colors">
            <XIcon className="h-6 w-6" />
            <span className="sr-only">Close modal</span>
          </button>
        </div>
        <div>
            {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
 
