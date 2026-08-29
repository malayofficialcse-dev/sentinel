import React, { useEffect } from 'react';
import { Button } from './Button';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxWidth = 'md',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthStyles = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 transition-opacity"
        onClick={onClose}
      />
      {/* Dialog container */}
      <div
        className={`relative w-full ${maxWidthStyles[maxWidth]} bg-white border border-[#C8C6C4] rounded-[4px] shadow-lg flex flex-col max-h-[90vh] z-10`}
      >
        <div className="px-4 py-3 border-b border-[#E1DFDD] bg-[#FAFAFA] flex items-center justify-between">
          <h3 className="font-semibold text-[15px] text-[#242424]">{title}</h3>
          <button
            onClick={onClose}
            className="text-[#605E5C] hover:text-[#242424] p-1 rounded-[4px] hover:bg-[#EDEBE9] transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
        <div className="p-4 overflow-y-auto flex-1">{children}</div>
        {footer ? (
          <div className="px-4 py-3 border-t border-[#E1DFDD] bg-[#FAFAFA] flex justify-end gap-2">
            {footer}
          </div>
        ) : (
          <div className="px-4 py-3 border-t border-[#E1DFDD] bg-[#FAFAFA] flex justify-end">
            <Button variant="secondary" size="md" onClick={onClose}>
              Close
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
