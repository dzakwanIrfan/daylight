'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PersonalityResultView } from './personality-result-view';
import { X } from 'lucide-react';

interface PersonalityResultModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PersonalityResultModal({ isOpen, onClose }: PersonalityResultModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        {/* Header dengan tombol close */}
        <DialogHeader className="sticky top-0 z-50 bg-white border-b-2 border-black p-6">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold">Your Persona Profile</DialogTitle>
            <button
              onClick={onClose}
              className="rounded-full p-2 hover:bg-gray-100 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </DialogHeader>
        
        {/* Content */}
        <div className="p-6">
          <PersonalityResultView />
        </div>
      </DialogContent>
    </Dialog>
  );
}